package com.petzoe.api.controller;

import com.petzoe.api.dto.*;
import com.petzoe.api.service.MedicalRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets/animals")
@PreAuthorize("hasRole('VETERINARIAN')")
public class VetAnimalController {

    private final MedicalRecordService medicalRecordService;

    public VetAnimalController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @GetMapping
    public ResponseEntity<List<AnimalSummaryDTO>> getWorklist() {
        return ResponseEntity.ok(medicalRecordService.getAnimalWorklist());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> getAnimal(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(medicalRecordService.getAnimal(authentication.getName(), id));
    }

    @PostMapping("/{id}/medical-records")
    public ResponseEntity<AnimalResponseDTO> addMedicalRecord(@PathVariable Long id,
                                                                @RequestBody MedicalRecordRequestDTO request,
                                                                Authentication authentication) {
        return ResponseEntity.ok(medicalRecordService.addMedicalRecord(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/vaccinations")
    public ResponseEntity<AnimalResponseDTO> addVaccination(@PathVariable Long id,
                                                              @RequestBody VaccinationRequestDTO request,
                                                              Authentication authentication) {
        return ResponseEntity.ok(medicalRecordService.addVaccination(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/preventive-care")
    public ResponseEntity<AnimalResponseDTO> addPreventiveCare(@PathVariable Long id,
                                                                 @RequestBody PreventiveCareRequestDTO request,
                                                                 Authentication authentication) {
        return ResponseEntity.ok(medicalRecordService.addPreventiveCare(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<AnimalResponseDTO> uploadDocument(@PathVariable Long id,
                                                              @RequestBody MedicalDocumentUploadRequestDTO request,
                                                              Authentication authentication) {
        return ResponseEntity.ok(medicalRecordService.uploadDocument(authentication.getName(), id, request));
    }

    @PutMapping("/documents/{documentId}/review")
    public ResponseEntity<AnimalResponseDTO> reviewDocument(@PathVariable Long documentId,
                                                              @RequestBody MedicalDocumentReviewRequestDTO request,
                                                              Authentication authentication) {
        return ResponseEntity.ok(medicalRecordService.reviewDocument(authentication.getName(), documentId, request));
    }
}
