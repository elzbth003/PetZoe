package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vet_scan_records")
public class VetScanRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "image_reference", nullable = false, length = 512)
    private String imageReference;

    @Column(name = "image_hash", length = 64)
    private String imageHash;

    @Column(nullable = false, length = 32)
    private String status; // "COMPLETED", "INSUFFICIENT_IMAGE", "FAILED"

    @Column(name = "status_message", length = 512)
    private String statusMessage;

    @Column(name = "model_name", length = 64)
    private String modelName;

    @Column(name = "model_version", length = 32)
    private String modelVersion;

    @Column(name = "dataset_version", length = 64)
    private String datasetVersion;

    @Column(name = "model_mode", length = 32)
    private String modelMode; // "REAL", "DEVELOPMENT_DEMO"

    @Column(name = "predictions_json", columnDefinition = "TEXT")
    private String predictionsJson;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "confidence_level", length = 32)
    private String confidenceLevel; // "HIGH", "MODERATE", "LOW"

    @Column(name = "severity", length = 32)
    private String severity; // "MILD", "MODERATE", "SEVERE", "INSUFFICIENT_EVIDENCE"

    @Column(name = "severity_description", length = 512)
    private String severityDescription;

    @Column(name = "symptoms_json", columnDefinition = "TEXT")
    private String symptomsJson;

    @Column(name = "explanation_image_reference", length = 512)
    private String explanationImageReference;

    @Column(name = "explanation_method", length = 32)
    private String explanationMethod; // "GRAD_CAM"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_scan_id")
    private VetScanRecord previousScan;

    @Column(name = "progression_status", length = 32)
    private String progressionStatus; // "IMPROVING", "STABLE", "WORSENING", "INCONCLUSIVE", "BASELINE"

    @Column(name = "progression_notes", columnDefinition = "TEXT")
    private String progressionNotes;

    @Column(name = "clinical_disclaimer", columnDefinition = "TEXT")
    private String clinicalDisclaimer;

    @Column(name = "veterinarian_review_status", length = 32)
    private String veterinarianReviewStatus = "PENDING"; // "PENDING", "AGREE", "DISAGREE", "REQUIRES_FURTHER_EXAMINATION"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id")
    private User veterinarian;

    @Column(name = "veterinarian_notes", columnDefinition = "TEXT")
    private String veterinarianNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public VetScanRecord() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public String getImageReference() { return imageReference; }
    public void setImageReference(String imageReference) { this.imageReference = imageReference; }

    public String getImageHash() { return imageHash; }
    public void setImageHash(String imageHash) { this.imageHash = imageHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getDatasetVersion() { return datasetVersion; }
    public void setDatasetVersion(String datasetVersion) { this.datasetVersion = datasetVersion; }

    public String getModelMode() { return modelMode; }
    public void setModelMode(String modelMode) { this.modelMode = modelMode; }

    public String getPredictionsJson() { return predictionsJson; }
    public void setPredictionsJson(String predictionsJson) { this.predictionsJson = predictionsJson; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getSeverityDescription() { return severityDescription; }
    public void setSeverityDescription(String severityDescription) { this.severityDescription = severityDescription; }

    public String getSymptomsJson() { return symptomsJson; }
    public void setSymptomsJson(String symptomsJson) { this.symptomsJson = symptomsJson; }

    public String getExplanationImageReference() { return explanationImageReference; }
    public void setExplanationImageReference(String explanationImageReference) { this.explanationImageReference = explanationImageReference; }

    public String getExplanationMethod() { return explanationMethod; }
    public void setExplanationMethod(String explanationMethod) { this.explanationMethod = explanationMethod; }

    public VetScanRecord getPreviousScan() { return previousScan; }
    public void setPreviousScan(VetScanRecord previousScan) { this.previousScan = previousScan; }

    public String getProgressionStatus() { return progressionStatus; }
    public void setProgressionStatus(String progressionStatus) { this.progressionStatus = progressionStatus; }

    public String getProgressionNotes() { return progressionNotes; }
    public void setProgressionNotes(String progressionNotes) { this.progressionNotes = progressionNotes; }

    public String getClinicalDisclaimer() { return clinicalDisclaimer; }
    public void setClinicalDisclaimer(String clinicalDisclaimer) { this.clinicalDisclaimer = clinicalDisclaimer; }

    public String getVeterinarianReviewStatus() { return veterinarianReviewStatus; }
    public void setVeterinarianReviewStatus(String veterinarianReviewStatus) { this.veterinarianReviewStatus = veterinarianReviewStatus; }

    public User getVeterinarian() { return veterinarian; }
    public void setVeterinarian(User veterinarian) { this.veterinarian = veterinarian; }

    public String getVeterinarianNotes() { return veterinarianNotes; }
    public void setVeterinarianNotes(String veterinarianNotes) { this.veterinarianNotes = veterinarianNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
