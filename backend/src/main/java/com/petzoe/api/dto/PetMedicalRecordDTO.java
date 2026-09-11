package com.petzoe.api.dto;

import com.petzoe.api.entity.PetMedicalRecord;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PetMedicalRecordDTO(
        Long id,
        Long petId,
        String petName,
        Long veterinarianId,
        String veterinarianName,
        Long appointmentId,
        LocalDate examinationDate,
        Double weightKg,
        String healthStatus,
        String symptoms,
        String diagnosis,
        String treatment,
        String medication,
        String labInvestigations,
        String veterinaryNotes,
        boolean followUpRequired,
        LocalDate followUpDate,
        String followUpNotes,
        LocalDateTime createdAt
) {
    public PetMedicalRecordDTO(PetMedicalRecord record) {
        this(
                record.getId(),
                record.getPet().getId(),
                record.getPet().getName(),
                record.getVeterinarian().getId(),
                record.getVeterinarian().getName(),
                record.getAppointment() != null ? record.getAppointment().getId() : null,
                record.getExaminationDate(),
                record.getWeightKg(),
                record.getHealthStatus(),
                record.getSymptoms(),
                record.getDiagnosis(),
                record.getTreatment(),
                record.getMedication(),
                record.getLabInvestigations(),
                record.getVeterinaryNotes(),
                record.isFollowUpRequired(),
                record.getFollowUpDate(),
                record.getFollowUpNotes(),
                record.getCreatedAt()
        );
    }
}
