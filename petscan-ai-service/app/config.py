import os

class Settings:
    MODEL_MODE: str = os.getenv("MODEL_MODE", "mock").lower()
    MODEL_NAME: str = "PetZoe-VetScan-EfficientNet"
    MODEL_VERSION: str = "v1.0.0"
    DATASET_VERSION: str = "canine-derm-multilabel-v1"

    # Image Quality Thresholds
    MIN_WIDTH: int = 224
    MIN_HEIGHT: int = 224
    BLUR_THRESHOLD: float = 80.0
    MIN_LUMINANCE: float = 30.0
    MAX_LUMINANCE: float = 235.0

    # Multi-label classification decision thresholds (calibrated for sigmoid probabilities)
    THRESHOLDS = {
        "ERYTHEMA": 0.50,
        "LICHENIFICATION": 0.50,
        "ALOPECIA": 0.50,
        "EROSION_ULCER": 0.50
    }

    # Lesion display metadata
    LESION_METADATA = {
        "ERYTHEMA": {
            "displayName": "Erythema",
            "description": "Superficial skin redness typically indicating active vascular dilation or inflammatory reaction."
        },
        "LICHENIFICATION": {
            "displayName": "Lichenification",
            "description": "Epidermal thickening and accentuation of normal skin markings, commonly seen in chronic pruritus or rubbing."
        },
        "ALOPECIA": {
            "displayName": "Alopecia",
            "description": "Noticeable thinning or total loss of hair/coat over the affected dermal region."
        },
        "EROSION_ULCER": {
            "displayName": "Erosion / Ulcer",
            "description": "Disruption of epidermal integrity, superficial raw surface, or deep crater-like cutaneous lesion."
        }
    }

settings = Settings()
