package com.petzoe.api.repository;

import com.petzoe.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for Category CRUD operations.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Find a category by its exact name (case-insensitive). */
    Optional<Category> findByNameIgnoreCase(String name);
}
