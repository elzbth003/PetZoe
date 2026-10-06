package com.petzoe.api.service.chat;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Evaluates user intent, keyword freshness requirements, and user authentication context
 * to select the optimal, secure RetrievalMode.
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

    private static final List<Pattern> PERSONAL_PETZOE_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(my\\s+pet|my\\s+pets|my\\s+dog|my\\s+cat|my\\s+puppy|my\\s+kitten)\\b"),
            Pattern.compile("(?i)\\b(my\\s+appointment\\w*|my\\s+appointments|next\\s+appointment|booked\\s+visit)\\b"),
            Pattern.compile("(?i)\\b(my\\s+vaccin\\w*|my\\s+medical|my\\s+prescription\\w*|my\\s+records?)\\b"),
            Pattern.compile("(?i)\\b(registered\\s+pet|pet\\s+code|pet\\s+id|show\\s+pets|list\\s+pets)\\b"),
            Pattern.compile("(?i)\\b(is\\s+[A-Za-z0-9_]+\\s+vaccinated|vaccination\\s+history|when\\s+is\\s+my)\\b"),
            Pattern.compile("(?i)\\b([A-Za-z0-9_]+'s\\s+(?:next\\s+)?(?:vaccin\\w*|medical|record\\w*|appointment\\w*|shot\\w*|dose|history))\\b"),
            Pattern.compile("(?i)\\b(?:vaccin\\w*\\s+record|vaccination\\s+status|vaccine\\s+record|immunization\\s+record)\\b"),
            Pattern.compile("(?i)\\bPZ-PET-[A-Z0-9]+\\b"),
            Pattern.compile("(?i)\\b(?:of|for)\\s+(?:my|the)\\s+pet\\b")
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
        return PERSONAL_PETZOE_PATTERNS.stream().anyMatch(p -> p.matcher(message).find());
    }

    public RetrievalMode determineRoute(String message, ChatIntent intent, boolean isAuthenticated) {
        if (intent == ChatIntent.EMERGENCY || intent == ChatIntent.GREETING) {
            return RetrievalMode.NO_RETRIEVAL;
        }

        // Rule 1: Personal user data MUST NEVER route to web search
        if (isPersonalPetZoeQuery(message, intent)) {
            return RetrievalMode.PETZOE_ONLY;
        }

        // Rule 2: Platform database transactional browsing (marketplace, adoption, vet directory)
        if (intent == ChatIntent.VETERINARIAN_SEARCH || intent == ChatIntent.ADOPTION ||
                intent == ChatIntent.SHELTER || intent == ChatIntent.MARKETPLACE ||
                intent == ChatIntent.PLATFORM_HELP) {
            return RetrievalMode.PETZOE_ONLY;
        }

        // Rule 3: Clinical safety question with no general research query
        if (intent == ChatIntent.MEDICAL_QUESTION) {
            boolean asksForResearch = isWebSearchRequired(message);
            if (asksForResearch) {
                return RetrievalMode.WEB_ONLY;
            }
            return RetrievalMode.NO_RETRIEVAL;
        }

        // Rule 4: Evaluates need for web search on veterinary topics
        boolean needsWeb = isWebSearchRequired(message);
        if (needsWeb) {
            if (intent == ChatIntent.VACCINATION || intent == ChatIntent.NUTRITION ||
                    intent == ChatIntent.PET_HYGIENE || intent == ChatIntent.GROOMING) {
                return RetrievalMode.KNOWLEDGE_PLUS_WEB;
            }
            return RetrievalMode.WEB_ONLY;
        }

        // Rule 5: Standard general pet care / knowledge base
        if (intent == ChatIntent.VACCINATION || intent == ChatIntent.NUTRITION ||
                intent == ChatIntent.GROOMING || intent == ChatIntent.PET_HYGIENE ||
                intent == ChatIntent.PET_BEHAVIOR || intent == ChatIntent.GENERAL_PET_CARE) {
            return RetrievalMode.KNOWLEDGE_BASE_ONLY;
        }

        return RetrievalMode.NO_RETRIEVAL;
    }
}
