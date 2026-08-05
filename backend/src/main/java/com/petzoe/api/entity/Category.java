package com.petzoe.api.entity;

import jakarta.persistence.*;

/**
 * Represents a product category in the marketplace.
 * Categories organize products into logical groups like Pet Food, Toys, etc.
 */
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name of the category (e.g., "Pet Food", "Toys"). */
    @Column(nullable = false, unique = true)
    private String name;

    /** Short description of what products belong in this category. */
    @Column(length = 500)
    private String description;

    /** URL to a representative image/icon for the category. */
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    public Category() {
    }

    public Category(String name, String description, String imageUrl) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
