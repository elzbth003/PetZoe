package com.petzoe.api.controller;

import com.petzoe.api.dto.*;
import com.petzoe.api.service.AppointmentService;
import com.petzoe.api.service.PetClinicalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
@PreAuthorize("hasRole('VETERINARIAN')")
public class VetClinicalController {

    private final PetClinicalService petClinicalService;
    private final AppointmentService appointmentService;

    public VetClinicalController(PetClinicalService petClinicalService, AppointmentService appointmentService) {
        this.petClinicalService = petClinicalService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<VetDashboardStatsDTO> getDashboardStats(Authentication auth) {
        return ResponseEntity.ok(petClinicalService.getDashboardStats(auth.getName()));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PetDTO>> getAuthorizedPatients(Authentication auth) {
        return ResponseEntity.ok(petClinicalService.getAuthorizedPatients(auth.getName()));
    }

    @GetMapping("/patients/{petId}")
    public ResponseEntity<VetPatientDetailDTO> getPatientDetail(@PathVariable Long petId, Authentication auth) {
        return ResponseEntity.ok(petClinicalService.getPatientDetail(petId, auth.getName()));
    }

    @PostMapping("/patients/{petId}/medical-records")
    public ResponseEntity<PetMedicalRecordDTO> addMedicalRecord(
            @PathVariable Long petId,
            @Valid @RequestBody PetMedicalRecordRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(petClinicalService.addMedicalRecord(petId, request, auth.getName()));
    }

    @PostMapping("/patients/{petId}/vaccinations")
    public ResponseEntity<PetVaccinationDTO> addVaccination(
            @PathVariable Long petId,
            @Valid @RequestBody PetVaccinationRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(petClinicalService.addVaccination(petId, request, auth.getName()));
    }

    @PostMapping("/patients/{petId}/documents")
    public ResponseEntity<PetMedicalDocumentDTO> uploadDocument(
            @PathVariable Long petId,
            @Valid @RequestBody PetMedicalDocumentUploadDTO request,
            Authentication auth) {
        return ResponseEntity.ok(petClinicalService.uploadDocument(petId, request, auth.getName()));
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<List<PetMedicalRecordDTO>> getFollowUps(Authentication auth) {
        return ResponseEntity.ok(petClinicalService.getFollowUps(auth.getName()));
    }

    // --- Appointment Lifecycle Transitions ---

    @PostMapping("/appointments/{id}/accept")
    public ResponseEntity<AppointmentDTO> acceptAppointment(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(appointmentService.acceptAppointment(id, auth.getName()));
    }

    @PostMapping("/appointments/{id}/reject")
    public ResponseEntity<AppointmentDTO> rejectAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) AppointmentActionRequestDTO request,
            Authentication auth) {
        String reason = request != null ? request.reason() : null;
        return ResponseEntity.ok(appointmentService.rejectAppointment(id, reason, auth.getName()));
    }

    @PostMapping("/appointments/{id}/reschedule")
    public ResponseEntity<AppointmentDTO> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentActionRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(
                id, request.newDate(), request.newTime(), request.reason(), auth.getName()));
    }

    @PostMapping("/appointments/{id}/consult")
    public ResponseEntity<AppointmentDTO> startConsultation(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(appointmentService.startConsultation(id, auth.getName()));
    }

    @PostMapping("/appointments/{id}/complete-consultation")
    public ResponseEntity<AppointmentDTO> completeConsultation(
            @PathVariable Long id,
            @Valid @RequestBody ConsultationSubmissionDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(appointmentService.completeConsultation(id, dto, auth.getName()));
    }
}
