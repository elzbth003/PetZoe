package com.petzoe.api.service;

import com.petzoe.api.dto.PetDTO;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.PetMedicalRecordRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PetIdLifecycleIntegrationTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PetMedicalRecordRepository medicalRecordRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PetService petService;

    private User ownerAlice;
    private User ownerBob;
    private Pet samplePet;

    @BeforeEach
    void setUp() {
        ownerAlice = new User("Alice Smith", "alice@example.com", "secret", "1234567890", "Pet Owner");
        ownerAlice.setId(101L);

        ownerBob = new User("Bob Jones", "bob@example.com", "secret", "9876543210", "Pet Owner");
        ownerBob.setId(102L);

        samplePet = new Pet();
        samplePet.setId(1L);
        samplePet.setName("Buddy");
        samplePet.setSpecies("Dog");
        samplePet.setBreed("Golden Retriever");
        samplePet.setAge(3);
        samplePet.setGender("Male");
        samplePet.setWeight(28.5);
        samplePet.setVaccinationStatus("Up-to-date");
        samplePet.setPetCode("PZ-PET-000001");
        samplePet.setOwner(ownerAlice);
    }

    @Test
    @DisplayName("Test 1: Pet Creation automatically generates permanent Pet ID")
    void testCreatePet_GeneratesPermanentPetCode() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> {
            Pet p = invocation.getArgument(0);
            p.setId(42L);
            return p;
        });

        PetDTO newPet = new PetDTO(null, null, "Charlie", "Cat", "Siamese", 2, "Female", 4.2, "Up-to-date", null, null, null, null, null, null);
        PetDTO created = petService.createPet(newPet, "alice@example.com");

        assertNotNull(created);
        assertNotNull(created.petCode(), "Created pet must have a Pet ID");
        assertTrue(created.petCode().startsWith("PZ-PET-"), "Pet ID must follow PZ-PET-XXXXXX pattern");
        verify(petRepository, times(2)).save(any(Pet.class));
    }

    @Test
    @DisplayName("Test 2: Updating Pet cannot alter the permanent Pet ID")
    void testUpdatePet_PreservesImmutablePetCode() {
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Attempt to supply a forged pet code in update DTO
        PetDTO updateDTO = new PetDTO(1L, "PZ-PET-FORGED-999", "Buddy Boy", "Dog", "Golden Retriever", 4, "Male", 29.0, "Up-to-date", null, null, null, null, null, null);
        PetDTO updated = petService.updatePet(1L, updateDTO, "alice@example.com");

        assertEquals("PZ-PET-000001", updated.petCode(), "Permanent Pet ID must remain unchanged and immutable");
        assertEquals("Buddy Boy", updated.name());
        assertEquals(29.0, updated.weight());
    }

    @Test
    @DisplayName("Test 3: Lookup Pet by Permanent Pet ID")
    void testGetPetByCode_Success() {
        when(petRepository.findByPetCodeIgnoreCase("PZ-PET-000001")).thenReturn(Optional.of(samplePet));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));

        PetDTO retrieved = petService.getPetByCode("PZ-PET-000001", "alice@example.com");

        assertNotNull(retrieved);
        assertEquals("Buddy", retrieved.name());
        assertEquals("PZ-PET-000001", retrieved.petCode());
    }

    @Test
    @DisplayName("Test 4: Ownership Transfer preserves Pet ID, reassigns owner, and sends notifications")
    void testTransferOwnership_Success() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(ownerBob));
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PetDTO transferred = petService.transferOwnership(1L, "bob@example.com", "alice@example.com");

        assertNotNull(transferred);
        assertEquals("PZ-PET-000001", transferred.petCode(), "Pet ID must remain identical after transfer");
        assertEquals(ownerBob, samplePet.getOwner(), "Pet owner must now be Bob");

        // Verify dual notifications dispatched
        verify(notificationService).createNotification(
                eq(ownerAlice),
                eq("Pet Ownership Transferred"),
                contains("PZ-PET-000001"),
                eq("SYSTEM")
        );
        verify(notificationService).createNotification(
                eq(ownerBob),
                contains("New Pet Received!"),
                contains("PZ-PET-000001"),
                eq("PROFILE")
        );
    }

    @Test
    @DisplayName("Test 5: Ownership Transfer rejects self-transfer")
    void testTransferOwnership_RejectsSelfTransfer() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                petService.transferOwnership(1L, "alice@example.com", "alice@example.com")
        );
        assertEquals("Cannot transfer pet to yourself.", ex.getMessage());
    }

    @Test
    @DisplayName("Test 6: Ownership Transfer rejects non-owner request")
    void testTransferOwnership_RejectsUnauthorizedSender() {
        User attacker = new User("Attacker", "attacker@example.com", "pass", "111", "Pet Owner");
        attacker.setId(999L);

        when(userRepository.findByEmail("attacker@example.com")).thenReturn(Optional.of(attacker));
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));

        SecurityException ex = assertThrows(SecurityException.class, () ->
                petService.transferOwnership(1L, "bob@example.com", "attacker@example.com")
        );
        assertEquals("Unauthorized: You can only transfer pets you currently own.", ex.getMessage());
    }
}
