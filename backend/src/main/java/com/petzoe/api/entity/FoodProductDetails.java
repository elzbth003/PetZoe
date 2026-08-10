package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "food_product_details")
public class FoodProductDetails {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "food_type")
    private String foodType;

    @Column(name = "pet_type")
    private String petType;

    @Column(name = "life_stage")
    private String lifeStage;

    @Column(name = "breed_size")
    private String breedSize;

    private String flavor;

    @Column(length = 1000)
    private String ingredients;

    @Column(name = "nutritional_information", length = 1000)
    private String nutritionalInformation;

    @Column(name = "guaranteed_analysis", length = 1000)
    private String guaranteedAnalysis;

    @Column(name = "feeding_guidelines", length = 1000)
    private String feedingGuidelines;

    @Column(name = "serving_size")
    private String servingSize;

    @Column(name = "net_weight")
    private String netWeight;

    @Column(name = "storage_instructions", length = 500)
    private String storageInstructions;

    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private String manufacturer;

    @Column(name = "country_of_origin")
    private String countryOfOrigin;

    @Column(name = "allergen_information", length = 500)
    private String allergenInformation;

    public FoodProductDetails() {}

    // Getters and Setters

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
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
