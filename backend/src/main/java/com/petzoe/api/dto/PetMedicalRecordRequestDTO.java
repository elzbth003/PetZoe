package com.petzoe.api.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PetMedicalRecordRequestDTO(
        Long appointmentId,
        @NotNull(message = "Examination date is required")
        LocalDate examinationDate,
        Double weightKg,
        @NotNull(message = "Health status is required")
        String healthStatus,
        String symptoms,
        String diagnosis,
        String treatment,
        String medication,
        String labInvestigations,
        String veterinaryNotes,
        boolean followUpRequired,
        LocalDate followUpDate,
        String followUpNotes
) {}
