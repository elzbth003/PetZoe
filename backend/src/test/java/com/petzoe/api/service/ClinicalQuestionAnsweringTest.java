package com.petzoe.api.service;

import com.petzoe.api.dto.AiChatRequestDTO;
import com.petzoe.api.dto.AiChatResponseDTO;
import com.petzoe.api.dto.PatientContextDTO;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AiChatConversationRepository;
import com.petzoe.api.repository.AiChatMessageRepository;
import com.petzoe.api.repository.PetMedicalRecordRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.PetVaccinationRecordRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.service.chat.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClinicalQuestionAnsweringTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private PetMedicalRecordRepository medicalRecordRepository;

    @Mock
    private PetVaccinationRecordRepository vaccinationRecordRepository;

    @Mock
    private AiChatConversationRepository conversationRepository;

    @Mock
    private AiChatMessageRepository messageRepository;

    @Mock
    private PetZoeToolService toolService;

    @Mock
    private KnowledgeBaseService knowledgeBaseService;

    private ChatSafetyService safetyService;
    private RetrievalRouterService routerService;
    private PatientContextService patientContextService;
    private GeminiChatModelService chatModelService;
    private AiChatService chatService;

    private final String OWNER_EMAIL = "owner@petverse.com";
    private User owner;
    private Pet sylo;

    @BeforeEach
    void setUp() {
        safetyService = new ChatSafetyService();
        routerService = new RetrievalRouterService();
        patientContextService = new PatientContextService(userRepository, petRepository, medicalRecordRepository, vaccinationRecordRepository);
        chatModelService = new GeminiChatModelService(new com.fasterxml.jackson.databind.ObjectMapper());

        chatService = new AiChatService(
                userRepository,
                conversationRepository,
                messageRepository,
                safetyService,
                toolService,
                knowledgeBaseService,
                chatModelService,
                routerService,
                null,
                new SourceAttributionService(new com.fasterxml.jackson.databind.ObjectMapper()),
                null,
                patientContextService
        );

        owner = new User("Elize", OWNER_EMAIL, "pass", "123", "Pet Owner");
        owner.setId(10L);

        sylo = new Pet("sylo", "Cat", "Persian", 1, "Male", 5.0, "Needs Vaccination", owner);
        sylo.setId(100L);
        sylo.setPetCode("PZ-PET-000004");
    }

    @Test
    @DisplayName("SCENARIO-A: General clinical question without pet name asks for species and provides age guidance")
    void testScenarioAGeneralClinicalQuestion() {
        String msg = "My pet is 2 months old. Should I give him deworming medicine?";

        // Intent must be PREVENTIVE_CARE, NOT PET_INFORMATION
        ChatIntent intent = safetyService.detectIntent(msg);
        assertEquals(ChatIntent.PREVENTIVE_CARE, intent, "Must classify as PREVENTIVE_CARE, not PET_INFORMATION");

        // Routing plan must be general (no pet identified)
        RetrievalPlan plan = routerService.createRetrievalPlan(msg, intent, true);
        assertNull(plan.getCandidatePetName(), "Candidate pet name should be null for general question");
        assertTrue(plan.isGeneralQuestion(), "Should be marked as general question");
        assertTrue(plan.hasSource(RetrievalPlan.EvidenceSource.VECTOR_KNOWLEDGE));
        assertFalse(plan.hasSource(RetrievalPlan.EvidenceSource.PATIENT_CONTEXT));

        // When processed
        when(knowledgeBaseService.hasKnowledge(any())).thenReturn(true);
        when(knowledgeBaseService.getKnowledgeForIntent(any())).thenReturn("Deworming guidelines for young animals");

        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), OWNER_EMAIL, false);

        assertNotNull(response);
        String reply = response.getMessage();

        // 1. Must directly answer the question
        assertTrue(reply.toLowerCase().contains("deworming is strongly recommended") ||
                   reply.toLowerCase().contains("deworming is generally recommended") ||
                   reply.toLowerCase().contains("preventive deworming"),
                "Response must directly address the deworming recommendation");

        // 2. Must ask for species clarification
        assertTrue(reply.toLowerCase().contains("puppy") && reply.toLowerCase().contains("kitten"),
                "Response must ask whether the pet is a puppy or kitten");

        // 3. Must include feline safety warning
        assertTrue(reply.toLowerCase().contains("permethrin") || reply.toLowerCase().contains("dog medications to cats") || reply.toLowerCase().contains("fatal to felines"),
                "Response must include strict species safety warning against canine medications for felines");

        // 4. Must not invent arbitrary pet profile
        assertFalse(reply.contains("PZ-PET-000004"), "Must not arbitrarily inject Sylo's profile into a general question");
        verifyNoInteractions(petRepository);
    }

    @Test
    @DisplayName("SCENARIO-B: Named pet clinical question resolves Sylo, detects age discrepancy, and provides grounded guidance")
    void testScenarioBNamedPetClinicalQuestion() {
        String msg = "My pet Sylo is 2 months old. Should I give him deworming medicine?";

        // Intent must be PREVENTIVE_CARE
        ChatIntent intent = safetyService.detectIntent(msg);
        assertEquals(ChatIntent.PREVENTIVE_CARE, intent, "Must classify as PREVENTIVE_CARE");

        // Candidate pet name must be Sylo
        String candidate = routerService.extractCandidatePetName(msg);
        assertEquals("Sylo", candidate, "Must extract Sylo as candidate pet name");

        // Routing plan must include PATIENT_CONTEXT and VECTOR_KNOWLEDGE
        RetrievalPlan plan = routerService.createRetrievalPlan(msg, intent, true);
        assertEquals("Sylo", plan.getCandidatePetName());
        assertTrue(plan.hasSource(RetrievalPlan.EvidenceSource.PATIENT_CONTEXT));
        assertTrue(plan.hasSource(RetrievalPlan.EvidenceSource.VECTOR_KNOWLEDGE));

        // Mock DB ownership and records
        when(userRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(petRepository.findByOwner(owner)).thenReturn(List.of(sylo));
        when(medicalRecordRepository.findByPetIdOrderByExaminationDateDesc(100L)).thenReturn(List.of());
        when(vaccinationRecordRepository.findByPetIdOrderByDateAdministeredDesc(100L)).thenReturn(List.of());
        when(knowledgeBaseService.hasKnowledge(any())).thenReturn(true);
        when(knowledgeBaseService.getKnowledgeForIntent(any())).thenReturn("WSAVA Feline Deworming Guidelines");

        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), OWNER_EMAIL, false);

        assertNotNull(response);
        String reply = response.getMessage();

        // 1. Must recognize Sylo and Cat species
        assertTrue(reply.toLowerCase().contains("sylo") && (reply.toLowerCase().contains("cat") || reply.toLowerCase().contains("kitten") || reply.toLowerCase().contains("persian")),
                "Response must recognize Sylo as a cat/kitten");

        // 2. Must detect and explain the age discrepancy
        assertTrue(reply.toLowerCase().contains("age clarification") || reply.toLowerCase().contains("2 months") || reply.toLowerCase().contains("1 year"),
                "Response must highlight the discrepancy between stated 2 months and registered 1 year");

        // 3. Must state no deworming treatment recorded (not that he never received one)
        assertTrue(reply.toLowerCase().contains("no deworming treatment recorded"),
                "Response must accurately report no treatment recorded in PetZoe database");

        // 4. Must provide kitten protocol and safety warnings
        assertTrue(reply.toLowerCase().contains("permethrin") || reply.toLowerCase().contains("feline"),
                "Response must provide feline safety warning");

        // 5. Must provide actionable next steps
        assertTrue(reply.toLowerCase().contains("veterinarian") || reply.toLowerCase().contains("pediatric scale"),
                "Response must advise veterinary weighing and consultation");
    }

    @Test
    @DisplayName("PATIENT-CONTEXT: Cannot access another user's pet even if name is known")
    void testCannotAccessAnotherUsersPet() {
        User otherUser = new User("Other", "other@petverse.com", "pass", "999", "Pet Owner");
        otherUser.setId(99L);
        Pet otherPet = new Pet("SecretPet", "Dog", "Beagle", 2, "Female", 10.0, "Up-to-date", otherUser);

        when(userRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(petRepository.findByOwner(owner)).thenReturn(List.of(sylo)); // owner only has Sylo

        PatientContextDTO context = patientContextService.resolvePatientContext(OWNER_EMAIL, "SecretPet", "Is SecretPet due for deworming?");

        assertFalse(context.isAccessAuthorized(), "Access to other user's pet must be denied");
        assertTrue(context.isNotFound(), "Must report pet not found under authenticated user");
        assertNull(context.getPetId(), "Pet ID must not be leaked");
    }

    @Test
    @DisplayName("PATIENT-CONTEXT: Ambiguous name matching multiple pets triggers clarification")
    void testMultiplePetsMatchTriggersClarification() {
        Pet sylo1 = new Pet("Sylo Junior", "Cat", "Persian", 1, "Male", 4.0, "Up-to-date", owner);
        Pet sylo2 = new Pet("Sylo Senior", "Cat", "Persian", 5, "Male", 6.0, "Up-to-date", owner);

        when(userRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(petRepository.findByOwner(owner)).thenReturn(List.of(sylo1, sylo2));

        PatientContextDTO context = patientContextService.resolvePatientContext(OWNER_EMAIL, "Sylo", "Should I deworm Sylo?");

        assertFalse(context.isAccessAuthorized());
        assertTrue(context.isMultipleMatchesFound(), "Must detect multiple matching pets");
        assertEquals(2, context.getMatchingPetNames().size());
    }

    @Test
    @DisplayName("SCENARIO-C: Canine and puppy resting vital signs answered with clinical ranges")
    void testScenarioCVitalSignsQuery() {
        String msg = "What is a normal heart rate for a dog, and how does it differ for a puppy?";
        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), null, true);

        assertNotNull(response);
        String reply = response.getMessage();
        assertTrue(reply.contains("60 to 140") || reply.contains("60–140"), "Must state adult dog heart rate range 60-140 bpm");
        assertTrue(reply.contains("120 to 200") || reply.contains("120–200"), "Must state puppy heart rate range 120-200 bpm");
    }

    @Test
    @DisplayName("SCENARIO-D: Dog egg consumption answered with safe preparation and nutritional value")
    void testScenarioDEggNutritionQuery() {
        String msg = "Can dogs eat eggs?";
        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), null, true);

        assertNotNull(response);
        String reply = response.getMessage();
        assertTrue(reply.toLowerCase().contains("cooked"), "Must emphasize eggs should be cooked");
        assertTrue(reply.toLowerCase().contains("protein"), "Must highlight protein/amino acid value");
        assertTrue(reply.toLowerCase().contains("raw") || reply.toLowerCase().contains("salmonella"), "Must mention raw egg safety boundary");
    }

    @Test
    @DisplayName("SCENARIO-E: Wet vs Dry food differences explained with hydration and dental benefits")
    void testScenarioEWetVsDryFoodComparison() {
        String msg = "Explain the difference between wet and dry pet food.";
        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), null, true);

        assertNotNull(response);
        String reply = response.getMessage();
        assertTrue(reply.toLowerCase().contains("moisture") || reply.toLowerCase().contains("hydration"), "Must explain moisture/hydration benefits of wet food");
        assertTrue(reply.toLowerCase().contains("kibble") || reply.toLowerCase().contains("dry"), "Must explain dry kibble convenience/energy density");
    }

    @Test
    @DisplayName("SCENARIO-F: Dog limping triage provides activity restriction and warns against human NSAIDs")
    void testScenarioFLimpingSymptomTriage() {
        String msg = "What should I do if my dog is limping?";
        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), null, true);

        assertNotNull(response);
        String reply = response.getMessage();
        assertTrue(reply.toLowerCase().contains("restrict") || reply.toLowerCase().contains("rest"), "Must advise resting/restricting activity");
        assertTrue(reply.toLowerCase().contains("human") || reply.toLowerCase().contains("paracetamol") || reply.toLowerCase().contains("ibuprofen"),
                "Must warn against administering human painkillers");
        assertTrue(reply.toLowerCase().contains("paw") || reply.toLowerCase().contains("toes"), "Must recommend inspecting paws");
    }

    @Test
    @DisplayName("SCENARIO-G: Rabbit anorexia recognized as GI stasis life-threatening emergency")
    void testScenarioGRabbitAnorexiaEmergencyTriage() {
        String msg = "Why is my rabbit not eating?";
        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), null, true);

        assertNotNull(response);
        String reply = response.getMessage();
        assertTrue(reply.toLowerCase().contains("gi stasis") || reply.toLowerCase().contains("stasis") || reply.toLowerCase().contains("ileus"),
                "Must identify Gastrointestinal Stasis");
        assertTrue(reply.toLowerCase().contains("emergency") || reply.toLowerCase().contains("immediately"),
                "Must urge immediate emergency exotics veterinary care");
    }

    @Test
    @DisplayName("SCENARIO-H: Puppy behavioral training promotes positive reinforcement and potty routines")
    void testScenarioHPuppyTrainingGuidance() {
        String msg = "How can I train my puppy?";
        AiChatResponseDTO response = chatService.processMessage(new AiChatRequestDTO(msg, null), null, true);

        assertNotNull(response);
        String reply = response.getMessage();
        assertTrue(reply.toLowerCase().contains("positive reinforcement"), "Must recommend positive reinforcement");
        assertTrue(reply.toLowerCase().contains("potty") || reply.toLowerCase().contains("crate") || reply.toLowerCase().contains("schedule"),
                "Must outline house-training / crate protocols");
    }
}
