package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Clinical document (scans, reports, certificates) for privately owned pets (Pet).
 */
@Entity
@Table(name = "pet_medical_documents")
public class PetMedicalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column
    private String title;

    @Column(name = "document_base64", columnDefinition = "TEXT", nullable = false)
    private String documentBase64;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    public PetMedicalDocument() {
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDocumentBase64() { return documentBase64; }
    public void setDocumentBase64(String documentBase64) { this.documentBase64 = documentBase64; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
