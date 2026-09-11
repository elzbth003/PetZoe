package com.petzoe.api.dto;

import java.time.LocalDate;

public record AppointmentActionRequestDTO(
        String reason,
        LocalDate newDate,
        String newTime
) {}
