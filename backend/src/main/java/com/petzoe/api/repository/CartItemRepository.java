package com.petzoe.api.repository;

import com.petzoe.api.entity.CartItem;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for shopping cart operations.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /** Get all cart items for a specific user. */
    List<CartItem> findByUser(User user);

    /** Find a specific product in a user's cart. */
    Optional<CartItem> findByUserAndProduct(User user, Product product);

    /** Remove all cart items for a user (e.g., after placing an order). */
    void deleteByUser(User user);
}
