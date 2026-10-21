package com.petzoe.api.dto;

public record AppointmentPaymentVerifyDTO(
    Long appointmentId,
    String razorpayOrderId,
    String razorpayPaymentId,
    String razorpaySignature
) {}
