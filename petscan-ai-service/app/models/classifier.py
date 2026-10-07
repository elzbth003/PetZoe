import numpy as np
from PIL import Image
from app.config import settings
from app.schemas.scan_schema import LesionPrediction

class CanineLesionClassifier:
    """
    Multi-label canine dermal lesion classifier.
    Supports 4 co-occurring dermal lesion indicators:
    1. ERYTHEMA (Dermal hyperemia / redness)
    2. LICHENIFICATION (Cutaneous thickening / hyperkeratosis)
    3. ALOPECIA (Focal or generalized hair coat loss)
    4. EROSION_ULCER (Superficial epithelial loss / ulcerative defects)
    """

    def __init__(self):
        self.classes = ["ERYTHEMA", "LICHENIFICATION", "ALOPECIA", "EROSION_ULCER"]

    def predict(self, image: Image.Image) -> tuple[list[LesionPrediction], float, str, str, str]:
        """
        Runs multi-label prediction with sigmoid probabilities.
        Returns:
            predictions: list of LesionPrediction
            overall_confidence: float
            confidence_level: "HIGH" | "MODERATE" | "LOW"
            severity: "MILD" | "MODERATE" | "SEVERE" | "INSUFFICIENT_EVIDENCE"
            severity_description: str
        """
        img_np = np.array(image.resize((224, 224)), dtype=np.float32)

        # Color channels & photometric signals
        r = img_np[:, :, 0]
        g = img_np[:, :, 1]
        b = img_np[:, :, 2]

        # 1. Erythema signal: relative prominence of red channel over green/blue
        rg_ratio = np.clip(np.mean(r) / (np.mean(g) + 1e-5), 0.5, 2.0)
        erythema_prob = 1.0 / (1.0 + np.exp(-3.5 * (rg_ratio - 1.15)))

        # 2. Lichenification signal: local texture variance / high-frequency coarseness
        gray = 0.299 * r + 0.587 * g + 0.114 * b
        texture_var = float(np.var(gray[::4, ::4]))
        lichenification_prob = 1.0 / (1.0 + np.exp(-0.005 * (texture_var - 800.0)))

        # 3. Alopecia signal: spatial contrast between coat hairs and bare skin patches
        grad_x = np.diff(gray, axis=1)
        hair_density_proxy = float(np.mean(np.abs(grad_x)))
        alopecia_prob = 1.0 / (1.0 + np.exp(0.15 * (hair_density_proxy - 18.0)))

        # 4. Erosion / Ulcer signal: deep localized dark/raw lesion regions
        ulcer_intensity = float(np.mean(r < 60) + np.mean((r > 160) & (g < 90) & (b < 90)))
        erosion_prob = 1.0 / (1.0 + np.exp(-25.0 * (ulcer_intensity - 0.08)))

        raw_scores = {
            "ERYTHEMA": float(np.clip(erythema_prob, 0.05, 0.96)),
            "LICHENIFICATION": float(np.clip(lichenification_prob, 0.05, 0.94)),
            "ALOPECIA": float(np.clip(alopecia_prob, 0.05, 0.95)),
            "EROSION_ULCER": float(np.clip(erosion_prob, 0.05, 0.92))
        }

        predictions = []
        for label in self.classes:
            prob = raw_scores[label]
            thresh = settings.THRESHOLDS.get(label, 0.50)
            meta = settings.LESION_METADATA[label]
            predictions.append(LesionPrediction(
                label=label,
                displayName=meta["displayName"],
                probability=round(prob, 3),
                detected=(prob >= thresh),
                threshold=thresh,
                description=meta["description"]
            ))

        # Overall confidence estimation (distance of predictions from indeterminate 0.5 boundary)
        conf_margins = [abs(p.probability - 0.5) * 2.0 for p in predictions]
        overall_confidence = float(np.mean(conf_margins))

        if overall_confidence >= 0.70:
            confidence_level = "HIGH"
        elif overall_confidence >= 0.45:
            confidence_level = "MODERATE"
        else:
            confidence_level = "LOW"

        # Severity Estimation: Prototype assessment based on detected lesion count and ulceration
        detected_count = sum(1 for p in predictions if p.detected)
        has_ulcer = any(p.label == "EROSION_ULCER" and p.detected for p in predictions)
        max_prob = max(p.probability for p in predictions)

        if max_prob < 0.35 and detected_count == 0:
            severity = "INSUFFICIENT_EVIDENCE"
            severity_desc = "No prominent lesion indicators detected with high model confidence."
        elif has_ulcer or detected_count >= 3:
            severity = "SEVERE"
            severity_desc = "Multiple concurrent dermal patterns or active epithelial ulceration observed. Prompt veterinary examination advised."
        elif detected_count == 2 or max_prob >= 0.75:
            severity = "MODERATE"
            severity_desc = "Distinct focal erythema, lichenification, or alopecia patterns identified."
        else:
            severity = "MILD"
            severity_desc = "Mild or localized superficial dermal changes detected."

        return predictions, round(overall_confidence, 2), confidence_level, severity, severity_desc

classifier = CanineLesionClassifier()
