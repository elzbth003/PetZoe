package com.petzoe.api.dto;

/**
 * DTO for creating and updating products (incoming request payload from sellers).
 */
public class ProductDTO {
    private String name;
    private String description;
    private String brand;
    private Double price;
    private Double discountPrice;
    private String sku;
    private Integer stockQuantity;
    private String imageUrl;
    private String ingredients;
    private String specifications;
    private Long categoryId;

    public ProductDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }

    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
