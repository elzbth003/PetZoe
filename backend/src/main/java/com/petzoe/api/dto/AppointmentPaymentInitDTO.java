package com.petzoe.api.dto;

public record AppointmentPaymentInitDTO(
    Long appointmentId,
    String razorpayOrderId,
    Long amountInPaise,
    Double amount,
    String currency,
    String keyId,
    String customerName,
    String customerEmail,
    String customerPhone,
    String veterinarianName,
    String petName
) {}
