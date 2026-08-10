package com.petzoe.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "accessory_product_details")
public class AccessoryProductDetails {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "accessory_type") // e.g., Collar, Bed, Clothing
    private String accessoryType;

    @Column(name = "pet_type")
    private String petType;

    private String material;

    private String size;

    @Column(name = "pet_size")
    private String petSize;

    private String color;

    private String weight;

    // Collar / Leash specific
    private Boolean adjustable = false;
    
    @Column(name = "neck_size_range")
    private String neckSizeRange;
    
    @Column(name = "closure_type")
    private String closureType;

    // Bed specific
    private String length;
    private String width;
    private String height;
    
    @Column(name = "filling_material")
    private String fillingMaterial;
    
    @Column(name = "removable_cover")
    private Boolean removableCover = false;
    
    @Column(name = "indoor_outdoor")
    private String indoorOutdoor;
    
    @Column(name = "recommended_pet_weight")
    private String recommendedPetWeight;

    // Clothing specific
    @Column(name = "chest_measurement")
    private String chestMeasurement;
    
    @Column(name = "neck_measurement")
    private String neckMeasurement;
    
    @Column(name = "back_length")
    private String backLength;
    
    private String season;

    // Common
    @Column(length = 500)
    private String features;
    
    @Column(name = "care_instructions", length = 500)
    private String careInstructions;
    
    @Column(name = "washing_instructions", length = 500)
    private String washingInstructions;
    
    private Boolean washable = false;

    public AccessoryProductDetails() {}

    // Getters and Setters

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getAccessoryType() { return accessoryType; }
    public void setAccessoryType(String accessoryType) { this.accessoryType = accessoryType; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getPetSize() { return petSize; }
    public void setPetSize(String petSize) { this.petSize = petSize; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
    public Boolean getAdjustable() { return adjustable; }
    public void setAdjustable(Boolean adjustable) { this.adjustable = adjustable; }
    public String getNeckSizeRange() { return neckSizeRange; }
    public void setNeckSizeRange(String neckSizeRange) { this.neckSizeRange = neckSizeRange; }
    public String getClosureType() { return closureType; }
    public void setClosureType(String closureType) { this.closureType = closureType; }
    public String getLength() { return length; }
    public void setLength(String length) { this.length = length; }
    public String getWidth() { return width; }
    public void setWidth(String width) { this.width = width; }
    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }
    public String getFillingMaterial() { return fillingMaterial; }
    public void setFillingMaterial(String fillingMaterial) { this.fillingMaterial = fillingMaterial; }
    public Boolean getRemovableCover() { return removableCover; }
    public void setRemovableCover(Boolean removableCover) { this.removableCover = removableCover; }
    public String getIndoorOutdoor() { return indoorOutdoor; }
    public void setIndoorOutdoor(String indoorOutdoor) { this.indoorOutdoor = indoorOutdoor; }
    public String getRecommendedPetWeight() { return recommendedPetWeight; }
    public void setRecommendedPetWeight(String recommendedPetWeight) { this.recommendedPetWeight = recommendedPetWeight; }
    public String getChestMeasurement() { return chestMeasurement; }
    public void setChestMeasurement(String chestMeasurement) { this.chestMeasurement = chestMeasurement; }
    public String getNeckMeasurement() { return neckMeasurement; }
    public void setNeckMeasurement(String neckMeasurement) { this.neckMeasurement = neckMeasurement; }
    public String getBackLength() { return backLength; }
    public void setBackLength(String backLength) { this.backLength = backLength; }
    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    public String getCareInstructions() { return careInstructions; }
    public void setCareInstructions(String careInstructions) { this.careInstructions = careInstructions; }
    public String getWashingInstructions() { return washingInstructions; }
    public void setWashingInstructions(String washingInstructions) { this.washingInstructions = washingInstructions; }
    public Boolean getWashable() { return washable; }
    public void setWashable(Boolean washable) { this.washable = washable; }
}
