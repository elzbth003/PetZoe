package com.petzoe.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PetDTO(
    Long id,
    String petCode,

    @NotBlank(message = "Pet name is required")
    @Size(min = 2, max = 50, message = "Pet name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s.'-]+$", message = "Pet name can only contain letters, numbers, spaces, hyphens, and apostrophes")
    String name,

    @NotBlank(message = "Species is required")
    @Pattern(regexp = "^(Dog|Cat|Bird|Rabbit|Other)$", message = "Species must be Dog, Cat, Bird, Rabbit, or Other")
    String species,

    @NotBlank(message = "Breed is required")
    @Size(min = 2, max = 50, message = "Breed must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s.'-]+$", message = "Breed can only contain letters, spaces, hyphens, and apostrophes")
    String breed,

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 30, message = "Age must be between 0 and 30 years")
    Integer age,

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female)$", message = "Gender must be Male or Female")
    String gender,

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.05", message = "Weight must be at least 0.05 kg")
    @DecimalMax(value = "200.0", message = "Weight must not exceed 200 kg")
    Double weight,

    @NotBlank(message = "Vaccination status is required")
    @Pattern(regexp = "^(Up-to-date|Needs Vaccination|Overdue)$", message = "Vaccination status must be Up-to-date, Needs Vaccination, or Overdue")
    String vaccinationStatus,

    String photoUrl,

    // Extended fields (all optional)
    @PastOrPresent(message = "Date of birth cannot be in the future")
    LocalDate dateOfBirth,

    @Size(max = 50, message = "Color cannot exceed 50 characters")
    String color,

    @Size(max = 200, message = "Allergies cannot exceed 200 characters")
    String allergies,

    @Size(max = 1000, message = "Medical notes cannot exceed 1000 characters")
    String medicalNotes,

    Long ownerId
) {
    // Backward-compatible constructor without petCode
    public PetDTO(Long id, String name, String species, String breed, Integer age,
                  String gender, Double weight, String vaccinationStatus, String photoUrl,
                  LocalDate dateOfBirth, String color, String allergies, String medicalNotes, Long ownerId) {
        this(id, null, name, species, breed, age, gender, weight, vaccinationStatus, photoUrl, dateOfBirth, color, allergies, medicalNotes, ownerId);
    }
}
