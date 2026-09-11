package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PetMedicalDocumentUploadDTO(
        @NotBlank(message = "Document type is required")
        String documentType,
        String title,
        @NotBlank(message = "Document content is required")
        String documentBase64,
        String notes
) {}
