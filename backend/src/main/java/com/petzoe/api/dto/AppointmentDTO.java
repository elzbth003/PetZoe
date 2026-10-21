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

    String notes,

    Double fee,

    String paymentStatus,

    String razorpayPaymentId
) {
    // Backward-compatible constructor without petCode and payment fields
    public AppointmentDTO(Long id, Long petId, String petName, Long ownerId, String ownerName,
                          Long veterinarianId, String veterinarianName, LocalDate appointmentDate,
                          String appointmentTime, String status, String notes) {
        this(id, petId, null, petName, ownerId, ownerName, veterinarianId, veterinarianName, appointmentDate, appointmentTime, status, notes, 10.0, "PAID", null);
    }

    // Backward-compatible constructor with petCode
    public AppointmentDTO(Long id, Long petId, String petCode, String petName, Long ownerId, String ownerName,
                          Long veterinarianId, String veterinarianName, LocalDate appointmentDate,
                          String appointmentTime, String status, String notes) {
        this(id, petId, petCode, petName, ownerId, ownerName, veterinarianId, veterinarianName, appointmentDate, appointmentTime, status, notes, 10.0, "PAID", null);
    }
}
