package com.petzoe.api.service;

import com.petzoe.api.dto.ReviewDTO;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.Review;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.ReviewRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service layer for product review operations.
 * Handles review submission and automatic rating recalculation.
 */
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /** Get all reviews for a product. */
    public List<Review> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return reviewRepository.findByProductOrderByCreatedAtDesc(product);
    }

    /** Submit a new review for a product. */
    public Review addReview(Long productId, ReviewDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Prevent duplicate reviews
        if (reviewRepository.findByUserAndProduct(user, product).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }

        // Validate rating
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Review review = new Review();
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setUser(user);
        review.setProduct(product);

        Review savedReview = reviewRepository.save(review);

        // Recalculate and update the product's average rating
        updateProductRating(product);

        return savedReview;
    }

    /** Recalculate the average rating and review count for a product. */
    private void updateProductRating(Product product) {
        Double avgRating = reviewRepository.getAverageRatingByProduct(product);
        Long count = reviewRepository.countByProduct(product);
        product.setAverageRating(avgRating != null ? avgRating : 0.0);
        product.setReviewCount(count != null ? count.intValue() : 0);
        productRepository.save(product);
    }
}
