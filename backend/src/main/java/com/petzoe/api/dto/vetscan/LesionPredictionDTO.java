package com.petzoe.api.dto.vetscan;

public record LesionPredictionDTO(
        String label,
        String displayName,
        double probability,
        boolean detected,
        double threshold,
        String description
) {}
