package com.petzoe.api.dto;

import com.petzoe.api.entity.Animal;
import com.petzoe.api.entity.AnimalSex;
import com.petzoe.api.entity.AnimalStatus;
import com.petzoe.api.entity.SterilizationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AnimalResponseDTO {
    private Long id;
    private String animalCode;
    private Long shelterId;
    private String shelterName;
    private String name;
    private String species;
    private String breed;
    private AnimalSex sex;
    private Integer estimatedAgeMonths;
    private String color;
    private String distinguishingMarks;
    private Double weightKg;
    private String primaryPhotoBase64;
    private String microchipNumber;
    private AnimalStatus status;
    private SterilizationStatus sterilizationStatus;

    private String generalCondition;
    private String visibleInjuries;
    private String behaviourObservations;
    private String immediateMedicalConcerns;
    private String knownAllergies;
    private String knownMedicalHistory;
    private String parasiteConcerns;
    private String vaccinationInfoAtIntake;
    private LocalDateTime initialAssessmentRecordedAt;
    private String initialAssessmentRecordedByName;

    private List<AnimalIntakeDTO> intakeHistory;
    private List<MedicalRecordDTO> medicalRecords;
    private List<VaccinationDTO> vaccinations;
    private List<MedicalDocumentDTO> medicalDocuments;
    private List<PreventiveCareDTO> preventiveCareRecords;

    private LocalDate nextVaccinationDueDate;
    private int overdueVaccinationCount;
    private LocalDate nextPreventiveCareDueDate;
    private int overduePreventiveCareCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AnimalResponseDTO() {}

    public AnimalResponseDTO(Animal animal, List<AnimalIntakeDTO> intakeHistory,
                              List<MedicalRecordDTO> medicalRecords, List<VaccinationDTO> vaccinations,
                              List<MedicalDocumentDTO> medicalDocuments, List<PreventiveCareDTO> preventiveCareRecords) {
        this.id = animal.getId();
        this.animalCode = animal.getAnimalCode();
        this.shelterId = animal.getShelter().getId();
        this.shelterName = animal.getShelter().getShelterName();
        this.name = animal.getName();
        this.species = animal.getSpecies();
        this.breed = animal.getBreed();
        this.sex = animal.getSex();
        this.estimatedAgeMonths = animal.getEstimatedAgeMonths();
        this.color = animal.getColor();
        this.distinguishingMarks = animal.getDistinguishingMarks();
        this.weightKg = animal.getWeightKg();
        this.primaryPhotoBase64 = animal.getPrimaryPhotoBase64();
        this.microchipNumber = animal.getMicrochipNumber();
        this.status = animal.getStatus();
        this.sterilizationStatus = animal.getSterilizationStatus();
        this.generalCondition = animal.getGeneralCondition();
        this.visibleInjuries = animal.getVisibleInjuries();
        this.behaviourObservations = animal.getBehaviourObservations();
        this.immediateMedicalConcerns = animal.getImmediateMedicalConcerns();
        this.knownAllergies = animal.getKnownAllergies();
        this.knownMedicalHistory = animal.getKnownMedicalHistory();
        this.parasiteConcerns = animal.getParasiteConcerns();
        this.vaccinationInfoAtIntake = animal.getVaccinationInfoAtIntake();
        this.initialAssessmentRecordedAt = animal.getInitialAssessmentRecordedAt();
        this.initialAssessmentRecordedByName = animal.getInitialAssessmentRecordedBy() != null
                ? animal.getInitialAssessmentRecordedBy().getName() : null;
        this.intakeHistory = intakeHistory;
        this.medicalRecords = medicalRecords;
        this.vaccinations = vaccinations;
        this.medicalDocuments = medicalDocuments;
        this.preventiveCareRecords = preventiveCareRecords;
        this.createdAt = animal.getCreatedAt();
        this.updatedAt = animal.getUpdatedAt();

        LocalDate today = LocalDate.now();
        this.nextVaccinationDueDate = vaccinations.stream()
                .map(VaccinationDTO::getNextDueDate)
                .filter(d -> d != null && !d.isBefore(today))
                .min(LocalDate::compareTo).orElse(null);
        this.overdueVaccinationCount = (int) vaccinations.stream()
                .map(VaccinationDTO::getNextDueDate)
                .filter(d -> d != null && d.isBefore(today))
                .count();
        this.nextPreventiveCareDueDate = preventiveCareRecords.stream()
                .map(PreventiveCareDTO::getNextDueDate)
                .filter(d -> d != null && !d.isBefore(today))
                .min(LocalDate::compareTo).orElse(null);
        this.overduePreventiveCareCount = (int) preventiveCareRecords.stream()
                .map(PreventiveCareDTO::getNextDueDate)
                .filter(d -> d != null && d.isBefore(today))
                .count();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnimalCode() { return animalCode; }
    public void setAnimalCode(String animalCode) { this.animalCode = animalCode; }

    public Long getShelterId() { return shelterId; }
    public void setShelterId(Long shelterId) { this.shelterId = shelterId; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

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

    public String getInitialAssessmentRecordedByName() { return initialAssessmentRecordedByName; }
    public void setInitialAssessmentRecordedByName(String initialAssessmentRecordedByName) { this.initialAssessmentRecordedByName = initialAssessmentRecordedByName; }

    public List<AnimalIntakeDTO> getIntakeHistory() { return intakeHistory; }
    public void setIntakeHistory(List<AnimalIntakeDTO> intakeHistory) { this.intakeHistory = intakeHistory; }

    public List<MedicalRecordDTO> getMedicalRecords() { return medicalRecords; }
    public void setMedicalRecords(List<MedicalRecordDTO> medicalRecords) { this.medicalRecords = medicalRecords; }

    public List<VaccinationDTO> getVaccinations() { return vaccinations; }
    public void setVaccinations(List<VaccinationDTO> vaccinations) { this.vaccinations = vaccinations; }

    public List<MedicalDocumentDTO> getMedicalDocuments() { return medicalDocuments; }
    public void setMedicalDocuments(List<MedicalDocumentDTO> medicalDocuments) { this.medicalDocuments = medicalDocuments; }

    public List<PreventiveCareDTO> getPreventiveCareRecords() { return preventiveCareRecords; }
    public void setPreventiveCareRecords(List<PreventiveCareDTO> preventiveCareRecords) { this.preventiveCareRecords = preventiveCareRecords; }

    public LocalDate getNextVaccinationDueDate() { return nextVaccinationDueDate; }
    public void setNextVaccinationDueDate(LocalDate nextVaccinationDueDate) { this.nextVaccinationDueDate = nextVaccinationDueDate; }

    public int getOverdueVaccinationCount() { return overdueVaccinationCount; }
    public void setOverdueVaccinationCount(int overdueVaccinationCount) { this.overdueVaccinationCount = overdueVaccinationCount; }

    public LocalDate getNextPreventiveCareDueDate() { return nextPreventiveCareDueDate; }
    public void setNextPreventiveCareDueDate(LocalDate nextPreventiveCareDueDate) { this.nextPreventiveCareDueDate = nextPreventiveCareDueDate; }

    public int getOverduePreventiveCareCount() { return overduePreventiveCareCount; }
    public void setOverduePreventiveCareCount(int overduePreventiveCareCount) { this.overduePreventiveCareCount = overduePreventiveCareCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
