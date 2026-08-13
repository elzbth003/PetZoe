package com.petzoe.api.dto;

import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;

public record VerificationHistoryDTO(
    Long id,
    String action,
    VerificationStatus previousStatus,
    VerificationStatus newStatus,
    String reason,
    String adminEmail,
    LocalDateTime createdAt
) {}
