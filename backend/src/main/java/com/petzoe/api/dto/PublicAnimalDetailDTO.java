package com.petzoe.api.dto;

import com.petzoe.api.entity.AdoptionListing;
import com.petzoe.api.entity.Animal;
import com.petzoe.api.entity.AnimalSex;
import com.petzoe.api.entity.AnimalSize;
import com.petzoe.api.entity.SterilizationStatus;

/**
 * Public adoption profile (spec section 11). Deliberately excludes private
 * medical documents, internal shelter notes, adopter information, and any
 * shelter contact/registration detail — see PublicShelterInfoDTO.
 */
public class PublicAnimalDetailDTO {
    private Long id;
    private String animalCode;
    private String name;
    private String species;
    private String breed;
    private Integer estimatedAgeMonths;
    private AnimalSex sex;
    private AnimalSize size;
    private String primaryPhotoBase64;
    private String personality;
    private String behaviour;
    private String healthSummary;
    private String vaccinationStatus;
    private SterilizationStatus sterilizationStatus;
    private String specialCareRequirements;
    private String listingDescription;
    private Double adoptionFee;
    private PublicShelterInfoDTO shelter;
    private String adoptionStatus;

    public PublicAnimalDetailDTO() {}

    public PublicAnimalDetailDTO(Animal animal, AdoptionListing listing, String healthSummary,
                                  String vaccinationStatus, String adoptionStatus) {
        this.id = animal.getId();
        this.animalCode = animal.getAnimalCode();
        this.name = animal.getName();
        this.species = animal.getSpecies();
        this.breed = animal.getBreed();
        this.estimatedAgeMonths = animal.getEstimatedAgeMonths();
        this.sex = animal.getSex();
        this.size = listing.getSize();
        this.primaryPhotoBase64 = animal.getPrimaryPhotoBase64();
        this.personality = listing.getPersonality();
        this.behaviour = animal.getBehaviourObservations();
        this.healthSummary = healthSummary;
        this.vaccinationStatus = vaccinationStatus;
        this.sterilizationStatus = animal.getSterilizationStatus();
        this.specialCareRequirements = listing.getSpecialCareRequirements();
        this.listingDescription = listing.getListingDescription();
        this.adoptionFee = listing.getAdoptionFee();
        this.shelter = new PublicShelterInfoDTO(animal.getShelter());
        this.adoptionStatus = adoptionStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnimalCode() { return animalCode; }
    public void setAnimalCode(String animalCode) { this.animalCode = animalCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public Integer getEstimatedAgeMonths() { return estimatedAgeMonths; }
    public void setEstimatedAgeMonths(Integer estimatedAgeMonths) { this.estimatedAgeMonths = estimatedAgeMonths; }

    public AnimalSex getSex() { return sex; }
    public void setSex(AnimalSex sex) { this.sex = sex; }

    public AnimalSize getSize() { return size; }
    public void setSize(AnimalSize size) { this.size = size; }

    public String getPrimaryPhotoBase64() { return primaryPhotoBase64; }
    public void setPrimaryPhotoBase64(String primaryPhotoBase64) { this.primaryPhotoBase64 = primaryPhotoBase64; }

    public String getPersonality() { return personality; }
    public void setPersonality(String personality) { this.personality = personality; }

    public String getBehaviour() { return behaviour; }
    public void setBehaviour(String behaviour) { this.behaviour = behaviour; }

    public String getHealthSummary() { return healthSummary; }
    public void setHealthSummary(String healthSummary) { this.healthSummary = healthSummary; }

    public String getVaccinationStatus() { return vaccinationStatus; }
    public void setVaccinationStatus(String vaccinationStatus) { this.vaccinationStatus = vaccinationStatus; }

    public SterilizationStatus getSterilizationStatus() { return sterilizationStatus; }
    public void setSterilizationStatus(SterilizationStatus sterilizationStatus) { this.sterilizationStatus = sterilizationStatus; }

    public String getSpecialCareRequirements() { return specialCareRequirements; }
    public void setSpecialCareRequirements(String specialCareRequirements) { this.specialCareRequirements = specialCareRequirements; }

    public String getListingDescription() { return listingDescription; }
    public void setListingDescription(String listingDescription) { this.listingDescription = listingDescription; }

    public Double getAdoptionFee() { return adoptionFee; }
    public void setAdoptionFee(Double adoptionFee) { this.adoptionFee = adoptionFee; }

    public PublicShelterInfoDTO getShelter() { return shelter; }
    public void setShelter(PublicShelterInfoDTO shelter) { this.shelter = shelter; }

    public String getAdoptionStatus() { return adoptionStatus; }
    public void setAdoptionStatus(String adoptionStatus) { this.adoptionStatus = adoptionStatus; }
}
