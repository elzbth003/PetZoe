package com.petzoe.api.service.chat;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class ChatSafetyService {

    private static final List<Pattern> EMERGENCY_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(severe\\s+bleeding|profuse\\s+bleeding|bleeding\\s+heavily|blood\\s+loss)\\b"),
            Pattern.compile("(?i)\\b(difficulty\\s+breathing|can'?t\\s+breathe|gasping|choking|struggling\\s+to\\s+breathe|blue\\s+tongue)\\b"),
            Pattern.compile("(?i)\\b(unconscious|passed\\s+out|unresponsive|collapsed|cannot\\s+wake\\s+up)\\b"),
            Pattern.compile("(?i)\\b(poison|poisoned|poisoning|antifreeze|rat\\s+poison|rodenticide|insecticide|ingested\\s+chemical)\\b"),
            Pattern.compile("(?i)\\b(seizure|seizures|convulsing|convulsions|foaming\\s+at\\s+mouth)\\b"),
            Pattern.compile("(?i)\\b(hit\\s+by\\s+car|broken\\s+bone|fracture|hit\\s+by\\s+a\\s+vehicle|severe\\s+trauma)\\b"),
            Pattern.compile("(?i)\\b(ate\\s+chocolate|ate\\s+grapes|ate\\s+raisins|ate\\s+xylitol|ate\\s+onion|ate\\s+garlic|ate\\s+lily|ate\\s+lilies)\\b"),
            Pattern.compile("(?i)\\b(cannot\\s+stand|unable\\s+to\\s+stand|paralyzed|paralysis|dragging\\s+legs)\\b"),
            Pattern.compile("(?i)\\b(severe\\s+allergic\\s+reaction|anaphylaxis|swollen\\s+face\\s+suddenly|eyes\\s+swollen\\s+shut)\\b")
    );

    private static final List<Pattern> MEDICAL_QUESTION_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(what\\s+disease|diagnose|diagnosis|do\\s+they\\s+have|does\\s+(he|she|it|my\\s+dog|my\\s+cat)\\s+have)\\b"),
            Pattern.compile("(?i)\\b(what\\s+medicine|what\\s+medication|what\\s+drug|prescribe|prescription\\s+for)\\b"),
            Pattern.compile("(?i)\\b((what|how\\s+much)\\s+(dosage|mg|dose|pill|medicine|antibiotic|medication)|dosage|dose)\\b"),
            Pattern.compile("(?i)\\b(red\\s+skin|scratching|vomiting|diarrhea|limping|lump|coughing|sneezing|eye\\s+discharge)\\b")
    );

    private static final List<Pattern> PROMPT_INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)\\b(ignore\\s+(all\\s+)?(previous|prior)\\s+instructions)\\b"),
            Pattern.compile("(?i)\\b(you\\s+are\\s+now\\s+in\\s+dan\\s+mode|jailbreak|bypass\\s+rules)\\b"),
            Pattern.compile("(?i)\\b(show\\s+(me\\s+)?(all\\s+)?(database|db|admin|users|passwords|credentials|api\\s*keys))\\b"),
            Pattern.compile("(?i)\\b(drop\\s+table|select\\s+\\*\\s+from|insert\\s+into|delete\\s+from)\\b")
    );

    public boolean isEmergency(String message) {
        if (message == null || message.isBlank()) return false;
        return EMERGENCY_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(message).find());
    }

    public boolean isMedicalQuestion(String message) {
        if (message == null || message.isBlank()) return false;
        return MEDICAL_QUESTION_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(message).find());
    }

    public boolean isPromptInjection(String message) {
        if (message == null || message.isBlank()) return false;
        return PROMPT_INJECTION_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(message).find());
    }

    public String generateEmergencyResponse() {
        return "🚨 **URGENT VETERINARY ALERT: Potential Pet Emergency Detected**\n\n" +
                "The symptoms or circumstances you described require immediate veterinary attention:\n" +
                "1. **Stay Calm & Keep Your Pet Still**: Do not administer human medications, induce vomiting without professional instruction, or offer food/water.\n" +
                "2. **Contact an Emergency Veterinarian Immediately**: Call your nearest emergency animal clinic or veterinary hospital right away.\n" +
                "3. **PetZoe Directory**: You can locate and call registered veterinarians directly through the PetZoe **Veterinarian Directory** on your dashboard.\n\n" +
                "_PetZoe AI Assistant is an informational tool and cannot replace immediate emergency clinical triage._";
    }

    public String formatMedicalSafetyGuidance(String symptomContext) {
        return "Physical symptoms such as skin changes, coughing, or gastrointestinal distress can stem from multiple varied underlying conditions. " +
                "Only a licensed veterinarian performing an in-person clinical examination and diagnostic tests can determine the exact cause and prescribe appropriate medication. " +
                "\n\n**Safety Note**: Never give human medication (e.g. Paracetamol/Acetaminophen, Ibuprofen) to pets as they can be fatal. " +
                "We strongly recommend booking a consultation with a certified veterinarian through PetZoe for accurate diagnosis and customized care.";
    }

    public ChatIntent detectIntent(String message) {
        if (message == null || message.isBlank()) {
            return ChatIntent.UNKNOWN;
        }

        String lower = message.toLowerCase().trim();

        if (isEmergency(lower)) {
            return ChatIntent.EMERGENCY;
        }

        if (lower.matches("^(hi|hello|hey|good\\s+(morning|afternoon|evening)|howdy).*") || lower.equals("hi") || lower.equals("hello")) {
            return ChatIntent.GREETING;
        }

        if (lower.contains("appointment") || lower.contains("consult") || lower.contains("book a vet") || lower.contains("schedule vet")) {
            return ChatIntent.APPOINTMENT;
        }

        if (lower.contains("vaccin") || lower.contains("rabies") || lower.contains("dhpp") || lower.contains("booster") || lower.contains("shot") || lower.contains("immuniz")) {
            return ChatIntent.VACCINATION;
        }

        if (lower.contains("medical record") || lower.contains("medical history") || lower.contains("clinical record") || lower.contains("health record") || lower.contains("health history") || lower.contains("diagnosis") || lower.contains("lab report") || lower.contains("treatment record")) {
            return ChatIntent.MEDICAL_RECORD;
        }

        if (lower.contains("prescription") || lower.contains("medication history") || lower.contains("rx")) {
            return ChatIntent.PRESCRIPTION_HISTORY;
        }

        if (lower.contains("find vet") || lower.contains("search vet") || lower.contains("veterinarian") || lower.contains("doctor") || lower.contains("clinic")) {
            return ChatIntent.VETERINARIAN_SEARCH;
        }

        if (lower.contains("deworm") || lower.contains("deworming") || lower.contains("worm") || lower.contains("parasite") || lower.contains("heartworm") || lower.contains("preventive care") || lower.contains("preventative care")) {
            return ChatIntent.PREVENTIVE_CARE;
        }

        if (lower.contains("shop") || lower.contains("buy") || lower.contains("marketplace") || lower.contains("product") || lower.contains("order")) {
            return ChatIntent.MARKETPLACE;
        }

        if (lower.contains("diet") || lower.contains("food") || lower.contains("nutrition") || lower.contains("feed") || lower.contains("calories")) {
            return ChatIntent.NUTRITION;
        }

        if (lower.contains("groom") || lower.contains("bath") || lower.contains("brush") || lower.contains("nail") || lower.contains("coat")) {
            return ChatIntent.GROOMING;
        }

        if (lower.contains("hygiene") || lower.contains("teeth") || lower.contains("dental") || lower.contains("ear cleaning") || lower.contains("flea") || lower.contains("tick")) {
            return ChatIntent.PET_HYGIENE;
        }

        if (lower.contains("behavior") || lower.contains("barking") || lower.contains("scratching furniture") || lower.contains("training") || lower.contains("anxiety") || lower.contains("aggression")) {
            return ChatIntent.PET_BEHAVIOR;
        }

        if (isMedicalQuestion(lower)) {
            return ChatIntent.MEDICAL_QUESTION;
        }

        boolean isExplicitPetProfileRequest = lower.matches(".*\\b(show|list|view|display|what|who|see|my registered)\\s+.*(pets?|dogs?|cats?|profile|code|id).*")
                || lower.equals("show me my registered pets")
                || lower.equals("show pets")
                || lower.equals("list pets")
                || lower.equals("my pets")
                || lower.equals("registered pets")
                || lower.matches("^(view\\s+)?(pet\\s+profile|profile\\s+of\\s+.*)$")
                || lower.matches("^pz-pet-[a-z0-9]+$")
                || (lower.contains("pet details") || lower.contains("pet code") || lower.contains("pet id"));

        if (isExplicitPetProfileRequest) {
            return ChatIntent.PET_INFORMATION;
        }


        if (lower.contains("adopt") || lower.contains("rehome") || lower.contains("rehoming") || lower.contains("hoe to adopt") || lower.contains("how to adopt")) {
            return ChatIntent.ADOPTION;
        }

        if (lower.contains("shelter") || lower.contains("rescue")) {
            return ChatIntent.SHELTER;
        }

        if (lower.contains("help") || lower.contains("how to use") || lower.contains("navigate") || lower.contains("petzoe")
                || lower.contains("register") || lower.contains("add pet") || lower.contains("add a pet") || lower.contains("how to add")
                || lower.contains("register a pet")) {
            return ChatIntent.PLATFORM_HELP;
        }

        return ChatIntent.GENERAL_PET_CARE;
    }
}
