package com.petzoe.api.dto;

import com.petzoe.api.entity.PetMedicalDocument;
import java.time.LocalDateTime;

public record PetMedicalDocumentDTO(
        Long id,
        Long petId,
        String petName,
        Long uploadedById,
        String uploadedByName,
        String documentType,
        String title,
        String documentBase64,
        String notes,
        LocalDateTime uploadedAt
) {
    public PetMedicalDocumentDTO(PetMedicalDocument doc) {
        this(
                doc.getId(),
                doc.getPet().getId(),
                doc.getPet().getName(),
                doc.getUploadedBy().getId(),
                doc.getUploadedBy().getName(),
                doc.getDocumentType(),
                doc.getTitle(),
                doc.getDocumentBase64(),
                doc.getNotes(),
                doc.getUploadedAt()
        );
    }
}
