package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * An adopter's application for a specific animal (spec section 13). Links
 * the animal, adopter, and their AdopterProfile; carries adoption-specific
 * statements (reason, per-animal care plan) rather than duplicating the
 * general household/housing data already captured on AdopterProfile.
 */
@Entity
@Table(name = "adoption_applications")
public class AdoptionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adopter_id", nullable = false)
    private User adopter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adopter_profile_id", nullable = false)
    private AdopterProfile adopterProfile;

    @Column(name = "reason_for_adoption", columnDefinition = "TEXT")
    private String reasonForAdoption;

    @Column(name = "pet_care_plan", columnDefinition = "TEXT")
    private String petCarePlan;

    @Column(name = "veterinary_care_plan_notes", columnDefinition = "TEXT")
    private String veterinaryCarePlanNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdoptionApplicationStatus status = AdoptionApplicationStatus.DRAFT;

    @Column(name = "shelter_notes", length = 1000)
    private String shelterNotes;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AdoptionApplication() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public User getAdopter() { return adopter; }
    public void setAdopter(User adopter) { this.adopter = adopter; }

    public AdopterProfile getAdopterProfile() { return adopterProfile; }
    public void setAdopterProfile(AdopterProfile adopterProfile) { this.adopterProfile = adopterProfile; }

    public String getReasonForAdoption() { return reasonForAdoption; }
    public void setReasonForAdoption(String reasonForAdoption) { this.reasonForAdoption = reasonForAdoption; }

    public String getPetCarePlan() { return petCarePlan; }
    public void setPetCarePlan(String petCarePlan) { this.petCarePlan = petCarePlan; }

    public String getVeterinaryCarePlanNotes() { return veterinaryCarePlanNotes; }
    public void setVeterinaryCarePlanNotes(String veterinaryCarePlanNotes) { this.veterinaryCarePlanNotes = veterinaryCarePlanNotes; }

    public AdoptionApplicationStatus getStatus() { return status; }
    public void setStatus(AdoptionApplicationStatus status) { this.status = status; }

    public String getShelterNotes() { return shelterNotes; }
    public void setShelterNotes(String shelterNotes) { this.shelterNotes = shelterNotes; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getDecidedAt() { return decidedAt; }
    public void setDecidedAt(LocalDateTime decidedAt) { this.decidedAt = decidedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
