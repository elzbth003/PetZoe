package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a product listed on the PetZoe marketplace.
 * Products are created by sellers and must be approved by admins before being visible.
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Name of the product displayed to buyers. */
    @Column(nullable = false)
    private String name;

    /** Detailed description of the product. */
    @Column(length = 2000)
    private String description;

    /** Brand or manufacturer name. */
    @Column(nullable = false)
    private String brand;

    /** Original listing price. */
    @Column(nullable = false)
    private Double price;

    /** Discounted price (null if no discount is active). */
    @Column(name = "discount_price")
    private Double discountPrice;

    /** Stock Keeping Unit – unique product identifier for inventory. */
    @Column(unique = true)
    private String sku;

    /** Number of units currently available in stock. */
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    /** URL to the main product image. */
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    /** Ingredients list (relevant for food and medicine products). */
    @Column(length = 1000)
    private String ingredients;

    /** Technical specifications or key features as a text block. */
    @Column(length = 1000)
    private String specifications;

    /** Calculated average star rating from reviews. */
    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    /** Total number of reviews submitted for this product. */
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    /** Whether an admin has approved this product for public visibility. */
    @Column(nullable = false)
    private Boolean approved = false;

    /** Whether this product is marked as featured (shown in homepage sections). */
    @Column(nullable = false)
    private Boolean featured = false;

    /** Timestamp when the product was first created. */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** The category this product belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** The seller (user with "Marketplace Seller" role) who listed this product. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    public Product() {
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getDiscountPrice() {
        return discountPrice;
    }

    public void setDiscountPrice(Double discountPrice) {
        this.discountPrice = discountPrice;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getSpecifications() {
        return specifications;
    }

    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }
}
