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

    @org.springframework.data.jpa.repository.Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatusGrouped();

    @org.springframework.data.jpa.repository.Query("SELECT CAST(o.createdAt AS java.time.LocalDate), COUNT(o), COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.createdAt >= :since GROUP BY CAST(o.createdAt AS java.time.LocalDate) ORDER BY CAST(o.createdAt AS java.time.LocalDate)")
    List<Object[]> countDailyOrdersAndRevenue(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE LOWER(o.status) IN ('delivered', 'completed', 'paid')")
    Double calculateGrossDeliveredRevenue();
}
