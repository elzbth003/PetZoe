package com.petzoe.api.dto;

import java.time.LocalDateTime;

public record PetRehomeListingDTO(
    Long id,
    Long petId,
    String petCode,
    String petName,
    String petSpecies,
    String petBreed,
    Integer petAge,
    String petGender,
    String petPhotoUrl,
    String petVaccinationStatus,
    Long ownerId,
    String ownerName,
    String ownerEmail,
    String title,
    String reason,
    String requirements,
    String city,
    String status,
    LocalDateTime createdAt,
    LocalDateTime closedAt,
    long applicationCount,
    boolean isOwner,
    boolean hasApplied
) {}
