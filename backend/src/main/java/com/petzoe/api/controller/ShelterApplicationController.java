package com.petzoe.api.controller;

import com.petzoe.api.dto.AdoptionApplicationDTO;
import com.petzoe.api.service.AdoptionApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Shelter-side, read-only for now — Phase 7 only covers submission; the
 * shelter decision workflow (approve/reject/request info) is a later phase. */
@RestController
@RequestMapping("/api/shelters/me/applications")
@PreAuthorize("hasRole('SHELTER_MANAGER')")
public class ShelterApplicationController {

    private final AdoptionApplicationService adoptionApplicationService;

    public ShelterApplicationController(AdoptionApplicationService adoptionApplicationService) {
        this.adoptionApplicationService = adoptionApplicationService;
    }

    @GetMapping
    public ResponseEntity<List<AdoptionApplicationDTO>> getApplications(Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.getApplicationsForMyShelter(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdoptionApplicationDTO> getApplicationDetail(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.getShelterApplicationDetail(authentication.getName(), id));
    }
}
