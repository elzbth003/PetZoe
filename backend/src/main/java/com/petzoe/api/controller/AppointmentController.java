package com.petzoe.api.controller;

import com.petzoe.api.dto.AppointmentDTO;
import com.petzoe.api.dto.AppointmentPaymentInitDTO;
import com.petzoe.api.dto.AppointmentPaymentVerifyDTO;
import com.petzoe.api.dto.DoctorDayScheduleDTO;
import com.petzoe.api.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsByOwner(email));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<DoctorDayScheduleDTO> getAvailableSlots(
            @RequestParam Long veterinarianId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getDoctorSlotAvailability(veterinarianId, date));
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> bookAppointment(@Valid @RequestBody AppointmentDTO dto, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.bookAppointment(dto, email));
    }

    @PostMapping("/initiate-payment")
    public ResponseEntity<AppointmentPaymentInitDTO> initiatePayment(
            @Valid @RequestBody AppointmentDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.initiateAppointmentPayment(dto, email));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<AppointmentDTO> verifyPayment(
            @RequestBody AppointmentPaymentVerifyDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.verifyAppointmentPayment(request, email));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, email));
    }

    @GetMapping("/vet")
    public ResponseEntity<List<AppointmentDTO>> getVetAppointments(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsByVeterinarian(email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentDTO> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        String email = authentication.getName();
        String status = payload.get("status");
        String notes = payload.get("notes");
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status, notes, email));
    }
}
