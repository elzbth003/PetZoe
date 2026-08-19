package com.petzoe.api.controller;

import com.petzoe.api.dto.AdoptionListingDTO;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.service.AdminAdoptionListingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/adoption-listings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAdoptionListingController {

    private final AdminAdoptionListingService adminAdoptionListingService;

    public AdminAdoptionListingController(AdminAdoptionListingService adminAdoptionListingService) {
        this.adminAdoptionListingService = adminAdoptionListingService;
    }

    @GetMapping
    public ResponseEntity<List<AdoptionListingDTO>> getListings(@RequestParam(required = false) VerificationStatus status) {
        return ResponseEntity.ok(adminAdoptionListingService.getListings(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdoptionListingDTO> getListingDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminAdoptionListingService.getListingDetail(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AdoptionListingDTO> approve(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminAdoptionListingService.approve(id, authentication.getName()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AdoptionListingDTO> reject(@PathVariable Long id, @RequestParam String reason,
                                                       Authentication authentication) {
        return ResponseEntity.ok(adminAdoptionListingService.reject(id, reason, authentication.getName()));
    }

    @PutMapping("/{id}/request-changes")
    public ResponseEntity<AdoptionListingDTO> requestChanges(@PathVariable Long id, @RequestParam String reason,
                                                               Authentication authentication) {
        return ResponseEntity.ok(adminAdoptionListingService.requestChanges(id, reason, authentication.getName()));
    }
}
