package com.petzoe.api.dto;

import com.petzoe.api.entity.Animal;
import com.petzoe.api.entity.AnimalSex;
import com.petzoe.api.entity.AnimalStatus;
import java.time.LocalDateTime;

public class AnimalSummaryDTO {
    private Long id;
    private String animalCode;
    private String name;
    private String species;
    private String breed;
    private AnimalSex sex;
    private AnimalStatus status;
    private String primaryPhotoBase64;
    private boolean initialAssessmentRecorded;
    private boolean hasOverdueCare;
    private LocalDateTime createdAt;

    public AnimalSummaryDTO() {}

    public AnimalSummaryDTO(Animal animal) {
        this(animal, false);
    }

    public AnimalSummaryDTO(Animal animal, boolean hasOverdueCare) {
        this.id = animal.getId();
        this.animalCode = animal.getAnimalCode();
        this.name = animal.getName();
        this.species = animal.getSpecies();
        this.breed = animal.getBreed();
        this.sex = animal.getSex();
        this.status = animal.getStatus();
        this.primaryPhotoBase64 = animal.getPrimaryPhotoBase64();
        this.initialAssessmentRecorded = animal.getInitialAssessmentRecordedAt() != null;
        this.hasOverdueCare = hasOverdueCare;
        this.createdAt = animal.getCreatedAt();
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

    public AnimalSex getSex() { return sex; }
    public void setSex(AnimalSex sex) { this.sex = sex; }

    public AnimalStatus getStatus() { return status; }
    public void setStatus(AnimalStatus status) { this.status = status; }

    public String getPrimaryPhotoBase64() { return primaryPhotoBase64; }
    public void setPrimaryPhotoBase64(String primaryPhotoBase64) { this.primaryPhotoBase64 = primaryPhotoBase64; }

    public boolean isInitialAssessmentRecorded() { return initialAssessmentRecorded; }
    public void setInitialAssessmentRecorded(boolean initialAssessmentRecorded) { this.initialAssessmentRecorded = initialAssessmentRecorded; }

    public boolean isHasOverdueCare() { return hasOverdueCare; }
    public void setHasOverdueCare(boolean hasOverdueCare) { this.hasOverdueCare = hasOverdueCare; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
