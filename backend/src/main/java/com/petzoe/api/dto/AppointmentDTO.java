package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AppointmentDTO(
    Long id,

    @NotNull(message = "Pet ID is required")
    Long petId,

    String petName,

    Long ownerId,

    @NotNull(message = "Veterinarian ID is required")
    Long veterinarianId,

    String veterinarianName,

    @NotNull(message = "Appointment date is required")
    LocalDate appointmentDate,

    @NotBlank(message = "Appointment time is required")
    String appointmentTime,

    String status,

    String notes
) {}
