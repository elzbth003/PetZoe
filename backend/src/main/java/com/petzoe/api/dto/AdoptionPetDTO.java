package com.petzoe.api.dto;

import com.petzoe.api.entity.AdoptionPet;
import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;

public class AdoptionPetDTO {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private Integer ageMonths;
    private String gender;
    private String healthStatus;
    private String vaccinationStatus;
    private VerificationStatus verificationStatus;
    private String petImageBase64;
    private String medicalDocumentsBase64;
    private String vaccinationRecordsBase64;
    private LocalDateTime createdAt;
    private AdminUserDTO shelterManager;

    public AdoptionPetDTO(AdoptionPet pet) {
        this.id = pet.getId();
        this.name = pet.getName();
        this.species = pet.getSpecies();
        this.breed = pet.getBreed();
        this.ageMonths = pet.getAgeMonths();
        this.gender = pet.getGender();
        this.healthStatus = pet.getHealthStatus();
        this.vaccinationStatus = pet.getVaccinationStatus();
        this.verificationStatus = pet.getVerificationStatus();
        this.petImageBase64 = pet.getPetImageBase64();
        this.medicalDocumentsBase64 = pet.getMedicalDocumentsBase64();
        this.vaccinationRecordsBase64 = pet.getVaccinationRecordsBase64();
        this.createdAt = pet.getCreatedAt();
        if (pet.getShelterManager() != null) {
            this.shelterManager = new AdminUserDTO(pet.getShelterManager());
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getPetImageBase64() { return petImageBase64; }
    public void setPetImageBase64(String petImageBase64) { this.petImageBase64 = petImageBase64; }
    public String getMedicalDocumentsBase64() { return medicalDocumentsBase64; }
    public void setMedicalDocumentsBase64(String medicalDocumentsBase64) { this.medicalDocumentsBase64 = medicalDocumentsBase64; }
    public String getVaccinationRecordsBase64() { return vaccinationRecordsBase64; }
    public void setVaccinationRecordsBase64(String vaccinationRecordsBase64) { this.vaccinationRecordsBase64 = vaccinationRecordsBase64; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public AdminUserDTO getShelterManager() { return shelterManager; }
    public void setShelterManager(AdminUserDTO shelterManager) { this.shelterManager = shelterManager; }
}
