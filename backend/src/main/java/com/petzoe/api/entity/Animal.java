package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A shelter animal's permanent identity record. Created at intake and carried
 * through the entire shelter-to-adoption lifecycle (medical care, listing,
 * application, handover, follow-up in later phases).
 *
 * Distinguishes shelter-observed fields (recorded here, at intake / initial
 * assessment time) from veterinarian-confirmed findings, which live on the
 * separate MedicalRecord entity introduced in Phase 3.
 */
@Entity
@Table(name = "animals")
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "animal_code", unique = true)
    private String animalCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_id", nullable = false)
    private Shelter shelter;

    private String name;

    @Column(nullable = false)
    private String species;

    private String breed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnimalSex sex = AnimalSex.UNKNOWN;

    @Column(name = "estimated_age_months")
    private Integer estimatedAgeMonths;

    private String color;

    @Column(name = "distinguishing_marks", columnDefinition = "TEXT")
    private String distinguishingMarks;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "primary_photo_base64", columnDefinition = "TEXT")
    private String primaryPhotoBase64;

    @Column(name = "microchip_number")
    private String microchipNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnimalStatus status = AnimalStatus.IN_SHELTER_CARE;

    @Enumerated(EnumType.STRING)
    @Column(name = "sterilization_status", nullable = false)
    private SterilizationStatus sterilizationStatus = SterilizationStatus.UNKNOWN;

    // ── Initial shelter assessment (observed by shelter, not veterinarian) ──
    @Column(name = "general_condition")
    private String generalCondition;

    @Column(name = "visible_injuries", columnDefinition = "TEXT")
    private String visibleInjuries;

    @Column(name = "behaviour_observations", columnDefinition = "TEXT")
    private String behaviourObservations;

    @Column(name = "immediate_medical_concerns", columnDefinition = "TEXT")
    private String immediateMedicalConcerns;

    @Column(name = "known_allergies", columnDefinition = "TEXT")
    private String knownAllergies;

    @Column(name = "known_medical_history", columnDefinition = "TEXT")
    private String knownMedicalHistory;

    @Column(name = "parasite_concerns", columnDefinition = "TEXT")
    private String parasiteConcerns;

    @Column(name = "vaccination_info_at_intake", columnDefinition = "TEXT")
    private String vaccinationInfoAtIntake;

    @Column(name = "initial_assessment_recorded_at")
    private LocalDateTime initialAssessmentRecordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initial_assessment_recorded_by")
    private User initialAssessmentRecordedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Animal() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnimalCode() { return animalCode; }
    public void setAnimalCode(String animalCode) { this.animalCode = animalCode; }

    public Shelter getShelter() { return shelter; }
    public void setShelter(Shelter shelter) { this.shelter = shelter; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public AnimalSex getSex() { return sex; }
    public void setSex(AnimalSex sex) { this.sex = sex; }

    public Integer getEstimatedAgeMonths() { return estimatedAgeMonths; }
    public void setEstimatedAgeMonths(Integer estimatedAgeMonths) { this.estimatedAgeMonths = estimatedAgeMonths; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDistinguishingMarks() { return distinguishingMarks; }
    public void setDistinguishingMarks(String distinguishingMarks) { this.distinguishingMarks = distinguishingMarks; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getPrimaryPhotoBase64() { return primaryPhotoBase64; }
    public void setPrimaryPhotoBase64(String primaryPhotoBase64) { this.primaryPhotoBase64 = primaryPhotoBase64; }

    public String getMicrochipNumber() { return microchipNumber; }
    public void setMicrochipNumber(String microchipNumber) { this.microchipNumber = microchipNumber; }

    public AnimalStatus getStatus() { return status; }
    public void setStatus(AnimalStatus status) { this.status = status; }

    public SterilizationStatus getSterilizationStatus() { return sterilizationStatus; }
    public void setSterilizationStatus(SterilizationStatus sterilizationStatus) { this.sterilizationStatus = sterilizationStatus; }

    public String getGeneralCondition() { return generalCondition; }
    public void setGeneralCondition(String generalCondition) { this.generalCondition = generalCondition; }

    public String getVisibleInjuries() { return visibleInjuries; }
    public void setVisibleInjuries(String visibleInjuries) { this.visibleInjuries = visibleInjuries; }

    public String getBehaviourObservations() { return behaviourObservations; }
    public void setBehaviourObservations(String behaviourObservations) { this.behaviourObservations = behaviourObservations; }

    public String getImmediateMedicalConcerns() { return immediateMedicalConcerns; }
    public void setImmediateMedicalConcerns(String immediateMedicalConcerns) { this.immediateMedicalConcerns = immediateMedicalConcerns; }

    public String getKnownAllergies() { return knownAllergies; }
    public void setKnownAllergies(String knownAllergies) { this.knownAllergies = knownAllergies; }

    public String getKnownMedicalHistory() { return knownMedicalHistory; }
    public void setKnownMedicalHistory(String knownMedicalHistory) { this.knownMedicalHistory = knownMedicalHistory; }

    public String getParasiteConcerns() { return parasiteConcerns; }
    public void setParasiteConcerns(String parasiteConcerns) { this.parasiteConcerns = parasiteConcerns; }

    public String getVaccinationInfoAtIntake() { return vaccinationInfoAtIntake; }
    public void setVaccinationInfoAtIntake(String vaccinationInfoAtIntake) { this.vaccinationInfoAtIntake = vaccinationInfoAtIntake; }

    public LocalDateTime getInitialAssessmentRecordedAt() { return initialAssessmentRecordedAt; }
    public void setInitialAssessmentRecordedAt(LocalDateTime initialAssessmentRecordedAt) { this.initialAssessmentRecordedAt = initialAssessmentRecordedAt; }

    public User getInitialAssessmentRecordedBy() { return initialAssessmentRecordedBy; }
    public void setInitialAssessmentRecordedBy(User initialAssessmentRecordedBy) { this.initialAssessmentRecordedBy = initialAssessmentRecordedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
