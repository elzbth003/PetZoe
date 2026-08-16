package com.petzoe.api.service;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Veterinary assessment, vaccination, and medical document review for shelter
 * animals (Phase 3). Only a verified Veterinarian (User.verificationStatus ==
 * APPROVED) may record professional findings — enforcing the domain rule that
 * shelters record observations but only a vet records medical assessment.
 *
 * Access is intentionally open across all shelters (not pre-assigned), mirroring
 * how the existing Appointment feature lets any vet serve any pet owner, and
 * matching the informal "veterinary care arrangements" shelters describe in
 * their profile rather than a rigid vet-shelter contract.
 */
@Service
public class MedicalRecordService {

    private final AnimalRepository animalRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PreventiveCareRecordRepository preventiveCareRecordRepository;
    private final UserRepository userRepository;
    private final AdoptionAuditService adoptionAuditService;
    private final NotificationService notificationService;
    private final AnimalResponseAssembler animalResponseAssembler;

    public MedicalRecordService(AnimalRepository animalRepository,
                                 MedicalRecordRepository medicalRecordRepository,
                                 VaccinationRepository vaccinationRepository,
                                 MedicalDocumentRepository medicalDocumentRepository,
                                 PreventiveCareRecordRepository preventiveCareRecordRepository,
                                 UserRepository userRepository,
                                 AdoptionAuditService adoptionAuditService,
                                 NotificationService notificationService,
                                 AnimalResponseAssembler animalResponseAssembler) {
        this.animalRepository = animalRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.preventiveCareRecordRepository = preventiveCareRecordRepository;
        this.userRepository = userRepository;
        this.adoptionAuditService = adoptionAuditService;
        this.notificationService = notificationService;
        this.animalResponseAssembler = animalResponseAssembler;
    }

    public List<AnimalSummaryDTO> getAnimalWorklist() {
        return animalRepository.findAll().stream()
                .map(a -> new AnimalSummaryDTO(a, animalResponseAssembler.hasOverdueCare(a)))
                .collect(Collectors.toList());
    }

    public AnimalResponseDTO getAnimal(String email, Long animalId) {
        requireVerifiedVet(email);
        return animalResponseAssembler.assemble(getAnimalOrThrow(animalId));
    }

    @Transactional
    public AnimalResponseDTO addMedicalRecord(String email, Long animalId, MedicalRecordRequestDTO request) {
        User vet = requireVerifiedVet(email);
        Animal animal = getAnimalOrThrow(animalId);

        if (request.examinationDate() == null) {
            throw new IllegalArgumentException("Examination date is required.");
        }
        if (request.healthStatus() == null || request.healthStatus().isBlank()) {
            throw new IllegalArgumentException("Health status is required.");
        }

        MedicalRecord record = new MedicalRecord();
        record.setAnimal(animal);
        record.setVeterinarian(vet);
        record.setExaminationDate(request.examinationDate());
        record.setWeightKg(request.weightKg());
        record.setHealthStatus(request.healthStatus());
        record.setDiagnosis(blankToNull(request.diagnosis()));
        record.setTreatment(blankToNull(request.treatment()));
        record.setMedication(blankToNull(request.medication()));
        record.setLabInvestigations(blankToNull(request.labInvestigations()));
        record.setDewormingInfo(blankToNull(request.dewormingInfo()));
        record.setParasiteControlInfo(blankToNull(request.parasiteControlInfo()));
        record.setSterilizationStatus(request.sterilizationStatus());
        record.setVeterinaryNotes(blankToNull(request.veterinaryNotes()));
        record.setFollowUpRequired(request.followUpRequired());
        record.setFollowUpDate(request.followUpDate());
        record.setFollowUpNotes(blankToNull(request.followUpNotes()));
        medicalRecordRepository.save(record);

        if (request.weightKg() != null) {
            animal.setWeightKg(request.weightKg());
        }
        if (request.sterilizationStatus() != null) {
            animal.setSterilizationStatus(request.sterilizationStatus());
        }
        animal.setUpdatedAt(LocalDateTime.now());
        animalRepository.save(animal);

        adoptionAuditService.log(vet, "MEDICAL_RECORD_ADDED", "Animal", animal.getId(),
                null, null, "Examination on " + request.examinationDate() + " — " + request.healthStatus());

        notifyShelter(animal, "Veterinary Assessment Recorded",
                "Dr. " + vet.getName() + " recorded a veterinary assessment for " + displayName(animal) + ".");

        return animalResponseAssembler.assemble(animal);
    }

    @Transactional
    public AnimalResponseDTO addVaccination(String email, Long animalId, VaccinationRequestDTO request) {
        User vet = requireVerifiedVet(email);
        Animal animal = getAnimalOrThrow(animalId);

        if (request.vaccineName() == null || request.vaccineName().isBlank()) {
            throw new IllegalArgumentException("Vaccine name is required.");
        }
        if (request.dateAdministered() == null) {
            throw new IllegalArgumentException("Date administered is required.");
        }

        Vaccination vaccination = new Vaccination();
        vaccination.setAnimal(animal);
        vaccination.setVeterinarian(vet);
        vaccination.setVaccineName(request.vaccineName());
        vaccination.setDateAdministered(request.dateAdministered());
        vaccination.setNextDueDate(request.nextDueDate());
        vaccination.setBatchLotNumber(blankToNull(request.batchLotNumber()));
        vaccination.setNotes(blankToNull(request.notes()));
        vaccinationRepository.save(vaccination);

        adoptionAuditService.log(vet, "VACCINATION_RECORDED", "Animal", animal.getId(),
                null, null, request.vaccineName() + " administered " + request.dateAdministered());

        notifyShelter(animal, "Vaccination Recorded",
                request.vaccineName() + " vaccination recorded for " + displayName(animal) + " by Dr. " + vet.getName() + ".");

        return animalResponseAssembler.assemble(animal);
    }

    @Transactional
    public AnimalResponseDTO addPreventiveCare(String email, Long animalId, PreventiveCareRequestDTO request) {
        User vet = requireVerifiedVet(email);
        Animal animal = getAnimalOrThrow(animalId);

        if (request.careType() == null) {
            throw new IllegalArgumentException("Care type is required.");
        }
        if (request.dateAdministered() == null) {
            throw new IllegalArgumentException("Date administered is required.");
        }

        PreventiveCareRecord record = new PreventiveCareRecord();
        record.setAnimal(animal);
        record.setVeterinarian(vet);
        record.setCareType(request.careType());
        record.setDateAdministered(request.dateAdministered());
        record.setNextDueDate(request.nextDueDate());
        record.setProduct(blankToNull(request.product()));
        record.setNotes(blankToNull(request.notes()));
        preventiveCareRecordRepository.save(record);

        adoptionAuditService.log(vet, "PREVENTIVE_CARE_RECORDED", "Animal", animal.getId(),
                null, null, request.careType() + " administered " + request.dateAdministered());

        notifyShelter(animal, "Preventive Care Recorded",
                request.careType().name().replace('_', ' ') + " recorded for " + displayName(animal) + " by Dr. " + vet.getName() + ".");

        return animalResponseAssembler.assemble(animal);
    }

    @Transactional
    public AnimalResponseDTO uploadDocument(String email, Long animalId, MedicalDocumentUploadRequestDTO request) {
        User vet = requireVerifiedVet(email);
        Animal animal = getAnimalOrThrow(animalId);

        if (request.documentBase64() == null || request.documentBase64().isBlank()) {
            throw new IllegalArgumentException("Document content is required.");
        }

        MedicalDocument doc = new MedicalDocument();
        doc.setAnimal(animal);
        doc.setDocumentType(request.documentType() != null ? request.documentType() : MedicalDocumentType.OTHER);
        doc.setDocumentBase64(request.documentBase64());
        doc.setUploadedBy(vet);
        doc.setNotes(blankToNull(request.notes()));
        medicalDocumentRepository.save(doc);

        adoptionAuditService.log(vet, "MEDICAL_DOCUMENT_UPLOADED", "Animal", animal.getId(),
                null, null, "Uploaded by veterinarian: " + doc.getDocumentType());

        return animalResponseAssembler.assemble(animal);
    }

    @Transactional
    public AnimalResponseDTO reviewDocument(String email, Long documentId, MedicalDocumentReviewRequestDTO request) {
        User vet = requireVerifiedVet(email);
        MedicalDocument doc = medicalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (request.status() == null) {
            throw new IllegalArgumentException("A review status is required.");
        }

        DocumentVerificationStatus previous = doc.getVerificationStatus();
        doc.setVerificationStatus(request.status());
        doc.setNotes(blankToNull(request.notes()));
        doc.setVerifiedBy(vet);
        doc.setVerifiedAt(LocalDateTime.now());
        medicalDocumentRepository.save(doc);

        adoptionAuditService.log(vet, "MEDICAL_DOCUMENT_REVIEWED", "Animal", doc.getAnimal().getId(),
                previous.name(), request.status().name(), request.notes());

        return animalResponseAssembler.assemble(doc.getAnimal());
    }

    private void notifyShelter(Animal animal, String title, String message) {
        User shelterManager = animal.getShelter().getManager();
        notificationService.createNotification(shelterManager, title, message, "SYSTEM");
    }

    private String displayName(Animal animal) {
        return (animal.getName() != null ? animal.getName() : "Unnamed") + " (" + animal.getAnimalCode() + ")";
    }

    private Animal getAnimalOrThrow(Long animalId) {
        return animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal not found"));
    }

    private User requireVerifiedVet(String email) {
        User vet = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (vet.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new IllegalStateException("Only verified veterinarians can perform this action.");
        }
        return vet;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
