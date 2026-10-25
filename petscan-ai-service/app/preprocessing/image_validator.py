import io
import numpy as np
from PIL import Image
from app.config import settings
from app.schemas.scan_schema import ImageQualityResult

def compute_laplacian_variance(gray_array: np.ndarray) -> float:
    """
    Computes Laplacian variance blur metric using a 3x3 discrete Laplace operator.
    Mathematically equivalent to cv2.Laplacian(gray, cv2.CV_64F).var().
    """
    if gray_array.shape[0] < 3 or gray_array.shape[1] < 3:
        return 0.0
    
    # 3x3 discrete Laplace kernel convolution via vectorized slicing
    lap = (
        gray_array[:-2, 1:-1].astype(np.float64)
        + gray_array[2:, 1:-1].astype(np.float64)
        + gray_array[1:-1, :-2].astype(np.float64)
        + gray_array[1:-1, 2:].astype(np.float64)
        - 4.0 * gray_array[1:-1, 1:-1].astype(np.float64)
    )
    return float(np.var(lap))

def validate_image_quality(image_bytes: bytes) -> tuple[ImageQualityResult, Image.Image | None]:
    """
    Evaluates image readability, resolution, blur (Laplacian variance),
    and illumination exposure.
    """
    issues = []
    
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except Exception as e:
        return ImageQualityResult(
            is_usable=False,
            blur_score=0.0,
            luminance_score=0.0,
            width=0,
            height=0,
            issues=[f"Corrupt or unreadable image file: {str(e)}"]
        ), None

    # Convert to RGB if palette or RGBA
    if image.mode != "RGB":
        image = image.convert("RGB")

    width, height = image.size

    # 1. Resolution Check
    if width < settings.MIN_WIDTH or height < settings.MIN_HEIGHT:
        issues.append(f"Image resolution ({width}x{height}) is below minimum requirement ({settings.MIN_WIDTH}x{settings.MIN_HEIGHT}).")

    # 2. Grayscale conversion for photometric checks
    img_np = np.array(image, dtype=np.float32)
    gray = 0.299 * img_np[:, :, 0] + 0.587 * img_np[:, :, 1] + 0.114 * img_np[:, :, 2]

    # 3. Blur Detection (Laplacian Variance)
    blur_score = compute_laplacian_variance(gray)
    if blur_score < settings.BLUR_THRESHOLD:
        issues.append(f"Image appears out of focus or blurred (Sharpness index: {blur_score:.1f}, required: >= {settings.BLUR_THRESHOLD}).")

    # 4. Exposure & Illumination Check
    mean_luminance = float(np.mean(gray))
    if mean_luminance < settings.MIN_LUMINANCE:
        issues.append(f"Image is underexposed / too dark (Luminance: {mean_luminance:.1f}, minimum: {settings.MIN_LUMINANCE}).")
    elif mean_luminance > settings.MAX_LUMINANCE:
        issues.append(f"Image is overexposed / washed out (Luminance: {mean_luminance:.1f}, maximum: {settings.MAX_LUMINANCE}).")

    # 5. Canine Dermal / Coat Biological Chromaticity Check
    # Convert image to HSV to evaluate biological dermal/fur presence vs non-pet scenes (sky, foliage, cars, UI)
    hsv_image = image.convert("HSV")
    hsv_np = np.array(hsv_image, dtype=np.float32)
    h = hsv_np[:, :, 0] * (360.0 / 255.0)  # [0, 360]
    s = hsv_np[:, :, 1] / 255.0            # [0, 1]
    v = hsv_np[:, :, 2] / 255.0            # [0, 1]

    # Dermal/fur tones: warm hues (red/orange/yellow/brown), low saturation fur (black/white/grey)
    is_warm_dermal = ((h <= 55) | (h >= 330)) & (v >= 0.15)
    is_fur_neutral = (s < 0.22) & (v >= 0.15)
    dermal_fur_mask = is_warm_dermal | is_fur_neutral
    dermal_ratio = float(np.mean(dermal_fur_mask))

    # Unnatural/non-pet dominant spectra (vibrant blue sky, vibrant green foliage, unnatural synthetic neon)
    is_vibrant_blue = (h >= 170) & (h <= 260) & (s > 0.35)
    is_vibrant_green = (h >= 75) & (h <= 165) & (s > 0.40)
    unnatural_mask = is_vibrant_blue | is_vibrant_green
    unnatural_ratio = float(np.mean(unnatural_mask))

    if dermal_ratio < 0.22 or unnatural_ratio > 0.50:
        issues.append("The uploaded photograph does not appear to be a canine skin or pet lesion photograph (non-biological colors or non-pet subject detected).")

    is_usable = (len(issues) == 0)

    quality_result = ImageQualityResult(
        is_usable=is_usable,
        blur_score=round(blur_score, 2),
        luminance_score=round(mean_luminance, 2),
        width=width,
        height=height,
        issues=issues
    )

    return quality_result, image
