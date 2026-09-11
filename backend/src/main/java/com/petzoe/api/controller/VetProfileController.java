package com.petzoe.api.controller;

import com.petzoe.api.dto.VerificationDocumentDTO;
import com.petzoe.api.dto.VerificationDocumentUploadDTO;
import com.petzoe.api.dto.VeterinarianProfileUpdateDTO;
import com.petzoe.api.dto.VeterinarianSelfProfileDTO;
import com.petzoe.api.service.VetProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vets/profile")
@PreAuthorize("hasRole('VETERINARIAN')")
public class VetProfileController {

    private final VetProfileService vetProfileService;

    public VetProfileController(VetProfileService vetProfileService) {
        this.vetProfileService = vetProfileService;
    }

    @GetMapping
    public ResponseEntity<VeterinarianSelfProfileDTO> getProfile(Authentication auth) {
        return ResponseEntity.ok(vetProfileService.getProfile(auth.getName()));
    }

    @PutMapping
    public ResponseEntity<VeterinarianSelfProfileDTO> updateProfile(
            @Valid @RequestBody VeterinarianProfileUpdateDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(vetProfileService.updateProfile(auth.getName(), dto));
    }

    @PostMapping("/documents")
    public ResponseEntity<VerificationDocumentDTO> uploadDocument(
            @Valid @RequestBody VerificationDocumentUploadDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(vetProfileService.uploadDocument(auth.getName(), dto.documentType(), dto.documentBase64()));
    }

    @DeleteMapping("/documents/{docId}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long docId,
            Authentication auth) {
        vetProfileService.deleteDocument(docId, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    @PostMapping("/submit")
    public ResponseEntity<VeterinarianSelfProfileDTO> submitForVerification(Authentication auth) {
        return ResponseEntity.ok(vetProfileService.submitForVerification(auth.getName()));
    }
}
