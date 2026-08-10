package com.petzoe.api.dto;

/**
 * Lightweight product summary used inside Cart and Wishlist DTOs.
 * Prevents Jackson serialization issues caused by lazy-loaded JPA entities.
 */
public record ProductSummaryDTO(
        Long id,
        String name,
        String brand,
        String imageUrl,
        Double price,
        Double discountPrice,
        Integer stockQuantity,
        String sku,
        Double averageRating,
        Integer reviewCount
) {}
