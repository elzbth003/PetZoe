package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateRehomeApplicationDTO(
    @NotBlank(message = "Application message is required")
    String applicantMessage,

    @NotBlank(message = "Living situation is required")
    String livingSituation,

    String experienceNotes,

    @NotBlank(message = "Contact phone is required")
    String contactPhone
) {}
