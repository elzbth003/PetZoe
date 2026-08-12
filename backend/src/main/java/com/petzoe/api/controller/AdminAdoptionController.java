package com.petzoe.api.controller;

import com.petzoe.api.dto.AdoptionPetDTO;
import com.petzoe.api.service.AdminAdoptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/adoptions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAdoptionController {

    private final AdminAdoptionService adminAdoptionService;

    public AdminAdoptionController(AdminAdoptionService adminAdoptionService) {
        this.adminAdoptionService = adminAdoptionService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AdoptionPetDTO>> getPendingAdoptionPets() {
        return ResponseEntity.ok(adminAdoptionService.getPendingAdoptionPets());
    }

    @PutMapping("/pets/{id}/approve")
    public ResponseEntity<AdoptionPetDTO> approveAdoptionPet(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminAdoptionService.approveAdoptionPet(id, authentication.getName()));
    }

    @PutMapping("/pets/{id}/reject")
    public ResponseEntity<AdoptionPetDTO> rejectAdoptionPet(@PathVariable Long id, @RequestParam String reason, Authentication authentication) {
        return ResponseEntity.ok(adminAdoptionService.rejectAdoptionPet(id, reason, authentication.getName()));
    }
}
