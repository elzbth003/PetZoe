package com.petzoe.api.dto;

import java.time.LocalDate;

public class FoodProductDetailsDTO {
    private String foodType;
    private String petType;
    private String lifeStage;
    private String breedSize;
    private String flavor;
    private String ingredients;
    private String nutritionalInformation;
    private String guaranteedAnalysis;
    private String feedingGuidelines;
    private String servingSize;
    private String netWeight;
    private String storageInstructions;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private String manufacturer;
    private String countryOfOrigin;
    private String allergenInformation;

    // Getters and Setters
    public String getFoodType() { return foodType; }
    public void setFoodType(String foodType) { this.foodType = foodType; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public String getLifeStage() { return lifeStage; }
    public void setLifeStage(String lifeStage) { this.lifeStage = lifeStage; }
    public String getBreedSize() { return breedSize; }
    public void setBreedSize(String breedSize) { this.breedSize = breedSize; }
    public String getFlavor() { return flavor; }
    public void setFlavor(String flavor) { this.flavor = flavor; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getNutritionalInformation() { return nutritionalInformation; }
    public void setNutritionalInformation(String nutritionalInformation) { this.nutritionalInformation = nutritionalInformation; }
    public String getGuaranteedAnalysis() { return guaranteedAnalysis; }
    public void setGuaranteedAnalysis(String guaranteedAnalysis) { this.guaranteedAnalysis = guaranteedAnalysis; }
    public String getFeedingGuidelines() { return feedingGuidelines; }
    public void setFeedingGuidelines(String feedingGuidelines) { this.feedingGuidelines = feedingGuidelines; }
    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    public String getNetWeight() { return netWeight; }
    public void setNetWeight(String netWeight) { this.netWeight = netWeight; }
    public String getStorageInstructions() { return storageInstructions; }
    public void setStorageInstructions(String storageInstructions) { this.storageInstructions = storageInstructions; }
    public LocalDate getManufacturingDate() { return manufacturingDate; }
    public void setManufacturingDate(LocalDate manufacturingDate) { this.manufacturingDate = manufacturingDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getCountryOfOrigin() { return countryOfOrigin; }
    public void setCountryOfOrigin(String countryOfOrigin) { this.countryOfOrigin = countryOfOrigin; }
    public String getAllergenInformation() { return allergenInformation; }
    public void setAllergenInformation(String allergenInformation) { this.allergenInformation = allergenInformation; }
}
