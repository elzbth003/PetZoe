package com.petzoe.api.dto;

import com.petzoe.api.entity.ProductStatus;
import java.time.LocalDateTime;

public class ProductSummaryDTO {
    private Long id;
    private String name;
    private String brand;
    private String categoryName;
    private Double price;
    private Integer stockQuantity;
    private ProductStatus status;
    private String imageUrl;
    private LocalDateTime createdAt;
    private String inventoryStatus; // IN STOCK, LOW STOCK, OUT OF STOCK

    // Fields added for backward compatibility
    private Double discountPrice;
    private String sku;
    private Double averageRating;
    private Integer reviewCount;

    public ProductSummaryDTO() {}

    public ProductSummaryDTO(Long id, String name, String brand, String imageUrl, 
                             Double price, Double discountPrice, Integer stockQuantity, 
                             String sku, Double averageRating, Integer reviewCount) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.imageUrl = imageUrl;
        this.price = price;
        this.discountPrice = discountPrice;
        this.stockQuantity = stockQuantity;
        this.sku = sku;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getInventoryStatus() { return inventoryStatus; }
    public void setInventoryStatus(String inventoryStatus) { this.inventoryStatus = inventoryStatus; }
    
    // Legacy getters/setters
    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
}
