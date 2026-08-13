package com.petzoe.api.dto;

import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;

public record VerificationDocumentDTO(
    Long id,
    String documentType,
    String documentBase64,
    VerificationStatus status,
    String rejectionReason,
    LocalDateTime uploadedAt,
    LocalDateTime verifiedAt,
    String verifiedByEmail
) {}
