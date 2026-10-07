package com.petzoe.api.dto.vetscan;

import java.util.List;

public record VetScanComparisonDTO(
        VetScanResponseDTO previousScan,
        VetScanResponseDTO currentScan,
        String progressionStatus,
        String visualComparisonSummary,
        List<LesionChangeMetricDTO> metricChanges
) {}
