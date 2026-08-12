package com.petzoe.api.service;

import com.petzoe.api.dto.VerificationRequestDTO;
import com.petzoe.api.entity.AuditLog;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationRequest;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.AuditLogRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminVerificationService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminVerificationService(VerificationRequestRepository verificationRequestRepository,
                                    UserRepository userRepository,
                                    AuditLogRepository auditLogRepository) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<VerificationRequestDTO> getPendingVerifications(String entityType) {
        return verificationRequestRepository.findByEntityTypeAndStatus(entityType, VerificationStatus.PENDING)
                .stream().map(VerificationRequestDTO::new).collect(Collectors.toList());
    }

    public VerificationRequestDTO approveVerification(Long id, String adminEmail) {
        VerificationRequest request = verificationRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification request not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        request.setStatus(VerificationStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(admin);
        
        // Update user status
        User user = request.getUser();
        user.setVerificationStatus(VerificationStatus.APPROVED);
        userRepository.save(user);

        verificationRequestRepository.save(request);

        AuditLog log = new AuditLog(admin, "APPROVED_USER", "User", user.getId(), "Approved " + user.getRole() + " verification.");
        auditLogRepository.save(log);

        return new VerificationRequestDTO(request);
    }

    public VerificationRequestDTO rejectVerification(Long id, String reason, String adminEmail) {
        VerificationRequest request = verificationRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification request not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        request.setStatus(VerificationStatus.REJECTED);
        request.setReviewerNotes(reason);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(admin);

        // Update user status
        User user = request.getUser();
        user.setVerificationStatus(VerificationStatus.REJECTED);
        userRepository.save(user);

        verificationRequestRepository.save(request);

        AuditLog log = new AuditLog(admin, "REJECTED_USER", "User", user.getId(), "Rejected " + user.getRole() + " verification. Reason: " + reason);
        auditLogRepository.save(log);

        return new VerificationRequestDTO(request);
    }
}
