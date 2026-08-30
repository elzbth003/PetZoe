package com.petzoe.api.controller;

import com.petzoe.api.dto.CartItemDTO;
import com.petzoe.api.dto.CartItemResponseDTO;
import com.petzoe.api.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * REST controller for shopping cart operations.
 * All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/marketplace/cart")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('PET_OWNER')")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /** Get all cart items for the authenticated user. */
    @GetMapping
    public ResponseEntity<List<CartItemResponseDTO>> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCartItems(auth.getName()));
    }

    /** Add a product to the cart. */
    @PostMapping
    public ResponseEntity<CartItemResponseDTO> addToCart(@RequestBody CartItemDTO dto, Authentication auth) {
        return ResponseEntity.ok(cartService.addToCart(dto, auth.getName()));
    }

    /** Update quantity of a cart item. */
    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponseDTO> updateQuantity(
            @PathVariable Long id, @RequestParam Integer quantity, Authentication auth) {
        return ResponseEntity.ok(cartService.updateQuantity(id, quantity, auth.getName()));
    }

    /** Remove a specific item from the cart. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeFromCart(@PathVariable Long id, Authentication auth) {
        cartService.removeFromCart(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Item removed from cart."));
    }

    /** Clear the entire cart. */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(Authentication auth) {
        cartService.clearCart(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Cart cleared."));
    }
}
