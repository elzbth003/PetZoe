package com.petzoe.api.dto;

import java.time.LocalDateTime;

public record PetRehomeApplicationDTO(
    Long id,
    Long listingId,
    String listingTitle,
    Long petId,
    String petCode,
    String petName,
    String petPhotoUrl,
    Long applicantId,
    String applicantName,
    String applicantEmail,
    String applicantMessage,
    String livingSituation,
    String experienceNotes,
    String contactPhone,
    String status,
    LocalDateTime createdAt,
    LocalDateTime respondedAt
) {}
