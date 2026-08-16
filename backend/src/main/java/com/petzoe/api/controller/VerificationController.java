package com.petzoe.api.controller;

import com.petzoe.api.dto.SubmitVerificationRequestDTO;
import com.petzoe.api.dto.VerificationRequestDTO;
import com.petzoe.api.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verifications")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/me")
    public ResponseEntity<VerificationRequestDTO> submitVerification(@RequestBody SubmitVerificationRequestDTO request,
                                                                       Authentication authentication) {
        return ResponseEntity.ok(verificationService.submitVerification(authentication.getName(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<VerificationRequestDTO> getMyVerification(Authentication authentication) {
        return ResponseEntity.ok(verificationService.getMyVerification(authentication.getName()));
    }
}
