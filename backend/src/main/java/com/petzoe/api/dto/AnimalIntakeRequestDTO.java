package com.petzoe.api.dto;

import com.petzoe.api.entity.AnimalSex;
import com.petzoe.api.entity.IntakeType;
import java.time.LocalDate;

public record AnimalIntakeRequestDTO(
    // Identification
    String name,
    String species,
    String breed,
    AnimalSex sex,
    Integer estimatedAgeMonths,
    String color,
    String distinguishingMarks,
    Double weightKg,
    String primaryPhotoBase64,
    String microchipNumber,
    // Intake event
    LocalDate intakeDate,
    IntakeType intakeType,
    String sourceInfo,
    String previousOwnershipInfo
) {}
