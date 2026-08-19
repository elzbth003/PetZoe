package com.petzoe.api.dto;

import com.petzoe.api.entity.AdoptionApplication;
import com.petzoe.api.entity.AdoptionApplicationStatus;
import java.time.LocalDateTime;

public class AdoptionApplicationDTO {
    private Long id;
    private Long animalId;
    private String animalCode;
    private String animalName;
    private String species;
    private String breed;
    private String primaryPhotoBase64;
    private String shelterName;
    private String adopterName;
    private String adopterEmail;
    private String adopterPhone;
    private AdopterProfileDTO adopterProfile;
    private String reasonForAdoption;
    private String petCarePlan;
    private String veterinaryCarePlanNotes;
    private AdoptionApplicationStatus status;
    private String shelterNotes;
    private LocalDateTime submittedAt;
    private LocalDateTime decidedAt;
    private LocalDateTime createdAt;

    public AdoptionApplicationDTO() {}

    public AdoptionApplicationDTO(AdoptionApplication app, boolean includeAdopterDetail) {
        this.id = app.getId();
        this.animalId = app.getAnimal().getId();
        this.animalCode = app.getAnimal().getAnimalCode();
        this.animalName = app.getAnimal().getName();
        this.species = app.getAnimal().getSpecies();
        this.breed = app.getAnimal().getBreed();
        this.primaryPhotoBase64 = app.getAnimal().getPrimaryPhotoBase64();
        this.shelterName = app.getAnimal().getShelter().getShelterName();
        this.reasonForAdoption = app.getReasonForAdoption();
        this.petCarePlan = app.getPetCarePlan();
        this.veterinaryCarePlanNotes = app.getVeterinaryCarePlanNotes();
        this.status = app.getStatus();
        this.shelterNotes = app.getShelterNotes();
        this.submittedAt = app.getSubmittedAt();
        this.decidedAt = app.getDecidedAt();
        this.createdAt = app.getCreatedAt();
        if (includeAdopterDetail) {
            this.adopterName = app.getAdopter().getName();
            this.adopterEmail = app.getAdopter().getEmail();
            this.adopterPhone = app.getAdopter().getPhone();
            this.adopterProfile = new AdopterProfileDTO(app.getAdopterProfile(), true);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAnimalId() { return animalId; }
    public void setAnimalId(Long animalId) { this.animalId = animalId; }

    public String getAnimalCode() { return animalCode; }
    public void setAnimalCode(String animalCode) { this.animalCode = animalCode; }

    public String getAnimalName() { return animalName; }
    public void setAnimalName(String animalName) { this.animalName = animalName; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public String getPrimaryPhotoBase64() { return primaryPhotoBase64; }
    public void setPrimaryPhotoBase64(String primaryPhotoBase64) { this.primaryPhotoBase64 = primaryPhotoBase64; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

    public String getAdopterName() { return adopterName; }
    public void setAdopterName(String adopterName) { this.adopterName = adopterName; }

    public String getAdopterEmail() { return adopterEmail; }
    public void setAdopterEmail(String adopterEmail) { this.adopterEmail = adopterEmail; }

    public String getAdopterPhone() { return adopterPhone; }
    public void setAdopterPhone(String adopterPhone) { this.adopterPhone = adopterPhone; }

    public AdopterProfileDTO getAdopterProfile() { return adopterProfile; }
    public void setAdopterProfile(AdopterProfileDTO adopterProfile) { this.adopterProfile = adopterProfile; }

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
}
