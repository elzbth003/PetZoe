package com.petzoe.api.controller;

import com.petzoe.api.dto.WishlistItemResponseDTO;
import com.petzoe.api.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * REST controller for wishlist operations.
 * All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/marketplace/wishlist")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('PET_OWNER')")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /** Get the authenticated user's wishlist. */
    @GetMapping
    public ResponseEntity<List<WishlistItemResponseDTO>> getWishlist(Authentication auth) {
        return ResponseEntity.ok(wishlistService.getWishlist(auth.getName()));
    }

    /** Add a product to the wishlist. */
    @PostMapping
    public ResponseEntity<WishlistItemResponseDTO> addToWishlist(
            @RequestBody Map<String, Long> body, Authentication auth) {
        return ResponseEntity.ok(wishlistService.addToWishlist(body.get("productId"), auth.getName()));
    }

    /** Remove an item from the wishlist. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeFromWishlist(@PathVariable Long id, Authentication auth) {
        wishlistService.removeFromWishlist(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Item removed from wishlist."));
    }

    /** Move a wishlist item to the cart. */
    @PostMapping("/{id}/move-to-cart")
    public ResponseEntity<Map<String, String>> moveToCart(@PathVariable Long id, Authentication auth) {
        wishlistService.moveToCart(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Item moved to cart."));
    }
}
