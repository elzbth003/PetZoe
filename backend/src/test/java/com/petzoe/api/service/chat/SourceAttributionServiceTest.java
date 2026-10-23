package com.petzoe.api.service.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petzoe.api.dto.AiCitationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SourceAttributionServiceTest {

    private SourceAttributionService attributionService;

    @BeforeEach
    void setUp() {
        attributionService = new SourceAttributionService(new ObjectMapper());
    }

    @Test
    @DisplayName("Citations referenced in LLM response are marked as CITED_IN_RESPONSE")
    void testValidateAndFilterCitations_Referenced() {
        List<AiCitationDTO> candidates = new ArrayList<>();
        AiCitationDTO c1 = new AiCitationDTO(1, "WSAVA Vaccination Guidelines", "wsava.org", "https://wsava.org/vaccine",
                "2024", "2026-10-23", "Core vaccines include rabies and parvovirus.", "CURATED_WHITELIST", "HYBRID_RAG", "OFFICIAL_GUIDELINE");
        c1.setSpecies("Canine");

        AiCitationDTO c2 = new AiCitationDTO(2, "CAPC Deworming Protocol", "capcvet.org", "https://capcvet.org/deworming",
                "2024", "2026-10-23", "Kittens require deworming every 2-3 weeks.", "CURATED_WHITELIST", "HYBRID_RAG", "OFFICIAL_GUIDELINE");
        c2.setSpecies("Feline");

        candidates.add(c1);
        candidates.add(c2);

        String llmResponse = "According to WSAVA guidelines [1], core vaccination begins at 6-8 weeks of age.";

        List<AiCitationDTO> result = attributionService.validateAndFilterCitations(candidates, llmResponse);

        assertEquals(2, result.size());
        assertTrue(result.get(0).isReferencedInResponse());
        assertEquals("CITED_IN_RESPONSE", result.get(0).getCitationStatus());
        assertEquals("Canine", result.get(0).getSpecies());

        assertFalse(result.get(1).isReferencedInResponse());
        assertEquals("RETRIEVED_BACKGROUND", result.get(1).getCitationStatus());
        assertEquals("Feline", result.get(1).getSpecies());
    }

    @Test
    @DisplayName("Hallucinated citation indices outside candidate range do not cause failures")
    void testValidateAndFilterCitations_HallucinatedIndex() {
        List<AiCitationDTO> candidates = new ArrayList<>();
        AiCitationDTO c1 = new AiCitationDTO(1, "AAHA Diabetes Care", "aaha.org", "https://aaha.org/diabetes",
                "2024", "2026-10-23", "Insulin monitoring guidelines.", "CURATED_WHITELIST", "HYBRID_RAG", "OFFICIAL_GUIDELINE");
        candidates.add(c1);

        String llmResponse = "Treatment requires strict adherence to dietary plans [99] and routine checkups [1].";

        List<AiCitationDTO> result = attributionService.validateAndFilterCitations(candidates, llmResponse);

        assertEquals(1, result.size());
        assertTrue(result.get(0).isReferencedInResponse());
        assertEquals("CITED_IN_RESPONSE", result.get(0).getCitationStatus());
    }

    @Test
    @DisplayName("Null or empty response leaves candidates marked as RETRIEVED_BACKGROUND")
    void testValidateAndFilterCitations_EmptyResponse() {
        List<AiCitationDTO> candidates = List.of(
                new AiCitationDTO(1, "Test", "test.org", "https://test.org", "2024", "2026-10-23", "Snippet", "WHITELIST", "WEB", "GENERAL")
        );

        List<AiCitationDTO> result = attributionService.validateAndFilterCitations(candidates, "");
        assertEquals(1, result.size());
        assertFalse(result.get(0).isReferencedInResponse());
        assertEquals("RETRIEVED_BACKGROUND", result.get(0).getCitationStatus());
    }

    @Test
    @DisplayName("Serialization and deserialization of citations preserve research metadata")
    void testJsonSerializationRoundtrip() {
        AiCitationDTO c = new AiCitationDTO(1, "WSAVA Guidelines", "wsava.org", "https://wsava.org",
                "2024", "2026-10-23", "Snippet text", "TRUSTED", "HYBRID_RAG", "OFFICIAL_GUIDELINE");
        c.setSpecies("Canine");
        c.setDoi("10.1111/jsap.13700");
        c.setLicense("CC-BY-NC-ND");
        c.setReferencedInResponse(true);
        c.setCitationStatus("CITED_IN_RESPONSE");

        String json = attributionService.toJson(List.of(c));
        assertNotNull(json);

        List<AiCitationDTO> deserialized = attributionService.fromJson(json);
        assertEquals(1, deserialized.size());
        assertEquals("Canine", deserialized.get(0).getSpecies());
        assertEquals("10.1111/jsap.13700", deserialized.get(0).getDoi());
        assertEquals("OFFICIAL_GUIDELINE", deserialized.get(0).getEvidenceType());
        assertTrue(deserialized.get(0).isReferencedInResponse());
        assertEquals("CITED_IN_RESPONSE", deserialized.get(0).getCitationStatus());
    }
}
