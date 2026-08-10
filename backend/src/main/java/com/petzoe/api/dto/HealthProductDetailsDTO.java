package com.petzoe.api.dto;

import java.time.LocalDate;

public class HealthProductDetailsDTO {
    private String productType;
    private String animalType;
    private String suitableAge;
    private String purpose;
    private String benefits;
    private String ingredients;
    private String activeIngredients;
    private String dosage;
    private String servingSize;
    private String recommendedFrequency;
    private String netWeight;
    private String quantity;
    private String storageInstructions;
    private String warnings;
    private String precautions;
    private String manufacturer;
    private String manufacturerAddress;
    private String batchNumber;
    private String countryOfOrigin;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private Boolean prescriptionRequired;

    // Getters and Setters
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    public String getAnimalType() { return animalType; }
    public void setAnimalType(String animalType) { this.animalType = animalType; }
    public String getSuitableAge() { return suitableAge; }
    public void setSuitableAge(String suitableAge) { this.suitableAge = suitableAge; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getActiveIngredients() { return activeIngredients; }
    public void setActiveIngredients(String activeIngredients) { this.activeIngredients = activeIngredients; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    public String getRecommendedFrequency() { return recommendedFrequency; }
    public void setRecommendedFrequency(String recommendedFrequency) { this.recommendedFrequency = recommendedFrequency; }
    public String getNetWeight() { return netWeight; }
    public void setNetWeight(String netWeight) { this.netWeight = netWeight; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public String getStorageInstructions() { return storageInstructions; }
    public void setStorageInstructions(String storageInstructions) { this.storageInstructions = storageInstructions; }
    public String getWarnings() { return warnings; }
    public void setWarnings(String warnings) { this.warnings = warnings; }
    public String getPrecautions() { return precautions; }
    public void setPrecautions(String precautions) { this.precautions = precautions; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getManufacturerAddress() { return manufacturerAddress; }
    public void setManufacturerAddress(String manufacturerAddress) { this.manufacturerAddress = manufacturerAddress; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public String getCountryOfOrigin() { return countryOfOrigin; }
    public void setCountryOfOrigin(String countryOfOrigin) { this.countryOfOrigin = countryOfOrigin; }
    public LocalDate getManufacturingDate() { return manufacturingDate; }
    public void setManufacturingDate(LocalDate manufacturingDate) { this.manufacturingDate = manufacturingDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public Boolean getPrescriptionRequired() { return prescriptionRequired; }
    public void setPrescriptionRequired(Boolean prescriptionRequired) { this.prescriptionRequired = prescriptionRequired; }
}
