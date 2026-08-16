package com.petzoe.api.controller;

import com.petzoe.api.dto.ShelterProfileRequestDTO;
import com.petzoe.api.dto.ShelterResponseDTO;
import com.petzoe.api.service.ShelterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shelters")
@PreAuthorize("hasRole('SHELTER_MANAGER')")
public class ShelterController {

    private final ShelterService shelterService;

    public ShelterController(ShelterService shelterService) {
        this.shelterService = shelterService;
    }

    @GetMapping("/me")
    public ResponseEntity<ShelterResponseDTO> getMyShelter(Authentication authentication) {
        return ResponseEntity.ok(shelterService.getMyShelter(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<ShelterResponseDTO> updateMyShelter(@RequestBody ShelterProfileRequestDTO request,
                                                                Authentication authentication) {
        return ResponseEntity.ok(shelterService.updateMyShelter(authentication.getName(), request));
    }

    @PostMapping("/me/documents")
    public ResponseEntity<ShelterResponseDTO> addDocument(@RequestBody Map<String, String> body,
                                                            Authentication authentication) {
        return ResponseEntity.ok(shelterService.addDocument(authentication.getName(),
                body.get("documentType"), body.get("documentBase64")));
    }

    @DeleteMapping("/me/documents/{id}")
    public ResponseEntity<ShelterResponseDTO> removeDocument(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(shelterService.removeDocument(authentication.getName(), id));
    }

    @PostMapping("/me/submit")
    public ResponseEntity<ShelterResponseDTO> submitForVerification(Authentication authentication) {
        return ResponseEntity.ok(shelterService.submitForVerification(authentication.getName()));
    }
}
