package com.petzoe.api.service;

import com.petzoe.api.dto.CartItemDTO;
import com.petzoe.api.dto.CartItemResponseDTO;
import com.petzoe.api.dto.ProductSummaryDTO;
import com.petzoe.api.entity.CartItem;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.CartItemRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

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

    /** Get all cart items for the authenticated user as DTOs. */
    public List<CartItemResponseDTO> getCartItems(String email) {
        User user = findUser(email);
        return cartItemRepository.findByUser(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Add a product to the cart. If it already exists, increase the quantity. */
    public CartItemResponseDTO addToCart(CartItemDTO dto, String email) {
        User user = findUser(email);
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() <= 0) {
            throw new RuntimeException("Product is out of stock");
        }

        CartItem saved = cartItemRepository.findByUserAndProduct(user, product)
                .map(existingItem -> {
                    int newQty = existingItem.getQuantity() + dto.getQuantity();
                    if (newQty > product.getStockQuantity()) {
                        newQty = product.getStockQuantity();
                    }
                    existingItem.setQuantity(newQty);
                    return cartItemRepository.save(existingItem);
                })
                .orElseGet(() -> {
                    int qty = Math.min(dto.getQuantity(), product.getStockQuantity());
                    CartItem newItem = new CartItem(qty, user, product);
                    return cartItemRepository.save(newItem);
                });

        return toDTO(saved);
    }

    /** Update the quantity of a specific cart item. */
    public CartItemResponseDTO updateQuantity(Long cartItemId, Integer quantity, String email) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized");
        }
        if (quantity < 1) throw new RuntimeException("Quantity must be at least 1");
        item.setQuantity(Math.min(quantity, item.getProduct().getStockQuantity()));
        return toDTO(cartItemRepository.save(item));
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

    /** Clear all items from the cart. */
    @Transactional
    public void clearCart(String email) {
        User user = findUser(email);
        cartItemRepository.deleteByUser(user);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CartItemResponseDTO toDTO(CartItem item) {
        Product p = item.getProduct();
        ProductSummaryDTO productDTO = new ProductSummaryDTO(
                p.getId(), p.getName(), p.getBrand(), p.getImageUrl(),
                p.getPrice(), p.getDiscountPrice(), p.getStockQuantity(),
                p.getSku(), p.getAverageRating(), p.getReviewCount()
        );
        return new CartItemResponseDTO(item.getId(), item.getQuantity(), productDTO);
    }
}
