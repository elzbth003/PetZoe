package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

public record ConsultationSubmissionDTO(
        String symptoms,
        String healthStatus,
        Double weightKg,
        @NotBlank(message = "Diagnosis is required")
        String diagnosis,
        @NotBlank(message = "Treatment plan is required")
        String treatment,
        String medication,
        String labInvestigations,
        String veterinaryNotes,
        boolean followUpRequired,
        LocalDate followUpDate,
        String followUpNotes,
        List<PrescriptionItemDTO> prescriptions
) {
    public record PrescriptionItemDTO(
            String medicineName,
            String dosage,
            String frequency,
            String duration,
            String instructions
    ) {}
}
