package com.petzoe.api.controller;

import com.petzoe.api.dto.AnimalIntakeRequestDTO;
import com.petzoe.api.dto.AnimalResponseDTO;
import com.petzoe.api.dto.AnimalSummaryDTO;
import com.petzoe.api.dto.InitialAssessmentRequestDTO;
import com.petzoe.api.dto.MedicalDocumentUploadRequestDTO;
import com.petzoe.api.service.AnimalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shelters/me/animals")
@PreAuthorize("hasRole('SHELTER_MANAGER')")
public class AnimalController {

    private final AnimalService animalService;

    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping
    public ResponseEntity<List<AnimalSummaryDTO>> getMyAnimals(Authentication authentication) {
        return ResponseEntity.ok(animalService.getMyAnimals(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> getAnimal(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(animalService.getAnimal(authentication.getName(), id));
    }

    @PostMapping
    public ResponseEntity<AnimalResponseDTO> createIntake(@RequestBody AnimalIntakeRequestDTO request,
                                                            Authentication authentication) {
        return ResponseEntity.ok(animalService.createIntake(authentication.getName(), request));
    }

    @PutMapping("/{id}/initial-assessment")
    public ResponseEntity<AnimalResponseDTO> recordInitialAssessment(@PathVariable Long id,
                                                                       @RequestBody InitialAssessmentRequestDTO request,
                                                                       Authentication authentication) {
        return ResponseEntity.ok(animalService.recordInitialAssessment(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<AnimalResponseDTO> uploadDocument(@PathVariable Long id,
                                                              @RequestBody MedicalDocumentUploadRequestDTO request,
                                                              Authentication authentication) {
        return ResponseEntity.ok(animalService.uploadDocument(authentication.getName(), id, request));
    }
}
