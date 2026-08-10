package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "Name is required")
    String name,

    String phone,

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    String bio,

    String address,

    String profileImage,

    String specialization
) {}
