package com.petzoe.api.service;

import com.petzoe.api.dto.AdoptionListingDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.AdoptionListingRepository;
import com.petzoe.api.repository.AnimalRepository;
import com.petzoe.api.repository.MedicalDocumentRepository;
import com.petzoe.api.repository.MedicalRecordRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VaccinationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin review of shelter-submitted adoption listings (spec section 10).
 * Admin verifies platform/compliance requirements (shelter verified, info
 * complete, documents present) but never edits the veterinarian's
 * professional findings — only approve/reject/request-changes on the listing.
 */
@Service
public class AdminAdoptionListingService {

    private final AdoptionListingRepository adoptionListingRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final AnimalResponseAssembler animalResponseAssembler;
    private final AdoptionAuditService adoptionAuditService;
    private final NotificationService notificationService;

    public AdminAdoptionListingService(AdoptionListingRepository adoptionListingRepository,
                                        AnimalRepository animalRepository,
                                        UserRepository userRepository,
                                        MedicalRecordRepository medicalRecordRepository,
                                        VaccinationRepository vaccinationRepository,
                                        MedicalDocumentRepository medicalDocumentRepository,
                                        AnimalResponseAssembler animalResponseAssembler,
                                        AdoptionAuditService adoptionAuditService,
                                        NotificationService notificationService) {
        this.adoptionListingRepository = adoptionListingRepository;
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.animalResponseAssembler = animalResponseAssembler;
        this.adoptionAuditService = adoptionAuditService;
        this.notificationService = notificationService;
    }

    public List<AdoptionListingDTO> getListings(VerificationStatus status) {
        List<AdoptionListing> listings = status != null
                ? adoptionListingRepository.findByStatus(status)
                : adoptionListingRepository.findAll();
        return listings.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AdoptionListingDTO getListingDetail(Long id) {
        return toDTO(getListingOrThrow(id));
    }

    @Transactional
    public AdoptionListingDTO approve(Long id, String adminEmail) {
        AdoptionListing listing = getListingOrThrow(id);
        User admin = getAdmin(adminEmail);
        Animal animal = listing.getAnimal();

        if (listing.getStatus() != VerificationStatus.PENDING && listing.getStatus() != VerificationStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Only a pending listing can be approved.");
        }

        listing.setStatus(VerificationStatus.APPROVED);
        listing.setReviewedAt(LocalDateTime.now());
        listing.setReviewedBy(admin);
        listing.setReviewerNotes(null);
        adoptionListingRepository.save(listing);

        AnimalStatus previous = animal.getStatus();
        animal.setStatus(AnimalStatus.READY_FOR_ADOPTION);
        animal.setUpdatedAt(LocalDateTime.now());
        animalRepository.save(animal);

        adoptionAuditService.log(admin, "ADOPTION_LISTING_APPROVED", "Animal", animal.getId(),
                previous.name(), AnimalStatus.READY_FOR_ADOPTION.name(), null);

        notificationService.createNotification(animal.getShelter().getManager(),
                "Adoption Listing Approved",
                displayName(animal) + " is now live on the public adoption listing.",
                "SYSTEM", null, animal.getId());

        return toDTO(listing);
    }

    @Transactional
    public AdoptionListingDTO reject(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A rejection reason is required.");
        }
        AdoptionListing listing = getListingOrThrow(id);
        User admin = getAdmin(adminEmail);
        Animal animal = listing.getAnimal();

        listing.setStatus(VerificationStatus.REJECTED);
        listing.setReviewedAt(LocalDateTime.now());
        listing.setReviewedBy(admin);
        listing.setReviewerNotes(reason);
        adoptionListingRepository.save(listing);

        AnimalStatus previous = animal.getStatus();
        animal.setStatus(AnimalStatus.ON_HOLD);
        animal.setUpdatedAt(LocalDateTime.now());
        animalRepository.save(animal);

        adoptionAuditService.log(admin, "ADOPTION_LISTING_REJECTED", "Animal", animal.getId(),
                previous.name(), AnimalStatus.ON_HOLD.name(), reason);

        notificationService.createNotification(animal.getShelter().getManager(),
                "Adoption Listing Rejected",
                displayName(animal) + "'s adoption listing was rejected.",
                "SYSTEM", reason, animal.getId());

        return toDTO(listing);
    }

    @Transactional
    public AdoptionListingDTO requestChanges(Long id, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Please describe what changes are required.");
        }
        AdoptionListing listing = getListingOrThrow(id);
        User admin = getAdmin(adminEmail);
        Animal animal = listing.getAnimal();

        listing.setStatus(VerificationStatus.CHANGES_REQUIRED);
        listing.setReviewedAt(LocalDateTime.now());
        listing.setReviewedBy(admin);
        listing.setReviewerNotes(reason);
        adoptionListingRepository.save(listing);

        AnimalStatus previous = animal.getStatus();
        animal.setStatus(AnimalStatus.AWAITING_DOCUMENTS);
        animal.setUpdatedAt(LocalDateTime.now());
        animalRepository.save(animal);

        adoptionAuditService.log(admin, "ADOPTION_LISTING_CHANGES_REQUESTED", "Animal", animal.getId(),
                previous.name(), AnimalStatus.AWAITING_DOCUMENTS.name(), reason);

        notificationService.createNotification(animal.getShelter().getManager(),
                "Changes Required for Adoption Listing",
                "Please update " + displayName(animal) + "'s listing and resubmit.",
                "SYSTEM", reason, animal.getId());

        return toDTO(listing);
    }

    private AdoptionListingDTO toDTO(AdoptionListing listing) {
        Animal animal = listing.getAnimal();
        var medicalRecords = medicalRecordRepository.findByAnimalIdOrderByExaminationDateDesc(animal.getId())
                .stream().map(com.petzoe.api.dto.MedicalRecordDTO::new).collect(Collectors.toList());
        var vaccinations = vaccinationRepository.findByAnimalIdOrderByDateAdministeredDesc(animal.getId())
                .stream().map(com.petzoe.api.dto.VaccinationDTO::new).collect(Collectors.toList());
        var medicalDocuments = medicalDocumentRepository.findByAnimalIdOrderByUploadedAtDesc(animal.getId())
                .stream().map(com.petzoe.api.dto.MedicalDocumentDTO::new).collect(Collectors.toList());
        List<String> missing = animalResponseAssembler.computeMissingRequirements(
                animal, medicalRecords, vaccinations, medicalDocuments, listing);
        return new AdoptionListingDTO(listing, missing);
    }

    private String displayName(Animal animal) {
        return (animal.getName() != null ? animal.getName() : "Unnamed") + " (" + animal.getAnimalCode() + ")";
    }

    private AdoptionListing getListingOrThrow(Long id) {
        return adoptionListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adoption listing not found"));
    }

    private User getAdmin(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
}
