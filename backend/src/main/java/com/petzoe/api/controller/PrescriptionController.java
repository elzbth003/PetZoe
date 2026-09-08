package com.petzoe.api.controller;

import com.petzoe.api.dto.PrescriptionDTO;
import com.petzoe.api.service.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('VETERINARIAN')")
    public ResponseEntity<PrescriptionDTO> createPrescription(@RequestBody PrescriptionDTO dto, Authentication auth) {
        return ResponseEntity.ok(prescriptionService.createPrescription(dto, auth.getName()));
    }

    @GetMapping("/pet/{petId}")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'VETERINARIAN', 'ADMIN')")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByPet(@PathVariable Long petId, Authentication auth) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPet(petId, auth.getName()));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'VETERINARIAN', 'ADMIN')")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByAppointment(@PathVariable Long appointmentId, Authentication auth) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByAppointment(appointmentId, auth.getName()));
    }
}
