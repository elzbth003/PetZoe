package com.petzoe.api.dto;

import java.time.LocalDate;

public record VaccinationRequestDTO(
    String vaccineName,
    LocalDate dateAdministered,
    LocalDate nextDueDate,
    String batchLotNumber,
    String notes
) {}
