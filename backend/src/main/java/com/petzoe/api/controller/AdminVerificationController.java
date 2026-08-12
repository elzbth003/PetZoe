package com.petzoe.api.controller;

import com.petzoe.api.dto.VerificationRequestDTO;
import com.petzoe.api.service.AdminVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/verifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final AdminVerificationService adminVerificationService;

    public AdminVerificationController(AdminVerificationService adminVerificationService) {
        this.adminVerificationService = adminVerificationService;
    }

    @GetMapping
    public ResponseEntity<List<VerificationRequestDTO>> getPendingVerifications(@RequestParam String entityType) {
        return ResponseEntity.ok(adminVerificationService.getPendingVerifications(entityType));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<VerificationRequestDTO> approveVerification(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminVerificationService.approveVerification(id, authentication.getName()));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<VerificationRequestDTO> rejectVerification(@PathVariable Long id, @RequestParam String reason, Authentication authentication) {
        return ResponseEntity.ok(adminVerificationService.rejectVerification(id, reason, authentication.getName()));
    }
}
