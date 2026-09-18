package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateRehomeListingDTO(
    @NotNull(message = "Pet ID is required")
    Long petId,

    @NotBlank(message = "Listing title is required")
    String title,

    @NotBlank(message = "Reason for rehoming is required")
    String reason,

    String requirements,
    String city
) {}
