package com.petzoe.api.service.chat;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class KnowledgeBaseService {

    private final Map<String, String> knowledgeArticles = new HashMap<>();

    public KnowledgeBaseService() {
        initializeKnowledgeBase();
    }

    private void initializeKnowledgeBase() {
        knowledgeArticles.put("VACCINATION", 
                "**Core Veterinary Vaccination Protocol (WSAVA Guidelines)**:\n" +
                "- **Dogs Core**: DHPP (Distemper, Hepatitis/Adenovirus, Parvovirus, Parainfluenza) starting at 6-8 weeks, boosted every 3-4 weeks until 16 weeks, then 1 year, and every 3 years thereafter. Rabies vaccine is legally mandated starting at 12-16 weeks with regular booster intervals.\n" +
                "- **Dogs Non-Core**: Leptospirosis, Bordetella (Kennel Cough), Lyme disease depending on lifestyle and regional exposure.\n" +
                "- **Cats Core**: FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) and Rabies.\n" +
                "- **Cats Non-Core**: FeLV (Feline Leukemia Virus) strongly advised for outdoor/multicat cats.");

        knowledgeArticles.put("NUTRITION", 
                "**Pet Nutritional Guidelines & Toxic Substances**:\n" +
                "- **Strictly Prohibited & Toxic**: Chocolate (theobromine), Grapes/Raisins (acute renal failure), Xylitol/Birch sugar (severe hypoglycemia/liver collapse), Onions/Garlic/Chives (hemolytic anemia), Macadamia nuts, cooked poultry bones (splintering).\n" +
                "- **Essential Diet**: High-protein species-appropriate diets balanced with omega-3/6 fatty acids, taurine (critical for cats), and clean fresh water available 24/7.\n" +
                "- **Portion Control**: Measured by weight, age, and activity level to prevent canine/feline obesity.");

        knowledgeArticles.put("PET_HYGIENE", 
                "**Preventive Dental & Coat Hygiene Guidelines**:\n" +
                "- **Dental**: Over 80% of dogs and cats show periodontal disease by age 3. Daily or alternate-day enzymatic pet toothpaste (never human fluoride toothpaste) and veterinary dental chews significantly reduce plaque.\n" +
                "- **Ears**: Weekly inspection for redness, wax buildup, or yeasty odor. Clean with veterinary ear cleanser using cotton pads, never insert Q-tips into ear canals.\n" +
                "- **Parasite Prevention**: Year-round broad-spectrum protection against fleas, ticks, and intestinal worms.");

        knowledgeArticles.put("GROOMING", 
                "**Pet Grooming Best Practices**:\n" +
                "- **Bathing**: Dogs generally require bathing once every 3-6 weeks depending on coat type using pH-balanced dog shampoo. Cats typically self-groom but benefit from regular brushing.\n" +
                "- **Nails**: Trim every 2-4 weeks. Ensure nail clipper avoids the 'quick' (blood vessel). Have styptic powder ready.\n" +
                "- **Brushing**: Reduces shedding and prevents painful matting.");

        knowledgeArticles.put("PLATFORM_HELP", 
                "**PetZoe Platform Features**:\n" +
                "- **Pet Management**: Register pets with universal lifetime Pet IDs (`petCode`), track weights and vaccination schedules (`/dashboard/owner`).\n" +
                "- **Veterinary Telehealth & Appointments**: Find certified doctors, book visits, and manage electronic prescriptions (`/dashboard/owner`).\n" +
                "- **Community Rehoming & Shelter Adoption**: Browse verified shelters and community pets (`/adopt` and `/rehoming`).\n" +
                "- **Pet Marketplace**: Shop certified food, supplements, and supplies (`/marketplace`).");
    }

    public String getKnowledgeForIntent(ChatIntent intent) {
        if (intent == null) return null;
        return knowledgeArticles.get(intent.name());
    }

    public boolean hasKnowledge(ChatIntent intent) {
        return intent != null && knowledgeArticles.containsKey(intent.name());
    }
}
