package com.petzoe.api.service.chat;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Evaluates user intent, pet identity, keyword freshness requirements, and authentication context
 * to select a composable RetrievalPlan and corresponding RetrievalMode.
 */
@Service
public class RetrievalRouterService {

    private static final List<Pattern> WEB_RETRIEVAL_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(latest|current|recent|newest|updated|today|this\\s+year)\\b"),
            Pattern.compile("(?i)\\b(recent\\s+research|latest\\s+study|latest\\s+research|recent\\s+studies|clinical\\s+study)\\b"),
            Pattern.compile("(?i)\\b(current\\s+guideline|current\\s+recommendation|new\\s+guideline|latest\\s+recommendation)\\b"),
            Pattern.compile("(?i)\\b(wsava|aaha|avma|who|cdc|pubmed)\\b"),
            Pattern.compile("(?i)\\b(new\\s+treatment\\s+guidelines|current\\s+regulation|latest\\s+product\\s+information)\\b"),
            Pattern.compile("(?i)\\b(research\\s+(?:about|on)|studies\\s+(?:about|on)|literature\\s+on)\\b")
    );

    private static final List<Pattern> PERSONAL_RECORD_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(my\\s+appointment\\w*|my\\s+appointments|next\\s+appointment|booked\\s+visit)\\b"),
            Pattern.compile("(?i)\\b(my\\s+vaccin\\w*|my\\s+medical|my\\s+prescription\\w*|my\\s+records?)\\b"),
            Pattern.compile("(?i)\\b(show\\s+(?:me\\s+)?(?:my\\s+)?(?:registered\\s+)?pets?|list\\s+(?:my\\s+)?pets?)\\b"),
            Pattern.compile("(?i)\\b(is\\s+[A-Za-z0-9_]+\\s+vaccinated|vaccination\\s+history|when\\s+is\\s+my)\\b"),
            Pattern.compile("(?i)\\b([A-Za-z0-9_]+'s\\s+(?:next\\s+)?(?:vaccin\\w*|medical|record\\w*|appointment\\w*|shot\\w*|dose|history))\\b"),
            Pattern.compile("(?i)\\b(?:vaccin\\w*\\s+record|vaccination\\s+status|vaccine\\s+record|immunization\\s+record)\\b"),
            Pattern.compile("(?i)\\bPZ-PET-[A-Z0-9]+\\b")
    );

    public boolean isWebSearchRequired(String message) {
        if (message == null || message.isBlank()) return false;
        return WEB_RETRIEVAL_PATTERNS.stream().anyMatch(p -> p.matcher(message).find());
    }

    public boolean isPersonalPetZoeQuery(String message, ChatIntent intent) {
        if (intent == ChatIntent.PET_INFORMATION || intent == ChatIntent.APPOINTMENT ||
                intent == ChatIntent.MEDICAL_RECORD || intent == ChatIntent.PRESCRIPTION_HISTORY) {
            return true;
        }
        if (message == null || message.isBlank()) return false;
        return PERSONAL_RECORD_PATTERNS.stream().anyMatch(p -> p.matcher(message).find());
    }

    public boolean isVetAvailabilityQuery(String message) {
        if (message == null || message.isBlank()) return false;
        String lower = message.toLowerCase();
        return lower.contains("available") || lower.contains("free slot") ||
                lower.contains("open slot") || lower.contains("slots tomorrow") || lower.contains("slots today") ||
                lower.contains("vet tomorrow") || lower.contains("doctor tomorrow") || lower.contains("appointment slot") ||
                lower.matches(".*\\b(is dr\\.?|can i book|when is dr\\.?|available on|available tomorrow|available today|clinic hours)\\b.*");
    }

    public String extractCandidatePetName(String message) {
        if (message == null || message.isBlank()) return null;

        // 1. Permanent Pet ID
        Matcher idMatcher = Pattern.compile("(?i)\\b(PZ-PET-[A-Z0-9]+)\\b").matcher(message);
        if (idMatcher.find()) {
            return idMatcher.group(1).toUpperCase();
        }

        // 2. Possessive pet name: e.g. "Sylo's", "Bruno's"
        Matcher possMatcher = Pattern.compile("(?i)\\b([A-Za-z0-9_]{2,25})'s\\b").matcher(message);
        if (possMatcher.find()) {
            String candidate = possMatcher.group(1);
            if (!isStopWord(candidate)) {
                return candidate;
            }
        }

        // 3. Phrasing like: "Is Buddy vaccinated?", "Does Bruno need..."
        Matcher isMatcher = Pattern.compile("(?i)\\b(?:is|does|can|will|has|check)\\s+([A-Za-z0-9_]{2,25})\\s+(?:vaccinated|due|need|have|sick|eating|schedule|record)\\b").matcher(message);
        if (isMatcher.find()) {
            String candidate = isMatcher.group(1);
            if (!isStopWord(candidate)) {
                return candidate;
            }
        }

        // 4. Phrasing like: "pet Sylo", "cat Sylo", "dog Bruno"
        Matcher prefixMatcher = Pattern.compile("(?i)\\b(?:pet|dog|cat|puppy|kitten)\\s+([A-Za-z0-9_]{2,25})\\b").matcher(message);
        if (prefixMatcher.find()) {
            String candidate = prefixMatcher.group(1);
            if (!isStopWord(candidate)) {
                return candidate;
            }
        }

        // 5. Phrasing like: "for Sylo", "of Sylo", "named Sylo"
        Matcher ofMatcher = Pattern.compile("(?i)\\b(?:for|of|named|called)\\s+([A-Za-z0-9_]{2,25})\\b").matcher(message);
        if (ofMatcher.find()) {
            String candidate = ofMatcher.group(1);
            if (!isStopWord(candidate)) {
                return candidate;
            }
        }

        return null;
    }

    private boolean isStopWord(String word) {
        if (word == null) return true;
        String w = word.toLowerCase();
        return w.equals("is") || w.equals("are") || w.equals("a") || w.equals("an") || w.equals("the") ||
               w.equals("my") || w.equals("our") || w.equals("your") || w.equals("all") ||
               w.equals("pet") || w.equals("pets") || w.equals("dog") || w.equals("dogs") ||
               w.equals("cat") || w.equals("cats") || w.equals("puppy") || w.equals("puppies") ||
               w.equals("kitten") || w.equals("kittens") || w.equals("details") || w.equals("profile") ||
               w.equals("record") || w.equals("records") || w.equals("history") || w.equals("vaccine") ||
               w.equals("vaccination") || w.equals("medicine") || w.equals("medication") || w.equals("food") ||
               w.equals("diet") || w.equals("care") || w.equals("help") || w.equals("today") ||
               w.equals("him") || w.equals("her") || w.equals("it") || w.equals("them") || w.equals("here") ||
               w.equals("dr") || w.equals("doctor");
    }

    /**
     * Constructs a fine-grained, composable RetrievalPlan specifying all required sources.
     */
    public RetrievalPlan createRetrievalPlan(String message, ChatIntent intent, boolean isAuthenticated) {
        RetrievalPlan plan = new RetrievalPlan();
        String candidatePet = extractCandidatePetName(message);
        plan.setCandidatePetName(candidatePet);

        if (intent == ChatIntent.EMERGENCY) {
            plan.addSource(RetrievalPlan.EvidenceSource.EMERGENCY_SAFETY);
            plan.setMode(RetrievalMode.NO_RETRIEVAL);
            return plan;
        }

        if (intent == ChatIntent.GREETING) {
            plan.setMode(RetrievalMode.NO_RETRIEVAL);
            return plan;
        }

        // Live Veterinarian Availability routing
        if (intent == ChatIntent.VET_AVAILABILITY) {
            plan.addSource(RetrievalPlan.EvidenceSource.LIVE_VET_AVAILABILITY);
            plan.setMode(RetrievalMode.VET_AVAILABILITY_ONLY);
            return plan;
        }

        // Personal pet vaccination query (e.g. "Is Buddy vaccinated?") -> PETZOE_ONLY
        if (intent == ChatIntent.VACCINATION && candidatePet != null && isAuthenticated) {
            String lower = (message != null) ? message.toLowerCase() : "";
            boolean isPersonalStatusCheck = lower.startsWith("is ") || lower.contains("status") || lower.contains("record") ||
                    !isWebSearchRequired(message) && !lower.contains("protocol") && !lower.contains("schedule") && !lower.contains("guideline");
            if (isPersonalStatusCheck) {
                plan.addSource(RetrievalPlan.EvidenceSource.DATABASE_RECORDS);
                plan.addSource(RetrievalPlan.EvidenceSource.PATIENT_CONTEXT);
                plan.setMode(RetrievalMode.PETZOE_ONLY);
                return plan;
            }
        }

        // Pure research queries (e.g. "What is the latest research on canine skin lesions?") -> WEB_ONLY
        if (intent == ChatIntent.MEDICAL_QUESTION && isWebSearchRequired(message) && candidatePet == null) {
            String lower = (message != null) ? message.toLowerCase() : "";
            if (lower.contains("latest research") || lower.contains("recent research") ||
                lower.contains("clinical study") || lower.contains("latest study") ||
                lower.contains("recent studies") || lower.contains("literature on")) {
                plan.addSource(RetrievalPlan.EvidenceSource.WEB_KNOWLEDGE);
                plan.setMode(RetrievalMode.WEB_ONLY);
                return plan;
            }
        }

        // Check if query is clinical / preventive / healthcare / nutrition / hygiene
        boolean isClinicalCare = (intent == ChatIntent.PREVENTIVE_CARE ||
                                  intent == ChatIntent.VACCINATION ||
                                  intent == ChatIntent.GENERAL_PET_CARE ||
                                  intent == ChatIntent.MEDICAL_QUESTION ||
                                  intent == ChatIntent.NUTRITION ||
                                  intent == ChatIntent.PET_HYGIENE ||
                                  intent == ChatIntent.GROOMING ||
                                  intent == ChatIntent.PET_BEHAVIOR);

        if (isClinicalCare) {
            plan.addSource(RetrievalPlan.EvidenceSource.VECTOR_KNOWLEDGE);

            boolean needsWeb = isWebSearchRequired(message);
            if (needsWeb) {
                plan.addSource(RetrievalPlan.EvidenceSource.WEB_KNOWLEDGE);
            }

            boolean needsVetAvailability = isVetAvailabilityQuery(message);
            if (needsVetAvailability) {
                plan.addSource(RetrievalPlan.EvidenceSource.LIVE_VET_AVAILABILITY);
            }

            if (candidatePet != null && isAuthenticated) {
                plan.addSource(RetrievalPlan.EvidenceSource.PATIENT_CONTEXT);
                if (needsVetAvailability) {
                    plan.setMode(RetrievalMode.CLINICAL_PLUS_VET_AVAILABILITY);
                } else {
                    plan.setMode(needsWeb ? RetrievalMode.PETZOE_PLUS_KNOWLEDGE_PLUS_WEB : RetrievalMode.PETZOE_PLUS_KNOWLEDGE);
                }
            } else {
                if (needsVetAvailability) {
                    plan.setMode(RetrievalMode.CLINICAL_PLUS_VET_AVAILABILITY);
                } else {
                    plan.setMode(needsWeb ? RetrievalMode.KNOWLEDGE_PLUS_WEB : RetrievalMode.KNOWLEDGE_BASE_ONLY);
                }
            }
            return plan;
        }

        // Pure database lookups
        if (intent == ChatIntent.PET_INFORMATION || intent == ChatIntent.APPOINTMENT ||
                intent == ChatIntent.MEDICAL_RECORD || intent == ChatIntent.PRESCRIPTION_HISTORY) {
            plan.addSource(RetrievalPlan.EvidenceSource.DATABASE_RECORDS);
            if (candidatePet != null && isAuthenticated) {
                plan.addSource(RetrievalPlan.EvidenceSource.PATIENT_CONTEXT);
            }
            plan.setMode(RetrievalMode.PETZOE_ONLY);
            return plan;
        }

        // Public marketplace / shelter / vet directory
        if (intent == ChatIntent.VETERINARIAN_SEARCH || intent == ChatIntent.ADOPTION ||
                intent == ChatIntent.SHELTER || intent == ChatIntent.MARKETPLACE ||
                intent == ChatIntent.PLATFORM_HELP) {
            plan.addSource(RetrievalPlan.EvidenceSource.DATABASE_RECORDS);
            plan.setMode(RetrievalMode.PETZOE_ONLY);
            return plan;
        }

        plan.setMode(RetrievalMode.NO_RETRIEVAL);
        return plan;
    }

    public RetrievalMode determineRoute(String message, ChatIntent intent, boolean isAuthenticated) {
        return createRetrievalPlan(message, intent, isAuthenticated).getMode();
    }
}
