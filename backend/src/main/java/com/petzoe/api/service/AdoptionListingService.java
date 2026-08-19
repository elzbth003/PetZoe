package com.petzoe.api.service;

import com.petzoe.api.dto.AdoptionListingRequestDTO;
import com.petzoe.api.dto.AnimalResponseDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.AdoptionListingRepository;
import com.petzoe.api.repository.AnimalRepository;
import com.petzoe.api.repository.MedicalRecordRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Shelter side of adoption-listing submission (spec section 9-10): a shelter
 * drafts adopter-facing listing content for a ready animal, then submits it
 * for admin review. Nothing here can publish an animal publicly by itself —
 * that only happens once an admin approves (see AdminAdoptionListingService).
 */
@Service
public class AdoptionListingService {

    private static final Set<AnimalStatus> EDITABLE_ANIMAL_STATUSES = EnumSet.of(
            AnimalStatus.IN_SHELTER_CARE, AnimalStatus.AWAITING_DOCUMENTS, AnimalStatus.ON_HOLD,
            AnimalStatus.MEDICAL_REVIEW, AnimalStatus.UNDER_MEDICAL_CARE);

    /** A vet has actively flagged the animal as needing care/review — it cannot
     * be submitted for adoption while a vet's own status flag is still active,
     * even though the listing content itself can still be drafted. */
    private static final Set<AnimalStatus> SUBMISSION_BLOCKED_STATUSES = EnumSet.of(
            AnimalStatus.UNDER_MEDICAL_CARE, AnimalStatus.MEDICAL_REVIEW);

    private final AdoptionListingRepository adoptionListingRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final AnimalService animalService;
    private final AnimalResponseAssembler animalResponseAssembler;
    private final AdoptionAuditService adoptionAuditService;
    private final NotificationService notificationService;
    private final MedicalRecordRepository medicalRecordRepository;

    public AdoptionListingService(AdoptionListingRepository adoptionListingRepository,
                                   AnimalRepository animalRepository,
                                   UserRepository userRepository,
                                   AnimalService animalService,
                                   AnimalResponseAssembler animalResponseAssembler,
                                   AdoptionAuditService adoptionAuditService,
                                   NotificationService notificationService,
                                   MedicalRecordRepository medicalRecordRepository) {
        this.adoptionListingRepository = adoptionListingRepository;
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
        this.animalService = animalService;
        this.animalResponseAssembler = animalResponseAssembler;
        this.adoptionAuditService = adoptionAuditService;
        this.notificationService = notificationService;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional
    public AnimalResponseDTO updateListing(String email, Long animalId, AdoptionListingRequestDTO request) {
        User manager = getManager(email);
        Animal animal = animalService.getOwnedAnimal(manager, animalId);

        if (!EDITABLE_ANIMAL_STATUSES.contains(animal.getStatus())) {
            throw new IllegalStateException("Listing cannot be edited while animal status is " + animal.getStatus() + ".");
        }

        AdoptionListing listing = adoptionListingRepository.findByAnimalId(animal.getId()).orElseGet(() -> {
            AdoptionListing l = new AdoptionListing();
            l.setAnimal(animal);
            return l;
        });

        if (listing.getId() != null && listing.getStatus() != VerificationStatus.NOT_SUBMITTED
                && listing.getStatus() != VerificationStatus.REJECTED
                && listing.getStatus() != VerificationStatus.CHANGES_REQUIRED) {
            throw new IllegalStateException("Listing cannot be edited while status is " + listing.getStatus() + ".");
        }

        if (request.adoptionFee() != null && request.adoptionFee() < 0) {
            throw new IllegalArgumentException("Adoption fee cannot be negative.");
        }

        if (request.size() != null) {
            listing.setSize(request.size());
        }
        listing.setPersonality(blankToNull(request.personality()));
        listing.setSpecialCareRequirements(blankToNull(request.specialCareRequirements()));
        listing.setAdoptionFee(request.adoptionFee());
        listing.setListingDescription(blankToNull(request.listingDescription()));
        listing.setUpdatedAt(LocalDateTime.now());
        adoptionListingRepository.save(listing);

        adoptionAuditService.log(manager, "ADOPTION_LISTING_UPDATED", "Animal", animal.getId(), null, null, null);

        return animalResponseAssembler.assemble(animal);
    }

    @Transactional
    public AnimalResponseDTO submitForAdoptionReview(String email, Long animalId) {
        User manager = getManager(email);
        Animal animal = animalService.getOwnedAnimal(manager, animalId);

        if (animal.getStatus() == AnimalStatus.ADOPTION_REVIEW) {
            throw new IllegalStateException("This animal's listing is already under admin review.");
        }
        if (!EDITABLE_ANIMAL_STATUSES.contains(animal.getStatus())) {
            throw new IllegalStateException("Animal must be in shelter care (not on hold, withdrawn, or already listed) to submit for adoption review.");
        }
        if (SUBMISSION_BLOCKED_STATUSES.contains(animal.getStatus())) {
            throw new IllegalStateException("This animal is currently flagged by a veterinarian as " + animal.getStatus()
                    + " and cannot be submitted for adoption until a vet clears it back to shelter care.");
        }

        AdoptionListing listing = adoptionListingRepository.findByAnimalId(animal.getId())
                .orElseThrow(() -> new IllegalStateException("Please complete the adoption listing details first."));

        List<String> missing = new ArrayList<>();
        if (animal.getInitialAssessmentRecordedAt() == null) missing.add("initial shelter assessment");
        if (medicalRecordRepository.findByAnimalIdOrderByExaminationDateDesc(animal.getId()).isEmpty()) {
            missing.add("veterinary assessment (a vet must examine this animal first)");
        }
        if (listing.getPersonality() == null || listing.getPersonality().isBlank()) missing.add("personality description");
        if (listing.getListingDescription() == null || listing.getListingDescription().isBlank()) missing.add("listing description");
        if (!missing.isEmpty()) {
            throw new IllegalArgumentException("Please complete the following before submitting: " + String.join(", ", missing) + ".");
        }

        AnimalStatus previousAnimalStatus = animal.getStatus();
        animal.setStatus(AnimalStatus.ADOPTION_REVIEW);
        animal.setUpdatedAt(LocalDateTime.now());
        animalRepository.save(animal);

        listing.setStatus(VerificationStatus.PENDING);
        listing.setSubmittedAt(LocalDateTime.now());
        listing.setReviewerNotes(null);
        listing.setReviewedAt(null);
        listing.setReviewedBy(null);
        adoptionListingRepository.save(listing);

        adoptionAuditService.log(manager, "ADOPTION_LISTING_SUBMITTED", "Animal", animal.getId(),
                previousAnimalStatus.name(), AnimalStatus.ADOPTION_REVIEW.name(), null);

        notifyAdmins(animal);

        return animalResponseAssembler.assemble(animal);
    }

    private void notifyAdmins(Animal animal) {
        List<User> admins = userRepository.findByRole("Admin");
        for (User admin : admins) {
            notificationService.createNotification(admin,
                    "New Adoption Listing Submitted",
                    (animal.getName() != null ? animal.getName() : "Unnamed") + " (" + animal.getAnimalCode()
                            + ") from " + animal.getShelter().getShelterName() + " is awaiting listing review.",
                    "SYSTEM", null, animal.getId());
        }
    }

    private User getManager(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
