package com.petzoe.api.dto.vetscan;

public record LesionChangeMetricDTO(
        String label,
        String displayName,
        double previousProbability,
        double currentProbability,
        double delta,
        String trend // "INCREASED", "DECREASED", "STABLE"
) {}
