package com.petzoe.api.repository;

import com.petzoe.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import org.springframework.stereotype.Repository;

/**
 * Repository for Category CRUD operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Find a category by its exact name (case-insensitive). */
    Optional<Category> findByNameIgnoreCase(String name);
}
