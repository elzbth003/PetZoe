package com.petzoe.api.service;

import com.petzoe.api.dto.ShelterProfileRequestDTO;
import com.petzoe.api.dto.ShelterResponseDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.ShelterDocumentRepository;
import com.petzoe.api.repository.ShelterRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationRequestRepository;
import com.petzoe.api.util.ValidationUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Self-service shelter profile management for Shelter Managers: draft the
 * shelter's organization profile, attach supporting documents, and submit
 * it for admin verification. A shelter cannot list animals for adoption
 * until its VerificationStatus reaches APPROVED (enforced by later phases).
 */
@Service
public class ShelterService {

    private static final List<VerificationStatus> EDITABLE_STATUSES = List.of(
            VerificationStatus.NOT_SUBMITTED,
            VerificationStatus.REJECTED,
            VerificationStatus.CHANGES_REQUIRED,
            VerificationStatus.RESUBMISSION_REQUIRED
    );

    private final ShelterRepository shelterRepository;
    private final ShelterDocumentRepository shelterDocumentRepository;
    private final UserRepository userRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final NotificationService notificationService;
    private final AdoptionAuditService adoptionAuditService;

    public ShelterService(ShelterRepository shelterRepository,
                           ShelterDocumentRepository shelterDocumentRepository,
                           UserRepository userRepository,
                           VerificationRequestRepository verificationRequestRepository,
                           NotificationService notificationService,
                           AdoptionAuditService adoptionAuditService) {
        this.shelterRepository = shelterRepository;
        this.shelterDocumentRepository = shelterDocumentRepository;
        this.userRepository = userRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.notificationService = notificationService;
        this.adoptionAuditService = adoptionAuditService;
    }

    public ShelterResponseDTO getMyShelter(String email) {
        User manager = getManager(email);
        Shelter shelter = shelterRepository.findByManagerId(manager.getId()).orElse(null);
        if (shelter == null) {
            return null;
        }
        return toDTO(shelter, manager);
    }

    @Transactional
    public ShelterResponseDTO updateMyShelter(String email, ShelterProfileRequestDTO request) {
        User manager = getManager(email);
        Shelter shelter = shelterRepository.findByManagerId(manager.getId()).orElseGet(() -> {
            Shelter s = new Shelter();
            s.setManager(manager);
            return s;
        });

        if (shelter.getId() != null && !EDITABLE_STATUSES.contains(shelter.getVerificationStatus())) {
            throw new IllegalStateException("Shelter profile cannot be edited while status is "
                    + shelter.getVerificationStatus() + ".");
        }

        if (request.capacity() != null && request.capacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be a positive number.");
        }
        ValidationUtils.requireBase64WithinLimit(request.primaryImageBase64(), "Shelter image");

        shelter.setShelterName(request.shelterName());
        shelter.setDescription(request.description());
        shelter.setOrganizationType(request.organizationType());
        shelter.setRegistrationNumber(request.registrationNumber());
        shelter.setAddressLine(request.addressLine());
        shelter.setCity(request.city());
        shelter.setState(request.state());
        shelter.setPincode(request.pincode());
        shelter.setCapacity(request.capacity());
        shelter.setVeterinaryCareArrangements(request.veterinaryCareArrangements());
        if (request.primaryImageBase64() != null) {
            shelter.setPrimaryImageBase64(request.primaryImageBase64());
        }
        shelter.setUpdatedAt(LocalDateTime.now());

        boolean isNew = shelter.getId() == null;
        Shelter saved = shelterRepository.save(shelter);

        adoptionAuditService.log(manager, isNew ? "SHELTER_PROFILE_CREATED" : "SHELTER_PROFILE_UPDATED",
                "Shelter", saved.getId(), null, saved.getVerificationStatus().name(), null);

        return toDTO(saved, manager);
    }

    @Transactional
    public ShelterResponseDTO addDocument(String email, String documentType, String documentBase64) {
        User manager = getManager(email);
        Shelter shelter = requireShelter(manager);
        assertEditable(shelter);

        if (documentBase64 == null || documentBase64.isBlank()) {
            throw new IllegalArgumentException("Document content is required.");
        }
        ValidationUtils.requireBase64WithinLimit(documentBase64, "Document");

        ShelterDocument doc = new ShelterDocument();
        doc.setShelter(shelter);
        doc.setDocumentType(documentType == null || documentType.isBlank() ? "OTHER" : documentType);
        doc.setDocumentBase64(documentBase64);
        shelterDocumentRepository.save(doc);

        adoptionAuditService.log(manager, "SHELTER_DOCUMENT_UPLOADED", "Shelter", shelter.getId(), null, null,
                "Uploaded document: " + doc.getDocumentType());

        Shelter refreshed = shelterRepository.findById(shelter.getId()).orElseThrow();
        return toDTO(refreshed, manager);
    }

    @Transactional
    public ShelterResponseDTO removeDocument(String email, Long documentId) {
        User manager = getManager(email);
        Shelter shelter = requireShelter(manager);
        assertEditable(shelter);

        ShelterDocument doc = shelterDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!doc.getShelter().getId().equals(shelter.getId())) {
            throw new SecurityException("Unauthorized: This document does not belong to your shelter.");
        }
        shelterDocumentRepository.delete(doc);

        adoptionAuditService.log(manager, "SHELTER_DOCUMENT_REMOVED", "Shelter", shelter.getId(), null, null,
                "Removed document: " + doc.getDocumentType());

        Shelter refreshed = shelterRepository.findById(shelter.getId()).orElseThrow();
        return toDTO(refreshed, manager);
    }

    @Transactional
    public ShelterResponseDTO submitForVerification(String email) {
        User manager = getManager(email);
        Shelter shelter = requireShelter(manager);

        if (shelter.getVerificationStatus() == VerificationStatus.PENDING
                || shelter.getVerificationStatus() == VerificationStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Shelter verification is already pending review.");
        }
        if (shelter.getVerificationStatus() == VerificationStatus.APPROVED) {
            throw new IllegalStateException("Shelter is already verified.");
        }

        List<String> missing = new ArrayList<>();
        if (isBlank(shelter.getShelterName())) missing.add("shelter name");
        if (isBlank(shelter.getDescription())) missing.add("description");
        if (shelter.getOrganizationType() == null) missing.add("organization type");
        if (isBlank(shelter.getRegistrationNumber())) missing.add("registration number");
        if (isBlank(shelter.getAddressLine())) missing.add("address");
        if (isBlank(shelter.getCity())) missing.add("city");
        if (isBlank(shelter.getState())) missing.add("state");
        if (shelter.getCapacity() == null || shelter.getCapacity() <= 0) missing.add("capacity");
        if (shelter.getDocuments().isEmpty()) missing.add("at least one supporting document");

        if (!missing.isEmpty()) {
            throw new IllegalArgumentException("Please complete the following before submitting: " + String.join(", ", missing) + ".");
        }

        VerificationStatus previousStatus = shelter.getVerificationStatus();
        shelter.setVerificationStatus(VerificationStatus.PENDING);
        shelter.setSubmittedAt(LocalDateTime.now());
        shelterRepository.save(shelter);

        manager.setVerificationStatus(VerificationStatus.PENDING);
        userRepository.save(manager);

        upsertVerificationRequest(manager);

        notificationService.createNotification(manager,
                "Shelter Verification Submitted",
                "Your shelter profile for '" + shelter.getShelterName() + "' has been submitted for admin review.",
                "SYSTEM");

        notifyAdmins(manager, shelter);

        adoptionAuditService.log(manager, "SHELTER_SUBMITTED_FOR_VERIFICATION", "Shelter", shelter.getId(),
                previousStatus.name(), VerificationStatus.PENDING.name(), null);

        return toDTO(shelter, manager);
    }

    private void upsertVerificationRequest(User manager) {
        String entityType = manager.getRole();
        Optional<VerificationRequest> existing =
                verificationRequestRepository.findByUserIdAndEntityType(manager.getId(), entityType);

        VerificationRequest verificationRequest = existing.orElseGet(VerificationRequest::new);
        verificationRequest.setUser(manager);
        verificationRequest.setEntityType(entityType);
        verificationRequest.setStatus(VerificationStatus.PENDING);
        verificationRequest.setReviewerNotes(null);
        verificationRequest.setSubmittedAt(LocalDateTime.now());
        verificationRequest.setReviewedAt(null);
        verificationRequest.setReviewedBy(null);
        verificationRequestRepository.save(verificationRequest);
    }

    private void notifyAdmins(User applicant, Shelter shelter) {
        List<User> admins = userRepository.findByRole("Admin");
        for (User admin : admins) {
            notificationService.createNotification(admin,
                    "New Shelter Verification Request",
                    shelter.getShelterName() + " (" + applicant.getName() + ", " + applicant.getEmail()
                            + ") has submitted a shelter profile for verification.",
                    "SYSTEM",
                    null,
                    shelter.getId());
        }
    }

    private void assertEditable(Shelter shelter) {
        if (!EDITABLE_STATUSES.contains(shelter.getVerificationStatus())) {
            throw new IllegalStateException("Shelter profile cannot be edited while status is "
                    + shelter.getVerificationStatus() + ".");
        }
    }

    private Shelter requireShelter(User manager) {
        return shelterRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new IllegalStateException("Please create your shelter profile first."));
    }

    private User getManager(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private ShelterResponseDTO toDTO(Shelter shelter, User manager) {
        String rejectionReason = null;
        if (shelter.getVerificationStatus() == VerificationStatus.REJECTED
                || shelter.getVerificationStatus() == VerificationStatus.CHANGES_REQUIRED) {
            rejectionReason = verificationRequestRepository
                    .findByUserIdAndEntityType(manager.getId(), manager.getRole())
                    .map(VerificationRequest::getReviewerNotes)
                    .orElse(null);
        }
        return new ShelterResponseDTO(shelter, rejectionReason);
    }
}
