package com.petzoe.api.controller;

import com.petzoe.api.dto.ShelterResponseDTO;
import com.petzoe.api.dto.ShelterSummaryDTO;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.service.AdminShelterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shelters")
@PreAuthorize("hasRole('ADMIN')")
public class AdminShelterController {

    private final AdminShelterService adminShelterService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public AdminShelterController(AdminShelterService adminShelterService,
                                  com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.adminShelterService = adminShelterService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<ShelterSummaryDTO>> getShelters(@RequestParam(required = false) VerificationStatus status) {
        return ResponseEntity.ok(adminShelterService.getShelters(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShelterResponseDTO> getShelterDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminShelterService.getShelterDetail(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ShelterResponseDTO> approve(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminShelterService.approve(id, authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ShelterResponseDTO> reject(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            jakarta.servlet.http.HttpServletRequest request,
            Authentication authentication) {
        String effectiveReason = extractReason(reason, request);
        return ResponseEntity.ok(adminShelterService.reject(id, effectiveReason, authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/{id}/request-changes")
    public ResponseEntity<ShelterResponseDTO> requestChanges(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            jakarta.servlet.http.HttpServletRequest request,
            Authentication authentication) {
        String effectiveReason = extractReason(reason, request);
        return ResponseEntity.ok(adminShelterService.requestChanges(id, effectiveReason, authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<ShelterResponseDTO> suspend(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            jakarta.servlet.http.HttpServletRequest request,
            Authentication authentication) {
        String effectiveReason = extractReason(reason, request);
        return ResponseEntity.ok(adminShelterService.suspend(id, effectiveReason, authentication != null ? authentication.getName() : null));
    }

    private String extractReason(String reason, jakarta.servlet.http.HttpServletRequest request) {
        if (reason != null && !reason.isBlank()) {
            return reason;
        }
        if (request != null) {
            String param = request.getParameter("reason");
            if (param != null && !param.isBlank()) {
                return param;
            }
            try {
                String ct = request.getContentType();
                if (ct != null && ct.contains("application/json")) {
                    com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(request.getInputStream());
                    if (node != null && node.has("reason") && !node.get("reason").isNull()) {
                        return node.get("reason").asText();
                    }
                }
            } catch (Exception ignored) {}
        }
        return reason;
    }
}
