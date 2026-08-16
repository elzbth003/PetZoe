package com.petzoe.api.service;

import com.petzoe.api.dto.ProductDTO;
import com.petzoe.api.dto.ProductResponse;
import com.petzoe.api.entity.Category;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.CategoryRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for marketplace product operations.
 * Handles CRUD, search, filtering, and approval workflows.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    /** Convert a Product entity to a ProductResponse DTO. */
    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setBrand(product.getBrand());
        response.setPrice(product.getPrice());
        response.setDiscountPrice(product.getDiscountPrice());
        response.setSku(product.getSku());
        response.setStockQuantity(product.getStockQuantity());
        response.setImageUrl(product.getImageUrl());
        response.setIngredients(product.getIngredients());
        response.setSpecifications(product.getSpecifications());
        response.setAverageRating(product.getAverageRating());
        response.setReviewCount(product.getReviewCount());
        response.setApproved(product.getApproved());
        response.setFeatured(product.getFeatured());
        response.setCreatedAt(product.getCreatedAt());
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        response.setSellerId(product.getSeller().getId());
        response.setSellerName(product.getSeller().getName());
        return response;
    }

    /** Get all approved products with pagination. */
    public Page<ProductResponse> getApprovedProducts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return productRepository.findByApprovedTrue(pageable).map(this::toResponse);
    }

    /** Get a single product by ID. */
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toResponse(product);
    }

    /** Search approved products by name or brand. */
    public Page<ProductResponse> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchApproved(query, pageable).map(this::toResponse);
    }

    /** Get products by category. */
    public Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByApprovedTrueAndCategory(category, pageable).map(this::toResponse);
    }

    /** Get featured products (for marketplace homepage). */
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByApprovedTrueAndFeaturedTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Get newest arrivals. */
    public List<ProductResponse> getNewArrivals() {
        return productRepository.findTop12ByApprovedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

}
