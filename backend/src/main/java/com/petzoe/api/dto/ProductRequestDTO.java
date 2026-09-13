package com.petzoe.api.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ProductRequestDTO {
    @NotBlank(message = "Product name is required")
    private String name;
    private String shortDescription;
    private String description;
    private String brand;

    @NotNull(message = "Product price is required")
    @Positive(message = "Product price must be greater than zero")
    private Double price;
    private Double mrp;
    private String sku;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;
    private Integer lowStockThreshold;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
    private String subcategory;
    private String petType;
    private String lifeStage;
    
    // Shipping
    private Double weight;
    private Double packageLength;
    private Double packageWidth;
    private Double packageHeight;
    private Boolean returnEligible;
    private Boolean replacementEligible;

    // Collections
    private List<ProductImageDTO> images;
    private List<ProductVariantDTO> variants;

    // Category Specific Details
    private HealthProductDetailsDTO healthDetails;
    private FoodProductDetailsDTO foodDetails;
    private ToyProductDetailsDTO toyDetails;
    private GroomingProductDetailsDTO groomingDetails;
    private AccessoryProductDetailsDTO accessoryDetails;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getMrp() { return mrp; }
    public void setMrp(Double mrp) { this.mrp = mrp; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public String getLifeStage() { return lifeStage; }
    public void setLifeStage(String lifeStage) { this.lifeStage = lifeStage; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public Double getPackageLength() { return packageLength; }
    public void setPackageLength(Double packageLength) { this.packageLength = packageLength; }
    public Double getPackageWidth() { return packageWidth; }
    public void setPackageWidth(Double packageWidth) { this.packageWidth = packageWidth; }
    public Double getPackageHeight() { return packageHeight; }
    public void setPackageHeight(Double packageHeight) { this.packageHeight = packageHeight; }
    public Boolean getReturnEligible() { return returnEligible; }
    public void setReturnEligible(Boolean returnEligible) { this.returnEligible = returnEligible; }
    public Boolean getReplacementEligible() { return replacementEligible; }
    public void setReplacementEligible(Boolean replacementEligible) { this.replacementEligible = replacementEligible; }
    public List<ProductImageDTO> getImages() { return images; }
    public void setImages(List<ProductImageDTO> images) { this.images = images; }
    public List<ProductVariantDTO> getVariants() { return variants; }
    public void setVariants(List<ProductVariantDTO> variants) { this.variants = variants; }
    public HealthProductDetailsDTO getHealthDetails() { return healthDetails; }
    public void setHealthDetails(HealthProductDetailsDTO healthDetails) { this.healthDetails = healthDetails; }
    public FoodProductDetailsDTO getFoodDetails() { return foodDetails; }
    public void setFoodDetails(FoodProductDetailsDTO foodDetails) { this.foodDetails = foodDetails; }
    public ToyProductDetailsDTO getToyDetails() { return toyDetails; }
    public void setToyDetails(ToyProductDetailsDTO toyDetails) { this.toyDetails = toyDetails; }
    public GroomingProductDetailsDTO getGroomingDetails() { return groomingDetails; }
    public void setGroomingDetails(GroomingProductDetailsDTO groomingDetails) { this.groomingDetails = groomingDetails; }
    public AccessoryProductDetailsDTO getAccessoryDetails() { return accessoryDetails; }
    public void setAccessoryDetails(AccessoryProductDetailsDTO accessoryDetails) { this.accessoryDetails = accessoryDetails; }
}
