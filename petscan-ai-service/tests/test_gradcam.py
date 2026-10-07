import numpy as np
from PIL import Image
from app.explainability.gradcam import generate_gradcam_overlay

def test_gradcam_overlay_generates_valid_png():
    np_img = np.random.randint(60, 180, (240, 240, 3), dtype=np.uint8)
    img = Image.fromarray(np_img, mode="RGB")

    heatmap_b64 = generate_gradcam_overlay(img, target_label="ERYTHEMA")

    assert heatmap_b64 is not None
    assert heatmap_b64.startswith("data:image/png;base64,")
    assert len(heatmap_b64) > 100
