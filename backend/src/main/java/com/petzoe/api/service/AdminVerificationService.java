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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminVerificationService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public AdminVerificationService(VerificationRequestRepository verificationRequestRepository,
                                    UserRepository userRepository,
                                    AuditLogRepository auditLogRepository,
                                    NotificationService notificationService) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
    }

    public List<VerificationRequestDTO> getPendingVerifications(String entityType) {
        return verificationRequestRepository.findByEntityTypeAndStatus(entityType, VerificationStatus.PENDING)
                .stream().map(VerificationRequestDTO::new).collect(Collectors.toList());
    }

    @Transactional
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

        notificationService.createNotification(
                user,
                "Account Approved",
                "Your " + user.getRole() + " verification has been approved. You can now access all features.",
                "ACCOUNT_APPROVED",
                null,
                request.getId()
        );

        return new VerificationRequestDTO(request);
    }

    @Transactional
    public VerificationRequestDTO rejectVerification(Long id, String reason, String adminEmail) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required for rejection.");
        }
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

        notificationService.createNotification(
                user,
                "Account Verification Rejected",
                "Your " + user.getRole() + " verification was rejected.",
                "ACCOUNT_REJECTED",
                reason,
                request.getId()
        );

        return new VerificationRequestDTO(request);
    }
}
