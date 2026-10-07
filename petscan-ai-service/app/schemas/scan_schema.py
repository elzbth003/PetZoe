from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LesionPrediction(BaseModel):
    label: str
    displayName: str
    probability: float
    detected: bool
    threshold: float
    description: str

class ImageQualityResult(BaseModel):
    is_usable: bool
    blur_score: float
    luminance_score: float
    width: int
    height: int
    issues: List[str] = Field(default_factory=list)

class ScanAnalysisResponse(BaseModel):
    status: str  # "COMPLETED", "INSUFFICIENT_IMAGE", "FAILED"
    message: str
    model_name: str
    model_version: str
    dataset_version: str
    model_mode: str  # "REAL", "DEVELOPMENT_DEMO"
    predictions: List[LesionPrediction] = Field(default_factory=list)
    overall_confidence: float = 0.0
    confidence_level: str = "LOW"  # "HIGH", "MODERATE", "LOW"
    severity: str = "INSUFFICIENT_EVIDENCE"  # "MILD", "MODERATE", "SEVERE", "INSUFFICIENT_EVIDENCE"
    severity_description: str = ""
    explanation_method: str = "GRAD_CAM"
    heatmap_base64: Optional[str] = None
    quality_metrics: ImageQualityResult
    clinical_disclaimer: str
