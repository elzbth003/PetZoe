package com.petzoe.api.controller;

import com.petzoe.api.dto.vetscan.VetScanComparisonDTO;
import com.petzoe.api.dto.vetscan.VetScanResponseDTO;
import com.petzoe.api.dto.vetscan.VetScanReviewRequestDTO;
import com.petzoe.api.service.VetScanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/vetscan")
public class VetScanController {

    private final VetScanService vetScanService;

    public VetScanController(VetScanService vetScanService) {
        this.vetScanService = vetScanService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<VetScanResponseDTO> analyzeScan(
            @RequestParam("image") MultipartFile image,
            @RequestParam("petId") Long petId,
            @RequestParam(value = "symptomsJson", required = false) String symptomsJson,
            Authentication authentication
    ) throws IOException {
        String email = authentication.getName();
        VetScanResponseDTO response = vetScanService.analyzeScan(image, petId, symptomsJson, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VetScanResponseDTO> getScanById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(vetScanService.getScanById(id, email));
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<VetScanResponseDTO>> getScansByPet(
            @PathVariable Long petId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(vetScanService.getScansByPet(petId, email));
    }

    @PostMapping("/{id}/compare")
    public ResponseEntity<VetScanComparisonDTO> compareScans(
            @PathVariable Long id,
            @RequestParam("previousScanId") Long previousScanId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(vetScanService.compareScans(id, previousScanId, email));
    }

    @PostMapping("/{id}/veterinarian-review")
    public ResponseEntity<VetScanResponseDTO> reviewScan(
            @PathVariable Long id,
            @Valid @RequestBody VetScanReviewRequestDTO request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(vetScanService.reviewScan(id, request, email));
    }
}
