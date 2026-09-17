package com.petzoe.api.service;

import com.petzoe.api.dto.PetDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AppointmentRepository appointmentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PetMedicalRecordRepository petMedicalRecordRepository;
    private final PetVaccinationRecordRepository petVaccinationRecordRepository;
    private final PetMedicalDocumentRepository petMedicalDocumentRepository;
    private final PrescriptionRepository prescriptionRepository;

    public PetService(PetRepository petRepository,
                      UserRepository userRepository,
                      NotificationService notificationService,
                      AppointmentRepository appointmentRepository,
                      ChatMessageRepository chatMessageRepository,
                      PetMedicalRecordRepository petMedicalRecordRepository,
                      PetVaccinationRecordRepository petVaccinationRecordRepository,
                      PetMedicalDocumentRepository petMedicalDocumentRepository,
                      PrescriptionRepository prescriptionRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.appointmentRepository = appointmentRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.petMedicalRecordRepository = petMedicalRecordRepository;
        this.petVaccinationRecordRepository = petVaccinationRecordRepository;
        this.petMedicalDocumentRepository = petMedicalDocumentRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    public List<PetDTO> getPetsByOwner(String email) {
        User owner = getOwner(email);
        return petRepository.findByOwner(owner).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PetDTO getPetById(Long id, String email) {
        Pet pet = getPetEntityOwnedByUser(id, email);
        return convertToDTO(pet);
    }

    public PetDTO createPet(PetDTO petDTO, String email) {
        User owner = getOwner(email);

        Pet pet = new Pet(
                petDTO.name(),
                petDTO.species(),
                petDTO.breed(),
                petDTO.age(),
                petDTO.gender(),
                petDTO.weight(),
                petDTO.vaccinationStatus(),
                petDTO.photoUrl(),
                petDTO.dateOfBirth(),
                petDTO.color(),
                petDTO.allergies(),
                petDTO.medicalNotes(),
                owner
        );

        String generatedCode = null;
        try {
            generatedCode = petRepository.getNextPetCode();
        } catch (Exception e) {
            // Fallback in environments where sequence might not be invoked directly
        }
        if (generatedCode != null && !generatedCode.trim().isEmpty()) {
            pet.setPetCode(generatedCode);
        }

        Pet savedPet = petRepository.save(pet);
        if (savedPet.getPetCode() == null) {
            savedPet.setPetCode(String.format("PZ-PET-%06d", savedPet.getId()));
            savedPet = petRepository.save(savedPet);
        }

        // Trigger vaccination notification if needed
        if (!"Up-to-date".equals(petDTO.vaccinationStatus())) {
            notificationService.createNotification(owner,
                    "Vaccination Reminder 💉",
                    petDTO.name() + " needs vaccination. Status: " + petDTO.vaccinationStatus(),
                    "VACCINATION");
        }

        return convertToDTO(savedPet);
    }

    public PetDTO updatePet(Long id, PetDTO petDTO, String email) {
        Pet pet = getPetEntityOwnedByUser(id, email);
        pet.setName(petDTO.name());
        pet.setSpecies(petDTO.species());
        pet.setBreed(petDTO.breed());
        pet.setAge(petDTO.age());
        pet.setGender(petDTO.gender());
        pet.setWeight(petDTO.weight());
        pet.setVaccinationStatus(petDTO.vaccinationStatus());
        pet.setPhotoUrl(petDTO.photoUrl());
        pet.setDateOfBirth(petDTO.dateOfBirth());
        pet.setColor(petDTO.color());
        pet.setAllergies(petDTO.allergies());
        pet.setMedicalNotes(petDTO.medicalNotes());
        // Note: petCode is permanent and immutable. It is NEVER modified during update.

        Pet updatedPet = petRepository.save(pet);
        return convertToDTO(updatedPet);
    }

    @Transactional
    public void deletePet(Long id, String email) {
        Pet pet = getPetEntityOwnedByUser(id, email);
        Long petId = pet.getId();

        // 1. Fetch appointments for this pet and delete associated chat messages
        List<Appointment> appointments = appointmentRepository.findByPetId(petId);
        if (!appointments.isEmpty()) {
            for (Appointment appointment : appointments) {
                List<ChatMessage> messages = chatMessageRepository.findByAppointmentIdOrderByCreatedAtAsc(appointment.getId());
                if (!messages.isEmpty()) {
                    chatMessageRepository.deleteAll(messages);
                }
            }
        }

        // 2. Delete all medical documents for this pet
        List<PetMedicalDocument> documents = petMedicalDocumentRepository.findByPetIdOrderByUploadedAtDesc(petId);
        if (!documents.isEmpty()) {
            petMedicalDocumentRepository.deleteAll(documents);
        }

        // 3. Delete all vaccination records for this pet
        List<PetVaccinationRecord> vaccinations = petVaccinationRecordRepository.findByPetIdOrderByDateAdministeredDesc(petId);
        if (!vaccinations.isEmpty()) {
            petVaccinationRecordRepository.deleteAll(vaccinations);
        }

        // 4. Delete all prescriptions for this pet
        List<Prescription> prescriptions = prescriptionRepository.findByPetIdOrderByCreatedAtDesc(petId);
        if (!prescriptions.isEmpty()) {
            prescriptionRepository.deleteAll(prescriptions);
        }

        // 5. Delete all clinical/medical records for this pet
        List<PetMedicalRecord> medicalRecords = petMedicalRecordRepository.findByPetIdOrderByExaminationDateDesc(petId);
        if (!medicalRecords.isEmpty()) {
            petMedicalRecordRepository.deleteAll(medicalRecords);
        }

        // 6. Delete all appointments for this pet
        if (!appointments.isEmpty()) {
            appointmentRepository.deleteAll(appointments);
        }

        // 7. Delete the pet itself
        petRepository.delete(pet);
    }

    public PetDTO getPetByCode(String petCode, String email) {
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        Pet pet = petRepository.findByPetCodeIgnoreCase(petCode.trim())
                .orElseThrow(() -> new IllegalArgumentException("No pet found with Pet ID: " + petCode));

        // Pet Owner can view their own pet; Veterinarians and Admins can view any pet
        boolean isOwner = pet.getOwner().getId().equals(requester.getId());
        boolean isVetOrAdmin = requester.getRole().equalsIgnoreCase("Veterinarian") || requester.getRole().equalsIgnoreCase("Admin");

        if (!isOwner && !isVetOrAdmin) {
            throw new SecurityException("Unauthorized: You do not have permission to view this pet.");
        }

        return convertToDTO(pet);
    }

    @Transactional
    public PetDTO transferOwnership(Long petId, String newOwnerEmail, String currentOwnerEmail) {
        if (newOwnerEmail == null || newOwnerEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("New owner email cannot be empty.");
        }

        User currentOwner = getOwner(currentOwnerEmail);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        if (!pet.getOwner().getId().equals(currentOwner.getId())) {
            throw new SecurityException("Unauthorized: You can only transfer pets you currently own.");
        }

        if (currentOwner.getEmail().equalsIgnoreCase(newOwnerEmail.trim())) {
            throw new IllegalArgumentException("Cannot transfer pet to yourself.");
        }

        User newOwner = userRepository.findByEmail(newOwnerEmail.trim())
                .orElseThrow(() -> new IllegalArgumentException("Recipient user not found with email: " + newOwnerEmail));

        if (!newOwner.isEnabled()) {
            throw new IllegalArgumentException("Recipient user account is disabled.");
        }

        // Transfer owner, keeping the permanent petCode and all historical records intact
        pet.setOwner(newOwner);
        Pet transferredPet = petRepository.save(pet);

        // Notify previous owner
        notificationService.createNotification(
                currentOwner,
                "Pet Ownership Transferred",
                "Ownership of " + pet.getName() + " (" + pet.getPetCode() + ") was successfully transferred to " + newOwner.getName() + " (" + newOwner.getEmail() + ").",
                "SYSTEM"
        );

        // Notify new owner
        notificationService.createNotification(
                newOwner,
                "New Pet Received! 🐾",
                "You are now the registered owner of " + pet.getName() + " (" + pet.getPetCode() + "). All medical history has been preserved.",
                "PROFILE"
        );

        return convertToDTO(transferredPet);
    }

    private Pet getPetEntityOwnedByUser(Long id, String email) {
        User owner = getOwner(email);
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + id));
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You do not own this pet.");
        }
        return pet;
    }

    private User getOwner(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private PetDTO convertToDTO(Pet pet) {
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
}
