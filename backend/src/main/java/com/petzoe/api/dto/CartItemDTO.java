package com.petzoe.api.dto;

/**
 * DTO for adding a product to the cart or updating its quantity.
 */
public class CartItemDTO {
    private Long productId;
    private Integer quantity;

    public CartItemDTO() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
