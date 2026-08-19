package com.petzoe.api.service;

import com.petzoe.api.dto.AdoptionApplicationDTO;
import com.petzoe.api.dto.AdoptionApplicationRequestDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.AdopterProfileRepository;
import com.petzoe.api.repository.AdoptionApplicationRepository;
import com.petzoe.api.repository.AnimalRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Adoption application submission for Pet Owners (spec section 13). Phase 7
 * covers draft/submit/withdraw only — the shelter decision workflow (screening,
 * house check, approval) is built in later phases on top of this record.
 */
@Service
public class AdoptionApplicationService {

    private static final Set<AdoptionApplicationStatus> EDITABLE_STATUSES = EnumSet.of(
            AdoptionApplicationStatus.DRAFT, AdoptionApplicationStatus.ADDITIONAL_INFORMATION_REQUIRED);

    private static final Set<AdoptionApplicationStatus> WITHDRAWABLE_STATUSES = EnumSet.of(
            AdoptionApplicationStatus.DRAFT, AdoptionApplicationStatus.SUBMITTED, AdoptionApplicationStatus.UNDER_REVIEW,
            AdoptionApplicationStatus.ADDITIONAL_INFORMATION_REQUIRED, AdoptionApplicationStatus.HOUSE_CHECK_PENDING,
            AdoptionApplicationStatus.HOUSE_CHECK_COMPLETED, AdoptionApplicationStatus.SHELTER_REVIEW);

    private final AdoptionApplicationRepository adoptionApplicationRepository;
    private final AdopterProfileRepository adopterProfileRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final AdoptionAuditService adoptionAuditService;
    private final NotificationService notificationService;

    public AdoptionApplicationService(AdoptionApplicationRepository adoptionApplicationRepository,
                                       AdopterProfileRepository adopterProfileRepository,
                                       AnimalRepository animalRepository,
                                       UserRepository userRepository,
                                       AdoptionAuditService adoptionAuditService,
                                       NotificationService notificationService) {
        this.adoptionApplicationRepository = adoptionApplicationRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
        this.adoptionAuditService = adoptionAuditService;
        this.notificationService = notificationService;
    }

    public List<AdoptionApplicationDTO> getMyApplications(String email) {
        User adopter = getUser(email);
        return adoptionApplicationRepository.findByAdopterIdOrderByCreatedAtDesc(adopter.getId())
                .stream().map(a -> new AdoptionApplicationDTO(a, false)).collect(Collectors.toList());
    }

    public AdoptionApplicationDTO getMyApplication(String email, Long animalId) {
        User adopter = getUser(email);
        AdoptionApplication app = adoptionApplicationRepository.findByAnimalIdAndAdopterId(animalId, adopter.getId())
                .orElseThrow(() -> new RuntimeException("No application found for this animal"));
        return new AdoptionApplicationDTO(app, true);
    }

    @Transactional
    public AdoptionApplicationDTO saveDraft(String email, Long animalId, AdoptionApplicationRequestDTO request) {
        User adopter = getUser(email);
        Animal animal = getAdoptableAnimal(animalId);
        AdopterProfile profile = getProfileOrThrow(adopter);

        AdoptionApplication app = adoptionApplicationRepository.findByAnimalIdAndAdopterId(animalId, adopter.getId())
                .orElseGet(() -> {
                    AdoptionApplication a = new AdoptionApplication();
                    a.setAnimal(animal);
                    a.setAdopter(adopter);
                    return a;
                });

        if (app.getId() != null && !EDITABLE_STATUSES.contains(app.getStatus())) {
            throw new IllegalStateException("This application cannot be edited while status is " + app.getStatus() + ".");
        }

        app.setAdopterProfile(profile);
        app.setReasonForAdoption(blankToNull(request.reasonForAdoption()));
        app.setPetCarePlan(blankToNull(request.petCarePlan()));
        app.setVeterinaryCarePlanNotes(blankToNull(request.veterinaryCarePlanNotes()));
        if (app.getStatus() == null) {
            app.setStatus(AdoptionApplicationStatus.DRAFT);
        }
        app.setUpdatedAt(LocalDateTime.now());
        adoptionApplicationRepository.save(app);

        return new AdoptionApplicationDTO(app, true);
    }

    @Transactional
    public AdoptionApplicationDTO submit(String email, Long animalId) {
        User adopter = getUser(email);
        AdoptionApplication app = adoptionApplicationRepository.findByAnimalIdAndAdopterId(animalId, adopter.getId())
                .orElseThrow(() -> new IllegalStateException("Please complete the application before submitting."));

        if (!EDITABLE_STATUSES.contains(app.getStatus())) {
            throw new IllegalStateException("This application cannot be submitted while status is " + app.getStatus() + ".");
        }

        Animal animal = getAdoptableAnimal(animalId);

        AdopterProfile profile = app.getAdopterProfile();
        if (profile.getAddress() == null || profile.getAddress().isBlank()
                || profile.getHousingType() == null || profile.getLivingArrangement() == null
                || !Boolean.TRUE.equals(profile.getCanProvideFoodAndHousing())) {
            throw new IllegalArgumentException("Please complete your adopter profile (address, housing type, living "
                    + "arrangement, and confirm you can provide food and housing) before submitting.");
        }
        if (app.getReasonForAdoption() == null || app.getReasonForAdoption().isBlank()) {
            throw new IllegalArgumentException("Please provide a reason for adoption before submitting.");
        }

        AdoptionApplicationStatus previous = app.getStatus();
        app.setStatus(AdoptionApplicationStatus.SUBMITTED);
        app.setSubmittedAt(LocalDateTime.now());
        adoptionApplicationRepository.save(app);

        adoptionAuditService.log(adopter, "ADOPTION_APPLICATION_SUBMITTED", "AdoptionApplication", app.getId(),
                previous.name(), AdoptionApplicationStatus.SUBMITTED.name(), null);

        notificationService.createNotification(animal.getShelter().getManager(),
                "New Adoption Application",
                adopter.getName() + " applied to adopt " + displayName(animal) + ".",
                "SYSTEM", null, app.getId());

        return new AdoptionApplicationDTO(app, true);
    }

    @Transactional
    public AdoptionApplicationDTO withdraw(String email, Long animalId) {
        User adopter = getUser(email);
        AdoptionApplication app = adoptionApplicationRepository.findByAnimalIdAndAdopterId(animalId, adopter.getId())
                .orElseThrow(() -> new RuntimeException("No application found for this animal"));

        if (!WITHDRAWABLE_STATUSES.contains(app.getStatus())) {
            throw new IllegalStateException("This application cannot be withdrawn while status is " + app.getStatus() + ".");
        }

        AdoptionApplicationStatus previous = app.getStatus();
        app.setStatus(AdoptionApplicationStatus.WITHDRAWN);
        app.setUpdatedAt(LocalDateTime.now());
        adoptionApplicationRepository.save(app);

        adoptionAuditService.log(adopter, "ADOPTION_APPLICATION_WITHDRAWN", "AdoptionApplication", app.getId(),
                previous.name(), AdoptionApplicationStatus.WITHDRAWN.name(), null);

        if (previous != AdoptionApplicationStatus.DRAFT) {
            notificationService.createNotification(app.getAnimal().getShelter().getManager(),
                    "Adoption Application Withdrawn",
                    adopter.getName() + " withdrew their application for " + displayName(app.getAnimal()) + ".",
                    "SYSTEM", null, app.getId());
        }

        return new AdoptionApplicationDTO(app, true);
    }

    // ── Shelter-side read access (Phase 7: view only; decisions come in a later phase) ──

    public List<AdoptionApplicationDTO> getApplicationsForMyShelter(String email) {
        User manager = getUser(email);
        return adoptionApplicationRepository.findByAnimal_Shelter_ManagerIdOrderByCreatedAtDesc(manager.getId())
                .stream().map(a -> new AdoptionApplicationDTO(a, true)).collect(Collectors.toList());
    }

    public AdoptionApplicationDTO getShelterApplicationDetail(String email, Long applicationId) {
        User manager = getUser(email);
        AdoptionApplication app = adoptionApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!app.getAnimal().getShelter().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("Unauthorized: This application does not belong to your shelter.");
        }
        return new AdoptionApplicationDTO(app, true);
    }

    private Animal getAdoptableAnimal(Long animalId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal not found"));
        if (animal.getStatus() != AnimalStatus.READY_FOR_ADOPTION
                || animal.getShelter().getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new IllegalStateException("This animal is not currently available for adoption.");
        }
        return animal;
    }

    private AdopterProfile getProfileOrThrow(User adopter) {
        return adopterProfileRepository.findByUserId(adopter.getId())
                .orElseThrow(() -> new IllegalStateException("Please complete your adopter profile first."));
    }

    private String displayName(Animal animal) {
        return (animal.getName() != null ? animal.getName() : "Unnamed") + " (" + animal.getAnimalCode() + ")";
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
