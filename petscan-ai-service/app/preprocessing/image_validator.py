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

    # 5. Extreme monochrome & Document detection (QR codes, barcodes, text screenshots)
    hsv_image = image.convert("HSV")
    hsv_np = np.array(hsv_image, dtype=np.float32)
    h = hsv_np[:, :, 0] * (360.0 / 255.0)  # [0, 360]
    s = hsv_np[:, :, 1] / 255.0            # [0, 1]
    v = hsv_np[:, :, 2] / 255.0            # [0, 1]

    is_extreme_monochrome = (s < 0.12) & ((v > 0.88) | (v < 0.12))
    extreme_mono_ratio = float(np.mean(is_extreme_monochrome))
    if extreme_mono_ratio > 0.40:
        issues.append("Non-biological graphic or document detected (e.g. QR code, text screenshot, or synthetic pattern). VetScan AI only screens authentic canine skin lesion photographs.")

    is_pure_white = (img_np[:, :, 0] > 235) & (img_np[:, :, 1] > 235) & (img_np[:, :, 2] > 235)
    white_ratio = float(np.mean(is_pure_white))
    if white_ratio > 0.45:
        issues.append("Image is dominated by blank document background. Please upload a close-up photograph of the pet's affected skin area.")

    mean_saturation = float(np.mean(s))
    if mean_saturation < 0.08:
        issues.append("Desaturated or black-and-white graphic detected. Clinical lesion screening requires a clear color photograph showing natural skin tones and erythema.")

    # 6. Canine Dermal / Coat Biological Chromaticity Check
    # Unnatural/non-pet dominant spectra (vibrant blue sky, vibrant green foliage, unnatural synthetic neon, purple)
    is_vibrant_blue = (h >= 170) & (h <= 260) & (s > 0.35)
    is_vibrant_green = (h >= 75) & (h <= 165) & (s > 0.38)
    is_vibrant_purple = (h >= 270) & (h <= 325) & (s > 0.40)
    unnatural_mask = is_vibrant_blue | is_vibrant_green | is_vibrant_purple
    unnatural_ratio = float(np.mean(unnatural_mask))
    if unnatural_ratio > 0.35:
        issues.append("Non-biological or scenery colors detected (foliage, sky, synthetic objects). Please focus closely on the canine skin or coat lesion.")

    # Dermal / Lesion Tissue Identification
    r_ch = img_np[:, :, 0]
    g_ch = img_np[:, :, 1]
    b_ch = img_np[:, :, 2]

    is_erythema = (r_ch > 95) & (r_ch > (g_ch * 1.10)) & (r_ch > (b_ch * 1.10)) & ((h <= 45) | (h >= 330)) & (s >= 0.12)
    is_skin_tone = (h >= 8) & (h <= 50) & (s >= 0.12) & (s <= 0.75) & (v >= 0.20) & (v <= 0.88)
    is_crust_melanin = (h >= 12) & (h <= 48) & (s >= 0.15) & (v >= 0.12) & (v <= 0.55) & (r_ch > g_ch) & (g_ch >= b_ch)
    dermal_mask = is_erythema | is_skin_tone | is_crust_melanin
    dermal_ratio = float(np.mean(dermal_mask))

    is_warm_fur = ((h <= 55) | (h >= 335)) & (s >= 0.10) & (v >= 0.15) & (v <= 0.88)
    is_neutral_fur = (s < 0.22) & (v >= 0.15) & (v <= 0.88) & (~is_extreme_monochrome)
    fur_mask = (is_warm_fur | is_neutral_fur) & (~dermal_mask) & (~is_extreme_monochrome)
    biological_ratio = float(np.mean(dermal_mask | fur_mask))

    if dermal_ratio < 0.05 and biological_ratio < 0.25:
        issues.append("The uploaded photograph does not appear to show a canine skin condition or lesion. Please upload a clear photo of your dog's affected skin or coat.")
    elif dermal_ratio < 0.01:
        issues.append("No canine skin lesion, rash, or erythema detected in the photograph. Please upload a focused close-up photo showing the affected skin area.")

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
