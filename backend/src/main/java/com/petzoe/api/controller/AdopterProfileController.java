package com.petzoe.api.controller;

import com.petzoe.api.dto.AdopterProfileDTO;
import com.petzoe.api.dto.AdopterProfileRequestDTO;
import com.petzoe.api.service.AdopterProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/adopters/me/profile")
@PreAuthorize("hasRole('PET_OWNER')")
public class AdopterProfileController {

    private final AdopterProfileService adopterProfileService;

    public AdopterProfileController(AdopterProfileService adopterProfileService) {
        this.adopterProfileService = adopterProfileService;
    }

    @GetMapping
    public ResponseEntity<AdopterProfileDTO> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(adopterProfileService.getMyProfile(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<AdopterProfileDTO> updateMyProfile(@Valid @RequestBody AdopterProfileRequestDTO request,
                                                               Authentication authentication) {
        return ResponseEntity.ok(adopterProfileService.updateMyProfile(authentication.getName(), request));
    }
}
