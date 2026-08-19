package com.petzoe.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    String phone,

    @NotBlank(message = "Role is required")
    @Pattern(
        regexp = "^(Pet Owner|Veterinarian|Shelter Manager|Marketplace Seller)$",
        message = "Invalid role"
    )
    String role
) {}
