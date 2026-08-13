package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewRequestDTO(
    @NotBlank(message = "Reason is required when rejecting or requesting resubmission")
    String reason
) {}
