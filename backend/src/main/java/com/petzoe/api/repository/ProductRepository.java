package com.petzoe.api.repository;

import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository for Product operations including search, filter, and pagination.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Find all approved products (visible to buyers). */
    Page<Product> findByApprovedTrue(Pageable pageable);

    /** Find approved products by category. */
    Page<Product> findByApprovedTrueAndCategory(Category category, Pageable pageable);

    /** Find featured approved products. */
    List<Product> findByApprovedTrueAndFeaturedTrue();

    /** Find all products listed by a specific seller. */
    List<Product> findBySeller(User seller);

    /** Search approved products by name or brand (case-insensitive). */
    @Query("SELECT p FROM Product p WHERE p.approved = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchApproved(@Param("query") String query, Pageable pageable);

    /** Find approved products within a price range. */
    @Query("SELECT p FROM Product p WHERE p.approved = true AND " +
           "COALESCE(p.discountPrice, p.price) BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") Double minPrice,
                                   @Param("maxPrice") Double maxPrice,
                                   Pageable pageable);

    /** Find all unapproved products (for admin review). */
    List<Product> findByApprovedFalse();

    /** Find newest approved products, ordered by creation date descending. */
    List<Product> findTop12ByApprovedTrueOrderByCreatedAtDesc();

    /** Count products by category (for analytics). */
    Long countByCategory(Category category);

    // --- New Methods for Vendor Product Management ---
    
    /** Find all products by a specific seller with pagination. */
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    /** Find products by seller and status. */
    Page<Product> findBySellerIdAndStatus(Long sellerId, com.petzoe.api.entity.ProductStatus status, Pageable pageable);

    /** Find all products by status (for admin review). */
    Page<Product> findByStatus(com.petzoe.api.entity.ProductStatus status, Pageable pageable);
}
