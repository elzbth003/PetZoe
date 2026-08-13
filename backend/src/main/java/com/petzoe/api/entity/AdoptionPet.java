package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_pets")
public class AdoptionPet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_manager_id", nullable = false)
    private User shelterManager;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String species;

    @Column(nullable = false)
    private String breed;

    @Column(nullable = false)
    private Integer ageMonths;

    @Column(nullable = false)
    private String gender;

    @Column(length = 1000)
    private String healthStatus;

    @Column(length = 1000)
    private String vaccinationStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "medical_documents_base64", columnDefinition = "TEXT")
    private String medicalDocumentsBase64;

    @Column(name = "vaccination_records_base64", columnDefinition = "TEXT")
    private String vaccinationRecordsBase64;

    @Column(name = "pet_image_base64", columnDefinition = "TEXT")
    private String petImageBase64;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AdoptionPet() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getShelterManager() { return shelterManager; }
    public void setShelterManager(User shelterManager) { this.shelterManager = shelterManager; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public Integer getAgeMonths() { return ageMonths; }
    public void setAgeMonths(Integer ageMonths) { this.ageMonths = ageMonths; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public String getVaccinationStatus() { return vaccinationStatus; }
    public void setVaccinationStatus(String vaccinationStatus) { this.vaccinationStatus = vaccinationStatus; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getMedicalDocumentsBase64() { return medicalDocumentsBase64; }
    public void setMedicalDocumentsBase64(String medicalDocumentsBase64) { this.medicalDocumentsBase64 = medicalDocumentsBase64; }

    public String getVaccinationRecordsBase64() { return vaccinationRecordsBase64; }
    public void setVaccinationRecordsBase64(String vaccinationRecordsBase64) { this.vaccinationRecordsBase64 = vaccinationRecordsBase64; }

    public String getPetImageBase64() { return petImageBase64; }
    public void setPetImageBase64(String petImageBase64) { this.petImageBase64 = petImageBase64; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
