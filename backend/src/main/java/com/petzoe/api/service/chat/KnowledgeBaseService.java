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

        knowledgeArticles.put("PREVENTIVE_CARE",
                "**CAPC & WSAVA Guidelines for Deworming & Parasite Control**:\n" +
                "- **Puppy & Kitten Protocol**: Puppies and kittens should begin preventive deworming at 2-3 weeks of age, repeated every 2-3 weeks until 12 weeks of age (at 2, 4, 6, 8, 10, 12 weeks), followed by monthly treatments until 6 months. Therefore, at 2 months (8 weeks) old, routine deworming is strongly recommended and is standard veterinary practice.\n" +
                "- **Common Parasites**: Roundworms (*Toxocara*) and hookworms (*Ancylostoma*) passed through mother's milk (transmammary) or placenta, plus tapeworms from fleas.\n" +
                "- **Anthelmintics**: Common veterinary medications include pyrantel pamoate, fenbendazole, or veterinary spot-ons approved for age and weight.\n" +
                "- **Critical Safety Alert**: NEVER give dog dewormers or flea medications to cats (permethrin is fatal to felines). Never use human medications. Accurate weighing on a pediatric scale is required before dosing.\n" +
                "- **Next Step**: Consult a licensed veterinarian on PetZoe to weigh the pet and prescribe the exact safe medication and dosage.");

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
