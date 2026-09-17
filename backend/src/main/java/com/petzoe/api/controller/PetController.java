package com.petzoe.api.controller;

import com.petzoe.api.dto.*;
import com.petzoe.api.service.PetClinicalService;
import com.petzoe.api.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;
    private final PetClinicalService petClinicalService;

    public PetController(PetService petService, PetClinicalService petClinicalService) {
        this.petService = petService;
        this.petClinicalService = petClinicalService;
    }

    @GetMapping
    public ResponseEntity<List<PetDTO>> getMyPets(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.getPetsByOwner(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.getPetById(id, email));
    }

    @GetMapping("/code/{petCode}")
    public ResponseEntity<PetDTO> getPetByCode(@PathVariable String petCode, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.getPetByCode(petCode, email));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<PetDTO> transferOwnership(
            @PathVariable Long id,
            @Valid @RequestBody PetTransferRequestDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.transferOwnership(id, request.newOwnerEmail(), email));
    }

    @PostMapping
    public ResponseEntity<PetDTO> createPet(@Valid @RequestBody PetDTO petDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.createPet(petDTO, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Long id, @Valid @RequestBody PetDTO petDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(petService.updatePet(id, petDTO, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        petService.deletePet(id, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/medical-records")
    public ResponseEntity<List<PetMedicalRecordDTO>> getPetMedicalRecords(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(petClinicalService.getPetMedicalRecords(id, authentication.getName()));
    }

    @GetMapping("/{id}/vaccinations")
    public ResponseEntity<List<PetVaccinationDTO>> getPetVaccinations(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(petClinicalService.getPetVaccinations(id, authentication.getName()));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<PetMedicalDocumentDTO>> getPetDocuments(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(petClinicalService.getPetDocuments(id, authentication.getName()));
    }

    @GetMapping("/{id}/clinical-history")
    public ResponseEntity<VetPatientDetailDTO> getPetClinicalHistory(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(petClinicalService.getPatientDetail(id, authentication.getName()));
    }
}
