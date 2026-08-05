package com.petzoe.api.controller;

import com.petzoe.api.entity.Order;
import com.petzoe.api.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * REST controller for order operations.
 * Users can place orders and view history; admins can manage order statuses.
 */
@RestController
@RequestMapping("/api/marketplace/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Place a new order from the user's cart. */
    @PostMapping
    public ResponseEntity<Order> placeOrder(Authentication auth) {
        return ResponseEntity.ok(orderService.placeOrder(auth.getName()));
    }

    /** Get the authenticated user's order history. */
    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getUserOrders(auth.getName()));
    }

    /** Get a specific order by ID. */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.getOrderById(id, auth.getName()));
    }

    /** Update order status (admin only). */
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, body.get("status")));
    }

    /** Get all orders (admin only). */
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
