package com.petzoe.api.controller;

import com.petzoe.api.dto.ReviewDTO;
import com.petzoe.api.entity.Review;
import com.petzoe.api.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for product review operations.
 * Viewing reviews is public; submitting reviews requires authentication.
 */
@RestController
@RequestMapping("/api/marketplace/products")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /** Get all reviews for a product (public). */
    @GetMapping("/{productId}/reviews")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    /** Submit a review for a product (requires authentication). */
    @PostMapping("/{productId}/reviews")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<Review> addReview(
            @PathVariable Long productId,
            @RequestBody ReviewDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(reviewService.addReview(productId, dto, auth.getName()));
    }
}
