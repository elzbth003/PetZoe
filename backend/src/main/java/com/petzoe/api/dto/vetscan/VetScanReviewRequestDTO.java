package com.petzoe.api.dto.vetscan;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VetScanReviewRequestDTO(
        @NotBlank(message = "Review status is required")
        @Pattern(regexp = "AGREE|DISAGREE|REQUIRES_FURTHER_EXAMINATION", message = "Invalid review status")
        String reviewStatus,

        String veterinarianNotes
) {}
