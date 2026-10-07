from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from app.config import settings
from app.preprocessing.image_validator import validate_image_quality
from app.models.classifier import classifier
from app.explainability.gradcam import generate_gradcam_overlay
from app.schemas.scan_schema import ScanAnalysisResponse, ImageQualityResult

router = APIRouter(prefix="/api/v1", tags=["VetScan Analysis"])

@router.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "PetZoe VetScan AI Service",
        "model_name": settings.MODEL_NAME,
        "model_version": settings.MODEL_VERSION,
        "dataset_version": settings.DATASET_VERSION,
        "model_mode": "DEVELOPMENT_DEMO" if settings.MODEL_MODE == "mock" else "REAL"
    }

@router.post("/analyze", response_model=ScanAnalysisResponse)
async def analyze_scan(
    image: UploadFile = File(...),
    symptoms_json: Optional[str] = Form(None)
):
    # 1. Read bytes & check size
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    # 2. Quality & Integrity Preprocessing
    quality_metrics, pil_image = validate_image_quality(contents)

    if not quality_metrics.is_usable or pil_image is None:
        return ScanAnalysisResponse(
            status="INSUFFICIENT_IMAGE",
            message="The image quality is insufficient for preliminary screening. Please upload a clearer image with the affected skin area in focus.",
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
            dataset_version=settings.DATASET_VERSION,
            model_mode="DEVELOPMENT_DEMO" if settings.MODEL_MODE == "mock" else "REAL",
            predictions=[],
            overall_confidence=0.0,
            confidence_level="LOW",
            severity="INSUFFICIENT_EVIDENCE",
            severity_description="Analysis halted due to insufficient image sharpness or lighting.",
            explanation_method="GRAD_CAM",
            heatmap_base64=None,
            quality_metrics=quality_metrics,
            clinical_disclaimer="PetZoe VetScan provides preliminary decision-support indicators and is NOT a veterinary diagnosis."
        )

    # 3. Multi-label Prediction
    predictions, confidence, conf_level, severity, severity_desc = classifier.predict(pil_image)

    # 4. Grad-CAM Explainability Generation
    # Target the lesion with highest detected probability or highest overall score
    dominant_lesion = max(predictions, key=lambda p: p.probability)
    target_label = dominant_lesion.label if dominant_lesion else "ERYTHEMA"
    heatmap_b64 = generate_gradcam_overlay(pil_image, target_label=target_label)

    model_mode = "DEVELOPMENT_DEMO" if settings.MODEL_MODE == "mock" else "REAL"

    return ScanAnalysisResponse(
        status="COMPLETED",
        message="Preliminary screening completed successfully.",
        model_name=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        dataset_version=settings.DATASET_VERSION,
        model_mode=model_mode,
        predictions=predictions,
        overall_confidence=confidence,
        confidence_level=conf_level,
        severity=severity,
        severity_description=severity_desc,
        explanation_method="GRAD_CAM",
        heatmap_base64=heatmap_b64,
        quality_metrics=quality_metrics,
        clinical_disclaimer="PetZoe VetScan provides preliminary screening indicators only and is NOT a veterinary diagnosis. Please consult a licensed veterinarian for definitive diagnosis and treatment."
    )
