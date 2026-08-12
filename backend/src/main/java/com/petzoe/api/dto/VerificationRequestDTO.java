package com.petzoe.api.dto;

import com.petzoe.api.entity.VerificationRequest;
import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;

public class VerificationRequestDTO {
    private Long id;
    private AdminUserDTO user;
    private String entityType;
    private VerificationStatus status;
    private String reviewerNotes;
    private String documentBase64;
    private String additionalDocumentsBase64;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    public VerificationRequestDTO() {}

    public VerificationRequestDTO(VerificationRequest vr) {
        this.id = vr.getId();
        this.user = new AdminUserDTO(vr.getUser());
        this.entityType = vr.getEntityType();
        this.status = vr.getStatus();
        this.reviewerNotes = vr.getReviewerNotes();
        this.documentBase64 = vr.getDocumentBase64();
        this.additionalDocumentsBase64 = vr.getAdditionalDocumentsBase64();
        this.submittedAt = vr.getSubmittedAt();
        this.reviewedAt = vr.getReviewedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AdminUserDTO getUser() { return user; }
    public void setUser(AdminUserDTO user) { this.user = user; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getDocumentBase64() { return documentBase64; }
    public void setDocumentBase64(String documentBase64) { this.documentBase64 = documentBase64; }

    public String getAdditionalDocumentsBase64() { return additionalDocumentsBase64; }
    public void setAdditionalDocumentsBase64(String additionalDocumentsBase64) { this.additionalDocumentsBase64 = additionalDocumentsBase64; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
