package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 60, message = "Name must be between 2 and 60 characters")
    @Pattern(regexp = "^[a-zA-Z\\s.'-]+$", message = "Name can only contain letters, spaces, hyphens, and apostrophes")
    String name,

    @Pattern(regexp = "^([0-9]{10})?$", message = "Phone must be a valid 10-digit number")
    String phone,

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    String bio,

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    String address,

    String profileImage,

    @Size(max = 100, message = "Specialization cannot exceed 100 characters")
    String specialization
) {}
