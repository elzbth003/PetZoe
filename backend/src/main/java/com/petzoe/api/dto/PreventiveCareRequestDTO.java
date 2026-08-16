package com.petzoe.api.dto;

import com.petzoe.api.entity.PreventiveCareType;
import java.time.LocalDate;

public record PreventiveCareRequestDTO(
    PreventiveCareType careType,
    LocalDate dateAdministered,
    LocalDate nextDueDate,
    String product,
    String notes
) {}
