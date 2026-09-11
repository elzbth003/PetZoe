package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PetVaccinationRequestDTO(
        @NotBlank(message = "Vaccine name is required")
        String vaccineName,
        @NotNull(message = "Date administered is required")
        LocalDate dateAdministered,
        LocalDate nextDueDate,
        String batchLotNumber,
        String notes
) {}
