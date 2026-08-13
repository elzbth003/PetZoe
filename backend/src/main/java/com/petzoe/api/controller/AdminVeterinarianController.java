package com.petzoe.api.controller;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.service.AdminVeterinarianService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/veterinarians")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVeterinarianController {

    private final AdminVeterinarianService adminVeterinarianService;

    public AdminVeterinarianController(AdminVeterinarianService adminVeterinarianService) {
        this.adminVeterinarianService = adminVeterinarianService;
    }

    @GetMapping
    public ResponseEntity<List<AdminVeterinarianListDTO>> getAllVeterinarians() {
        return ResponseEntity.ok(adminVeterinarianService.getAllVeterinarians());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeterinarianDetailDTO> getVeterinarianDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminVeterinarianService.getVeterinarianDetail(id));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<Map<String, String>> markUnderReview(@PathVariable Long id, Authentication auth) {
        adminVeterinarianService.markUnderReview(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Profile marked as UNDER_REVIEW"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approveVeterinarian(@PathVariable Long id, Authentication auth) {
        adminVeterinarianService.approveVeterinarian(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Veterinarian approved successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectVeterinarian(@PathVariable Long id, @Valid @RequestBody ReviewRequestDTO request, Authentication auth) {
        adminVeterinarianService.rejectVeterinarian(id, request.reason(), auth.getName());
        return ResponseEntity.ok(Map.of("message", "Veterinarian rejected"));
    }

    @PutMapping("/{id}/request-resubmission")
    public ResponseEntity<Map<String, String>> requestResubmission(@PathVariable Long id, @Valid @RequestBody ReviewRequestDTO request, Authentication auth) {
        adminVeterinarianService.requestResubmission(id, request.reason(), auth.getName());
        return ResponseEntity.ok(Map.of("message", "Resubmission requested"));
    }

    @PutMapping("/documents/{docId}/review")
    public ResponseEntity<VerificationDocumentDTO> reviewDocument(
            @PathVariable Long docId,
            @RequestParam VerificationStatus status,
            @RequestParam(required = false) String reason,
            Authentication auth) {
        return ResponseEntity.ok(adminVeterinarianService.reviewDocument(docId, status, reason, auth.getName()));
    }
}
