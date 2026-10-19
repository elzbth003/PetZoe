package com.petzoe.api.dto;

import java.util.List;

/**
 * Structured patient context data transfer object for clinical chat reasoning.
 * Distinguishes verified database facts from user-stated attributes and tracks
 * age discrepancies and recorded deworming/medical histories.
 */
public class PatientContextDTO {

    private Long petId;
    private String petCode;
    private String name;
    private String species;
    private String breed;
    private String gender;
    private Integer registeredAgeYears;
    private String statedAge;
    private boolean hasAgeDiscrepancy;
    private String ageDiscrepancyNote;
    private Double weightKg;
    private String recordedDewormingHistory;
    private String recordedVaccinationSummary;
    private String relevantMedicalNotes;
    private boolean accessAuthorized;
    private boolean notFound;
    private boolean multipleMatchesFound;
    private List<String> matchingPetNames;

    public PatientContextDTO() {}

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public String getPetCode() { return petCode; }
    public void setPetCode(String petCode) { this.petCode = petCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getRegisteredAgeYears() { return registeredAgeYears; }
    public void setRegisteredAgeYears(Integer registeredAgeYears) { this.registeredAgeYears = registeredAgeYears; }

    public String getStatedAge() { return statedAge; }
    public void setStatedAge(String statedAge) { this.statedAge = statedAge; }

    public boolean isHasAgeDiscrepancy() { return hasAgeDiscrepancy; }
    public void setHasAgeDiscrepancy(boolean hasAgeDiscrepancy) { this.hasAgeDiscrepancy = hasAgeDiscrepancy; }

    public String getAgeDiscrepancyNote() { return ageDiscrepancyNote; }
    public void setAgeDiscrepancyNote(String ageDiscrepancyNote) { this.ageDiscrepancyNote = ageDiscrepancyNote; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getRecordedDewormingHistory() { return recordedDewormingHistory; }
    public void setRecordedDewormingHistory(String recordedDewormingHistory) { this.recordedDewormingHistory = recordedDewormingHistory; }

    public String getRecordedVaccinationSummary() { return recordedVaccinationSummary; }
    public void setRecordedVaccinationSummary(String recordedVaccinationSummary) { this.recordedVaccinationSummary = recordedVaccinationSummary; }

    public String getRelevantMedicalNotes() { return relevantMedicalNotes; }
    public void setRelevantMedicalNotes(String relevantMedicalNotes) { this.relevantMedicalNotes = relevantMedicalNotes; }

    public boolean isAccessAuthorized() { return accessAuthorized; }
    public void setAccessAuthorized(boolean accessAuthorized) { this.accessAuthorized = accessAuthorized; }

    public boolean isNotFound() { return notFound; }
    public void setNotFound(boolean notFound) { this.notFound = notFound; }

    public boolean isMultipleMatchesFound() { return multipleMatchesFound; }
    public void setMultipleMatchesFound(boolean multipleMatchesFound) { this.multipleMatchesFound = multipleMatchesFound; }

    public List<String> getMatchingPetNames() { return matchingPetNames; }
    public void setMatchingPetNames(List<String> matchingPetNames) { this.matchingPetNames = matchingPetNames; }

    /**
     * Serializes verified patient details for inclusion in LLM or fallback prompt context.
     */
    public String toContextString() {
        if (!accessAuthorized) {
            if (multipleMatchesFound) {
                return "PATIENT RESOLUTION: Multiple pets matched: " + String.join(", ", matchingPetNames) + ". Clarification needed.";
            }
            if (notFound) {
                return "PATIENT RESOLUTION: Requested pet not found under authenticated user's account.";
            }
            return "PATIENT RESOLUTION: Unauthorized or anonymous access. Patient records unavailable.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("VERIFIED PATIENT PROFILE (PETZOE DATABASE GROUND TRUTH):\n"));
        sb.append(String.format("• Pet Name: %s (Pet ID: %s)\n", name, petCode));
        sb.append(String.format("• Species: %s | Breed: %s | Gender: %s\n", species, breed, gender != null ? gender : "Unspecified"));
        sb.append(String.format("• Registered Age: %d %s\n", registeredAgeYears, registeredAgeYears == 1 ? "year old" : "years old"));
        if (statedAge != null && !statedAge.isBlank()) {
            sb.append(String.format("• Stated Age in User Message: %s\n", statedAge));
        }
        if (hasAgeDiscrepancy) {
            sb.append(String.format("• Age Discrepancy Alert: %s\n", ageDiscrepancyNote));
        }
        if (weightKg != null) {
            sb.append(String.format("• Recorded Weight: %.1f kg\n", weightKg));
        } else {
            sb.append("• Recorded Weight: No weight measurement on file (clinical weigh-in required before dosing).\n");
        }
        sb.append(String.format("• Deworming Treatment History: %s\n",
                recordedDewormingHistory != null ? recordedDewormingHistory : "No deworming treatment recorded"));
        if (recordedVaccinationSummary != null && !recordedVaccinationSummary.isBlank()) {
            sb.append(String.format("• Immunization Status: %s\n", recordedVaccinationSummary));
        }
        if (relevantMedicalNotes != null && !relevantMedicalNotes.isBlank()) {
            sb.append(String.format("• Clinical Notes & Allergies: %s\n", relevantMedicalNotes));
        }
        return sb.toString();
    }
}
