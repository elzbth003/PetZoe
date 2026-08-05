package com.petzoe.api.entity;

import jakarta.persistence.*;

/**
 * Represents an item in a user's shopping cart.
 * Links a user to a product with a specified quantity.
 */
@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Number of units the user wants to purchase. */
    @Column(nullable = false)
    private Integer quantity;

    /** The user who owns this cart item. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The product added to the cart. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public CartItem() {
    }

    public CartItem(Integer quantity, User user, Product product) {
        this.quantity = quantity;
        this.user = user;
        this.product = product;
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
