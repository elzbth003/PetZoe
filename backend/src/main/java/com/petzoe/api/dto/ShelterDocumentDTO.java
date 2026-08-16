package com.petzoe.api.dto;

import com.petzoe.api.entity.ShelterDocument;
import java.time.LocalDateTime;

public class ShelterDocumentDTO {
    private Long id;
    private String documentType;
    private String documentBase64;
    private LocalDateTime uploadedAt;

    public ShelterDocumentDTO() {}

    public ShelterDocumentDTO(ShelterDocument doc) {
        this.id = doc.getId();
        this.documentType = doc.getDocumentType();
        this.documentBase64 = doc.getDocumentBase64();
        this.uploadedAt = doc.getUploadedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getDocumentBase64() { return documentBase64; }
    public void setDocumentBase64(String documentBase64) { this.documentBase64 = documentBase64; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
