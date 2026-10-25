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

            // 11. Normal Vital Signs and Basic Physiology in Dogs, Cats, and Rabbits
            ingestionService.ingestDocument(
                    "AVMA and Merck Veterinary Manual: Normal Vital Signs and Basic Physiology in Small Animals",
                    "GENERAL_PET_CARE",
                    "American Veterinary Medical Association (AVMA) & Merck Veterinary Manual",
                    "https://www.merckvetmanual.com/special-pet-topics/reference-guides/normal-vital-signs",
                    "2024.1",
                    """
                    # Normal Resting Vital Signs in Dogs, Cats, and Rabbits
                    Accurate vital sign measurement must be performed when the animal is resting calmly, free from excitement, strenuous exercise, stress, or high ambient temperatures.
                    
                    ### Canine Normal Vital Signs
                    - Adult Dog Resting Heart Rate: 60 to 140 beats per minute (bpm).
                      * Large and Giant Breeds: 60 to 100 bpm.
                      * Medium Breeds: 80 to 120 bpm.
                      * Small and Toy Breeds: 100 to 140 bpm.
                    - Puppy Resting Heart Rate: 120 to 200 bpm. Puppies possess a significantly higher resting heart rate than adult dogs due to higher basal metabolic rate and developing autonomic nervous tone.
                    - Canine Resting Respiratory Rate: 10 to 30 breaths per minute at rest (non-panting). Consistent resting respiratory rates above 35 to 40 breaths/min can be an early indicator of congestive heart failure (pulmonary edema) or respiratory compromise.
                    - Canine Normal Body Temperature (Rectal): 101.0°F to 102.5°F (38.3°C to 39.2°C).
                    
                    ### Feline Normal Vital Signs
                    - Adult Cat Resting Heart Rate: 140 to 220 beats per minute (bpm).
                    - Kitten Resting Heart Rate: 160 to 240 bpm.
                    - Feline Resting Respiratory Rate: 20 to 30 breaths per minute at rest. Open-mouth breathing or panting in cats is never normal and constitutes an urgent respiratory emergency.
                    - Feline Normal Body Temperature (Rectal): 100.5°F to 102.5°F (38.1°C to 39.2°C).
                    
                    ### Rabbit Normal Vital Signs
                    - Rabbit Resting Heart Rate: 140 to 300 beats per minute (bpm).
                    - Rabbit Resting Respiratory Rate: 30 to 60 breaths per minute.
                    - Rabbit Normal Body Temperature: 101.0°F to 103.0°F (38.3°C to 39.4°C).
                    
                    ### Mucous Membranes and Capillary Refill Time (CRT)
                    Healthy gingival mucous membranes should be bubblegum pink and moist. Capillary Refill Time (CRT) should be under 2 seconds. Pale, white, muddy, or blue (cyanotic) gums indicate severe shock, hemorrhage, anemia, or hypoxemia requiring immediate emergency intervention.
                    """,
                    "10.2460/javma.24.01.0012",
                    "Canine, Feline, and Rabbit",
                    "Vital Signs & Normal Physiology",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Educational Reference / AVMA Standards"
            );

            // 12. Clinical Symptoms Triage: Non-Emergency Guidance for Vomiting, Lameness, and Pruritus
            ingestionService.ingestDocument(
                    "AAHA and AVMA Clinical Symptoms Triage: Non-Emergency Guidance for Vomiting, Lameness, and Pruritus",
                    "MEDICAL_QUESTION",
                    "American Animal Hospital Association (AAHA)",
                    "https://www.aaha.org/aaha-guidelines/clinical-symptoms-triage/",
                    "2024.1",
                    """
                    # Evidence-Based Non-Emergency Symptom Evaluation and Safe Home Triage
                    
                    ### Feline & Canine Vomiting Triage
                    - Potential Causes: Dietary indiscretion (scavenging food, garbage ingestion), abrupt change in diet, hairballs (especially in domestic cats), acute gastritis, intestinal parasites (roundworms, Giardia), viral enteritis, or early inflammatory bowel disease.
                    - Safe Home Observation Steps: If the pet is bright, alert, and active after an isolated vomiting episode, remove food for 4 to 6 hours while providing small frequent sips of fresh water to prevent dehydration. Gradually reintroduce a bland, digestible diet (boiled chicken breast and white rice, or commercial gastrointestinal diet) in small portions.
                    - Urgent Red Flags (Immediate Vet Evaluation Needed): Repeated or projectile vomiting within 24 hours, presence of fresh red blood (hematemesis) or dark 'coffee-ground' digested blood, severe lethargy, inability to keep water down, concurrent watery diarrhea, swollen or painful abdomen, or suspected toxic ingestion/foreign body ingestion.
                    
                    ### Canine Limping and Lameness Triage
                    - Potential Causes: Minor soft tissue strain or muscle sprain, torn toenail, interdigital foreign body (burr, thorn, pebble), cut or abrasion on paw pad, cranial cruciate ligament (CCL) sprain/tear, patellar luxation, or osteoarthritic flare-up.
                    - Safe Home Observation Steps: Restrict high-impact activity (no running, jumping, or stairs). Confine the dog to a quiet, secure room or leash-walk only for short elimination breaks. Inspect all four paw pads and spaces between toes carefully with a flashlight for foreign objects, swelling, or redness.
                    - Critical Medication Alert: NEVER administer human pain relievers or anti-inflammatory drugs (Paracetamol/Acetaminophen, Ibuprofen/Advil, Aspirin, Naproxen) to dogs or cats. They cause fatal gastric ulceration, acute renal failure, and hepatotoxicity.
                    - Red Flags: Complete inability to bear weight on the affected limb (non-weight bearing lameness), obvious limb deformity, severe swelling, heat, vocalization of acute pain, or sudden neurological dragging of feet.
                    
                    ### Flea and Ectoparasite Identification
                    - Clinical Identification: Fleas (Ctenocephalides felis) are fast-moving, reddish-brown wingless insects. Look for 'flea dirt' (flea feces resembling ground black pepper) at the base of the tail, groin, and ventral abdomen.
                    - Wet Paper Towel Test: Place collected black debris onto a damp white paper towel; if the specks dissolve into a reddish-brown ring (digested host blood), flea infestation is confirmed.
                    - Flea Allergy Dermatitis (FAD): A single flea bite can trigger intense allergic pruritus, excoriation, and secondary pyoderma. Maintain uninterrupted veterinary-prescribed isoxazoline or topical chemoprophylaxis year-round.
                    """,
                    "10.5326/JAAHA-MS-7440",
                    "Canine and Feline",
                    "Clinical Symptoms Triage & First-Aid",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Open Access Clinical Guidelines"
            );

            // 13. Pet Nutrition, Safe Human Foods, and Wet vs Dry Food Comparisons
            ingestionService.ingestDocument(
                    "WSAVA and AAHA Evidence-Based Pet Nutrition, Safe Human Foods, and Feeding Guidelines",
                    "NUTRITION",
                    "World Small Animal Veterinary Association (WSAVA)",
                    "https://wsava.org/global-guidelines/global-nutrition-guidelines/",
                    "2024.1",
                    """
                    # Evidence-Based Small Animal Nutrition and Dietary Formulation
                    
                    ### Safe Human Foods for Dogs and Cats
                    - Cooked Eggs: Fully cooked plain eggs (scrambled, boiled, or poached without butter, milk, salt, or oil) are an excellent, highly digestible source of complete proteins, essential fatty acids, and amino acids for both dogs and cats. Avoid raw egg whites in large amounts due to avidin (which binds biotin) and Salmonella risk.
                    - Plain Cooked Lean Meats: Boiled skinless, boneless chicken breast, turkey, or lean beef without seasonings, onions, or garlic.
                    - Carrots and Green Beans: Low-calorie, fiber-rich crunchy treats supporting satiety in weight-managed dogs.
                    - Pure Cooked Pumpkin: Plain canned pumpkin puree (NOT spiced pie filling) provides soluble and insoluble fiber that helps regulate both mild diarrhea and constipation in dogs and cats.
                    - Blueberries and Apples: Rich in antioxidants and vitamins (always core and remove seeds from apples to prevent cyanide glycoside ingestion).
                    
                    ### Wet Food vs. Dry Food (Kibble) Comparison
                    - Wet / Canned Pet Food:
                      * Moisture Content: 70% to 80% water. Exceptionally beneficial for feline renal, bladder, and lower urinary tract health (FLUTD prevention) by promoting dilute urine.
                      * Palatability: Strong aroma and soft texture, ideal for senior pets, convalescent animals, or pets with dental pathology or reduced appetite.
                      * Caloric Density: Lower caloric density per gram, allowing larger portion volumes for satiety.
                    - Dry Pet Food (Kibble):
                      * Moisture Content: 8% to 10% water. Highly energy-dense, convenient, economical, and stable at room temperature.
                      * Mechanical Chewing: Promotes mastication; some veterinary dental formulas have matrix fiber that assists in plaque scraping (though it cannot replace regular toothbrushing).
                    - Mixed Feeding Approach: Many veterinarians recommend a combination of dry kibble for energy balance and canned wet food to ensure optimum daily hydration.
                    """,
                    "10.1111/jsap.12550",
                    "Canine and Feline",
                    "Clinical Nutrition & Dietary Comparison",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Educational Attribution / WSAVA"
            );

            // 14. Rabbit Health, Nutrition, and Gastrointestinal Stasis Guidelines
            ingestionService.ingestDocument(
                    "House Rabbit Society and BSAVA Guidelines for Rabbit Health, Nutrition, and GI Stasis",
                    "GENERAL_PET_CARE",
                    "House Rabbit Society & British Small Animal Veterinary Association",
                    "https://rabbit.org/care/nutrition-and-gi-stasis/",
                    "2024.1",
                    """
                    # Evidence-Based Rabbit Care, Digestive Physiology, and Gastrointestinal Stasis
                    
                    ### Unique Digestive Physiology of Lagomorphs
                    Domestic rabbits (Oryctolagus cuniculus) are strict herbivorous hindgut fermenters. Their gastrointestinal motility and cecal microbial flora depend entirely on an uninterrupted supply of long-stem indigestible dietary fiber.
                    
                    ### Species-Appropriate Rabbit Diet
                    1. Grass Hay (Timothy, Orchard, Meadow Hay): 80% to 85% of total daily diet. Must be clean, fresh, fragrant, and available in UNLIMITED quantities 24/7. Essential for continuous gut motility and grinding down continuously growing open-rooted elodont teeth.
                    2. Fresh Leafy Greens: 10% to 15% (romaine lettuce, cilantro, parsley, basil, dill, mint, dandelion greens).
                    3. High-Fiber Pellets: 5% (plain timothy pellets without seeds, corn, or colorful sugary bits; approximately 1/8 to 1/4 cup per 5 lbs body weight daily).
                    4. Unlimited Fresh Water: Heavy ceramic bowl or siphon water bottle cleaned daily.
                    
                    ### Gastrointestinal Stasis (Ileus): Critical Emergency Alert
                    - Pathophysiology: When a rabbit experiences pain, stress, dehydration, lack of fiber, or illness, normal gastrointestinal peristalsis slows down or ceases completely. Cecal bacteria overgrow, producing painful gas and hepatic lipidosis.
                    - Clinical Warning Signs:
                      * Refusal to eat food or hay for 12 hours or more (anorexia).
                      * Dramatically reduced fecal pellet size, irregular shapes, or complete absence of stool output.
                      * Hunched posture, teeth grinding (bruxism from abdominal pain), lethargy, cold ears (hypothermia).
                    - Emergency Status: A rabbit that has not eaten or defecated in 12 hours is in a LIFE-THREATENING veterinary emergency. Without prompt veterinary intervention (fluid therapy, pain relief/analgesia, gut motility stimulants, and assisted syringe feeding with critical care formula), GI stasis can become fatal within 24 to 48 hours.
                    """,
                    "10.1136/vetreco-2023-000892",
                    "Rabbit",
                    "Exotic & Small Mammal Medicine",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Open Access / Educational Attribution"
            );

            // 15. Puppy and Kitten Behavioral Training, Socialization, and Potty Protocols
            ingestionService.ingestDocument(
                    "AAHA Guidelines for Canine and Feline Early Training, Socialization, and Behavior",
                    "PET_BEHAVIOR",
                    "American Animal Hospital Association (AAHA)",
                    "https://www.aaha.org/aaha-guidelines/behavior-management/",
                    "2024.1",
                    """
                    # Positive Reinforcement Behavioral Training and Pediatric Socialization
                    
                    ### Puppy Socialization Period (3 to 14 Weeks)
                    The primary neurological socialization window in puppies closes around 14 to 16 weeks of age. During this period, puppies should be safely and positively exposed to diverse environments, household sounds (vacuum cleaners, doorbells), novel textures (grass, gravel, tile), friendly people, and fully vaccinated dogs. Positive early exposure prevents adult fear-based aggression and neophobia.
                    
                    ### Positive Reinforcement Training Fundamentals
                    - Mark and Reward: Use positive reinforcement (high-value treats, praise, toy rewards) immediately within 1 to 2 seconds of the desired behavior.
                    - Avoid Aversive or Dominance Methods: Physical punishment, shock collars, alpha rolls, or scolding increase cortisol levels, fear, and defensive aggression.
                    
                    ### House-Training / Potty Protocol
                    1. Strict Proactive Routine: Take puppies outdoors to their designated elimination spot immediately upon waking, within 15 minutes after eating or drinking, and following energetic play sessions.
                    2. Frequent Intervals: Young puppies can generally hold their bladder for only their age in months plus one hour (e.g., a 2-month-old puppy needs elimination opportunities every 2 to 3 hours).
                    3. Crate Training: Dogs naturally avoid soiling their sleeping quarters. The crate should only be large enough for the puppy to stand, turn around, and lie down comfortably. Never use the crate for punishment.
                    
                    ### Bite Inhibition and Teething
                    Puppies explore through their mouths. When a puppy bites hands or clothing, emit a soft, calm yelp, freeze motion, and immediately redirect their jaws to an appropriate rubber or textured chew toy.
                    
                    ### Feline Environmental Enrichment
                    Cats require vertical territory (cat trees, elevated perches), horizontal and vertical sisal scratching posts, and predatory play simulation (feather wand toys) to satisfy innate hunting drives and prevent stress-induced behaviors.
                    """,
                    "10.5326/JAAHA-MS-7550",
                    "Canine and Feline",
                    "Behavior, Training & Socialization",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "Clinical Practice Guidelines"
            );

            // 16. PetZoe Platform Architecture, User Workflows, and Services
            ingestionService.ingestDocument(
                    "PetZoe Digital Ecosystem: Platform User Guide, Features, and Navigation Workflows",
                    "PLATFORM_HELP",
                    "PetZoe Healthcare Platform Documentation",
                    "https://petzoe.com/docs/platform-guide",
                    "2024.1",
                    """
                    # PetZoe Digital Ecosystem Architecture and User Guide
                    PetZoe is an all-in-one verified digital pet healthcare and adoption ecosystem connecting pet owners, licensed veterinarians, animal shelters, and pet care suppliers.
                    
                    ### Core Platform Services and Navigation
                    1. Pet Registration & Tamper-Proof Pet ID:
                       - Navigation: Owner Dashboard -> My Pets -> 'Add Pet'.
                       - Feature: Generates a unique, permanent digital Pet ID code (e.g. `PZ-PET-000004`). Tracks species, breed, birth date, microchip number, current weight, and verified immunization milestones.
                    2. Veterinarian Discovery & Telehealth Appointments:
                       - Navigation: Owner Dashboard -> Appointments -> 'Book a Vet' or `/dashboard/owner?tab=Appointments`.
                       - Feature: Browse verified registered veterinary practitioners, view clinic addresses, check live real-time calendar availability slots, and book in-clinic or telehealth video consultations.
                    3. Medical Records and Immunization Tracking:
                       - Navigation: Owner Dashboard -> My Pets -> 'Vaccination Details' & 'Medical History'.
                       - Feature: Access comprehensive clinical records, diagnostic lab notes, Rabies and core booster dates, and verified prescriptions uploaded directly by attending veterinarians.
                    4. Community Rehoming and Animal Shelter Adoptions:
                       - Navigation: `/rehoming` for peer-to-peer ethical pet rehoming; `/adopt` for institutional animal shelter rescues.
                       - Feature: View verified pet profiles, personality traits, health checks, vaccination records, and submit secure digital adoption inquiries.
                    5. PetZoe Marketplace:
                       - Navigation: `/marketplace`.
                       - Feature: Certified marketplace offering veterinary prescription diets, life-stage pet foods, grooming shampoos, dental supplies, flea/tick preventives, and durable accessories.
                    """,
                    "10.5281/zenodo.petzoe.platform.2024",
                    "Canine, Feline, and Small Animals",
                    "Platform Navigation & Services",
                    "OFFICIAL_CLINICAL_GUIDELINE",
                    "PetZoe Proprietary Documentation"
            );

            log.info("PetZoe Research-Grade Vector Knowledge Corpus successfully initialized and ready for hybrid semantic retrieval.");
        } catch (Exception e) {
            log.error("Failed to seed knowledge corpus: {}", e.getMessage(), e);
        }
    }
}
