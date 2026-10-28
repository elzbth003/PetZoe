package com.petzoe.api.controller;

import com.petzoe.api.entity.Order;
import com.petzoe.api.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * REST controller for order operations.
 * Users can view order history; admins can manage order statuses.
 * Direct order placement without payment is disabled to enforce payment verification.
 */
@RestController
@RequestMapping("/api/marketplace/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Direct order placement without payment is disabled to ensure payment verification. */
    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<?> placeOrder(Authentication auth) {
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of(
                "error", "Payment Required",
                "message", "Direct order placement without payment is disabled. Please checkout through /api/marketplace/payments/create to proceed with secure payment."
        ));
    }

    /** Get the authenticated user's order history. */
    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<List<Order>> getUserOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getUserOrders(auth.getName()));
    }

    /** Get a specific order by ID. */
    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.getOrderById(id, auth.getName()));
    }

    /** Update order status (admin only). */
    @PutMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, body.get("status")));
    }

    /** Get all orders (admin only). */
    @GetMapping("/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}