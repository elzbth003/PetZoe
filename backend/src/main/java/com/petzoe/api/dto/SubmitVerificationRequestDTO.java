package com.petzoe.api.dto;

public record SubmitVerificationRequestDTO(
    String documentBase64,
    String additionalDocumentsBase64
) {}
