package com.petzoe.api.dto;

import java.time.LocalDateTime;

public record NotificationDTO(
    Long id,
    String title,
    String message,
    String type,
    String reason,
    Long referenceId,
    boolean isRead,
    LocalDateTime createdAt
) {}
