package com.petzoe.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PetTransferRequestDTO(
    @NotBlank(message = "New owner email is required")
    @Email(message = "Please provide a valid email address")
    String newOwnerEmail
) {}
