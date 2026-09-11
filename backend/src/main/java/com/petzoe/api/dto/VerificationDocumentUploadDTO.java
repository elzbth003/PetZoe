package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;

public record VerificationDocumentUploadDTO(
        @NotBlank(message = "Document type is required")
        String documentType,

        @NotBlank(message = "Document base64 content is required")
        String documentBase64
) {}
