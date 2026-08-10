package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a product listed on the PetZoe marketplace.
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(length = 2000)
    private String description; // detailed description

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private Double price; // selling price

    @Column(name = "mrp")
    private Double mrp;

    @Column(name = "discount_price")
    private Double discountPrice;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 5;

    @Column(name = "image_url", length = 512)
    private String imageUrl; // Primary image URL (legacy)

    @Column(length = 1000)
    private String ingredients; // Legacy

    @Column(length = 1000)
    private String specifications; // Legacy

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private Boolean approved = false; // Legacy/Backward compatibility

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.DRAFT;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private String subcategory;

    @Column(name = "pet_type")
    private String petType; // e.g., "Dog,Cat"

    @Column(name = "life_stage")
    private String lifeStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    // Shipping Info
    private Double weight;
    @Column(name = "package_length")
    private Double packageLength;
    @Column(name = "package_width")
    private Double packageWidth;
    @Column(name = "package_height")
    private Double packageHeight;
    @Column(name = "return_eligible")
    private Boolean returnEligible = false;
    @Column(name = "replacement_eligible")
    private Boolean replacementEligible = false;

    // Relationships
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private HealthProductDetails healthDetails;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private FoodProductDetails foodDetails;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private ToyProductDetails toyDetails;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private GroomingProductDetails groomingDetails;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private AccessoryProductDetails accessoryDetails;

    public Product() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public String getLifeStage() { return lifeStage; }
    public void setLifeStage(String lifeStage) { this.lifeStage = lifeStage; }
    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }
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
    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }
    public List<ProductVariant> getVariants() { return variants; }
    public void setVariants(List<ProductVariant> variants) { this.variants = variants; }
    public HealthProductDetails getHealthDetails() { return healthDetails; }
    public void setHealthDetails(HealthProductDetails healthDetails) { this.healthDetails = healthDetails; }
    public FoodProductDetails getFoodDetails() { return foodDetails; }
    public void setFoodDetails(FoodProductDetails foodDetails) { this.foodDetails = foodDetails; }
    public ToyProductDetails getToyDetails() { return toyDetails; }
    public void setToyDetails(ToyProductDetails toyDetails) { this.toyDetails = toyDetails; }
    public GroomingProductDetails getGroomingDetails() { return groomingDetails; }
    public void setGroomingDetails(GroomingProductDetails groomingDetails) { this.groomingDetails = groomingDetails; }
    public AccessoryProductDetails getAccessoryDetails() { return accessoryDetails; }
    public void setAccessoryDetails(AccessoryProductDetails accessoryDetails) { this.accessoryDetails = accessoryDetails; }
}
