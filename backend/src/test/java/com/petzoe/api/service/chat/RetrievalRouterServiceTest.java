package com.petzoe.api.service.chat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RetrievalRouterServiceTest {

    private RetrievalRouterService router;

    @BeforeEach
    void setUp() {
        router = new RetrievalRouterService();
    }

    @Test
    @DisplayName("Personal appointment query routes strictly to PETZOE_ONLY")
    void testPersonalAppointmentRoute() {
        RetrievalMode mode = router.determineRoute("When is my next appointment?", ChatIntent.APPOINTMENT, true);
        assertEquals(RetrievalMode.PETZOE_ONLY, mode);
    }

    @Test
    @DisplayName("Personal pet ownership query with pet name routes strictly to PETZOE_ONLY")
    void testPersonalPetNameQuery() {
        RetrievalMode mode = router.determineRoute("Is Buddy vaccinated?", ChatIntent.VACCINATION, true);
        assertEquals(RetrievalMode.PETZOE_ONLY, mode);
    }

    @Test
    @DisplayName("Registered pets listing routes strictly to PETZOE_ONLY")
    void testShowMyPetsRoute() {
        RetrievalMode mode = router.determineRoute("Show me my registered pets", ChatIntent.PET_INFORMATION, true);
        assertEquals(RetrievalMode.PETZOE_ONLY, mode);
    }

    @Test
    @DisplayName("Grooming query without freshness keywords routes to KNOWLEDGE_BASE_ONLY")
    void testGeneralGroomingRoute() {
        RetrievalMode mode = router.determineRoute("What are the basic grooming practices for dogs?", ChatIntent.GROOMING, false);
        assertEquals(RetrievalMode.KNOWLEDGE_BASE_ONLY, mode);
    }

    @Test
    @DisplayName("Latest WSAVA vaccination query routes to KNOWLEDGE_PLUS_WEB")
    void testLatestVaccinationGuidelinesRoute() {
        RetrievalMode mode = router.determineRoute("What are the latest WSAVA vaccination recommendations?", ChatIntent.VACCINATION, false);
        assertEquals(RetrievalMode.KNOWLEDGE_PLUS_WEB, mode);
    }

    @Test
    @DisplayName("Recent research on canine skin lesions routes to WEB_ONLY")
    void testRecentResearchRoute() {
        RetrievalMode mode = router.determineRoute("What is the latest research on canine skin lesions?", ChatIntent.MEDICAL_QUESTION, false);
        assertEquals(RetrievalMode.WEB_ONLY, mode);
    }

    @Test
    @DisplayName("Life-threatening emergency query routes to NO_RETRIEVAL for immediate safety short-circuit")
    void testEmergencyRoute() {
        RetrievalMode mode = router.determineRoute("Help, my dog collapsed and is having seizures!", ChatIntent.EMERGENCY, true);
        assertEquals(RetrievalMode.NO_RETRIEVAL, mode);
    }

    @Test
    @DisplayName("Personal PetZoe detection flags personal queries accurately")
    void testIsPersonalPetZoeQuery() {
        assertTrue(router.isPersonalPetZoeQuery("What is my dog's vaccination date?", ChatIntent.VACCINATION));
        assertTrue(router.isPersonalPetZoeQuery("Show my appointments", ChatIntent.APPOINTMENT));
        assertTrue(router.isPersonalPetZoeQuery("When is ShadowTest's next vaccination?", ChatIntent.VACCINATION));
        assertTrue(router.isPersonalPetZoeQuery("lsit the vaccination record of my pet", ChatIntent.VACCINATION));
        assertTrue(router.isPersonalPetZoeQuery("What is my pet BrunoTest's medical history?", ChatIntent.MEDICAL_RECORD));
        assertTrue(router.isPersonalPetZoeQuery("PZ-PET-000002", ChatIntent.PET_INFORMATION));
        assertFalse(router.isPersonalPetZoeQuery("What are the WSAVA core vaccines for puppies?", ChatIntent.VACCINATION));
    }
}
