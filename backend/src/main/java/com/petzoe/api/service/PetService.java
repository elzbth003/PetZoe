package com.petzoe.api.service;

import com.petzoe.api.dto.PetDTO;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PetService(PetRepository petRepository, UserRepository userRepository,
                      NotificationService notificationService) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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

        Pet savedPet = petRepository.save(pet);

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

        Pet updatedPet = petRepository.save(pet);
        return convertToDTO(updatedPet);
    }

    public void deletePet(Long id, String email) {
        Pet pet = getPetEntityOwnedByUser(id, email);
        petRepository.delete(pet);
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
