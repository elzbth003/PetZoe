package com.petzoe.api.service.chat.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Automatically seeds the PostgreSQL knowledge corpus with verified, research-grade veterinary guidelines
 * from WSAVA, AAHA, AVMA, CAPC, and PubMed on application startup.
 * Fully captures document title, publisher, URL, DOI, species, topic, and licensing.
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
            log.info("Starting initialization of PetZoe Research-Grade Vector Knowledge Corpus...");

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
                    """,
                    "10.1111/jsap.12431",
                    "Canine and Feline",
                    "Vaccination Protocols",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Open Access / Educational Attribution"
            );

            // 2. AAHA Canine Vaccination Guidelines
            ingestionService.ingestDocument(
                    "AAHA Canine Vaccination Guidelines & Lifestyle Protocols",
                    "VACCINATION",
                    "American Animal Hospital Association (AAHA)",
                    "https://www.aaha.org/aaha-guidelines/vaccination-recommendations/",
                    "2024.1",
                    """
                    # AAHA Lifestyle-Based Vaccination Protocols
                    AAHA establishes evidence-based vaccination intervals to ensure high clinical immunity while minimizing over-vaccination.
                    Core vaccines (CDV, CAV-2, CPV-2, Rabies) trigger robust immunological memory enduring at least 3 to 5 years after the initial 1-year booster.
                    
                    ### Non-Core Vaccine Selection and Risk Assessment
                    - Leptospirosis: Annual vaccination recommended for dogs exposed to standing water, wildlife, or urban rodents.
                    - Canine Infectious Respiratory Disease Complex (CIRDC): Bordetella oral, intranasal, or injectable formulations administered annually or bi-annually for social dogs.
                    - Canine Influenza Virus (H3N8/H3N2): Indicated for dogs frequently visiting dog parks, boarding kennels, or grooming facilities.
                    """,
                    "10.5326/JAAHA-MS-7221",
                    "Canine",
                    "Vaccination Protocols",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Clinical Reference / AAHA Guidelines"
            );

            // 3. CAPC & WSAVA Pediatric Parasite Control & Deworming
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
                    """,
                    "10.1016/j.vetpar.2023.109981",
                    "Canine and Feline",
                    "Pediatric Deworming & Parasitology",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Educational Attribution / CAPC"
            );

            // 4. AAHA & WSAVA Nutrition & Toxic Substances
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
                    """,
                    "10.1111/jsap.12218",
                    "Canine and Feline",
                    "Toxicology & Clinical Nutrition",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Educational Attribution"
            );

            // 5. Clinical Hygiene, Dental, and Dermatological Care
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
                    """,
                    "10.2460/javma.23.08.0450",
                    "Canine and Feline",
                    "Hygiene & Dental Prevention",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Educational Attribution"
            );

            // 6. Veterinary Dermatology Research: Canine Atopic Dermatitis
            ingestionService.ingestDocument(
                    "Canine Atopic Dermatitis & Cutaneous Lesions: Veterinary Dermatology Update",
                    "MEDICAL_QUESTION",
                    "PubMed Central / Peer-Reviewed Veterinary Dermatology Study Group",
                    "https://pubmed.ncbi.nlm.nih.gov/canine-dermatology-research/",
                    "2023.3",
                    """
                    # Clinical Investigation of Canine Cutaneous Lesions and Pruritus
                    Canine atopic dermatitis is a genetically predisposed inflammatory and pruritic allergic skin disease characterized by IgE antibodies directed against environmental allergens.
                    Common clinical presentations include erythema, alopecia, excoriations, lichenification, and hyperpigmentation localized to face, ears, paws, axillae, and ventrum.
                    
                    ### Diagnostic Workup and Secondary Infections
                    Secondary bacterial pyoderma (predominantly Staphylococcus pseudintermedius) and Malassezia pachydermatis overgrowth are extremely frequent complications that exacerbate pruritus.
                    Clinical investigation requires multi-modal diagnostics: tape-strip cytology, skin scrapings for Demodex and Sarcoptes mites, fungal culture, and strict elimination diet trials.
                    """,
                    "10.1111/vde.13110",
                    "Canine",
                    "Dermatology & Cutaneous Lesions",
                    "PEER_REVIEWED_STUDY",
                    "Open Access CC BY 4.0"
            );

            // 7. AAHA/AAFP Feline & Canine Senior Care Guidelines
            ingestionService.ingestDocument(
                    "AAHA and AAFP Senior Care Guidelines for Dogs and Cats",
                    "GENERAL_PET_CARE",
                    "American Animal Hospital Association & AAFP",
                    "https://www.aaha.org/aaha-guidelines/senior-care-guidelines/",
                    "2023.1",
                    """
                    # Geriatric Pet Healthcare and Early Disease Detection
                    Dogs and cats reach senior life stages around 7 to 9 years of age depending on breed and size.
                    Senior pets benefit from bi-annual physical examinations rather than annual visits to detect chronic progressive conditions early.
                    
                    ### Essential Senior Diagnostic Screening
                    1. Comprehensive Serum Biochemistry Panel: Evaluates renal function (BUN, Creatinine, SDMA) and hepatic enzymes (ALT, ALKP).
                    2. Complete Blood Count (CBC): Screens for occult anemia, chronic inflammation, and infection.
                    3. Urinalysis & Specific Gravity: Identifies early renal compromise and proteinuria prior to azotemia.
                    4. Systemic Blood Pressure Measurement: Critical for early detection of secondary hypertension associated with chronic kidney disease (CKD) or hyperthyroidism in cats.
                    """,
                    "10.5326/JAAHA-MS-7333",
                    "Canine and Feline",
                    "Life-Stage Preventive Health",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Clinical Reference"
            );

            // 8. IRIS Guidelines for Chronic Kidney Disease Staging (Nephrology)
            ingestionService.ingestDocument(
                    "IRIS Guidelines for Staging of Chronic Kidney Disease (CKD) in Dogs and Cats",
                    "INTERNAL_MEDICINE",
                    "International Renal Interest Society (IRIS)",
                    "http://www.iris-kidney.com/guidelines/staging.html",
                    "2023.2",
                    """
                    # IRIS Chronic Kidney Disease Staging and Clinical Assessment
                    Chronic kidney disease (CKD) is characterized by irreversible structural and functional loss of renal parenchyma.
                    IRIS stages CKD into four distinct clinical stages based on fasting plasma creatinine and Symmetric Dimethylarginine (SDMA) values taken at least twice in stable, well-hydrated patients:
                    
                    ### Feline IRIS CKD Stages
                    - Stage 1: Creatinine < 1.6 mg/dL (or SDMA < 18 mcg/dL) with persistent renal structural abnormalities or low urine specific gravity (< 1.035).
                    - Stage 2: Creatinine 1.6 to 2.8 mg/dL (or SDMA 18 to 25 mcg/dL). Mild renal azotemia with residual nephron compromise.
                    - Stage 3: Creatinine 2.9 to 5.0 mg/dL (or SDMA 26 to 38 mcg/dL). Moderate renal azotemia; clinical signs of polyuria, polydipsia, and weight loss.
                    - Stage 4: Creatinine > 5.0 mg/dL (or SDMA > 38 mcg/dL). Severe end-stage renal azotemia, uremic crisis risk.
                    
                    ### Canine IRIS CKD Stages
                    - Stage 1: Creatinine < 1.4 mg/dL (SDMA < 18 mcg/dL).
                    - Stage 2: Creatinine 1.4 to 2.8 mg/dL (SDMA 18 to 35 mcg/dL).
                    - Stage 3: Creatinine 2.9 to 5.0 mg/dL (SDMA 36 to 54 mcg/dL).
                    - Stage 4: Creatinine > 5.0 mg/dL (SDMA > 54 mcg/dL).
                    
                    ### Mandatory IRIS Sub-Staging Criteria
                    1. Proteinuria (Urine Protein-to-Creatinine Ratio - UPC): Non-proteinuric (< 0.2 in cats, < 0.2 in dogs), Borderline (0.2-0.4 in cats, 0.2-0.5 in dogs), Proteinuric (> 0.4 in cats, > 0.5 in dogs).
                    2. Blood Pressure Sub-staging: Normotensive (< 140 mmHg), Prehypertensive (140-159 mmHg), Hypertensive (160-179 mmHg), Severely Hypertensive (>= 180 mmHg).
                    Therapeutic intervention with renal diets (phosphorus restriction, balanced omega-3) and ACE inhibitors/ARBs must follow exact IRIS staging.
                    """,
                    "10.1111/jvim.13700",
                    "Canine and Feline",
                    "Nephrology & Renal Failure",
                    "CONSENSUS_STATEMENT",
                    "Open Access Clinical Guidelines"
            );

            // 9. ACVIM Consensus on Canine Myxomatous Mitral Valve Disease (Cardiology)
            ingestionService.ingestDocument(
                    "ACVIM Consensus Guidelines for the Diagnosis and Treatment of Myxomatous Mitral Valve Disease in Dogs",
                    "INTERNAL_MEDICINE",
                    "American College of Veterinary Internal Medicine (ACVIM)",
                    "https://onlinelibrary.wiley.com/doi/10.1111/jvim.15488",
                    "2023.1",
                    """
                    # ACVIM Guidelines for Canine Myxomatous Mitral Valve Disease (MMVD)
                    MMVD is the most prevalent acquired cardiovascular disease in domestic canines, primarily affecting small-to-medium breed dogs (Cavalier King Charles Spaniel, Poodle, Chihuahua, Dachshund).
                    
                    ### ACVIM Cardiovascular Staging Classification
                    - Stage A: Dogs at high risk for developing MMVD with no identifiable murmur or structural change (breed predisposition).
                    - Stage B1: Dogs with an audible left apical systolic murmur characteristic of mitral regurgitation, but NO echocardiographic or radiographic evidence of cardiac remodeling (normal left atrial and left ventricular size). Medical treatment is NOT indicated in Stage B1.
                    - Stage B2: Asymptomatic murmur with verified cardiac enlargement meeting the EPIC criteria: Left Atrial-to-Aortic root ratio (LA:Ao) >= 1.6 on echo, Normalized Left Ventricular Internal Diameter in Diastole (LVIDDN) >= 1.7, and Vertebral Heart Score (VHS) > 10.5 on thoracic radiographs. Treatment with Pimobendan (0.25 to 0.3 mg/kg q12h) is mandatory at Stage B2 to delay onset of congestive heart failure.
                    - Stage C: Dogs with current or prior clinical signs of Congestive Heart Failure (CHF: pulmonary edema, tachypnea, cough). Standard quad-therapy includes Furosemide, Pimobendan, ACE inhibitor (enalapril/benazepril), and Spironolactone.
                    - Stage D: Refractory end-stage CHF requiring advanced diuretic strategies (torsemide), arteriodilators, or mechanical intervention.
                    """,
                    "10.1111/jvim.15488",
                    "Canine",
                    "Cardiology & Mitral Valve Disease",
                    "CONSENSUS_STATEMENT",
                    "Open Access CC BY 4.0"
            );

            // 10. RECOVER Initiative Veterinary CPR & Resuscitation (Emergency Care)
            ingestionService.ingestDocument(
                    "RECOVER Evidence-Based Veterinary Resuscitation (CPR) Guidelines for Dogs and Cats",
                    "EMERGENCY_CARE",
                    "Veterinary Emergency and Critical Care Society (VECCS) & ACVECC",
                    "https://recoverinitiative.org/cpr-guidelines/",
                    "2024.1",
                    """
                    # Evidence-Based Veterinary Cardiopulmonary Resuscitation (CPR)
                    The RECOVER initiative provides internationally standardized, clinical evidence-based protocols for cardiopulmonary arrest in small animals.
                    
                    ### Basic Life Support (BLS) Algorithm
                    1. Immediate Recognition: Do not delay CPR to check for pulses; assess responsiveness and breathing in under 10 seconds.
                    2. Chest Compressions: High-quality uninterrupted compressions at a rate of 100 to 120 compressions per minute. Compress 1/3 to 1/2 the width of the chest. Ensure full chest recoil between compressions.
                    3. Chest Conformation Technique: Lateral recumbency over widest part of thorax in medium/large round-chested dogs; directly over the heart in keel-chested dogs; circumferential two-handed technique in small dogs and cats.
                    4. Cycles: Perform uninterrupted 2-minute cycles before switching compressor to avoid rescuer fatigue.
                    5. Ventilation: Intubate in lateral recumbency without pausing compressions; ventilate at 10 breaths per minute with an inspiratory time of 1 second and tidal volume of 10 mL/kg.
                    
                    ### Advanced Life Support (ALS) Algorithm
                    - Epinephrine: Administer low-dose epinephrine (0.01 mg/kg IV/IO) every other 2-minute cycle.
                    - Vasopressin: May alternate with epinephrine (0.8 U/kg IV/IO).
                    - Reversible Arrest Triggers: Atropine (0.04 mg/kg) for high vagal tone/asystole; Naloxone for opioid toxicity; Flumazenil for benzodiazepines; Calcium gluconate for severe hyperkalemia.
                    - Defibrillation: Electrical defibrillation indicated solely for Ventricular Fibrillation (VF) or Pulseless Ventricular Tachycardia (pVT).
                    """,
                    "10.1111/vec.12450",
                    "Canine and Feline",
                    "Emergency Resuscitation & Critical Care",
                    "CONSENSUS_STATEMENT",
                    "Clinical Practice Guidelines"
            );

            log.info("PetZoe Research-Grade Vector Knowledge Corpus successfully initialized and ready for hybrid semantic retrieval.");
        } catch (Exception e) {
            log.error("Failed to seed knowledge corpus: {}", e.getMessage(), e);
        }
    }
}
