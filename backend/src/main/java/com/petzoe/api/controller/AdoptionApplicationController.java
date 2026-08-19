package com.petzoe.api.controller;

import com.petzoe.api.dto.AdoptionApplicationDTO;
import com.petzoe.api.dto.AdoptionApplicationRequestDTO;
import com.petzoe.api.service.AdoptionApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adopters/me/applications")
@PreAuthorize("hasRole('PET_OWNER')")
public class AdoptionApplicationController {

    private final AdoptionApplicationService adoptionApplicationService;

    public AdoptionApplicationController(AdoptionApplicationService adoptionApplicationService) {
        this.adoptionApplicationService = adoptionApplicationService;
    }

    @GetMapping
    public ResponseEntity<List<AdoptionApplicationDTO>> getMyApplications(Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.getMyApplications(authentication.getName()));
    }

    @GetMapping("/{animalId}")
    public ResponseEntity<AdoptionApplicationDTO> getMyApplication(@PathVariable Long animalId, Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.getMyApplication(authentication.getName(), animalId));
    }

    @PutMapping("/{animalId}")
    public ResponseEntity<AdoptionApplicationDTO> saveDraft(@PathVariable Long animalId,
                                                              @RequestBody AdoptionApplicationRequestDTO request,
                                                              Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.saveDraft(authentication.getName(), animalId, request));
    }

    @PostMapping("/{animalId}/submit")
    public ResponseEntity<AdoptionApplicationDTO> submit(@PathVariable Long animalId, Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.submit(authentication.getName(), animalId));
    }

    @PostMapping("/{animalId}/withdraw")
    public ResponseEntity<AdoptionApplicationDTO> withdraw(@PathVariable Long animalId, Authentication authentication) {
        return ResponseEntity.ok(adoptionApplicationService.withdraw(authentication.getName(), animalId));
    }
}
