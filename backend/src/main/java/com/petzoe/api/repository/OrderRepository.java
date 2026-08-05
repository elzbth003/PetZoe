package com.petzoe.api.repository;

import com.petzoe.api.entity.Order;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for order operations.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Get all orders for a specific user, newest first. */
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    /** Get all orders (for admin management), newest first. */
    List<Order> findAllByOrderByCreatedAtDesc();
}
