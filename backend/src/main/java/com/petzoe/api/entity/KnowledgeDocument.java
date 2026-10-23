package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "knowledge_documents", indexes = {
    @Index(name = "idx_knowledge_docs_status_cat", columnList = "status, category")
})
public class KnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(length = 200)
    private String publisher;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "document_version", length = 100)
    private String documentVersion;

    @Column(name = "content_hash", length = 64, unique = true)
    private String contentHash;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "doi", length = 200)
    private String doi;

    @Column(name = "species", length = 100)
    private String species;

    @Column(name = "clinical_topic", length = 150)
    private String clinicalTopic;

    @Column(name = "evidence_type", length = 80)
    private String evidenceType = "OFFICIAL_CLINICAL_GUIDELINE"; // OFFICIAL_CLINICAL_GUIDELINE, PEER_REVIEWED_STUDY, SYSTEMATIC_REVIEW

    @Column(name = "license", length = 150)
    private String license = "Open Access / Educational Attribution";

    @Column(name = "source_verification_status", length = 50)
    private String sourceVerificationStatus = "VERIFIED"; // VERIFIED, UNVERIFIED, SUPERSEDED, FAILED

    @Column(name = "access_date")
    private LocalDateTime accessDate = LocalDateTime.now();

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, DRAFT

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KnowledgeChunk> chunks = new ArrayList<>();

    public KnowledgeDocument() {}

    public KnowledgeDocument(String title, String sourceUrl, String publisher, String category,
                             String documentVersion, String contentHash, String status) {
        this.title = title;
        this.sourceUrl = sourceUrl;
        this.publisher = publisher;
        this.category = category;
        this.documentVersion = documentVersion;
        this.contentHash = contentHash;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDocumentVersion() { return documentVersion; }
    public void setDocumentVersion(String documentVersion) { this.documentVersion = documentVersion; }
    public String getContentHash() { return contentHash; }
    public void setContentHash(String contentHash) { this.contentHash = contentHash; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }
    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }
    public String getClinicalTopic() { return clinicalTopic; }
    public void setClinicalTopic(String clinicalTopic) { this.clinicalTopic = clinicalTopic; }
    public String getEvidenceType() { return evidenceType; }
    public void setEvidenceType(String evidenceType) { this.evidenceType = evidenceType; }
    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }
    public String getSourceVerificationStatus() { return sourceVerificationStatus; }
    public void setSourceVerificationStatus(String sourceVerificationStatus) { this.sourceVerificationStatus = sourceVerificationStatus; }
    public LocalDateTime getAccessDate() { return accessDate; }
    public void setAccessDate(LocalDateTime accessDate) { this.accessDate = accessDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<KnowledgeChunk> getChunks() { return chunks; }
    public void setChunks(List<KnowledgeChunk> chunks) { this.chunks = chunks; }
}
