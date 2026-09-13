package com.petzoe.api.service;

import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service layer for order management.
 * Handles placing orders from cart, viewing order history, and status updates.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    /**
     * Place an order from the user's cart.
     * Converts all cart items into order items, calculates the total, and clears the cart.
     */
    @Transactional
    public Order placeOrder(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Add items before placing an order.");
        }

        // Create the order
        Order order = new Order();
        order.setUser(user);
        order.setStatus("Pending");

        double totalAmount = 0.0;

        // Convert each cart item into an order item
        for (CartItem cartItem : cartItems) {
            // Re-fetch with a row lock (not the stale entity off the cart item)
            // so concurrent checkouts can't both oversell the same stock.
            Product product = productRepository.findByIdForUpdate(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for '" + product.getName() + "'. Only "
                        + product.getStockQuantity() + " left, " + cartItem.getQuantity() + " requested.");
            }

            // Use discount price if available, otherwise use regular price
            double effectivePrice = product.getDiscountPrice() != null
                    ? product.getDiscountPrice()
                    : product.getPrice();

            OrderItem orderItem = new OrderItem(
                    cartItem.getQuantity(),
                    effectivePrice,
                    order,
                    product
            );
            order.getItems().add(orderItem);
            totalAmount += effectivePrice * cartItem.getQuantity();

            // Decrease stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Clear the cart after successful order placement
        cartItemRepository.deleteByUser(user);

        return savedOrder;
    }

    /** Get all orders for the authenticated user. */
    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /** Get a specific order by ID. */
    public Order getOrderById(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this order");
        }
        return order;
    }

    /** Update order status (admin only). */
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    /** Get all orders (admin). */
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}
