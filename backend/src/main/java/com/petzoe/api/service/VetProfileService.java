package com.petzoe.api.service;

import com.petzoe.api.dto.VerificationDocumentDTO;
import com.petzoe.api.dto.VerificationHistoryDTO;
import com.petzoe.api.dto.VeterinarianProfileUpdateDTO;
import com.petzoe.api.dto.VeterinarianSelfProfileDTO;
import com.petzoe.api.dto.VetScheduleUpdateDTO;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationDocument;
import com.petzoe.api.entity.VerificationHistory;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.entity.VeterinarianProfile;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationDocumentRepository;
import com.petzoe.api.repository.VerificationHistoryRepository;
import com.petzoe.api.repository.VeterinarianProfileRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VetProfileService {

    private final VeterinarianProfileRepository veterinarianProfileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final VerificationHistoryRepository verificationHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public VetProfileService(VeterinarianProfileRepository veterinarianProfileRepository,
                             VerificationDocumentRepository verificationDocumentRepository,
                             VerificationHistoryRepository verificationHistoryRepository,
                             UserRepository userRepository,
                             NotificationService notificationService) {
        this.veterinarianProfileRepository = veterinarianProfileRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.verificationHistoryRepository = verificationHistoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public VeterinarianSelfProfileDTO getProfile(String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId())
                .orElseGet(() -> {
                    VeterinarianProfile newProfile = new VeterinarianProfile();
                    newProfile.setUser(vet);
                    return veterinarianProfileRepository.save(newProfile);
                });

        return mapToSelfProfileDTO(vet, profile);
    }

    @Transactional
    public VeterinarianSelfProfileDTO updateProfile(String vetEmail, VeterinarianProfileUpdateDTO dto) {
        User vet = getVetByEmail(vetEmail);
        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId())
                .orElseGet(() -> {
                    VeterinarianProfile newProfile = new VeterinarianProfile();
                    newProfile.setUser(vet);
                    return veterinarianProfileRepository.save(newProfile);
                });

        if (dto.qualification() != null) profile.setQualification(dto.qualification().trim());
        if (dto.registrationNumber() != null) profile.setRegistrationNumber(dto.registrationNumber().trim());
        if (dto.experience() != null) profile.setExperience(dto.experience());

        if (dto.specialization() != null) vet.setSpecialization(dto.specialization().trim());
        if (dto.bio() != null) vet.setBio(dto.bio().trim());
        if (dto.address() != null) vet.setAddress(dto.address().trim());
        if (dto.phone() != null) vet.setPhone(dto.phone().trim());

        veterinarianProfileRepository.save(profile);
        userRepository.save(vet);

        return mapToSelfProfileDTO(vet, profile);
    }

    @Transactional
    public VerificationDocumentDTO uploadDocument(String vetEmail, String documentType, String documentBase64) {
        if (documentType == null || documentType.isBlank()) {
            throw new IllegalArgumentException("Document type is required (e.g. LICENSE, DEGREE, ID_PROOF)");
        }
        if (documentBase64 == null || documentBase64.isBlank()) {
            throw new IllegalArgumentException("Document base64 content is required");
        }

        User vet = getVetByEmail(vetEmail);
        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId())
                .orElseGet(() -> {
                    VeterinarianProfile newProfile = new VeterinarianProfile();
                    newProfile.setUser(vet);
                    return veterinarianProfileRepository.save(newProfile);
                });

        VerificationDocument doc = new VerificationDocument();
        doc.setVeterinarianProfile(profile);
        doc.setDocumentType(documentType.trim().toUpperCase());
        doc.setDocumentBase64(documentBase64);
        doc.setStatus(VerificationStatus.PENDING);
        doc.setUploadedAt(LocalDateTime.now());

        VerificationDocument saved = verificationDocumentRepository.save(doc);
        return mapToDocumentDTO(saved);
    }

    @Transactional
    public void deleteDocument(Long documentId, String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        VerificationDocument doc = verificationDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        if (!doc.getVeterinarianProfile().getUser().getId().equals(vet.getId())) {
            throw new AccessDeniedException("Unauthorized to delete this document");
        }

        if (doc.getStatus() == VerificationStatus.APPROVED) {
            throw new IllegalStateException("Approved documents cannot be deleted");
        }

        verificationDocumentRepository.delete(doc);
    }

    @Transactional
    public VeterinarianSelfProfileDTO submitForVerification(String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId())
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian profile does not exist yet. Please complete profile details first."));

        if (profile.getRegistrationNumber() == null || profile.getRegistrationNumber().isBlank()) {
            throw new IllegalArgumentException("Medical registration number is required for verification.");
        }
        if (profile.getQualification() == null || profile.getQualification().isBlank()) {
            throw new IllegalArgumentException("Medical qualification is required for verification.");
        }

        List<VerificationDocument> docs = verificationDocumentRepository.findByVeterinarianProfileId(profile.getId());
        if (docs.isEmpty()) {
            throw new IllegalArgumentException("At least one verification document (License / Degree) must be uploaded before submitting.");
        }

        VerificationStatus prevStatus = vet.getVerificationStatus();
        vet.setVerificationStatus(VerificationStatus.PENDING);
        profile.setSubmittedAt(LocalDateTime.now());

        veterinarianProfileRepository.save(profile);
        userRepository.save(vet);

        VerificationHistory history = new VerificationHistory(
                profile,
                "SUBMITTED",
                prevStatus,
                VerificationStatus.PENDING,
                "Submitted by veterinarian for credential verification",
                null
        );
        verificationHistoryRepository.save(history);

        // Notify Admins
        List<User> admins = userRepository.findByRole("Admin");
        for (User admin : admins) {
            notificationService.createNotification(
                    admin,
                    "New Veterinarian Verification Request",
                    "Dr. " + vet.getName() + " has submitted their profile and credentials for verification.",
                    "VERIFICATION",
                    null,
                    profile.getId()
            );
        }

        notificationService.createNotification(
                vet,
                "Verification Submitted",
                "Your credentials have been submitted for review. Our team will verify your medical license.",
                "VERIFICATION"
        );

        return mapToSelfProfileDTO(vet, profile);
    }

    @Transactional
    public VeterinarianSelfProfileDTO updateSchedule(String vetEmail, VetScheduleUpdateDTO dto) {
        User vet = getVetByEmail(vetEmail);
        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId())
                .orElseGet(() -> {
                    VeterinarianProfile newProfile = new VeterinarianProfile();
                    newProfile.setUser(vet);
                    return veterinarianProfileRepository.save(newProfile);
                });

        if (dto.workingDays() != null && !dto.workingDays().isEmpty()) {
            profile.setWorkingDays(String.join(",", dto.workingDays()));
        }
        if (dto.workStartTime() != null && !dto.workStartTime().isBlank()) {
            profile.setWorkStartTime(dto.workStartTime().trim());
        }
        if (dto.workEndTime() != null && !dto.workEndTime().isBlank()) {
            profile.setWorkEndTime(dto.workEndTime().trim());
        }

        VeterinarianProfile saved = veterinarianProfileRepository.save(profile);
        return mapToSelfProfileDTO(vet, saved);
    }

    private User getVetByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        if (!"Veterinarian".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Unauthorized: User is not a veterinarian.");
        }
        return user;
    }

    private VeterinarianSelfProfileDTO mapToSelfProfileDTO(User vet, VeterinarianProfile profile) {
        List<VerificationDocumentDTO> docs = verificationDocumentRepository.findByVeterinarianProfileId(profile.getId())
                .stream()
                .map(this::mapToDocumentDTO)
                .collect(Collectors.toList());

        List<VerificationHistoryDTO> history = verificationHistoryRepository.findByVeterinarianProfileIdOrderByCreatedAtDesc(profile.getId())
                .stream()
                .map(this::mapToHistoryDTO)
                .collect(Collectors.toList());

        return new VeterinarianSelfProfileDTO(
                vet.getId(),
                vet.getName(),
                vet.getEmail(),
                vet.getPhone(),
                vet.getSpecialization(),
                vet.getBio(),
                vet.getAddress(),
                vet.getVerificationStatus(),
                profile.getId(),
                profile.getQualification(),
                profile.getRegistrationNumber(),
                profile.getExperience(),
                profile.getSubmittedAt(),
                profile.getVerifiedAt(),
                docs,
                history,
                profile.getWorkingDays(),
                profile.getWorkStartTime(),
                profile.getWorkEndTime()
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

    private VerificationHistoryDTO mapToHistoryDTO(VerificationHistory h) {
        return new VerificationHistoryDTO(
                h.getId(),
                h.getAction(),
                h.getPreviousStatus(),
                h.getNewStatus(),
                h.getReason(),
                h.getAdmin() != null ? h.getAdmin().getEmail() : null,
                h.getCreatedAt()
        );
    }
}
