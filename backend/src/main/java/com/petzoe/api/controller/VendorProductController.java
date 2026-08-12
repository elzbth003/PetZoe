package com.petzoe.api.controller;

import com.petzoe.api.dto.ProductRequestDTO;
import com.petzoe.api.dto.ProductResponseDTO;
import com.petzoe.api.dto.ProductSummaryDTO;
import com.petzoe.api.service.VendorProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/products")
@PreAuthorize("hasAnyRole('SELLER', 'MARKETPLACE_SELLER', 'ADMIN')")
public class VendorProductController {

    private final VendorProductService vendorProductService;

    public VendorProductController(VendorProductService vendorProductService) {
        this.vendorProductService = vendorProductService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductSummaryDTO>> getMyProducts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorProductService.getVendorProducts(email, page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorProductService.getVendorProductById(id, email));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody ProductRequestDTO request, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorProductService.createProduct(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO request, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorProductService.updateProduct(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        vendorProductService.deleteProduct(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ProductResponseDTO> submitForReview(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorProductService.submitForReview(id, email));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<ProductResponseDTO> updateStock(@PathVariable Long id, @RequestParam Integer stock, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorProductService.updateStock(id, stock, email));
    }
}
