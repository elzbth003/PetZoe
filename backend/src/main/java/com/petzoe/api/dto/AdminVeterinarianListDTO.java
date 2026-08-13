package com.petzoe.api.dto;

import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;

public record AdminVeterinarianListDTO(
    Long userId,
    String name,
    String email,
    String phone,
    String specialization,
    VerificationStatus verificationStatus,
    LocalDateTime profileSubmittedAt,
    Integer experience,
    String registrationNumber
) {}
