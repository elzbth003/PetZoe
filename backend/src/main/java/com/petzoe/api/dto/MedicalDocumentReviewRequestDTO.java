package com.petzoe.api.dto;

import com.petzoe.api.entity.DocumentVerificationStatus;

public record MedicalDocumentReviewRequestDTO(
    DocumentVerificationStatus status,
    String notes
) {}
