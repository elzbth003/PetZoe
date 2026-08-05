package com.petzoe.api.service;

import com.petzoe.api.dto.CategoryDTO;
import com.petzoe.api.entity.Category;
import com.petzoe.api.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service layer for marketplace category management.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /** Get all categories. */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /** Get a category by ID. */
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    /** Create a new category (admin only). */
    public Category createCategory(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        return categoryRepository.save(category);
    }

    /** Update an existing category (admin only). */
    public Category updateCategory(Long id, CategoryDTO dto) {
        Category category = getCategoryById(id);
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        return categoryRepository.save(category);
    }

    /** Delete a category (admin only). */
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
