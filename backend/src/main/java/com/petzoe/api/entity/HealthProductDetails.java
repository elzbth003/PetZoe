package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "health_product_details")
public class HealthProductDetails {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_type")
    private String productType;

    @Column(name = "animal_type")
    private String animalType;

    @Column(name = "suitable_age")
    private String suitableAge;

    private String purpose;

    @Column(length = 1000)
    private String benefits;

    @Column(length = 1000)
    private String ingredients;

    @Column(name = "active_ingredients", length = 1000)
    private String activeIngredients;

    private String dosage;

    @Column(name = "serving_size")
    private String servingSize;

    @Column(name = "recommended_frequency")
    private String recommendedFrequency;

    @Column(name = "net_weight")
    private String netWeight;

    private String quantity;

    @Column(name = "storage_instructions", length = 500)
    private String storageInstructions;

    @Column(length = 1000)
    private String warnings;

    @Column(length = 1000)
    private String precautions;

    private String manufacturer;

    @Column(name = "manufacturer_address")
    private String manufacturerAddress;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "country_of_origin")
    private String countryOfOrigin;

    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "prescription_required")
    private Boolean prescriptionRequired = false;

    public HealthProductDetails() {}

    // Getters and Setters

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
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
