package com.petzoe.api.repository;

import com.petzoe.api.entity.Review;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/**
 * Repository for product review operations.
 */
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /** Get all reviews for a specific product. */
    List<Review> findByProductOrderByCreatedAtDesc(Product product);

    /** Check if a user has already reviewed a product. */
    Optional<Review> findByUserAndProduct(User user, Product product);

    /** Calculate the average rating for a product. */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product = :product")
    Double getAverageRatingByProduct(@Param("product") Product product);

    /** Count total reviews for a product. */
    Long countByProduct(Product product);
}
