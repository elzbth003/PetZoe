package com.petzoe.api.dto;

/**
 * DTO for WishlistItem responses — avoids lazy-loading serialization issues.
 */
public record WishlistItemResponseDTO(
        Long id,
        ProductSummaryDTO product
) {}
