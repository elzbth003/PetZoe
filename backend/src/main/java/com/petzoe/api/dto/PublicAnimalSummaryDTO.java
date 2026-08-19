package com.petzoe.api.dto;

import com.petzoe.api.entity.AdoptionListing;
import com.petzoe.api.entity.Animal;
import com.petzoe.api.entity.AnimalSex;
import com.petzoe.api.entity.AnimalSize;

public class PublicAnimalSummaryDTO {
    private Long id;
    private String animalCode;
    private String name;
    private String species;
    private String breed;
    private Integer estimatedAgeMonths;
    private AnimalSex sex;
    private AnimalSize size;
    private String primaryPhotoBase64;
    private String city;
    private String state;
    private String shelterName;
    private String adoptionStatus;

    public PublicAnimalSummaryDTO() {}

    public PublicAnimalSummaryDTO(Animal animal, AdoptionListing listing, String adoptionStatus) {
        this.id = animal.getId();
        this.animalCode = animal.getAnimalCode();
        this.name = animal.getName();
        this.species = animal.getSpecies();
        this.breed = animal.getBreed();
        this.estimatedAgeMonths = animal.getEstimatedAgeMonths();
        this.sex = animal.getSex();
        this.size = listing != null ? listing.getSize() : AnimalSize.UNKNOWN;
        this.primaryPhotoBase64 = animal.getPrimaryPhotoBase64();
        this.city = animal.getShelter().getCity();
        this.state = animal.getShelter().getState();
        this.shelterName = animal.getShelter().getShelterName();
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

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

    public String getAdoptionStatus() { return adoptionStatus; }
    public void setAdoptionStatus(String adoptionStatus) { this.adoptionStatus = adoptionStatus; }
}
