package com.petzoe.api.service;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PetClinicalService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PetMedicalRecordRepository petMedicalRecordRepository;
    private final PetVaccinationRecordRepository petVaccinationRecordRepository;
    private final PetMedicalDocumentRepository petMedicalDocumentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AnimalRepository animalRepository;
    private final AnimalResponseAssembler animalResponseAssembler;
    private final NotificationService notificationService;
    private final VetScanService vetScanService;

    public PetClinicalService(PetRepository petRepository,
                              UserRepository userRepository,
                              AppointmentRepository appointmentRepository,
                              PetMedicalRecordRepository petMedicalRecordRepository,
                              PetVaccinationRecordRepository petVaccinationRecordRepository,
                              PetMedicalDocumentRepository petMedicalDocumentRepository,
                              PrescriptionRepository prescriptionRepository,
                              AnimalRepository animalRepository,
                              AnimalResponseAssembler animalResponseAssembler,
                              NotificationService notificationService,
                              VetScanService vetScanService) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.petMedicalRecordRepository = petMedicalRecordRepository;
        this.petVaccinationRecordRepository = petVaccinationRecordRepository;
        this.petMedicalDocumentRepository = petMedicalDocumentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.animalRepository = animalRepository;
        this.animalResponseAssembler = animalResponseAssembler;
        this.notificationService = notificationService;
        this.vetScanService = vetScanService;
    }

    public VetDashboardStatsDTO getDashboardStats(String vetEmail) {
        User vet = getVetByEmail(vetEmail);

        long todays = appointmentRepository.countByVeterinarianAndAppointmentDate(vet, LocalDate.now());
        long pending = appointmentRepository.countByVeterinarianAndStatus(vet, "PENDING");
        long confirmed = appointmentRepository.countByVeterinarianAndStatus(vet, "CONFIRMED")
                + appointmentRepository.countByVeterinarianAndStatus(vet, "UPCOMING");
        long completed = appointmentRepository.countByVeterinarianAndStatus(vet, "COMPLETED");
        long activePatients = appointmentRepository.countDistinctPetsByVeterinarianId(vet.getId());
        long followUps = petMedicalRecordRepository.countByVeterinarianIdAndFollowUpRequiredTrueAndFollowUpDateLessThanEqual(
                vet.getId(), LocalDate.now());

        long shelterCount = animalRepository.count();
        long overdueShelter = animalRepository.findAll().stream()
                .filter(animalResponseAssembler::hasOverdueCare)
                .count();

        return new VetDashboardStatsDTO(
                todays,
                pending,
                confirmed,
                completed,
                activePatients,
                followUps,
                shelterCount,
                overdueShelter
        );
    }

    public List<PetDTO> getAuthorizedPatients(String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        List<Appointment> appointments = appointmentRepository.findByVeterinarian(vet);

        Map<Long, Pet> uniquePets = new LinkedHashMap<>();
        for (Appointment appt : appointments) {
            if (appt.getPet() != null) {
                uniquePets.putIfAbsent(appt.getPet().getId(), appt.getPet());
            }
        }

        return uniquePets.values().stream()
                .map(this::toPetDTO)
                .collect(Collectors.toList());
    }

    public VetPatientDetailDTO getPatientDetail(Long petId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validatePetAccess(pet, user);
        return assemblePatientDetail(pet, user);
    }

    public VetPatientDetailDTO getPatientByPetCode(String petCode, String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        Pet pet = petRepository.findByPetCodeIgnoreCase(petCode.trim())
                .orElseThrow(() -> new IllegalArgumentException("No pet found with Pet ID: " + petCode));

        return assemblePatientDetail(pet, vet);
    }

    private VetPatientDetailDTO assemblePatientDetail(Pet pet, User user) {
        User owner = pet.getOwner();
        UserDTO ownerDTO = new UserDTO(
                owner.getId(), owner.getName(), owner.getEmail(), owner.getPhone(),
                owner.getBio(), owner.getAddress(), owner.getProfileImage(), owner.getRole(),
                owner.getSpecialization()
        );

        List<AppointmentDTO> appointments = appointmentRepository.findByPetId(pet.getId()).stream()
                .filter(a -> user.getRole().equalsIgnoreCase("ADMIN")
                        || pet.getOwner().getId().equals(user.getId())
                        || user.getRole().equalsIgnoreCase("Veterinarian"))
                .map(this::toAppointmentDTO)
                .collect(Collectors.toList());

        List<PetMedicalRecordDTO> medicalRecords = petMedicalRecordRepository
                .findByPetIdOrderByExaminationDateDesc(pet.getId()).stream()
                .map(PetMedicalRecordDTO::new)
                .collect(Collectors.toList());

        List<PrescriptionDTO> prescriptions = prescriptionRepository
                .findByPetIdOrderByCreatedAtDesc(pet.getId()).stream()
                .map(this::toPrescriptionDTO)
                .collect(Collectors.toList());

        List<PetVaccinationDTO> vaccinations = petVaccinationRecordRepository
                .findByPetIdOrderByDateAdministeredDesc(pet.getId()).stream()
                .map(PetVaccinationDTO::new)
                .collect(Collectors.toList());

        List<PetMedicalDocumentDTO> documents = petMedicalDocumentRepository
                .findByPetIdOrderByUploadedAtDesc(pet.getId()).stream()
                .map(PetMedicalDocumentDTO::new)
                .collect(Collectors.toList());

        List<PetMedicalRecordDTO> followUps = medicalRecords.stream()
                .filter(PetMedicalRecordDTO::followUpRequired)
                .collect(Collectors.toList());

        List<com.petzoe.api.dto.vetscan.VetScanResponseDTO> vetScanRecords;
        try {
            vetScanRecords = vetScanService.getScansByPet(pet.getId(), user.getEmail());
        } catch (Exception e) {
            vetScanRecords = Collections.emptyList();
        }

        return new VetPatientDetailDTO(
                toPetDTO(pet),
                ownerDTO,
                appointments,
                medicalRecords,
                prescriptions,
                vaccinations,
                documents,
                followUps,
                vetScanRecords
        );
    }

    @Transactional
    public PetMedicalRecordDTO addMedicalRecord(Long petId, PetMedicalRecordRequestDTO request, String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        return createAndSaveMedicalRecord(pet, vet, request);
    }

    @Transactional
    public PetMedicalRecordDTO addMedicalRecordByPetCode(String petCode, PetMedicalRecordRequestDTO request, String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        Pet pet = petRepository.findByPetCodeIgnoreCase(petCode.trim())
                .orElseThrow(() -> new IllegalArgumentException("No pet found with Pet ID: " + petCode));

        return createAndSaveMedicalRecord(pet, vet, request);
    }

    private PetMedicalRecordDTO createAndSaveMedicalRecord(Pet pet, User vet, PetMedicalRecordRequestDTO request) {
        Appointment appointment = null;
        if (request.appointmentId() != null) {
            appointment = appointmentRepository.findById(request.appointmentId()).orElse(null);
        }

        PetMedicalRecord record = new PetMedicalRecord();
        record.setPet(pet);
        record.setVeterinarian(vet);
        record.setAppointment(appointment);
        record.setExaminationDate(request.examinationDate() != null ? request.examinationDate() : LocalDate.now());
        record.setWeightKg(request.weightKg());
        record.setHealthStatus(request.healthStatus() != null ? request.healthStatus() : "Examined");
        record.setSymptoms(request.symptoms());
        record.setDiagnosis(request.diagnosis());
        record.setTreatment(request.treatment());
        record.setMedication(request.medication());
        record.setLabInvestigations(request.labInvestigations());
        record.setVeterinaryNotes(request.veterinaryNotes());
        record.setFollowUpRequired(request.followUpRequired());
        record.setFollowUpDate(request.followUpDate());
        record.setFollowUpNotes(request.followUpNotes());

        PetMedicalRecord saved = petMedicalRecordRepository.save(record);

        // Synchronize pet weight if updated
        if (request.weightKg() != null && request.weightKg() > 0) {
            pet.setWeight(request.weightKg());
            petRepository.save(pet);
        }

        // Notify pet owner
        notificationService.createNotification(
                pet.getOwner(),
                "New Clinical Record Added",
                "Dr. " + vet.getName() + " recorded a clinical evaluation for " + pet.getName() + " (" + pet.getPetCode() + ").",
                "APPOINTMENT"
        );

        return new PetMedicalRecordDTO(saved);
    }

    @Transactional
    public PetVaccinationDTO addVaccination(Long petId, PetVaccinationRequestDTO request, String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validateClinicalRelationship(pet, vet);

        PetVaccinationRecord record = new PetVaccinationRecord();
        record.setPet(pet);
        record.setVeterinarian(vet);
        record.setVaccineName(request.vaccineName());
        record.setDateAdministered(request.dateAdministered() != null ? request.dateAdministered() : LocalDate.now());
        record.setNextDueDate(request.nextDueDate());
        record.setBatchLotNumber(request.batchLotNumber());
        record.setNotes(request.notes());

        PetVaccinationRecord saved = petVaccinationRecordRepository.save(record);

        // Update pet's vaccinationStatus column to Up-to-date
        pet.setVaccinationStatus("Up-to-date");
        petRepository.save(pet);

        // Notify pet owner
        notificationService.createNotification(
                pet.getOwner(),
                "Vaccination Recorded 💉",
                request.vaccineName() + " vaccination was administered to " + pet.getName() + " by Dr. " + vet.getName() + ".",
                "VACCINATION"
        );

        return new PetVaccinationDTO(saved);
    }

    @Transactional
    public PetMedicalDocumentDTO uploadDocument(Long petId, PetMedicalDocumentUploadDTO request, String vetEmail) {
        User user = userRepository.findByEmail(vetEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + vetEmail));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validatePetAccess(pet, user);

        PetMedicalDocument doc = new PetMedicalDocument();
        doc.setPet(pet);
        doc.setUploadedBy(user);
        doc.setDocumentType(request.documentType());
        doc.setTitle(request.title() != null && !request.title().isBlank() ? request.title() : request.documentType());
        doc.setDocumentBase64(request.documentBase64());
        doc.setNotes(request.notes());

        PetMedicalDocument saved = petMedicalDocumentRepository.save(doc);

        if (!pet.getOwner().getId().equals(user.getId())) {
            notificationService.createNotification(
                    pet.getOwner(),
                    "Medical Document Uploaded",
                    "A new medical document (" + saved.getTitle() + ") was added for " + pet.getName() + ".",
                    "APPOINTMENT"
            );
        }

        return new PetMedicalDocumentDTO(saved);
    }

    public List<PetMedicalRecordDTO> getFollowUps(String vetEmail) {
        User vet = getVetByEmail(vetEmail);
        return petMedicalRecordRepository
                .findByVeterinarianIdAndFollowUpRequiredTrueOrderByFollowUpDateAsc(vet.getId())
                .stream()
                .map(PetMedicalRecordDTO::new)
                .collect(Collectors.toList());
    }

    public List<PetMedicalRecordDTO> getPetMedicalRecords(Long petId, String userEmail) {
        return getPetMedicalHistory(petId, userEmail);
    }

    public List<PetMedicalRecordDTO> getPetMedicalHistory(Long petId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validatePetAccess(pet, user);

        return petMedicalRecordRepository.findByPetIdOrderByExaminationDateDesc(petId)
                .stream()
                .map(PetMedicalRecordDTO::new)
                .collect(Collectors.toList());
    }

    public List<PetVaccinationDTO> getPetVaccinations(Long petId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validatePetAccess(pet, user);

        return petVaccinationRecordRepository.findByPetIdOrderByDateAdministeredDesc(petId)
                .stream()
                .map(PetVaccinationDTO::new)
                .collect(Collectors.toList());
    }

    public List<PetMedicalDocumentDTO> getPetDocuments(Long petId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validatePetAccess(pet, user);

        return petMedicalDocumentRepository.findByPetIdOrderByUploadedAtDesc(petId)
                .stream()
                .map(PetMedicalDocumentDTO::new)
                .collect(Collectors.toList());
    }

    private User getVetByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        if (!"Veterinarian".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Unauthorized: User is not a veterinarian.");
        }
        return user;
    }

    private void validateClinicalRelationship(Pet pet, User vet) {
        boolean hasRelationship = appointmentRepository.existsByPetIdAndVeterinarianId(pet.getId(), vet.getId());
        if (!hasRelationship && !vet.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("Unauthorized: You do not have an active clinical relationship or appointment with this pet.");
        }
    }

    private void validatePetAccess(Pet pet, User user) {
        boolean isOwner = pet.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole().equalsIgnoreCase("ADMIN");
        boolean isVetWithAppointment = appointmentRepository.existsByPetIdAndVeterinarianId(pet.getId(), user.getId());

        if (!isOwner && !isAdmin && !isVetWithAppointment) {
            throw new AccessDeniedException("Unauthorized: You do not have access to this pet's clinical records.");
        }
    }

    private PetDTO toPetDTO(Pet pet) {
        return new PetDTO(
                pet.getId(),
                pet.getPetCode(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getAge(),
                pet.getGender(),
                pet.getWeight(),
                pet.getVaccinationStatus(),
                pet.getPhotoUrl(),
                pet.getDateOfBirth(),
                pet.getColor(),
                pet.getAllergies(),
                pet.getMedicalNotes(),
                pet.getOwner().getId()
        );
    }

    private AppointmentDTO toAppointmentDTO(Appointment a) {
        return new AppointmentDTO(
                a.getId(),
                a.getPet().getId(),
                a.getPet().getPetCode(),
                a.getPet().getName(),
                a.getOwner().getId(),
                a.getOwner().getName(),
                a.getVeterinarian().getId(),
                a.getVeterinarian().getName(),
                a.getAppointmentDate(),
                a.getAppointmentTime(),
                a.getStatus(),
                a.getNotes()
        );
    }

    private PrescriptionDTO toPrescriptionDTO(Prescription p) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(p.getId());
        dto.setAppointmentId(p.getAppointment().getId());
        dto.setPetId(p.getPet().getId());
        dto.setVeterinarianId(p.getVeterinarian().getId());
        dto.setVeterinarianName(p.getVeterinarian().getName());
        dto.setMedicineName(p.getMedicineName());
        dto.setDosage(p.getDosage());
        dto.setFrequency(p.getFrequency());
        dto.setDuration(p.getDuration());
        dto.setInstructions(p.getInstructions());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
