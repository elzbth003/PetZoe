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
    private final com.petzoe.api.repository.AuditLogRepository auditLogRepository;
    private final com.petzoe.api.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    public AdminProductService(ProductRepository productRepository, 
                               ProductMapper productMapper,
                               com.petzoe.api.repository.AuditLogRepository auditLogRepository,
                               com.petzoe.api.repository.UserRepository userRepository,
                               NotificationService notificationService) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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
    public ProductResponseDTO approveProduct(Long id, String adminEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        com.petzoe.api.entity.User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (product.getStatus() != ProductStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Only products pending review can be approved (current status: " + product.getStatus() + ").");
        }

        product.setStatus(ProductStatus.APPROVED);
        product.setApproved(true); // backward compatibility
        product.setRejectionReason(null);
        Product saved = productRepository.save(product);
        
        auditLogRepository.save(new com.petzoe.api.entity.AuditLog(admin, "APPROVED_PRODUCT", "Product", saved.getId(), "Approved product: " + saved.getName()));
        
        notificationService.createNotification(
                saved.getSeller(),
                "Product Approved",
                "Your product '" + saved.getName() + "' has been approved and is now live.",
                "PRODUCT_APPROVED",
                null,
                saved.getId()
        );
        
        return productMapper.toResponseDTO(saved);
    }

    @Transactional
    public ProductResponseDTO rejectProduct(Long id, String reason, String adminEmail) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason must be provided.");
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        com.petzoe.api.entity.User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (product.getStatus() != ProductStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Only products pending review can be rejected (current status: " + product.getStatus() + ").");
        }

        product.setStatus(ProductStatus.REJECTED);
        product.setApproved(false);
        product.setRejectionReason(reason);
        Product saved = productRepository.save(product);
        
        auditLogRepository.save(new com.petzoe.api.entity.AuditLog(admin, "REJECTED_PRODUCT", "Product", saved.getId(), "Rejected product: " + saved.getName() + ". Reason: " + reason));
        
        notificationService.createNotification(
                saved.getSeller(),
                "Product Rejected",
                "Your product '" + saved.getName() + "' was rejected during review.",
                "PRODUCT_REJECTED",
                reason,
                saved.getId()
        );
        
        return productMapper.toResponseDTO(saved);
    }
}
