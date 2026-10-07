import numpy as np
from PIL import Image
from app.models.classifier import classifier

def test_multi_label_inference_returns_four_classes():
    np_img = np.random.randint(50, 200, (250, 250, 3), dtype=np.uint8)
    img = Image.fromarray(np_img, mode="RGB")

    predictions, confidence, conf_level, severity, severity_desc = classifier.predict(img)

    assert len(predictions) == 4
    labels = [p.label for p in predictions]
    assert "ERYTHEMA" in labels
    assert "LICHENIFICATION" in labels
    assert "ALOPECIA" in labels
    assert "EROSION_ULCER" in labels

    for p in predictions:
        assert 0.0 <= p.probability <= 1.0
        assert p.threshold == 0.50
        assert p.detected == (p.probability >= p.threshold)

    assert 0.0 <= confidence <= 1.0
    assert conf_level in ["HIGH", "MODERATE", "LOW"]
    assert severity in ["MILD", "MODERATE", "SEVERE", "INSUFFICIENT_EVIDENCE"]
    assert len(severity_desc) > 0
