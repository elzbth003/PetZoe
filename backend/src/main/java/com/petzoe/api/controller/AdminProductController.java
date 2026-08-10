package com.petzoe.api.controller;

import com.petzoe.api.dto.ProductResponseDTO;
import com.petzoe.api.dto.ProductSummaryDTO;
import com.petzoe.api.service.AdminProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductSummaryDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        return ResponseEntity.ok(adminProductService.getAllProducts(page, size, sortBy));
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<ProductSummaryDTO>> getPendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminProductService.getPendingProducts(page, size));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ProductResponseDTO> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductService.approveProduct(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ProductResponseDTO> rejectProduct(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(adminProductService.rejectProduct(id, reason));
    }
}
