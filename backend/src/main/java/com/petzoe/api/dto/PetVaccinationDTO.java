package com.petzoe.api.dto;

import com.petzoe.api.entity.PetVaccinationRecord;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PetVaccinationDTO(
        Long id,
        Long petId,
        String petName,
        Long veterinarianId,
        String veterinarianName,
        String vaccineName,
        LocalDate dateAdministered,
        LocalDate nextDueDate,
        String batchLotNumber,
        String notes,
        LocalDateTime createdAt
) {
    public PetVaccinationDTO(PetVaccinationRecord record) {
        this(
                record.getId(),
                record.getPet().getId(),
                record.getPet().getName(),
                record.getVeterinarian().getId(),
                record.getVeterinarian().getName(),
                record.getVaccineName(),
                record.getDateAdministered(),
                record.getNextDueDate(),
                record.getBatchLotNumber(),
                record.getNotes(),
                record.getCreatedAt()
        );
    }
}
