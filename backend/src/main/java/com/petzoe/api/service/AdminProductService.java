package com.petzoe.api.service;

import com.petzoe.api.dto.ProductResponseDTO;
import com.petzoe.api.dto.ProductSummaryDTO;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.ProductStatus;
import com.petzoe.api.mapper.ProductMapper;
import com.petzoe.api.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public AdminProductService(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public Page<ProductSummaryDTO> getAllProducts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return productRepository.findAll(pageable).map(productMapper::toSummaryDTO);
    }

    public Page<ProductSummaryDTO> getPendingProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return productRepository.findByStatus(ProductStatus.PENDING_REVIEW, pageable).map(productMapper::toSummaryDTO);
    }

    @Transactional
    public ProductResponseDTO approveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.APPROVED);
        product.setApproved(true); // backward compatibility
        product.setRejectionReason(null);
        return productMapper.toResponseDTO(productRepository.save(product));
    }

    @Transactional
    public ProductResponseDTO rejectProduct(Long id, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason must be provided.");
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.REJECTED);
        product.setApproved(false);
        product.setRejectionReason(reason);
        return productMapper.toResponseDTO(productRepository.save(product));
    }
}
