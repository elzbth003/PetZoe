package com.petzoe.api.service;

import com.petzoe.api.dto.CreateRehomeApplicationDTO;
import com.petzoe.api.dto.CreateRehomeListingDTO;
import com.petzoe.api.dto.PetRehomeApplicationDTO;
import com.petzoe.api.dto.PetRehomeListingDTO;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.PetRehomeApplication;
import com.petzoe.api.entity.PetRehomeListing;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.PetRehomeApplicationRepository;
import com.petzoe.api.repository.PetRehomeListingRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PetRehomeService {

    private final PetRehomeListingRepository listingRepository;
    private final PetRehomeApplicationRepository applicationRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PetRehomeService(PetRehomeListingRepository listingRepository,
                            PetRehomeApplicationRepository applicationRepository,
                            PetRepository petRepository,
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.listingRepository = listingRepository;
        this.applicationRepository = applicationRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Transactional
    public PetRehomeListingDTO createListing(CreateRehomeListingDTO dto, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        Pet pet = petRepository.findById(dto.petId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + dto.petId()));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You can only create rehoming listings for pets you currently own.");
        }

        if (listingRepository.existsByPetIdAndStatus(pet.getId(), "ACTIVE")) {
            throw new IllegalArgumentException("This pet already has an active rehoming listing.");
        }

        PetRehomeListing listing = new PetRehomeListing(
                pet,
                owner,
                dto.title(),
                dto.reason(),
                dto.requirements(),
                dto.city()
        );

        PetRehomeListing saved = listingRepository.save(listing);
        return toListingDTO(saved, owner);
    }

    @Transactional(readOnly = true)
    public List<PetRehomeListingDTO> getActiveListings(String species, String query, String currentUserEmail) {
        User currentUser = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        }

        final User userForMapping = currentUser;
        List<PetRehomeListing> listings;

        String sp = (species != null && !species.equalsIgnoreCase("All") && !species.isBlank()) ? species.trim() : null;
        String q = (query != null && !query.isBlank()) ? query.trim() : null;

        if (sp != null || q != null) {
            listings = listingRepository.searchActiveListings(sp, q);
        } else {
            listings = listingRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
        }

        return listings.stream()
                .map(l -> toListingDTO(l, userForMapping))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PetRehomeListingDTO getListingDetails(Long id, String currentUserEmail) {
        PetRehomeListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + id));

        User currentUser = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        }

        return toListingDTO(listing, currentUser);
    }

    @Transactional(readOnly = true)
    public List<PetRehomeListingDTO> getMyListings(String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        return listingRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(l -> toListingDTO(l, owner))
                .collect(Collectors.toList());
    }

    @Transactional
    public PetRehomeListingDTO cancelListing(Long listingId, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        PetRehomeListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + listingId));

        if (!listing.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You can only cancel your own listings.");
        }

        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalStateException("Only active listings can be cancelled.");
        }

        listing.setStatus("CANCELLED");
        listing.setClosedAt(LocalDateTime.now());
        PetRehomeListing updated = listingRepository.save(listing);

        // Cancel any pending applications and notify applicants
        List<PetRehomeApplication> pendingApps = applicationRepository.findByListingIdAndStatus(listing.getId(), "PENDING");
        for (PetRehomeApplication app : pendingApps) {
            app.setStatus("CANCELLED");
            app.setRespondedAt(LocalDateTime.now());
            applicationRepository.save(app);

            notificationService.createNotification(
                    app.getApplicant(),
                    "Rehoming Listing Withdrawn",
                    "The listing for " + listing.getPet().getName() + " (" + listing.getPet().getPetCode() + ") has been withdrawn by the owner.",
                    "SYSTEM"
            );
        }

        return toListingDTO(updated, owner);
    }

    @Transactional
    public PetRehomeApplicationDTO applyForPet(Long listingId, CreateRehomeApplicationDTO dto, String applicantEmail) {
        User applicant = getUserByEmail(applicantEmail);
        PetRehomeListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + listingId));

        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalStateException("This listing is no longer accepting applications.");
        }

        if (listing.getOwner().getId().equals(applicant.getId())) {
            throw new IllegalArgumentException("You cannot apply to adopt your own pet.");
        }

        if (applicationRepository.existsByListingIdAndApplicantIdAndStatus(listingId, applicant.getId(), "PENDING")) {
            throw new IllegalArgumentException("You already have an active pending application for this pet.");
        }

        PetRehomeApplication application = new PetRehomeApplication(
                listing,
                listing.getPet(),
                applicant,
                dto.applicantMessage(),
                dto.livingSituation(),
                dto.experienceNotes(),
                dto.contactPhone()
        );

        PetRehomeApplication saved = applicationRepository.save(application);

        // Send notification to pet owner
        notificationService.createNotification(
                listing.getOwner(),
                "New Rehoming Application Received! 🐾",
                applicant.getName() + " has submitted an adoption application for " + listing.getPet().getName() + " (" + listing.getPet().getPetCode() + ").",
                "SYSTEM"
        );

        return toApplicationDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PetRehomeApplicationDTO> getApplicationsForListing(Long listingId, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        PetRehomeListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + listingId));

        if (!listing.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You can only view applications for your own listings.");
        }

        return applicationRepository.findByListingIdOrderByCreatedAtDesc(listingId)
                .stream()
                .map(this::toApplicationDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PetRehomeApplicationDTO> getMyApplications(String applicantEmail) {
        User applicant = getUserByEmail(applicantEmail);
        return applicationRepository.findByApplicantIdOrderByCreatedAtDesc(applicant.getId())
                .stream()
                .map(this::toApplicationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PetRehomeApplicationDTO cancelApplication(Long applicationId, String applicantEmail) {
        User applicant = getUserByEmail(applicantEmail);
        PetRehomeApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));

        if (!app.getApplicant().getId().equals(applicant.getId())) {
            throw new SecurityException("Unauthorized: You can only cancel your own applications.");
        }

        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalStateException("Only pending applications can be cancelled.");
        }

        app.setStatus("CANCELLED");
        app.setRespondedAt(LocalDateTime.now());
        PetRehomeApplication updated = applicationRepository.save(app);
        return toApplicationDTO(updated);
    }

    @Transactional
    public PetRehomeApplicationDTO rejectApplication(Long applicationId, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        PetRehomeApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));

        if (!app.getListing().getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You can only review applications for your own pets.");
        }

        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalStateException("Application is not in PENDING status.");
        }

        app.setStatus("REJECTED");
        app.setRespondedAt(LocalDateTime.now());
        PetRehomeApplication updated = applicationRepository.save(app);

        // Notify applicant
        notificationService.createNotification(
                app.getApplicant(),
                "Rehoming Application Update",
                "Your adoption application for " + app.getPet().getName() + " (" + app.getPet().getPetCode() + ") was not selected at this time.",
                "SYSTEM"
        );

        return toApplicationDTO(updated);
    }

    /**
     * Atomic Acceptance Transaction:
     * 1. Validates ownership and active status.
     * 2. Marks winning application as ACCEPTED.
     * 3. Automatically rejects all other pending applications for this listing.
     * 4. Marks listing as COMPLETED.
     * 5. Atomically reassigns pet ownership to applicant while preserving permanent petCode and all medical history.
     * 6. Dispatches dual notifications to original owner and new owner, plus notifications to competing applicants.
     */
    @Transactional
    public PetRehomeApplicationDTO acceptApplication(Long applicationId, String ownerEmail) {
        User currentOwner = getUserByEmail(ownerEmail);
        PetRehomeApplication winningApp = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));

        PetRehomeListing listing = winningApp.getListing();

        if (!listing.getOwner().getId().equals(currentOwner.getId())) {
            throw new SecurityException("Unauthorized: Only the current registered pet owner can accept applications.");
        }

        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalStateException("Cannot accept applications for a closed or completed listing.");
        }

        if (!"PENDING".equals(winningApp.getStatus())) {
            throw new IllegalStateException("Application is no longer in PENDING status.");
        }

        Pet pet = listing.getPet();
        if (!pet.getOwner().getId().equals(currentOwner.getId())) {
            throw new IllegalStateException("Pet ownership has changed or is invalid.");
        }

        User newOwner = winningApp.getApplicant();

        // 1. Mark winning application ACCEPTED
        winningApp.setStatus("ACCEPTED");
        winningApp.setRespondedAt(LocalDateTime.now());
        PetRehomeApplication savedWinningApp = applicationRepository.save(winningApp);

        // 2. Reject all other pending applications for this listing
        List<PetRehomeApplication> otherPendingApps = applicationRepository.findByListingIdAndStatus(listing.getId(), "PENDING");
        for (PetRehomeApplication otherApp : otherPendingApps) {
            if (!otherApp.getId().equals(winningApp.getId())) {
                otherApp.setStatus("REJECTED");
                otherApp.setRespondedAt(LocalDateTime.now());
                applicationRepository.save(otherApp);

                notificationService.createNotification(
                        otherApp.getApplicant(),
                        "Pet Rehoming Update",
                        pet.getName() + " (" + pet.getPetCode() + ") has found a loving new home. Thank you for your interest and care!",
                        "SYSTEM"
                );
            }
        }

        // 3. Mark listing COMPLETED
        listing.setStatus("COMPLETED");
        listing.setClosedAt(LocalDateTime.now());
        listingRepository.save(listing);

        // 4. Atomically reassign pet ownership (Preserving permanent petCode and all clinical records intact)
        pet.setOwner(newOwner);
        petRepository.save(pet);

        // 5. Notify original owner
        notificationService.createNotification(
                currentOwner,
                "Pet Successfully Rehomed! 🏡",
                "Ownership of " + pet.getName() + " (" + pet.getPetCode() + ") has been officially transferred to " + newOwner.getName() + " (" + newOwner.getEmail() + "). Thank you for giving them a wonderful journey.",
                "SYSTEM"
        );

        // 6. Notify new owner
        notificationService.createNotification(
                newOwner,
                "Welcome to Your New Family Member! 🐾",
                "Congratulations! Your application to adopt " + pet.getName() + " (" + pet.getPetCode() + ") was accepted. You are now the official registered owner. All medical history and clinical records are available on your dashboard.",
                "PROFILE"
        );

        return toApplicationDTO(savedWinningApp);
    }

    private PetRehomeListingDTO toListingDTO(PetRehomeListing l, User currentUser) {
        long appCount = applicationRepository.countByListingId(l.getId());
        boolean isOwner = currentUser != null && l.getOwner().getId().equals(currentUser.getId());
        boolean hasApplied = currentUser != null && !isOwner &&
                applicationRepository.existsByListingIdAndApplicantIdAndStatus(l.getId(), currentUser.getId(), "PENDING");

        return new PetRehomeListingDTO(
                l.getId(),
                l.getPet().getId(),
                l.getPet().getPetCode(),
                l.getPet().getName(),
                l.getPet().getSpecies(),
                l.getPet().getBreed(),
                l.getPet().getAge(),
                l.getPet().getGender(),
                l.getPet().getPhotoUrl(),
                l.getPet().getVaccinationStatus(),
                l.getOwner().getId(),
                l.getOwner().getName(),
                l.getOwner().getEmail(),
                l.getTitle(),
                l.getReason(),
                l.getRequirements(),
                l.getCity(),
                l.getStatus(),
                l.getCreatedAt(),
                l.getClosedAt(),
                appCount,
                isOwner,
                hasApplied
        );
    }

    private PetRehomeApplicationDTO toApplicationDTO(PetRehomeApplication app) {
        return new PetRehomeApplicationDTO(
                app.getId(),
                app.getListing().getId(),
                app.getListing().getTitle(),
                app.getPet().getId(),
                app.getPet().getPetCode(),
                app.getPet().getName(),
                app.getPet().getPhotoUrl(),
                app.getApplicant().getId(),
                app.getApplicant().getName(),
                app.getApplicant().getEmail(),
                app.getApplicantMessage(),
                app.getLivingSituation(),
                app.getExperienceNotes(),
                app.getContactPhone(),
                app.getStatus(),
                app.getCreatedAt(),
                app.getRespondedAt()
        );
    }
}
