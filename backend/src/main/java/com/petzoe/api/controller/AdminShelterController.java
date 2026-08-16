package com.petzoe.api.controller;

import com.petzoe.api.dto.ShelterResponseDTO;
import com.petzoe.api.dto.ShelterSummaryDTO;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.service.AdminShelterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shelters")
@PreAuthorize("hasRole('ADMIN')")
public class AdminShelterController {

    private final AdminShelterService adminShelterService;

    public AdminShelterController(AdminShelterService adminShelterService) {
        this.adminShelterService = adminShelterService;
    }

    @GetMapping
    public ResponseEntity<List<ShelterSummaryDTO>> getShelters(@RequestParam(required = false) VerificationStatus status) {
        return ResponseEntity.ok(adminShelterService.getShelters(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShelterResponseDTO> getShelterDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminShelterService.getShelterDetail(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ShelterResponseDTO> approve(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminShelterService.approve(id, authentication.getName()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ShelterResponseDTO> reject(@PathVariable Long id, @RequestParam String reason,
                                                       Authentication authentication) {
        return ResponseEntity.ok(adminShelterService.reject(id, reason, authentication.getName()));
    }

    @PutMapping("/{id}/request-changes")
    public ResponseEntity<ShelterResponseDTO> requestChanges(@PathVariable Long id, @RequestParam String reason,
                                                               Authentication authentication) {
        return ResponseEntity.ok(adminShelterService.requestChanges(id, reason, authentication.getName()));
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<ShelterResponseDTO> suspend(@PathVariable Long id, @RequestParam String reason,
                                                        Authentication authentication) {
        return ResponseEntity.ok(adminShelterService.suspend(id, reason, authentication.getName()));
    }
}
