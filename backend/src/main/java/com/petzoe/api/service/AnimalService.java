package com.petzoe.api.service;

import com.petzoe.api.dto.AnimalResponseDTO;
import com.petzoe.api.dto.AnimalSummaryDTO;
import com.petzoe.api.dto.InitialAssessmentRequestDTO;
import com.petzoe.api.dto.AnimalIntakeRequestDTO;
import com.petzoe.api.dto.MedicalDocumentUploadRequestDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.AnimalIntakeRepository;
import com.petzoe.api.repository.AnimalRepository;
import com.petzoe.api.repository.MedicalDocumentRepository;
import com.petzoe.api.repository.ShelterRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Animal intake and identification for verified shelters (Phase 2).
 * Only a shelter with VerificationStatus.APPROVED may record an intake,
 * enforcing "Shelter Verification -> Animal Intake" from the spec workflow.
 */
@Service
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final AnimalIntakeRepository animalIntakeRepository;
    private final ShelterRepository shelterRepository;
    private final UserRepository userRepository;
    private final AdoptionAuditService adoptionAuditService;
    private final AnimalResponseAssembler animalResponseAssembler;
    private final MedicalDocumentRepository medicalDocumentRepository;

    public AnimalService(AnimalRepository animalRepository,
                          AnimalIntakeRepository animalIntakeRepository,
                          ShelterRepository shelterRepository,
                          UserRepository userRepository,
                          AdoptionAuditService adoptionAuditService,
                          AnimalResponseAssembler animalResponseAssembler,
                          MedicalDocumentRepository medicalDocumentRepository) {
        this.animalRepository = animalRepository;
        this.animalIntakeRepository = animalIntakeRepository;
        this.shelterRepository = shelterRepository;
        this.userRepository = userRepository;
        this.adoptionAuditService = adoptionAuditService;
        this.animalResponseAssembler = animalResponseAssembler;
        this.medicalDocumentRepository = medicalDocumentRepository;
    }

    @Transactional
    public AnimalResponseDTO createIntake(String email, AnimalIntakeRequestDTO request) {
        User manager = getManager(email);
        Shelter shelter = getVerifiedShelter(manager);

        if (request.species() == null || request.species().isBlank()) {
            throw new IllegalArgumentException("Species is required.");
        }
        if (request.intakeDate() == null) {
            throw new IllegalArgumentException("Intake date is required.");
        }
        if (request.intakeType() == null) {
            throw new IllegalArgumentException("Intake type is required.");
        }

        Animal animal = new Animal();
        animal.setShelter(shelter);
        animal.setName(blankToNull(request.name()));
        animal.setSpecies(request.species());
        animal.setBreed(blankToNull(request.breed()));
        animal.setSex(request.sex() != null ? request.sex() : AnimalSex.UNKNOWN);
        animal.setEstimatedAgeMonths(request.estimatedAgeMonths());
        animal.setColor(blankToNull(request.color()));
        animal.setDistinguishingMarks(blankToNull(request.distinguishingMarks()));
        animal.setWeightKg(request.weightKg());
        animal.setPrimaryPhotoBase64(request.primaryPhotoBase64());
        animal.setMicrochipNumber(blankToNull(request.microchipNumber()));
        animal.setStatus(AnimalStatus.IN_SHELTER_CARE);

        Animal saved = animalRepository.save(animal);
        saved.setAnimalCode(String.format("PZA-%06d", saved.getId()));
        saved = animalRepository.save(saved);

        AnimalIntake intake = new AnimalIntake();
        intake.setAnimal(saved);
        intake.setIntakeDate(request.intakeDate());
        intake.setIntakeType(request.intakeType());
        intake.setSourceInfo(blankToNull(request.sourceInfo()));
        intake.setPreviousOwnershipInfo(blankToNull(request.previousOwnershipInfo()));
        intake.setRecordedBy(manager);
        animalIntakeRepository.save(intake);

        adoptionAuditService.log(manager, "ANIMAL_INTAKE_CREATED", "Animal", saved.getId(),
                null, AnimalStatus.IN_SHELTER_CARE.name(),
                "Intake type: " + request.intakeType() + ", Animal ID: " + saved.getAnimalCode());

        return animalResponseAssembler.assemble(saved);
    }

    @Transactional
    public AnimalResponseDTO recordInitialAssessment(String email, Long animalId, InitialAssessmentRequestDTO request) {
        User manager = getManager(email);
        Animal animal = getOwnedAnimal(manager, animalId);

        animal.setGeneralCondition(blankToNull(request.generalCondition()));
        if (request.weightKg() != null) {
            animal.setWeightKg(request.weightKg());
        }
        animal.setVisibleInjuries(blankToNull(request.visibleInjuries()));
        animal.setBehaviourObservations(blankToNull(request.behaviourObservations()));
        animal.setImmediateMedicalConcerns(blankToNull(request.immediateMedicalConcerns()));
        animal.setKnownAllergies(blankToNull(request.knownAllergies()));
        animal.setKnownMedicalHistory(blankToNull(request.knownMedicalHistory()));
        animal.setParasiteConcerns(blankToNull(request.parasiteConcerns()));
        animal.setVaccinationInfoAtIntake(blankToNull(request.vaccinationInfoAtIntake()));
        animal.setInitialAssessmentRecordedAt(LocalDateTime.now());
        animal.setInitialAssessmentRecordedBy(manager);
        animal.setUpdatedAt(LocalDateTime.now());

        Animal saved = animalRepository.save(animal);

        adoptionAuditService.log(manager, "INITIAL_ASSESSMENT_RECORDED", "Animal", saved.getId(),
                null, null, "Shelter-observed initial assessment recorded.");

        return animalResponseAssembler.assemble(saved);
    }

    public List<AnimalSummaryDTO> getMyAnimals(String email) {
        User manager = getManager(email);
        Shelter shelter = shelterRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new IllegalStateException("Please create your shelter profile first."));
        return animalRepository.findByShelterId(shelter.getId()).stream()
                .map(a -> new AnimalSummaryDTO(a, animalResponseAssembler.hasOverdueCare(a)))
                .collect(Collectors.toList());
    }

    public AnimalResponseDTO getAnimal(String email, Long animalId) {
        User manager = getManager(email);
        Animal animal = getOwnedAnimal(manager, animalId);
        return animalResponseAssembler.assemble(animal);
    }

    @Transactional
    public AnimalResponseDTO uploadDocument(String email, Long animalId, MedicalDocumentUploadRequestDTO request) {
        User manager = getManager(email);
        Animal animal = getOwnedAnimal(manager, animalId);

        if (request.documentBase64() == null || request.documentBase64().isBlank()) {
            throw new IllegalArgumentException("Document content is required.");
        }

        MedicalDocument doc = new MedicalDocument();
        doc.setAnimal(animal);
        doc.setDocumentType(request.documentType() != null ? request.documentType() : MedicalDocumentType.OTHER);
        doc.setDocumentBase64(request.documentBase64());
        doc.setUploadedBy(manager);
        doc.setNotes(blankToNull(request.notes()));
        medicalDocumentRepository.save(doc);

        adoptionAuditService.log(manager, "MEDICAL_DOCUMENT_UPLOADED", "Animal", animal.getId(),
                null, null, "Uploaded by shelter: " + doc.getDocumentType());

        return animalResponseAssembler.assemble(animal);
    }

    private Animal getOwnedAnimal(User manager, Long animalId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal not found"));
        if (!animal.getShelter().getManager().getId().equals(manager.getId())) {
            throw new SecurityException("Unauthorized: This animal does not belong to your shelter.");
        }
        return animal;
    }

    private Shelter getVerifiedShelter(User manager) {
        Shelter shelter = shelterRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new IllegalStateException("Please create and verify your shelter profile first."));
        if (shelter.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new IllegalStateException("Only verified shelters can record animal intake. Current status: "
                    + shelter.getVerificationStatus() + ".");
        }
        return shelter;
    }

    private User getManager(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
