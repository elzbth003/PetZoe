package com.petzoe.api.service.chat.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Automatically seeds the PostgreSQL knowledge corpus with verified veterinary guidelines
 * from WSAVA, AAHA, and AVMA on application startup.
 */
@Component
public class KnowledgeCorpusInitializer {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeCorpusInitializer.class);

    private final KnowledgeIngestionService ingestionService;

    public KnowledgeCorpusInitializer(KnowledgeIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedKnowledgeCorpus() {
        try {
            log.info("Starting initialization of PetZoe Vector Knowledge Corpus...");

            // 1. WSAVA Vaccination Protocol
            ingestionService.ingestDocument(
                    "WSAVA Global Guidelines for Vaccination of Dogs and Cats",
                    "VACCINATION",
                    "World Small Animal Veterinary Association (WSAVA)",
                    "https://wsava.org/global-guidelines/vaccination-guidelines/",
                    "2024.1",
                    """
                    # Core Canine Vaccination Guidelines
                    Core vaccination protects canines from severe, potentially fatal systemic diseases globally.
                    The core vaccines for all domestic dogs regardless of lifestyle are:
                    1. Canine Distemper Virus (CDV)
                    2. Canine Adenovirus (CAV-1 and CAV-2: Infectious Canine Hepatitis)
                    3. Canine Parvovirus-2 (CPV-2)
                    4. Rabies Virus (where mandated by regional legislation or in endemic regions).
                    
                    ### Puppy Core Administration Schedule
                    Puppies should receive their initial core vaccine at 6 to 8 weeks of age, followed by boosters every 2 to 4 weeks until 16 weeks of age or older.
                    The final puppy dose at 16 weeks is crucial to overcome interfering Maternally Derived Antibodies (MDA).
                    A booster vaccination is recommended at 26 weeks or 12 months of age, and subsequently core revaccinations should occur at intervals of 3 years.
                    
                    ### Non-Core Canine Vaccines
                    Non-core vaccines are selected based on lifestyle, geographic risk, and exposure:
                    - Leptospirosis (multivalent bacterin administered annually in endemic/wetland regions).
                    - Bordetella bronchiseptica and Canine Parainfluenza (Kennel Cough, recommended for boarding/socializing dogs).
                    - Borrelia burgdorferi (Lyme disease for tick-endemic habitats).
                    
                    # Core Feline Vaccination Guidelines
                    The core vaccines for domestic cats are:
                    1. Feline Parvovirus (FPV / Panleukopenia)
                    2. Feline Herpesvirus-1 (FHV-1)
                    3. Feline Calicivirus (FCV)
                    4. Rabies Virus (endemic or legally required areas).
                    
                    Feline Leukemia Virus (FeLV) is strongly recommended for all kittens under 1 year of age and adult cats with outdoor access.
                    """
            );

            // 2. AAHA & WSAVA Nutrition & Toxic Substances
            ingestionService.ingestDocument(
                    "AAHA and WSAVA Global Pet Nutritional and Toxicity Guidelines",
                    "NUTRITION",
                    "American Animal Hospital Association & WSAVA",
                    "https://wsava.org/global-guidelines/global-nutrition-guidelines/",
                    "2023.2",
                    """
                    # Emergency Dietary Toxicities in Pets
                    The following common household foods and substances are strictly toxic to canines and felines:
                    1. Chocolate and Cocoa: Contains theobromine and caffeine. Can cause tachycardia, cardiac arrhythmias, seizures, and death.
                    2. Grapes, Raisins, and Currants: Ingestion can trigger catastrophic acute idiosyncratic oliguric renal failure in canines.
                    3. Xylitol / Birch Bark Extract: Found in sugar-free gum, peanut butter, and baked goods. Induces massive insulin surge causing acute hypoglycemia and fulminant hepatic necrosis.
                    4. Allium Family (Onions, Garlic, Leeks, Chives): Contain organosulfur compounds causing oxidative damage to erythrocytes, leading to hemolytic anemia and Heinz body formation.
                    5. Macadamia Nuts: Cause posterior paresis, ataxia, hyperthermia, and tremors in canines.
                    6. Cooked Poultry Bones: High risk of splintering, esophageal perforation, gastric laceration, and obstructive impaction.
                    
                    # Species-Appropriate Balanced Diets
                    - Cats are obligate carnivores requiring essential animal-derived amino acids, particularly Taurine, Arginine, and preformed Vitamin A. Taurine deficiency causes dilated cardiomyopathy (DCM) and central retinal degeneration.
                    - Canine nutrition requires balanced proportions of complete proteins, omega-3 and omega-6 fatty acids (EPA/DHA), and controlled calcium-phosphorus ratios to support skeletal integrity.
                    """
            );

            // 3. Clinical Hygiene, Dental, and Dermatological Care
            ingestionService.ingestDocument(
                    "AVMA and AAHA Clinical Hygiene, Dental, and Coat Care Standards",
                    "PET_HYGIENE",
                    "American Veterinary Medical Association",
                    "https://www.avma.org/resources-tools/pet-owners/petcare",
                    "2024.1",
                    """
                    # Periodontal Hygiene and Dental Prevention
                    Over 80% of dogs and 70% of cats exhibit clinical signs of periodontal disease by 3 years of age.
                    Daily or alternate-day brushing with veterinary enzymatic toothpaste (never human fluoride toothpaste which causes gastric toxicity) is the clinical gold standard.
                    Veterinary Oral Health Council (VOHC) accepted dental chews and water additives serve as secondary plaque inhibitors.
                    
                    # Ear Canal Hygiene and Otitis Prevention
                    Perform weekly otic examinations for erythema, ceruminous discharge, or foul odor.
                    Use dedicated veterinary astringent ear cleansers with cotton pads. Never insert cotton-tipped applicators (Q-tips) into the vertical or horizontal ear canal to avoid tympanic membrane rupture.
                    
                    # Parasite Control Protocol
                    Maintain uninterrupted year-round broad-spectrum chemoprophylaxis against fleas (Ctenocephalides felis), ticks (Ixodes, Rhipicephalus), heartworms (Dirofilaria immitis), and intestinal nematodes.
                    """
            );

            // 4. PetZoe Digital Platform Integration Guide
            ingestionService.ingestDocument(
                    "PetZoe Integrated Healthcare Platform Architecture and Features",
                    "PLATFORM_HELP",
                    "PetZoe Core Engineering",
                    "https://petzoe.com/docs/platform",
                    "2.1.0",
                    """
                    # PetZoe Digital Platform Ecosystem
                    PetZoe is a complete pet health management and community ecosystem:
                    1. Pet ID and Profile Tracking: Every registered pet receives a universal permanent Pet ID (`petCode`, e.g. PZ-PET-XXXXXX). Access pet profiles, weights, and medical records from `/dashboard/owner`.
                    2. Certified Veterinary Appointments: Browse verified clinics, schedule telehealth or physical consultations, and view real-time appointment statuses under `/dashboard/owner?tab=Appointments`.
                    3. Electronic Prescriptions: Review active medication regimens, dosages, and doctor notes issued during consultations under the Medical Records section.
                    4. Pet Adoption and Rehoming: Explore verified shelter listings at `/adopt` and community foster/rehoming boards at `/rehoming`.
                    5. Verified Marketplace: Purchase certified pet foods, supplements, and accessories with integrated secure payments at `/marketplace`.
                    """
            );

            // 5. CAPC and WSAVA Guidelines for Deworming and Endoparasite Control in Puppies and Kittens
            ingestionService.ingestDocument(
                    "CAPC and WSAVA Guidelines for Deworming and Pediatric Parasite Control in Dogs and Cats",
                    "PREVENTIVE_CARE",
                    "Companion Animal Parasite Council (CAPC) & WSAVA",
                    "https://capcvet.org/guidelines/general-guidelines/",
                    "2024.2",
                    """
                    # Pediatric and Young Animal Deworming Protocols
                    Intestinal parasites are extremely common in young puppies and kittens due to maternal transmission (transmammary roundworms and hookworms through nursing in kittens and puppies, plus transplacental transmission in puppies) and early environmental contamination.
                    
                    ### Core Kitten Deworming Schedule
                    Kittens should begin preventive anthelmintic treatment at 2 to 3 weeks of age.
                    Repeat deworming every 2 to 3 weeks until 12 weeks of age (standard intervals: 2, 4, 6, 8, 10, and 12 weeks).
                    Therefore, at 2 months (8 weeks) of age, deworming is strongly recommended and is an essential core component of routine preventive veterinary pediatric care.
                    After 12 weeks of age, kittens should receive monthly parasite preventive treatments until 6 months of age.
                    Adult cats should maintain year-round broad-spectrum parasite protection or be dewormed at intervals of 1 to 3 months based on lifestyle (indoor vs. outdoor) and veterinary fecal examination results.
                    
                    ### Core Puppy Deworming Schedule
                    Puppies should begin preventive deworming at 2 weeks of age.
                    Repeat treatment every 2 weeks until 8 weeks of age (at 2, 4, 6, and 8 weeks).
                    At 2 months (8 weeks) of age, deworming is standard, essential, and strongly recommended.
                    Continue monthly preventive treatments until 6 months of age, followed by year-round adult broad-spectrum heartworm and intestinal parasite prevention.
                    
                    ### Common Intestinal Parasites
                    1. Roundworms (Toxocara cati in cats, Toxocara canis in dogs): Cause pot-bellied appearance, unthriftiness, vomiting, diarrhea, and poor weight gain. Zoonotic potential (visceral and ocular larva migrans in humans).
                    2. Hookworms (Ancylostoma tubaeforme in cats, Ancylostoma caninum in dogs): Ingest blood through intestinal mucosa; cause severe life-threatening anemia, dark tarry stools (melena), and lethargy in young puppies and kittens.
                    3. Tapeworms (Dipylidium caninum): Transmitted via ingestion of infected fleas during grooming. Taenia species transmitted through prey ingestion.
                    4. Giardia and Coccidia: Protozoan parasites causing watery, foul-smelling diarrhea requiring specific veterinary diagnostics.
                    
                    ### Anthelmintic Medications and Critical Safety Boundaries
                    - Pediatric Veterinary Formulations: Pyrantel pamoate is the clinical gold standard for young puppies and kittens against roundworms and hookworms. Fenbendazole offers broader coverage (roundworms, hookworms, whipworms, and Giardia). Praziquantel is indicated for cestodes (tapeworms).
                    - Strict Species Safety Alert: NEVER administer canine deworming, flea, or tick medications to cats. Products formulated for dogs often contain permethrin, organophosphates, or concentrations that cause fatal neurotoxicity in felines.
                    - Accurate Weight-Based Dosing: Veterinary anthelmintics MUST be dosed strictly according to the animal's exact body weight using an accurate calibrated pediatric scale. Under-dosing causes treatment failure and resistance, while overdosing can cause systemic toxicity.
                    - Minimum Age and Weight Thresholds: Many topical combination spot-on treatments require a minimum age of 8 or 9 weeks and a minimum body weight threshold (e.g., 0.5 kg to 1.0 kg).
                    - Diagnostic Protocol: A microscopic fecal floatation examination (centrifugation technique) should be conducted by a veterinarian to confirm parasite burden and verify treatment efficacy.
                    """
            );

            log.info("PetZoe Vector Knowledge Corpus successfully initialized and ready for semantic retrieval.");
        } catch (Exception e) {
            log.error("Failed to seed knowledge corpus: {}", e.getMessage(), e);
        }
    }
}
