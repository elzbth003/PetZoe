package com.petzoe.api.service;

import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service layer for order management.
 * Handles viewing order history and status updates.
 * Direct checkout without payment verification is disabled; checkout flows through PaymentService.
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
     * Direct order placement without payment is disabled.
     * Orders must be initiated and verified via PaymentService (/api/marketplace/payments).
     */
    @Transactional
    public Order placeOrder(String email) {
        throw new IllegalStateException("Direct order placement without payment is disabled. Please checkout through /api/marketplace/payments/create to proceed with secure payment.");
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
