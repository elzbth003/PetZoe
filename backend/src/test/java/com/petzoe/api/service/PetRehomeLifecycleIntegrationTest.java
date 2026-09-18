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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PetRehomeLifecycleIntegrationTest {

    @Mock
    private PetRehomeListingRepository listingRepository;

    @Mock
    private PetRehomeApplicationRepository applicationRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PetRehomeService rehomeService;

    private User ownerAlice;
    private User applicantBob;
    private User applicantCharlie;
    private Pet samplePet;
    private PetRehomeListing activeListing;

    @BeforeEach
    void setUp() {
        ownerAlice = new User("Alice Smith", "alice@example.com", "secret", "1234567890", "Pet Owner");
        ownerAlice.setId(101L);

        applicantBob = new User("Bob Jones", "bob@example.com", "secret", "9876543210", "Pet Owner");
        applicantBob.setId(102L);

        applicantCharlie = new User("Charlie Day", "charlie@example.com", "secret", "5555555555", "Pet Owner");
        applicantCharlie.setId(103L);

        samplePet = new Pet();
        samplePet.setId(1L);
        samplePet.setPetCode("PZ-PET-000001");
        samplePet.setName("Buddy");
        samplePet.setSpecies("Dog");
        samplePet.setBreed("Golden Retriever");
        samplePet.setAge(3);
        samplePet.setGender("Male");
        samplePet.setWeight(28.5);
        samplePet.setVaccinationStatus("Up-to-date");
        samplePet.setOwner(ownerAlice);

        activeListing = new PetRehomeListing(
                samplePet,
                ownerAlice,
                "Loving home for Buddy",
                "Relocating overseas for work",
                "Fenced yard preferred, active lifestyle",
                "San Francisco"
        );
        activeListing.setId(501L);
    }

    @Test
    @DisplayName("1. Owner successfully creates a rehoming listing")
    void testCreateListing_Success() {
        CreateRehomeListingDTO dto = new CreateRehomeListingDTO(
                1L,
                "Loving home for Buddy",
                "Relocating overseas for work",
                "Fenced yard preferred",
                "San Francisco"
        );

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));
        when(listingRepository.existsByPetIdAndStatus(1L, "ACTIVE")).thenReturn(false);
        when(listingRepository.save(any(PetRehomeListing.class))).thenAnswer(invocation -> {
            PetRehomeListing saved = invocation.getArgument(0);
            saved.setId(501L);
            return saved;
        });

        PetRehomeListingDTO result = rehomeService.createListing(dto, "alice@example.com");

        assertNotNull(result);
        assertEquals("Loving home for Buddy", result.title());
        assertEquals("PZ-PET-000001", result.petCode());
        assertEquals("ACTIVE", result.status());
        assertTrue(result.isOwner());
        verify(listingRepository, times(1)).save(any(PetRehomeListing.class));
    }

    @Test
    @DisplayName("2. Non-owner cannot create a rehoming listing for someone else's pet")
    void testCreateListing_Unauthorized() {
        CreateRehomeListingDTO dto = new CreateRehomeListingDTO(1L, "Title", "Reason", "Reqs", "City");

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(applicantBob));
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));

        assertThrows(SecurityException.class, () ->
                rehomeService.createListing(dto, "bob@example.com")
        );
    }

    @Test
    @DisplayName("3. Duplicate active listing for the same pet is prevented")
    void testCreateListing_DuplicatePrevented() {
        CreateRehomeListingDTO dto = new CreateRehomeListingDTO(1L, "Title", "Reason", "Reqs", "City");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(petRepository.findById(1L)).thenReturn(Optional.of(samplePet));
        when(listingRepository.existsByPetIdAndStatus(1L, "ACTIVE")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
                rehomeService.createListing(dto, "alice@example.com")
        );
    }

    @Test
    @DisplayName("4. Interested adopter successfully submits an application")
    void testApplyForPet_Success() {
        CreateRehomeApplicationDTO appDto = new CreateRehomeApplicationDTO(
                "I would love to give Buddy a great home!",
                "Single family house with large fenced yard",
                "Owned dogs for over 10 years",
                "987-654-3210"
        );

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(applicantBob));
        when(listingRepository.findById(501L)).thenReturn(Optional.of(activeListing));
        when(applicationRepository.existsByListingIdAndApplicantIdAndStatus(501L, 102L, "PENDING")).thenReturn(false);
        when(applicationRepository.save(any(PetRehomeApplication.class))).thenAnswer(invocation -> {
            PetRehomeApplication saved = invocation.getArgument(0);
            saved.setId(701L);
            return saved;
        });

        PetRehomeApplicationDTO appResult = rehomeService.applyForPet(501L, appDto, "bob@example.com");

        assertNotNull(appResult);
        assertEquals("PENDING", appResult.status());
        assertEquals("PZ-PET-000001", appResult.petCode());
        assertEquals("Bob Jones", appResult.applicantName());

        // Verify notification was sent to pet owner Alice
        verify(notificationService, times(1)).createNotification(
                eq(ownerAlice),
                contains("New Rehoming Application Received"),
                contains("Bob Jones"),
                eq("SYSTEM")
        );
    }

    @Test
    @DisplayName("5. Owner cannot apply to adopt their own pet")
    void testApplyForPet_OwnerCannotApply() {
        CreateRehomeApplicationDTO appDto = new CreateRehomeApplicationDTO("Msg", "Living", "Exp", "123");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(listingRepository.findById(501L)).thenReturn(Optional.of(activeListing));

        assertThrows(IllegalArgumentException.class, () ->
                rehomeService.applyForPet(501L, appDto, "alice@example.com")
        );
    }

    @Test
    @DisplayName("6. Duplicate pending application by same applicant is rejected")
    void testApplyForPet_DuplicatePendingRejected() {
        CreateRehomeApplicationDTO appDto = new CreateRehomeApplicationDTO("Msg", "Living", "Exp", "123");

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(applicantBob));
        when(listingRepository.findById(501L)).thenReturn(Optional.of(activeListing));
        when(applicationRepository.existsByListingIdAndApplicantIdAndStatus(501L, 102L, "PENDING")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
                rehomeService.applyForPet(501L, appDto, "bob@example.com")
        );
    }

    @Test
    @DisplayName("7. Owner rejects an application")
    void testRejectApplication_Success() {
        PetRehomeApplication app = new PetRehomeApplication(
                activeListing, samplePet, applicantBob, "Msg", "House", "10 yrs", "123"
        );
        app.setId(701L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(applicationRepository.findById(701L)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any(PetRehomeApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PetRehomeApplicationDTO rejected = rehomeService.rejectApplication(701L, "alice@example.com");

        assertEquals("REJECTED", rejected.status());
        assertNotNull(rejected.respondedAt());

        // Verify notification sent to Bob
        verify(notificationService, times(1)).createNotification(
                eq(applicantBob),
                contains("Rehoming Application Update"),
                contains("not selected"),
                eq("SYSTEM")
        );
    }

    @Test
    @DisplayName("8. Atomic Acceptance: transfers ownership, preserves PZ-PET-XXXXXX, rejects others, closes listing, notifies all parties")
    void testAcceptApplication_AtomicTransferSuccess() {
        // Winning application from Bob
        PetRehomeApplication winningApp = new PetRehomeApplication(
                activeListing, samplePet, applicantBob, "Bob msg", "House", "Exp", "123"
        );
        winningApp.setId(701L);

        // Competing application from Charlie
        PetRehomeApplication competingApp = new PetRehomeApplication(
                activeListing, samplePet, applicantCharlie, "Charlie msg", "Apt", "Exp", "456"
        );
        competingApp.setId(702L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(applicationRepository.findById(701L)).thenReturn(Optional.of(winningApp));
        when(applicationRepository.findByListingIdAndStatus(501L, "PENDING")).thenReturn(List.of(winningApp, competingApp));
        when(applicationRepository.save(any(PetRehomeApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(listingRepository.save(any(PetRehomeListing.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PetRehomeApplicationDTO acceptedResult = rehomeService.acceptApplication(701L, "alice@example.com");

        // 1. Verify winning app is ACCEPTED
        assertEquals("ACCEPTED", acceptedResult.status());
        assertEquals("ACCEPTED", winningApp.getStatus());
        assertNotNull(winningApp.getRespondedAt());

        // 2. Verify competing app is automatically REJECTED
        assertEquals("REJECTED", competingApp.getStatus());
        assertNotNull(competingApp.getRespondedAt());

        // 3. Verify listing is COMPLETED
        assertEquals("COMPLETED", activeListing.getStatus());
        assertNotNull(activeListing.getClosedAt());

        // 4. Verify Pet Owner transferred to Bob, while permanent petCode PZ-PET-000001 is preserved intact
        assertEquals(applicantBob, samplePet.getOwner());
        assertEquals("PZ-PET-000001", samplePet.getPetCode());
        assertEquals("Buddy", samplePet.getName());

        // 5. Verify notifications to all parties
        // Alice (previous owner)
        verify(notificationService, times(1)).createNotification(
                eq(ownerAlice),
                contains("Successfully Rehomed"),
                contains("Bob Jones"),
                eq("SYSTEM")
        );
        // Bob (new owner)
        verify(notificationService, times(1)).createNotification(
                eq(applicantBob),
                contains("Welcome to Your New Family Member"),
                contains("PZ-PET-000001"),
                eq("PROFILE")
        );
        // Charlie (competing applicant)
        verify(notificationService, times(1)).createNotification(
                eq(applicantCharlie),
                contains("Pet Rehoming Update"),
                contains("loving new home"),
                eq("SYSTEM")
        );
    }

    @Test
    @DisplayName("9. Owner cancels listing: listing status is CANCELLED and pending apps are cancelled")
    void testCancelListing_Success() {
        PetRehomeApplication pendingApp = new PetRehomeApplication(
                activeListing, samplePet, applicantBob, "Msg", "House", "Exp", "123"
        );
        pendingApp.setId(701L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(ownerAlice));
        when(listingRepository.findById(501L)).thenReturn(Optional.of(activeListing));
        when(applicationRepository.findByListingIdAndStatus(501L, "PENDING")).thenReturn(List.of(pendingApp));
        when(listingRepository.save(any(PetRehomeListing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PetRehomeListingDTO cancelled = rehomeService.cancelListing(501L, "alice@example.com");

        assertEquals("CANCELLED", cancelled.status());
        assertEquals("CANCELLED", pendingApp.getStatus());
        verify(notificationService, times(1)).createNotification(
                eq(applicantBob),
                contains("Rehoming Listing Withdrawn"),
                contains("withdrawn by the owner"),
                eq("SYSTEM")
        );
    }
}
