package com.petzoe.api.dto;

import com.petzoe.api.entity.MedicalDocumentType;

public record MedicalDocumentUploadRequestDTO(
    MedicalDocumentType documentType,
    String documentBase64,
    String notes
) {}
