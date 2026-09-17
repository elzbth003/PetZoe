package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AppointmentDTO(
    Long id,

    @NotNull(message = "Pet ID is required")
    Long petId,

    String petCode,

    String petName,

    Long ownerId,
    
    String ownerName,

    @NotNull(message = "Veterinarian ID is required")
    Long veterinarianId,

    String veterinarianName,

    @NotNull(message = "Appointment date is required")
    LocalDate appointmentDate,

    @NotBlank(message = "Appointment time is required")
    String appointmentTime,

    String status,

    String notes
) {
    // Backward-compatible constructor without petCode
    public AppointmentDTO(Long id, Long petId, String petName, Long ownerId, String ownerName,
                          Long veterinarianId, String veterinarianName, LocalDate appointmentDate,
                          String appointmentTime, String status, String notes) {
        this(id, petId, null, petName, ownerId, ownerName, veterinarianId, veterinarianName, appointmentDate, appointmentTime, status, notes);
    }
}
