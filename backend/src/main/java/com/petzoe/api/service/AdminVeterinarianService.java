package com.petzoe.api.service;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminVeterinarianService {

    private final VeterinarianProfileRepository veterinarianProfileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final VerificationHistoryRepository verificationHistoryRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public AdminVeterinarianService(
            VeterinarianProfileRepository veterinarianProfileRepository,
            VerificationDocumentRepository verificationDocumentRepository,
            VerificationHistoryRepository verificationHistoryRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            NotificationService notificationService) {
        this.veterinarianProfileRepository = veterinarianProfileRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.verificationHistoryRepository = verificationHistoryRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
    }

    public List<AdminVeterinarianListDTO> getAllVeterinarians() {
        return veterinarianProfileRepository.findAll().stream()
                .map(this::mapToListDTO)
                .collect(Collectors.toList());
    }

    public VeterinarianDetailDTO getVeterinarianDetail(Long id) {
        VeterinarianProfile profile = veterinarianProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian profile not found"));
        return mapToDetailDTO(profile);
    }

    @Transactional
    public void markUnderReview(Long id, String adminEmail) {
        VeterinarianProfile profile = veterinarianProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian profile not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (profile.getUser().getVerificationStatus() != VerificationStatus.PENDING && profile.getUser().getVerificationStatus() != VerificationStatus.RESUBMISSION_REQUIRED) {
             throw new IllegalStateException("Only PENDING or RESUBMISSION_REQUIRED profiles can be marked as UNDER_REVIEW");
        }

        VerificationStatus oldStatus = profile.getUser().getVerificationStatus();
        updateStatusAndLog(profile, admin, VerificationStatus.UNDER_REVIEW, "UNDER_REVIEW", "Started review process");
    }

    @Transactional
    public void approveVeterinarian(Long id, String adminEmail) {
        VeterinarianProfile profile = veterinarianProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian profile not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (profile.getUser().getVerificationStatus() != VerificationStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Profile must be UNDER_REVIEW before approval");
        }

        // Rule Engine: All documents must be approved before the vet can be approved
        List<VerificationDocument> docs = verificationDocumentRepository.findByVeterinarianProfileId(profile.getId());
        if (docs.isEmpty()) {
            throw new IllegalStateException("Cannot approve profile with no documents");
        }
        for (VerificationDocument doc : docs) {
            if (doc.getStatus() != VerificationStatus.APPROVED) {
                throw new IllegalStateException("Cannot approve profile until all documents are APPROVED");
            }
        }

        updateStatusAndLog(profile, admin, VerificationStatus.APPROVED, "APPROVED", "Approved veterinarian verification");
        notificationService.createNotification(profile.getUser(), "Verification Approved", "Your veterinarian profile has been approved.", "VERIFICATION");
    }

    @Transactional
    public void rejectVeterinarian(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Reason is required for rejection");
        }

        VeterinarianProfile profile = veterinarianProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian profile not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        updateStatusAndLog(profile, admin, VerificationStatus.REJECTED, "REJECTED", reason);
        notificationService.createNotification(profile.getUser(), "Verification Rejected", "Your veterinarian profile has been rejected. Reason: " + reason, "VERIFICATION");
    }

    @Transactional
    public void requestResubmission(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Reason is required to request resubmission");
        }

        VeterinarianProfile profile = veterinarianProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian profile not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        updateStatusAndLog(profile, admin, VerificationStatus.RESUBMISSION_REQUIRED, "REQUEST_RESUBMISSION", reason);
        notificationService.createNotification(profile.getUser(), "Resubmission Required", "We need more information for your verification. Reason: " + reason, "VERIFICATION");
    }

    @Transactional
    public VerificationDocumentDTO reviewDocument(Long documentId, VerificationStatus newStatus, String reason, String adminEmail) {
        VerificationDocument doc = verificationDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (newStatus == VerificationStatus.REJECTED && (reason == null || reason.isBlank())) {
            throw new IllegalArgumentException("Reason is required for rejected documents");
        }

        doc.setStatus(newStatus);
        if (newStatus == VerificationStatus.REJECTED) {
            doc.setRejectionReason(reason);
        } else {
            doc.setRejectionReason(null);
        }
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setVerifiedBy(admin);

        verificationDocumentRepository.save(doc);

        return mapToDocumentDTO(doc);
    }

    private void updateStatusAndLog(VeterinarianProfile profile, User admin, VerificationStatus newStatus, String action, String reason) {
        VerificationStatus oldStatus = profile.getUser().getVerificationStatus();
        
        // Update User status (single source of truth for auth)
        User user = profile.getUser();
        user.setVerificationStatus(newStatus);
        userRepository.save(user);

        // Update Profile timestamps
        if (newStatus == VerificationStatus.APPROVED || newStatus == VerificationStatus.REJECTED) {
            profile.setVerifiedAt(LocalDateTime.now());
            profile.setVerifiedBy(admin);
            veterinarianProfileRepository.save(profile);
        }

        // Add to history (Append only)
        VerificationHistory history = new VerificationHistory(profile, action, oldStatus, newStatus, reason, admin);
        verificationHistoryRepository.save(history);

        // Audit log
        AuditLog log = new AuditLog(admin, action + "_VET", "User", user.getId(), action + " vet verification. Reason: " + reason);
        auditLogRepository.save(log);
    }

    private AdminVeterinarianListDTO mapToListDTO(VeterinarianProfile profile) {
        User user = profile.getUser();
        return new AdminVeterinarianListDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getSpecialization(),
                user.getVerificationStatus(),
                profile.getSubmittedAt(),
                profile.getExperience(),
                profile.getRegistrationNumber()
        );
    }

    private VeterinarianDetailDTO mapToDetailDTO(VeterinarianProfile profile) {
        User user = profile.getUser();
        
        List<VerificationDocumentDTO> docs = verificationDocumentRepository.findByVeterinarianProfileId(profile.getId())
                .stream().map(this::mapToDocumentDTO).collect(Collectors.toList());
                
        List<VerificationHistoryDTO> history = verificationHistoryRepository.findByVeterinarianProfileIdOrderByCreatedAtDesc(profile.getId())
                .stream().map(this::mapToHistoryDTO).collect(Collectors.toList());

        return new VeterinarianDetailDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getSpecialization(),
                user.getBio(),
                user.getAddress(),
                user.getVerificationStatus(),
                profile.getId(),
                profile.getQualification(),
                profile.getRegistrationNumber(),
                profile.getExperience(),
                profile.getSubmittedAt(),
                profile.getVerifiedAt(),
                docs,
                history
        );
    }

    private VerificationDocumentDTO mapToDocumentDTO(VerificationDocument doc) {
        return new VerificationDocumentDTO(
                doc.getId(),
                doc.getDocumentType(),
                doc.getDocumentBase64(),
                doc.getStatus(),
                doc.getRejectionReason(),
                doc.getUploadedAt(),
                doc.getVerifiedAt(),
                doc.getVerifiedBy() != null ? doc.getVerifiedBy().getEmail() : null
        );
    }

    private VerificationHistoryDTO mapToHistoryDTO(VerificationHistory history) {
        return new VerificationHistoryDTO(
                history.getId(),
                history.getAction(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getReason(),
                history.getAdmin() != null ? history.getAdmin().getEmail() : null,
                history.getCreatedAt()
        );
    }
}
