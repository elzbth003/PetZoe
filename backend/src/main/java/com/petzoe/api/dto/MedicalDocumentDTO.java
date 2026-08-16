package com.petzoe.api.dto;

import com.petzoe.api.entity.DocumentVerificationStatus;
import com.petzoe.api.entity.MedicalDocument;
import com.petzoe.api.entity.MedicalDocumentType;
import java.time.LocalDateTime;

public class MedicalDocumentDTO {
    private Long id;
    private MedicalDocumentType documentType;
    private String documentBase64;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private DocumentVerificationStatus verificationStatus;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String notes;

    public MedicalDocumentDTO() {}

    public MedicalDocumentDTO(MedicalDocument d) {
        this.id = d.getId();
        this.documentType = d.getDocumentType();
        this.documentBase64 = d.getDocumentBase64();
        this.uploadedByName = d.getUploadedBy().getName();
        this.uploadedAt = d.getUploadedAt();
        this.verificationStatus = d.getVerificationStatus();
        this.verifiedByName = d.getVerifiedBy() != null ? d.getVerifiedBy().getName() : null;
        this.verifiedAt = d.getVerifiedAt();
        this.notes = d.getNotes();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalDocumentType getDocumentType() { return documentType; }
    public void setDocumentType(MedicalDocumentType documentType) { this.documentType = documentType; }

    public String getDocumentBase64() { return documentBase64; }
    public void setDocumentBase64(String documentBase64) { this.documentBase64 = documentBase64; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public DocumentVerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(DocumentVerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerifiedByName() { return verifiedByName; }
    public void setVerifiedByName(String verifiedByName) { this.verifiedByName = verifiedByName; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
