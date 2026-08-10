package com.petzoe.api.service;

import com.petzoe.api.dto.ProductSummaryDTO;
import com.petzoe.api.dto.WishlistItemResponseDTO;
import com.petzoe.api.entity.CartItem;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.WishlistItem;
import com.petzoe.api.repository.CartItemRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for wishlist operations.
 */
@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistItemRepository wishlistItemRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /** Get all wishlist items for the authenticated user as DTOs. */
    public List<WishlistItemResponseDTO> getWishlist(String email) {
        User user = findUser(email);
        return wishlistItemRepository.findByUser(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Add a product to the wishlist. */
    public WishlistItemResponseDTO addToWishlist(Long productId, String email) {
        User user = findUser(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Prevent duplicates — return existing item silently
        return wishlistItemRepository.findByUserAndProduct(user, product)
                .map(this::toDTO)
                .orElseGet(() -> toDTO(wishlistItemRepository.save(new WishlistItem(user, product))));
    }

    /** Remove a product from the wishlist. */
    public void removeFromWishlist(Long wishlistItemId, String email) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        if (!item.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized");
        }
        wishlistItemRepository.delete(item);
    }

    /** Move a wishlist item to the shopping cart. */
    public void moveToCart(Long wishlistItemId, String email) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        if (!item.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized");
        }

        User user = item.getUser();
        Product product = item.getProduct();

        // Add to cart (or increase quantity if already in cart)
        cartItemRepository.findByUserAndProduct(user, product)
                .ifPresentOrElse(
                        cartItem -> {
                            cartItem.setQuantity(cartItem.getQuantity() + 1);
                            cartItemRepository.save(cartItem);
                        },
                        () -> cartItemRepository.save(new CartItem(1, user, product))
                );

        wishlistItemRepository.delete(item);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private WishlistItemResponseDTO toDTO(WishlistItem item) {
        Product p = item.getProduct();
        ProductSummaryDTO productDTO = new ProductSummaryDTO(
                p.getId(), p.getName(), p.getBrand(), p.getImageUrl(),
                p.getPrice(), p.getDiscountPrice(), p.getStockQuantity(),
                p.getSku(), p.getAverageRating(), p.getReviewCount()
        );
        return new WishlistItemResponseDTO(item.getId(), productDTO);
    }
}
