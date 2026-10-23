package com.petzoe.api.service.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiChatModelServiceTest {

    private GeminiChatModelService service;

    @BeforeEach
    void setUp() {
        service = new GeminiChatModelService(new ObjectMapper());
        ReflectionTestUtils.setField(service, "modelName", "gemini-1.5-flash");
        ReflectionTestUtils.setField(service, "fallbackModel", "gemini-1.5-flash");
        ReflectionTestUtils.setField(service, "provider", "GEMINI");
        ReflectionTestUtils.setField(service, "temperature", 0.4);
    }

    @Test
    @DisplayName("Provider name indicates grounded local when API key is unpopulated")
    void testProviderNameOffline() {
        ReflectionTestUtils.setField(service, "apiKey", "");
        assertEquals("PETZOE_GROUNDED_LOCAL", service.getProviderName());

        ReflectionTestUtils.setField(service, "apiKey", null);
        assertEquals("PETZOE_GROUNDED_LOCAL", service.getProviderName());
    }

    @Test
    @DisplayName("Provider name indicates live Gemini when API key is set")
    void testProviderNameOnline() {
        ReflectionTestUtils.setField(service, "apiKey", "AIzaSyTestKey123");
        assertEquals("GEMINI (gemini-1.5-flash)", service.getProviderName());
    }

    @Test
    @DisplayName("Model identifier validation accepts valid IDs and rejects malicious input")
    void testModelIdentifierValidation() {
        assertTrue(service.isValidModelIdentifier("gemini-1.5-flash"));
        assertTrue(service.isValidModelIdentifier("gemini-1.5-pro"));
        assertTrue(service.isValidModelIdentifier("tunedModels/petzoe-vet-v1"));
        assertTrue(service.isValidModelIdentifier("models/gemini-2.0-flash"));

        assertFalse(service.isValidModelIdentifier(""));
        assertFalse(service.isValidModelIdentifier("   "));
        assertFalse(service.isValidModelIdentifier(null));
        assertFalse(service.isValidModelIdentifier("model with spaces"));
        assertFalse(service.isValidModelIdentifier("gemini?key=injection&param=val"));
        assertFalse(service.isValidModelIdentifier("model;rm -rf /"));
        assertFalse(service.isValidModelIdentifier("../../../etc/passwd"));
    }

    @Test
    @DisplayName("Circuit breaker trips to OPEN after threshold consecutive failures")
    void testCircuitBreakerTripping() {
        assertFalse(service.isCircuitOpen());
        assertEquals(0, service.getFailureCount());

        // Simulate failed calls by setting API key to invalid endpoint
        ReflectionTestUtils.setField(service, "apiKey", "test-key-invalid");
        ReflectionTestUtils.setField(service, "modelName", "tunedModels/nonexistent-model");

        // Execute calls that will fail and trigger fallback
        for (int i = 0; i < GeminiChatModelService.CIRCUIT_FAILURE_THRESHOLD; i++) {
            String resp = service.generateResponse("System", "Context", "Hello", List.of());
            assertNotNull(resp);
        }

        assertTrue(service.isCircuitOpen(), "Circuit breaker should be OPEN after threshold failures");
        assertTrue(service.getFailureCount() >= GeminiChatModelService.CIRCUIT_FAILURE_THRESHOLD);

        // Reset circuit
        service.resetCircuit();
        assertFalse(service.isCircuitOpen());
        assertEquals(0, service.getFailureCount());
    }

    @Test
    @DisplayName("Grounded rule engine responds accurately for clinical questions when offline")
    void testGroundedClinicalFallback() {
        ReflectionTestUtils.setField(service, "apiKey", "");

        // Deworming query
        String dewormingResp = service.generateResponse("System", "", "Should I deworm my 2 month old kitten?", List.of());
        assertNotNull(dewormingResp);
        assertTrue(dewormingResp.contains("deworming") || dewormingResp.contains("CAPC") || dewormingResp.contains("parasite"));

        // Toxicity query
        String toxicResp = service.generateResponse("System", "", "Can I feed my dog chocolate and onions?", List.of());
        assertNotNull(toxicResp);
        assertTrue(toxicResp.contains("Prohibited") || toxicResp.contains("Chocolate") || toxicResp.contains("Fatal"));
    }
}
