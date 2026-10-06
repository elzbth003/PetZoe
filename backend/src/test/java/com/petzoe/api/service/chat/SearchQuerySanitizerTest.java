package com.petzoe.api.service.chat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SearchQuerySanitizerTest {

    private SearchQuerySanitizer sanitizer;

    @BeforeEach
    void setUp() {
        sanitizer = new SearchQuerySanitizer();
    }

    @Test
    @DisplayName("Removes email and phone number from search query")
    void testRemoveEmailAndPhone() {
        String raw = "What is the latest research on canine parvovirus? Contact me at owner@example.com or +1-555-0199";
        String cleaned = sanitizer.sanitizeForWebSearch(raw);

        assertNotNull(cleaned);
        assertFalse(cleaned.contains("owner@example.com"));
        assertFalse(cleaned.contains("555-0199"));
        assertTrue(cleaned.contains("canine parvovirus"));
    }

    @Test
    @DisplayName("Removes JWT and UUID tokens from search query")
    void testRemoveTokensAndUuid() {
        String raw = "Search current guidelines with token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.test and session 123e4567-e89b-12d3-a456-426614174000";
        String cleaned = sanitizer.sanitizeForWebSearch(raw);

        assertNotNull(cleaned);
        assertFalse(cleaned.contains("eyJ"));
        assertFalse(cleaned.contains("123e4567"));
        assertTrue(cleaned.contains("current guidelines"));
    }

    @Test
    @DisplayName("Converts personal possessives while preserving species and veterinary topic")
    void testPreserveSpeciesAndTopic() {
        String raw = "Based on Buddy's medical record, what is the latest treatment for canine dermatitis?";
        String cleaned = sanitizer.sanitizeForWebSearch(raw);

        assertNotNull(cleaned);
        assertFalse(cleaned.contains("Buddy"));
        assertTrue(cleaned.toLowerCase().contains("canine"));
        assertTrue(cleaned.toLowerCase().contains("dermatitis"));
    }

    @Test
    @DisplayName("Returns null for empty or purely sensitive queries")
    void testEmptyOrPurePIIQuery() {
        String piiOnly = "password123 user@example.com";
        String cleaned = sanitizer.sanitizeForWebSearch(piiOnly);
        assertTrue(cleaned == null || cleaned.isBlank());
    }
}
