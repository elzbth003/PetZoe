import io
import numpy as np
from PIL import Image
from app.preprocessing.image_validator import validate_image_quality

def create_synthetic_image(width=300, height=300, color=(180, 100, 90)):
    # Create image with texture/edges so it is sharp
    np_img = np.random.randint(0, 50, (height, width, 3), dtype=np.uint8)
    np_img[:, :] += np.array(color, dtype=np.uint8)
    img = Image.fromarray(np_img, mode="RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_valid_image_passes_quality():
    image_bytes = create_synthetic_image(300, 300)
    quality, pil_img = validate_image_quality(image_bytes)
    assert quality.is_usable is True
    assert quality.width == 300
    assert quality.height == 300
    assert pil_img is not None
    assert len(quality.issues) == 0

def test_low_resolution_rejected():
    image_bytes = create_synthetic_image(150, 150)
    quality, pil_img = validate_image_quality(image_bytes)
    assert quality.is_usable is False
    assert any("resolution" in issue.lower() for issue in quality.issues)

def test_flat_blurry_image_rejected():
    # Completely flat single-color image has 0 Laplacian variance (extreme blur)
    img = Image.new("RGB", (300, 300), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    quality, _ = validate_image_quality(buf.getvalue())
    assert quality.is_usable is False
    assert any("blurred" in issue.lower() or "focus" in issue.lower() for issue in quality.issues)

def test_underexposed_image_rejected():
    # Very dark image
    img = Image.new("RGB", (300, 300), color=(10, 10, 10))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    quality, _ = validate_image_quality(buf.getvalue())
    assert quality.is_usable is False
    assert any("dark" in issue.lower() or "underexposed" in issue.lower() for issue in quality.issues)
