package com.petzoe.api.service;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.*;
import com.petzoe.api.mapper.ProductMapper;
import com.petzoe.api.repository.CategoryRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendorProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    public VendorProductService(ProductRepository productRepository,
                                CategoryRepository categoryRepository,
                                UserRepository userRepository,
                                ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.productMapper = productMapper;
    }

    public Page<ProductSummaryDTO> getVendorProducts(String sellerEmail, int page, int size, String sortBy) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return productRepository.findBySellerId(seller.getId(), pageable)
                .map(productMapper::toSummaryDTO);
    }

    public ProductResponseDTO getVendorProductById(Long id, String sellerEmail) {
        Product product = getProductForVendor(id, sellerEmail);
        return productMapper.toResponseDTO(product);
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = productMapper.toEntity(request, category, seller);
        product.setStatus(ProductStatus.DRAFT);
        
        // Setup bidirectional relationships
        if (product.getHealthDetails() != null) product.getHealthDetails().setProduct(product);
        if (product.getFoodDetails() != null) product.getFoodDetails().setProduct(product);
        if (product.getToyDetails() != null) product.getToyDetails().setProduct(product);
        if (product.getGroomingDetails() != null) product.getGroomingDetails().setProduct(product);
        if (product.getAccessoryDetails() != null) product.getAccessoryDetails().setProduct(product);

        product = productRepository.save(product);
        return productMapper.toResponseDTO(product);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request, String sellerEmail) {
        Product product = getProductForVendor(id, sellerEmail);
        
        if (product.getStatus() == ProductStatus.APPROVED || product.getStatus() == ProductStatus.PENDING_REVIEW) {
            throw new RuntimeException("Cannot edit a product that is approved or pending review. Change status to Draft first.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Here we'd map fields from request to existing product.
        // For simplicity in this demo, we use a basic update pattern or rely on MapStruct update methods if configured.
        product.setName(request.getName());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        if (request.getMrp() != null && request.getPrice() != null && request.getMrp() > 0) {
            product.setDiscountPrice(request.getMrp() - request.getPrice() > 0 ? request.getPrice() : null);
        }
        product.setSku(request.getSku());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        
        // Update details based on new logic...
        
        return productMapper.toResponseDTO(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id, String sellerEmail) {
        Product product = getProductForVendor(id, sellerEmail);
        if (product.getStatus() == ProductStatus.APPROVED) {
            throw new RuntimeException("Cannot delete an approved product. Disable or discontinue it instead.");
        }
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponseDTO submitForReview(Long id, String sellerEmail) {
        Product product = getProductForVendor(id, sellerEmail);
        if (product.getStatus() != ProductStatus.DRAFT && product.getStatus() != ProductStatus.REJECTED) {
            throw new RuntimeException("Only Draft or Rejected products can be submitted for review.");
        }
        product.setStatus(ProductStatus.PENDING_REVIEW);
        return productMapper.toResponseDTO(productRepository.save(product));
    }

    @Transactional
    public ProductResponseDTO updateStock(Long id, Integer stockQuantity, String sellerEmail) {
        Product product = getProductForVendor(id, sellerEmail);
        if (stockQuantity < 0) throw new IllegalArgumentException("Stock cannot be negative.");
        product.setStockQuantity(stockQuantity);
        if (stockQuantity == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.APPROVED); // assuming it was approved before
        }
        return productMapper.toResponseDTO(productRepository.save(product));
    }

    private Product getProductForVendor(Long id, String sellerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Access denied. You do not own this product.");
        }
        return product;
    }
}
