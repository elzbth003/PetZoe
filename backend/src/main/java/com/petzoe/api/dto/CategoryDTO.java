package com.petzoe.api.dto;

/**
 * DTO for creating and updating categories.
 */
public class CategoryDTO {
    private String name;
    private String description;
    private String imageUrl;

    public CategoryDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
