package com.petzoe.api.repository;

import com.petzoe.api.entity.WishlistItem;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for wishlist operations.
 */
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    /** Get all wishlist items for a specific user. */
    List<WishlistItem> findByUser(User user);

    /** Check if a product is already in a user's wishlist. */
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
}
