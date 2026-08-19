package com.petzoe.api.dto;

import com.petzoe.api.entity.AdoptionListing;
import com.petzoe.api.entity.AnimalSize;
import com.petzoe.api.entity.AnimalStatus;
import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;
import java.util.List;

public class AdoptionListingDTO {
    private Long id;
    private Long animalId;
    private String animalCode;
    private String animalName;
    private String species;
    private String breed;
    private String primaryPhotoBase64;
    private AnimalStatus animalStatus;
    private String shelterName;
    private AnimalSize size;
    private String personality;
    private String specialCareRequirements;
    private Double adoptionFee;
    private String listingDescription;
    private VerificationStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewerNotes;
    private List<String> missingRequirements;

    public AdoptionListingDTO() {}

    public AdoptionListingDTO(AdoptionListing listing, List<String> missingRequirements) {
        this.id = listing.getId();
        this.animalId = listing.getAnimal().getId();
        this.animalCode = listing.getAnimal().getAnimalCode();
        this.animalName = listing.getAnimal().getName();
        this.species = listing.getAnimal().getSpecies();
        this.breed = listing.getAnimal().getBreed();
        this.primaryPhotoBase64 = listing.getAnimal().getPrimaryPhotoBase64();
        this.animalStatus = listing.getAnimal().getStatus();
        this.shelterName = listing.getAnimal().getShelter().getShelterName();
        this.size = listing.getSize();
        this.personality = listing.getPersonality();
        this.specialCareRequirements = listing.getSpecialCareRequirements();
        this.adoptionFee = listing.getAdoptionFee();
        this.listingDescription = listing.getListingDescription();
        this.status = listing.getStatus();
        this.submittedAt = listing.getSubmittedAt();
        this.reviewedAt = listing.getReviewedAt();
        this.reviewerNotes = listing.getReviewerNotes();
        this.missingRequirements = missingRequirements;
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

    public AnimalStatus getAnimalStatus() { return animalStatus; }
    public void setAnimalStatus(AnimalStatus animalStatus) { this.animalStatus = animalStatus; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

    public AnimalSize getSize() { return size; }
    public void setSize(AnimalSize size) { this.size = size; }

    public String getPersonality() { return personality; }
    public void setPersonality(String personality) { this.personality = personality; }

    public String getSpecialCareRequirements() { return specialCareRequirements; }
    public void setSpecialCareRequirements(String specialCareRequirements) { this.specialCareRequirements = specialCareRequirements; }

    public Double getAdoptionFee() { return adoptionFee; }
    public void setAdoptionFee(Double adoptionFee) { this.adoptionFee = adoptionFee; }

    public String getListingDescription() { return listingDescription; }
    public void setListingDescription(String listingDescription) { this.listingDescription = listingDescription; }

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public List<String> getMissingRequirements() { return missingRequirements; }
    public void setMissingRequirements(List<String> missingRequirements) { this.missingRequirements = missingRequirements; }
}
