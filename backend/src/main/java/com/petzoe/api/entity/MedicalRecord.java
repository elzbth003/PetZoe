package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A single professional veterinary examination of a shelter animal.
 * Belongs to the animal's permanent digital health record. Distinct from
 * Animal's shelter-observed fields (Phase 2) — this is the veterinarian's
 * confirmed professional finding.
 */
@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private User veterinarian;

    @Column(name = "examination_date", nullable = false)
    private LocalDate examinationDate;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "health_status", nullable = false)
    private String healthStatus;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String medication;

    @Column(name = "lab_investigations", columnDefinition = "TEXT")
    private String labInvestigations;

    @Column(name = "deworming_info", columnDefinition = "TEXT")
    private String dewormingInfo;

    @Column(name = "parasite_control_info", columnDefinition = "TEXT")
    private String parasiteControlInfo;

    @Enumerated(EnumType.STRING)
    @Column(name = "sterilization_status")
    private SterilizationStatus sterilizationStatus;

    @Column(name = "veterinary_notes", columnDefinition = "TEXT")
    private String veterinaryNotes;

    @Column(name = "follow_up_required", nullable = false)
    private boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public MedicalRecord() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public User getVeterinarian() { return veterinarian; }
    public void setVeterinarian(User veterinarian) { this.veterinarian = veterinarian; }

    public LocalDate getExaminationDate() { return examinationDate; }
    public void setExaminationDate(LocalDate examinationDate) { this.examinationDate = examinationDate; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public String getMedication() { return medication; }
    public void setMedication(String medication) { this.medication = medication; }

    public String getLabInvestigations() { return labInvestigations; }
    public void setLabInvestigations(String labInvestigations) { this.labInvestigations = labInvestigations; }

    public String getDewormingInfo() { return dewormingInfo; }
    public void setDewormingInfo(String dewormingInfo) { this.dewormingInfo = dewormingInfo; }

    public String getParasiteControlInfo() { return parasiteControlInfo; }
    public void setParasiteControlInfo(String parasiteControlInfo) { this.parasiteControlInfo = parasiteControlInfo; }

    public SterilizationStatus getSterilizationStatus() { return sterilizationStatus; }
    public void setSterilizationStatus(SterilizationStatus sterilizationStatus) { this.sterilizationStatus = sterilizationStatus; }

    public String getVeterinaryNotes() { return veterinaryNotes; }
    public void setVeterinaryNotes(String veterinaryNotes) { this.veterinaryNotes = veterinaryNotes; }

    public boolean isFollowUpRequired() { return followUpRequired; }
    public void setFollowUpRequired(boolean followUpRequired) { this.followUpRequired = followUpRequired; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
