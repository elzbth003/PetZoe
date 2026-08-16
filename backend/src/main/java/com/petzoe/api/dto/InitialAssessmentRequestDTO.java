package com.petzoe.api.dto;

public record InitialAssessmentRequestDTO(
    String generalCondition,
    Double weightKg,
    String visibleInjuries,
    String behaviourObservations,
    String immediateMedicalConcerns,
    String knownAllergies,
    String knownMedicalHistory,
    String parasiteConcerns,
    String vaccinationInfoAtIntake
) {}
