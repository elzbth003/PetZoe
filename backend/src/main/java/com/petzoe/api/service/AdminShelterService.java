package com.petzoe.api.service;

import com.petzoe.api.dto.ShelterResponseDTO;
import com.petzoe.api.dto.ShelterSummaryDTO;
import com.petzoe.api.entity.Shelter;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationRequest;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.ShelterRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminShelterService {

    private final ShelterRepository shelterRepository;
    private final UserRepository userRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final NotificationService notificationService;
    private final AdoptionAuditService adoptionAuditService;

    public AdminShelterService(ShelterRepository shelterRepository,
                                UserRepository userRepository,
                                VerificationRequestRepository verificationRequestRepository,
                                NotificationService notificationService,
                                AdoptionAuditService adoptionAuditService) {
        this.shelterRepository = shelterRepository;
        this.userRepository = userRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.notificationService = notificationService;
        this.adoptionAuditService = adoptionAuditService;
    }

    public List<ShelterSummaryDTO> getShelters(VerificationStatus status) {
        List<Shelter> shelters = status != null
                ? shelterRepository.findByVerificationStatus(status)
                : shelterRepository.findAll();
        return shelters.stream().map(ShelterSummaryDTO::new).collect(Collectors.toList());
    }

    private Shelter findShelter(Long id) {
        return shelterRepository.findById(id)
                .or(() -> shelterRepository.findByManagerId(id))
                .orElseThrow(() -> new RuntimeException("Shelter not found"));
    }

    public ShelterResponseDTO getShelterDetail(Long id) {
        Shelter shelter = findShelter(id);
        String rejectionReason = shelter.getVerificationStatus() == VerificationStatus.REJECTED
                || shelter.getVerificationStatus() == VerificationStatus.CHANGES_REQUIRED
                || shelter.getVerificationStatus() == VerificationStatus.SUSPENDED
                ? findVerificationRequest(shelter.getManager()).map(VerificationRequest::getReviewerNotes).orElse(null)
                : null;
        return new ShelterResponseDTO(shelter, rejectionReason);
    }

    @Transactional
    public ShelterResponseDTO approve(Long id, String adminEmail) {
        Shelter shelter = findShelter(id);
        User admin = getAdmin(adminEmail);

        VerificationStatus previous = shelter.getVerificationStatus();
        shelter.setVerificationStatus(VerificationStatus.APPROVED);
        shelterRepository.save(shelter);

        User manager = shelter.getManager();
        manager.setVerificationStatus(VerificationStatus.APPROVED);
        userRepository.save(manager);

        updateVerificationRequest(manager, VerificationStatus.APPROVED, admin, null);

        notificationService.createNotification(manager,
                "Shelter Verified",
                "Congratulations! Your shelter '" + shelter.getShelterName() + "' has been verified. "
                        + "You can now begin recording animal intakes.",
                "ACCOUNT_APPROVED");

        adoptionAuditService.log(admin, "SHELTER_APPROVED", "Shelter", shelter.getId(),
                previous.name(), VerificationStatus.APPROVED.name(), null);

        return new ShelterResponseDTO(shelter, null);
    }

    @Transactional
    public ShelterResponseDTO reject(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A rejection reason is required.");
        }
        Shelter shelter = findShelter(id);
        User admin = getAdmin(adminEmail);

        VerificationStatus previous = shelter.getVerificationStatus();
        shelter.setVerificationStatus(VerificationStatus.REJECTED);
        shelterRepository.save(shelter);

        User manager = shelter.getManager();
        manager.setVerificationStatus(VerificationStatus.REJECTED);
        userRepository.save(manager);

        updateVerificationRequest(manager, VerificationStatus.REJECTED, admin, reason);

        notificationService.createNotification(manager,
                "Shelter Verification Rejected",
                "Your shelter '" + shelter.getShelterName() + "' verification was rejected.",
                "ACCOUNT_REJECTED",
                reason,
                shelter.getId());

        adoptionAuditService.log(admin, "SHELTER_REJECTED", "Shelter", shelter.getId(),
                previous.name(), VerificationStatus.REJECTED.name(), reason);

        return new ShelterResponseDTO(shelter, reason);
    }

    @Transactional
    public ShelterResponseDTO requestChanges(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Please describe what changes are required.");
        }
        Shelter shelter = findShelter(id);
        User admin = getAdmin(adminEmail);

        VerificationStatus previous = shelter.getVerificationStatus();
        shelter.setVerificationStatus(VerificationStatus.CHANGES_REQUIRED);
        shelterRepository.save(shelter);

        User manager = shelter.getManager();
        manager.setVerificationStatus(VerificationStatus.CHANGES_REQUIRED);
        userRepository.save(manager);

        updateVerificationRequest(manager, VerificationStatus.CHANGES_REQUIRED, admin, reason);

        notificationService.createNotification(manager,
                "Changes Required for Shelter Verification",
                "Please update your shelter '" + shelter.getShelterName() + "' profile and resubmit.",
                "ACCOUNT_REJECTED",
                reason,
                shelter.getId());

        adoptionAuditService.log(admin, "SHELTER_CHANGES_REQUIRED", "Shelter", shelter.getId(),
                previous.name(), VerificationStatus.CHANGES_REQUIRED.name(), reason);

        return new ShelterResponseDTO(shelter, reason);
    }

    @Transactional
    public ShelterResponseDTO suspend(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A suspension reason is required.");
        }
        Shelter shelter = findShelter(id);
        User admin = getAdmin(adminEmail);

        VerificationStatus previous = shelter.getVerificationStatus();
        shelter.setVerificationStatus(VerificationStatus.SUSPENDED);
        shelterRepository.save(shelter);

        User manager = shelter.getManager();
        manager.setVerificationStatus(VerificationStatus.SUSPENDED);
        userRepository.save(manager);

        updateVerificationRequest(manager, VerificationStatus.SUSPENDED, admin, reason);

        notificationService.createNotification(manager,
                "Shelter Verification Suspended",
                "Your shelter '" + shelter.getShelterName() + "' verification has been suspended.",
                "ACCOUNT_REJECTED",
                reason,
                shelter.getId());

        adoptionAuditService.log(admin, "SHELTER_SUSPENDED", "Shelter", shelter.getId(),
                previous.name(), VerificationStatus.SUSPENDED.name(), reason);

        return new ShelterResponseDTO(shelter, reason);
    }

    private void updateVerificationRequest(User manager, VerificationStatus status, User admin, String reason) {
        VerificationRequest vr = findVerificationRequest(manager).orElseGet(() -> {
            VerificationRequest newVr = new VerificationRequest();
            newVr.setUser(manager);
            newVr.setEntityType(manager.getRole() != null ? manager.getRole() : "Shelter Manager");
            newVr.setSubmittedAt(LocalDateTime.now());
            return newVr;
        });
        vr.setStatus(status);
        vr.setReviewerNotes(reason);
        vr.setReviewedAt(LocalDateTime.now());
        vr.setReviewedBy(admin);
        verificationRequestRepository.save(vr);
    }

    private Optional<VerificationRequest> findVerificationRequest(User manager) {
        Optional<VerificationRequest> direct = verificationRequestRepository.findByUserIdAndEntityType(manager.getId(), manager.getRole());
        if (direct.isPresent()) {
            return direct;
        }
        return verificationRequestRepository.findByUserId(manager.getId());
    }

    private User getAdmin(String email) {
        if (email != null && !email.isBlank()) {
            Optional<User> u = userRepository.findByEmail(email);
            if (u.isPresent()) return u.get();
        }
        return userRepository.findAll().stream()
                .filter(u -> "Admin".equalsIgnoreCase(u.getRole()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
}
