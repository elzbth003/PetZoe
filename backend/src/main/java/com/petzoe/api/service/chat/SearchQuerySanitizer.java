package com.petzoe.api.service.chat;

import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Strips PII, authentication tokens, UUIDs, internal identifiers, and personal names,
 * while safely preserving contextual veterinary info (e.g. species, breed, medical topic).
 */
@Service
public class SearchQuerySanitizer {

    // Regex to detect and strip emails
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    // Regex to detect and strip phone numbers
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+?[0-9]{1,3}[-.\\s]?)?(\\(?[0-9]{2,4}\\)?[-.\\s]?)?[0-9]{3,4}[-.\\s]?[0-9]{3,4}");

    // Regex to detect and strip UUIDs and JWTs
    private static final Pattern UUID_PATTERN = Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
    private static final Pattern JWT_PATTERN = Pattern.compile("eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+");

    // Common pet name references (e.g., "my dog Buddy", "Buddy's", "my cat Luna")
    private static final Pattern PET_NAME_REFERENCE = Pattern.compile("(?i)\\b(my\\s+(?:dog|cat|puppy|kitten|pet)\\s+)?([A-Z][a-z]+)'s?\\b");

    // Internal ID patterns (e.g., ID: 1234, id=56, #PET123)
    private static final Pattern INTERNAL_ID_PATTERN = Pattern.compile("(?i)\\b(id[:=]\\s*\\d+|#?[A-Z]{2,5}\\d{3,}|user_id=\\d+|pet_id=\\d+)\\b");

    // Sensitive keyword indicators
    private static final Pattern SENSITIVE_KEYWORDS = Pattern.compile("(?i)\\b(password|secret|token|api_?key|bearer|credit\\s*card|ssn|dob)\\S*");

    // Common pet names list
    private static final Pattern COMMON_PET_NAMES = Pattern.compile("(?i)\\b(buddy|max|bella|charlie|luna|lucy|bailey|daisy|rocky|milo|oliver|leo|jack|toby|coco)\\b");

    public String sanitizeForWebSearch(String rawMessage) {
        if (rawMessage == null || rawMessage.isBlank()) {
            return null;
        }

        String cleaned = rawMessage;

        // Strip JWTs and tokens
        cleaned = JWT_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = UUID_PATTERN.matcher(cleaned).replaceAll("");

        // Strip Emails and Phone Numbers
        cleaned = EMAIL_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = PHONE_PATTERN.matcher(cleaned).replaceAll("");

        // Strip Internal IDs
        cleaned = INTERNAL_ID_PATTERN.matcher(cleaned).replaceAll("");

        // Strip Sensitive keywords and passwords
        cleaned = SENSITIVE_KEYWORDS.matcher(cleaned).replaceAll("");

        // Replace common possessives like "Buddy's medical record" -> "canine medical record"
        cleaned = cleaned.replaceAll("(?i)\\b([A-Z][a-z]+)'s\\s+(dog|puppy|canine)", "canine");
        cleaned = cleaned.replaceAll("(?i)\\b([A-Z][a-z]+)'s\\s+(cat|kitten|feline)", "feline");
        cleaned = cleaned.replaceAll("(?i)\\b(my\\s+dog|my\\s+puppy)\\s+([A-Z][a-z]+)", "canine");
        cleaned = cleaned.replaceAll("(?i)\\b(my\\s+cat|my\\s+kitten)\\s+([A-Z][a-z]+)", "feline");
        cleaned = cleaned.replaceAll("(?i)\\b[A-Z][a-z]+'s\\b", "canine");
        cleaned = COMMON_PET_NAMES.matcher(cleaned).replaceAll("canine");
        cleaned = cleaned.replaceAll("(?i)\\bmy\\s+dog's\\b", "canine");
        cleaned = cleaned.replaceAll("(?i)\\bmy\\s+cat's\\b", "feline");
        cleaned = cleaned.replaceAll("(?i)\\bmy\\s+pet's?\\b", "pet");

        // Clean punctuation and normalize spacing
        cleaned = cleaned.replaceAll("[\\r\\n]+", " ");
        cleaned = cleaned.replaceAll("[^a-zA-Z0-9\\s-]", " ");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();

        // Check if query is meaningful after stripping PII
        if (cleaned.length() < 3) {
            return null;
        }

        return cleaned;
    }
}
