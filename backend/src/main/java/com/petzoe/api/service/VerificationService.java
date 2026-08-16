package com.petzoe.api.service;

import com.petzoe.api.dto.SubmitVerificationRequestDTO;
import com.petzoe.api.dto.VerificationRequestDTO;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationRequest;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VerificationService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public VerificationService(VerificationRequestRepository verificationRequestRepository,
                                UserRepository userRepository,
                                NotificationService notificationService) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public VerificationRequestDTO submitVerification(String email, SubmitVerificationRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.documentBase64() == null || request.documentBase64().isBlank()) {
            throw new IllegalArgumentException("A verification document is required.");
        }

        String entityType = user.getRole();
        Optional<VerificationRequest> existing = verificationRequestRepository.findByUserIdAndEntityType(user.getId(), entityType);

        VerificationRequest verificationRequest;
        if (existing.isPresent()) {
            verificationRequest = existing.get();
            if (verificationRequest.getStatus() == VerificationStatus.PENDING
                    || verificationRequest.getStatus() == VerificationStatus.UNDER_REVIEW) {
                throw new IllegalStateException("A verification request is already pending review.");
            }
            if (verificationRequest.getStatus() == VerificationStatus.APPROVED) {
                throw new IllegalStateException("You are already verified.");
            }
            // Resubmission after REJECTED / CHANGES_REQUIRED / RESUBMISSION_REQUIRED
            verificationRequest.setDocumentBase64(request.documentBase64());
            verificationRequest.setAdditionalDocumentsBase64(request.additionalDocumentsBase64());
            verificationRequest.setStatus(VerificationStatus.PENDING);
            verificationRequest.setReviewerNotes(null);
            verificationRequest.setSubmittedAt(LocalDateTime.now());
            verificationRequest.setReviewedAt(null);
            verificationRequest.setReviewedBy(null);
        } else {
            verificationRequest = new VerificationRequest();
            verificationRequest.setUser(user);
            verificationRequest.setEntityType(entityType);
            verificationRequest.setDocumentBase64(request.documentBase64());
            verificationRequest.setAdditionalDocumentsBase64(request.additionalDocumentsBase64());
            verificationRequest.setStatus(VerificationStatus.PENDING);
        }

        verificationRequestRepository.save(verificationRequest);

        user.setVerificationStatus(VerificationStatus.PENDING);
        userRepository.save(user);

        notificationService.createNotification(user,
                "Verification Submitted",
                "Your " + entityType + " verification request has been submitted for review.",
                "SYSTEM");

        notifyAdmins(user, entityType);

        return new VerificationRequestDTO(verificationRequest);
    }

    public VerificationRequestDTO getMyVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return verificationRequestRepository.findByUserIdAndEntityType(user.getId(), user.getRole())
                .map(VerificationRequestDTO::new)
                .orElse(null);
    }

    /**
     * Automatically opens a pending verification request right when a user registers
     * under a role that requires admin verification (e.g. Marketplace Seller), so the
     * request shows up in the admin queue immediately without a separate submission step.
     */
    @Transactional
    public void autoCreateOnRegistration(User user) {
        String entityType = user.getRole();

        VerificationRequest verificationRequest = new VerificationRequest();
        verificationRequest.setUser(user);
        verificationRequest.setEntityType(entityType);
        verificationRequest.setStatus(VerificationStatus.PENDING);
        verificationRequestRepository.save(verificationRequest);

        user.setVerificationStatus(VerificationStatus.PENDING);
        userRepository.save(user);

        notifyAdmins(user, entityType);
    }

    private void notifyAdmins(User applicant, String entityType) {
        List<User> admins = userRepository.findByRole("Admin");
        for (User admin : admins) {
            notificationService.createNotification(admin,
                    "New Seller Verification Request",
                    applicant.getName() + " (" + applicant.getEmail() + ") registered as a "
                            + entityType + " and is awaiting verification.",
                    "SYSTEM",
                    null,
                    applicant.getId());
        }
    }
}
