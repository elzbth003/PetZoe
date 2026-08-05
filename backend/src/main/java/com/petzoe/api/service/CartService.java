package com.petzoe.api.service;

import com.petzoe.api.dto.CartItemDTO;
import com.petzoe.api.entity.CartItem;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.CartItemRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service layer for shopping cart operations.
 */
@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /** Get all cart items for the authenticated user. */
    public List<CartItem> getCartItems(String email) {
        User user = findUser(email);
        return cartItemRepository.findByUser(user);
    }

    /** Add a product to the cart. If it already exists, increase the quantity. */
    public CartItem addToCart(CartItemDTO dto, String email) {
        User user = findUser(email);
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if the product is already in the cart
        return cartItemRepository.findByUserAndProduct(user, product)
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity() + dto.getQuantity());
                    return cartItemRepository.save(existingItem);
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem(dto.getQuantity(), user, product);
                    return cartItemRepository.save(newItem);
                });
    }

    /** Update the quantity of a specific cart item. */
    public CartItem updateQuantity(Long cartItemId, Integer quantity, String email) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized");
        }
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    /** Remove a specific item from the cart. */
    public void removeFromCart(Long cartItemId, String email) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized");
        }
        cartItemRepository.delete(item);
    }

    /** Clear all items from the cart (e.g., after placing an order). */
    @Transactional
    public void clearCart(String email) {
        User user = findUser(email);
        cartItemRepository.deleteByUser(user);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
