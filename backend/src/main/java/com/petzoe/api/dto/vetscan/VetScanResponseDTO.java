package com.petzoe.api.dto.vetscan;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record VetScanResponseDTO(
        Long id,
        Long petId,
        String petName,
        String petCode,
        String species,
        String breed,
        String imageReference,
        String imageHash,
        String status,
        String statusMessage,
        String modelName,
        String modelVersion,
        String datasetVersion,
        String modelMode,
        List<LesionPredictionDTO> predictions,
        Double confidence,
        String confidenceLevel,
        String severity,
        String severityDescription,
        Map<String, Object> symptoms,
        String explanationImageReference,
        String explanationMethod,
        Long previousScanId,
        String progressionStatus,
        String progressionNotes,
        String clinicalDisclaimer,
        String veterinarianReviewStatus,
        String veterinarianName,
        String veterinarianNotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
