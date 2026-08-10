package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "grooming_product_details")
public class GroomingProductDetails {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_type") // e.g., Liquid, Tool
    private String productType;

    @Column(name = "pet_type")
    private String petType;

    @Column(name = "suitable_age")
    private String suitableAge;

    @Column(name = "coat_type")
    private String coatType;

    @Column(name = "skin_type")
    private String skinType;

    private String purpose;

    @Column(length = 1000)
    private String ingredients;

    private String fragrance;

    private String volume;

    @Column(name = "usage_instructions", length = 1000)
    private String usageInstructions;

    @Column(name = "recommended_frequency")
    private String recommendedFrequency;

    @Column(length = 500)
    private String warnings;

    @Column(length = 500)
    private String storage;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private String manufacturer;

    // Fields specific for grooming tools
    @Column(name = "tool_type")
    private String toolType;

    private String material;

    private String size;

    private String dimensions;

    @Column(name = "safety_instructions", length = 500)
    private String safetyInstructions;

    @Column(name = "cleaning_instructions", length = 500)
    private String cleaningInstructions;

    public GroomingProductDetails() {}

    // Getters and Setters

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public String getSuitableAge() { return suitableAge; }
    public void setSuitableAge(String suitableAge) { this.suitableAge = suitableAge; }
    public String getCoatType() { return coatType; }
    public void setCoatType(String coatType) { this.coatType = coatType; }
    public String getSkinType() { return skinType; }
    public void setSkinType(String skinType) { this.skinType = skinType; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getFragrance() { return fragrance; }
    public void setFragrance(String fragrance) { this.fragrance = fragrance; }
    public String getVolume() { return volume; }
    public void setVolume(String volume) { this.volume = volume; }
    public String getUsageInstructions() { return usageInstructions; }
    public void setUsageInstructions(String usageInstructions) { this.usageInstructions = usageInstructions; }
    public String getRecommendedFrequency() { return recommendedFrequency; }
    public void setRecommendedFrequency(String recommendedFrequency) { this.recommendedFrequency = recommendedFrequency; }
    public String getWarnings() { return warnings; }
    public void setWarnings(String warnings) { this.warnings = warnings; }
    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getToolType() { return toolType; }
    public void setToolType(String toolType) { this.toolType = toolType; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public String getSafetyInstructions() { return safetyInstructions; }
    public void setSafetyInstructions(String safetyInstructions) { this.safetyInstructions = safetyInstructions; }
    public String getCleaningInstructions() { return cleaningInstructions; }
    public void setCleaningInstructions(String cleaningInstructions) { this.cleaningInstructions = cleaningInstructions; }
}
