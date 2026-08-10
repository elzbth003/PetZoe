package com.petzoe.api.dto;

/**
 * DTO for CartItem responses — avoids lazy-loading serialization issues.
 */
public record CartItemResponseDTO(
        Long id,
        Integer quantity,
        ProductSummaryDTO product
) {}
