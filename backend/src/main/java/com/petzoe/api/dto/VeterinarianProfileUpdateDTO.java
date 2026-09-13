package com.petzoe.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VeterinarianProfileUpdateDTO(
        @Size(max = 100, message = "Qualification cannot exceed 100 characters")
        String qualification,

        @Size(max = 50, message = "Registration number cannot exceed 50 characters")
        String registrationNumber,

        @Min(value = 0, message = "Experience cannot be negative")
        @Max(value = 70, message = "Experience cannot exceed 70 years")
        Integer experience,

        @Size(max = 100, message = "Specialization cannot exceed 100 characters")
        @Pattern(regexp = "^$|^[a-zA-Z\\s,.'&-]+$", message = "Specialization can only contain letters, spaces, and basic punctuation")
        String specialization,

        @Size(max = 500, message = "Bio cannot exceed 500 characters")
        @Pattern(
            regexp = "^$|^(?!\\s+$)[^<>]{10,500}$",
            message = "Bio must be between 10 and 500 characters and cannot contain HTML or script tags (< or >)"
        )
        String bio,

        @Size(max = 255, message = "Address cannot exceed 255 characters")
        @Pattern(
            regexp = "^$|^(?!\\s+$)[a-zA-Z0-9\\s,.'#\\/()&-]{5,255}$",
            message = "Address must be between 5 and 255 characters and can only contain letters, numbers, spaces, and basic punctuation (# , . - / ' &)"
        )
        String address,

        @Pattern(regexp = "^$|^[0-9]{10}$", message = "Phone must be a valid 10-digit number")
        String phone
) {}
