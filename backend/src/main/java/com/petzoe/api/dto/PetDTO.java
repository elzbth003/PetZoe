package com.petzoe.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PetDTO(
    Long id,

    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Species is required")
    String species,

    @NotBlank(message = "Breed is required")
    String breed,

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 100, message = "Age must be realistic")
    Integer age,

    @NotBlank(message = "Gender is required")
    String gender,

    @NotNull(message = "Weight is required")
    @Min(value = 0, message = "Weight cannot be negative")
    Double weight,

    @NotBlank(message = "Vaccination status is required")
    String vaccinationStatus,

    String photoUrl,

    Long ownerId
) {}
