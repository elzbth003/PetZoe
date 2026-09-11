package com.petzoe.api.config;

import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final VeterinarianProfileRepository veterinarianProfileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final VerificationHistoryRepository verificationHistoryRepository;
    private final ShelterRepository shelterRepository;
    private final ShelterDocumentRepository shelterDocumentRepository;
    private final AnimalRepository animalRepository;
    private final AnimalIntakeRepository animalIntakeRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final AdoptionListingRepository adoptionListingRepository;
    private final PetMedicalRecordRepository petMedicalRecordRepository;
    private final PetVaccinationRecordRepository petVaccinationRecordRepository;
    private final PetMedicalDocumentRepository petMedicalDocumentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository,
                               PetRepository petRepository,
                               AppointmentRepository appointmentRepository,
                               CategoryRepository categoryRepository,
                               ProductRepository productRepository,
                               CartItemRepository cartItemRepository,
                               WishlistItemRepository wishlistItemRepository,
                               OrderRepository orderRepository,
                               ReviewRepository reviewRepository,
                               VeterinarianProfileRepository veterinarianProfileRepository,
                               VerificationDocumentRepository verificationDocumentRepository,
                               VerificationHistoryRepository verificationHistoryRepository,
                               ShelterRepository shelterRepository,
                               ShelterDocumentRepository shelterDocumentRepository,
                               AnimalRepository animalRepository,
                               AnimalIntakeRepository animalIntakeRepository,
                               MedicalRecordRepository medicalRecordRepository,
                               VaccinationRepository vaccinationRepository,
                               AdoptionListingRepository adoptionListingRepository,
                               PetMedicalRecordRepository petMedicalRecordRepository,
                               PetVaccinationRecordRepository petVaccinationRecordRepository,
                               PetMedicalDocumentRepository petMedicalDocumentRepository,
                               PrescriptionRepository prescriptionRepository,
                               ChatMessageRepository chatMessageRepository,
                               NotificationRepository notificationRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.veterinarianProfileRepository = veterinarianProfileRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.verificationHistoryRepository = verificationHistoryRepository;
        this.shelterRepository = shelterRepository;
        this.shelterDocumentRepository = shelterDocumentRepository;
        this.animalRepository = animalRepository;
        this.animalIntakeRepository = animalIntakeRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.adoptionListingRepository = adoptionListingRepository;
        this.petMedicalRecordRepository = petMedicalRecordRepository;
        this.petVaccinationRecordRepository = petVaccinationRecordRepository;
        this.petMedicalDocumentRepository = petMedicalDocumentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();
        seedVeterinarians();
        seedPetOwnersAndPets();
        seedSheltersAndAnimals();
        seedAppointmentsAndClinicalRecords();
        seedMarketplace();
    }

    // ─── 1. Admin ─────────────────────────────────────────────────────────────
    private void seedAdmin() {
        String adminEmail = System.getenv("ADMIN_EMAIL");
        if (adminEmail == null || adminEmail.isEmpty()) {
            adminEmail = "admin@petverse.com";
        }
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminPassword == null || adminPassword.isEmpty()) {
            adminPassword = "Password123!";
        }

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User("System Administrator", adminEmail,
                    passwordEncoder.encode(adminPassword), "9876543213", "Admin");
            admin.setVerificationStatus(VerificationStatus.APPROVED);
            admin.setEnabled(true);
            userRepository.save(admin);
        }
    }

    // ─── 2. Veterinarians ─────────────────────────────────────────────────────
    private void seedVeterinarians() {
        // 1. Dr. Sarah Jenkins (Approved)
        createOrUpdateVet(
                "Dr. Sarah Jenkins", "vet@petverse.com", "9876543210",
                "Small Animal Internal Medicine & Surgery",
                "Board-certified veterinary surgeon specializing in small animal internal diagnostics, soft tissue surgery, and wellness protocols.",
                "124 Baker Street, Central Pet Hospital",
                "BVSc & AH, MVSc (Surgery)", "VET-REG-2024-8891", 7,
                VerificationStatus.APPROVED, "LICENSE"
        );

        // 2. Dr. Marcus Vance (Approved)
        createOrUpdateVet(
                "Dr. Marcus Vance", "dr.marcus@petverse.com", "9876543235",
                "Canine Orthopedics & Trauma Surgery",
                "Senior veterinary orthopedic surgeon with over 12 years of clinical experience handling cruciate ligament repairs, fracture fixations, and joint regenerative therapy.",
                "Metro Animal Specialty Hospital, Suite 402, Bangalore",
                "BVSc, MS (Orthopedics), MRCVS", "VET-REG-2018-4512", 12,
                VerificationStatus.APPROVED, "DEGREE"
        );

        // 3. Dr. Priya Nair (Approved)
        createOrUpdateVet(
                "Dr. Priya Nair", "dr.priya@petverse.com", "9876543236",
                "Feline Medicine & Soft Tissue Surgery",
                "Dedicated feline medicine practitioner focused on feline chronic kidney disease, metabolic health, behavioral counseling, and gentle ultrasonic dental care.",
                "Cat Care & Wellness Clinic, Marine Drive, Kochi",
                "BVSc & AH, MVSc (Medicine)", "VET-REG-2021-9920", 6,
                VerificationStatus.APPROVED, "LICENSE"
        );

        // 4. Dr. David Chen (Approved)
        createOrUpdateVet(
                "Dr. David Chen", "dr.david@petverse.com", "9876543237",
                "Exotic Pets, Avian & Reptile Medicine",
                "Board-certified avian & exotic companion veterinarian. Providing specialized avian endoscopy, lagomorph dental burring, and reptile husbandry consulting.",
                "Exotic Wildlife & Companion Animal Clinic, Mumbai",
                "DVM, Certified Avian Specialist", "VET-REG-2019-7711", 9,
                VerificationStatus.APPROVED, "DEGREE"
        );

        // 5. Dr. Elena Rostova (Approved)
        createOrUpdateVet(
                "Dr. Elena Rostova", "dr.elena@petverse.com", "9876543238",
                "Veterinary Dermatology & Allergy Management",
                "Specialist in canine atopic dermatitis, complex bacterial pyoderma, chronic otitis externa, and intradermal allergen immunotherapy.",
                "DermaPet Advanced Skin Specialty Center, Indiranagar, Bangalore",
                "BVSc, PhD (Vet Dermatology)", "VET-REG-2020-3349", 8,
                VerificationStatus.APPROVED, "LICENSE"
        );

        // 6. Dr. Arjun Mehta (Pending - Great for Admin Verification Testing!)
        createOrUpdateVet(
                "Dr. Arjun Mehta", "dr.arjun@petverse.com", "9876543239",
                "Cardiology & Emergency Critical Care",
                "Emergency doctor handling cardiac echocardiography, acute trauma stabilization, pleural effusion management, and continuous intensive monitoring.",
                "City Emergency Animal Hospital, Delhi",
                "BVSc & AH, MVSc (Cardiology)", "VET-REG-2023-1184", 4,
                VerificationStatus.PENDING, "LICENSE"
        );

        // 7. Dr. Chloe Bennett (Under Review - Great for Admin Approval Testing!)
        createOrUpdateVet(
                "Dr. Chloe Bennett", "dr.chloe@petverse.com", "9876543240",
                "Veterinary Dentistry & Maxillofacial Care",
                "Specializing in periodontics, endodontic therapy, oral tumor resection, and corrective orthodontic treatments for companion animals.",
                "Happy Smiles Veterinary Dental Hospital, Hyderabad",
                "DVM, MVSc (Stomatology)", "VET-REG-2022-6632", 5,
                VerificationStatus.UNDER_REVIEW, "DEGREE"
        );
    }

    private User createOrUpdateVet(String name, String email, String phone, String specialization,
                                   String bio, String address, String qualification,
                                   String regNo, int experience, VerificationStatus status, String docType) {
        User vet = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User(name, email, passwordEncoder.encode("Password123!"), phone, "Veterinarian");
            return userRepository.save(u);
        });

        vet.setEnabled(true);
        vet.setName(name);
        vet.setPhone(phone);
        vet.setSpecialization(specialization);
        vet.setBio(bio);
        vet.setAddress(address);
        vet.setVerificationStatus(status);
        userRepository.save(vet);

        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId()).orElseGet(() -> {
            VeterinarianProfile p = new VeterinarianProfile();
            p.setUser(vet);
            return p;
        });

        profile.setQualification(qualification);
        profile.setRegistrationNumber(regNo);
        profile.setExperience(experience);
        profile.setSubmittedAt(LocalDateTime.now().minusDays(15));
        if (status == VerificationStatus.APPROVED) {
            profile.setVerifiedAt(LocalDateTime.now().minusDays(14));
        }
        veterinarianProfileRepository.save(profile);

        if (verificationDocumentRepository.findByVeterinarianProfileId(profile.getId()).isEmpty()) {
            VerificationDocument doc = new VerificationDocument();
            doc.setVeterinarianProfile(profile);
            doc.setDocumentType(docType);
            doc.setDocumentBase64("data:application/pdf;base64,JVBERi0xLjQKJUV4YW1wbGVMaWNlbnNlUERG");
            doc.setStatus(status == VerificationStatus.APPROVED ? VerificationStatus.APPROVED : VerificationStatus.PENDING);
            doc.setUploadedAt(LocalDateTime.now().minusDays(15));
            if (status == VerificationStatus.APPROVED) {
                doc.setVerifiedAt(LocalDateTime.now().minusDays(14));
            }
            verificationDocumentRepository.save(doc);
        }

        return vet;
    }

    // ─── 3. Pet Owners & Pets ─────────────────────────────────────────────────
    private void seedPetOwnersAndPets() {
        // Owner 1: Alex Carter
        User alex = createOrUpdateOwner("Alex Carter", "owner@petverse.com", "9876543211",
                "742 Evergreen Terrace, Springfield", "Passionate dog and cat parent dedicated to wellness, agility, and preventive care.");
        createOrUpdatePet("Milo", "Dog", "Golden Retriever", 2, "Male", 28.5, "Up-to-date",
                "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2024, 1, 15), "Golden", null, "Microchipped (#98514100234). High energy retriever.", alex);
        createOrUpdatePet("Luna", "Cat", "Siamese", 1, "Female", 4.2, "Up-to-date",
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2025, 3, 20), "Cream & Seal Point", "Fish-based commercial dry food", "Indoor only. Sensitive stomach.", alex);
        createOrUpdatePet("Bella", "Dog", "French Bulldog", 3, "Female", 11.2, "Needs Vaccination",
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2023, 6, 10), "Brindle", "Poultry / Chicken Meal", "Prone to seasonal allergies and skin flaking.", alex);

        // Owner 2: Jessica Taylor
        User jessica = createOrUpdateOwner("Jessica Taylor", "jessica@petverse.com", "9876543220",
                "15 Park Avenue, Indiranagar, Bangalore", "Active pet lover who hikes with her German Shepherd and loves birdwatching.");
        createOrUpdatePet("Rocky", "Dog", "German Shepherd", 4, "Male", 34.0, "Up-to-date",
                "https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2022, 4, 12), "Black & Tan", null, "Working lineage. Mild bilateral stifle stiffness after prolonged sprint workouts.", jessica);
        createOrUpdatePet("Oliver", "Cat", "British Shorthair", 2, "Male", 5.1, "Up-to-date",
                "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2024, 2, 18), "Blue Grey", null, "Calm disposition. Routine ultrasonic dental prophylaxis recommended.", jessica);
        createOrUpdatePet("Pip", "Bird", "Cockatiel", 1, "Male", 0.09, "Up-to-date",
                "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2025, 5, 1), "Grey & Yellow Crest", null, "Enjoys fresh leafy greens and millet treats. Active whistler.", jessica);

        // Owner 3: Michael Chang
        User michael = createOrUpdateOwner("Michael Chang", "michael@petverse.com", "9876543221",
                "88 Orchid Road, Bandra West, Mumbai", "Tech professional and lifelong animal rescuer.");
        createOrUpdatePet("Daisy", "Dog", "Beagle", 3, "Female", 10.8, "Up-to-date",
                "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2023, 8, 22), "Tricolor", null, "Excellent trail tracker. Requires portion control for weight management.", michael);
        createOrUpdatePet("Leo", "Cat", "Maine Coon", 2, "Male", 8.4, "Up-to-date",
                "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2024, 3, 5), "Brown Classic Tabby", null, "Gentle giant. Regular combing required for dense undercoat.", michael);

        // Owner 4: Sophia Williams
        User sophia = createOrUpdateOwner("Sophia Williams", "sophia@petverse.com", "9876543222",
                "23 Lake View Residency, Kochi", "Animal welfare advocate caring for companion rabbits and working canines.");
        createOrUpdatePet("Coco", "Rabbit", "Netherland Dwarf", 1, "Female", 1.2, "Up-to-date",
                "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2025, 4, 10), "Pure White", null, "Unlimited timothy hay diet. Sensitive gastrointestinal tract.", sophia);
        createOrUpdatePet("Zeus", "Dog", "Siberian Husky", 5, "Male", 27.5, "Up-to-date",
                "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2021, 11, 28), "Silver Grey & White", null, "Heavy seasonal coat blowing. Bi-weekly brush routine.", sophia);

        // Owner 5: Liam Johnson
        User liam = createOrUpdateOwner("Liam Johnson", "liam@petverse.com", "9876543223",
                "102 MG Road, Nungambakkam, Chennai", "Architect and dog agility enthusiast.");
        createOrUpdatePet("Rusty", "Dog", "Pembroke Welsh Corgi", 2, "Male", 12.0, "Up-to-date",
                "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2024, 7, 14), "Red & White", null, "Strong herding instinct. Energetic and highly social.", liam);
        createOrUpdatePet("Mochi", "Cat", "Persian", 3, "Female", 3.9, "Up-to-date",
                "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&q=80&w=600",
                LocalDate.of(2023, 9, 20), "White", null, "Daily facial hygiene cleaning recommended due to brachycephalic eyes.", liam);
    }

    private User createOrUpdateOwner(String name, String email, String phone, String address, String bio) {
        User owner = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User(name, email, passwordEncoder.encode("Password123!"), phone, "Pet Owner");
            return userRepository.save(u);
        });
        owner.setEnabled(true);
        owner.setName(name);
        owner.setPhone(phone);
        owner.setAddress(address);
        owner.setBio(bio);
        return userRepository.save(owner);
    }

    private Pet createOrUpdatePet(String name, String species, String breed, int age, String gender,
                                  double weight, String vacStatus, String photoUrl, LocalDate dob,
                                  String color, String allergies, String notes, User owner) {
        List<Pet> existingPets = petRepository.findByOwner(owner);
        for (Pet p : existingPets) {
            if (p.getName().equalsIgnoreCase(name)) {
                p.setWeight(weight);
                p.setVaccinationStatus(vacStatus);
                p.setPhotoUrl(photoUrl);
                p.setColor(color);
                p.setAllergies(allergies);
                p.setMedicalNotes(notes);
                return petRepository.save(p);
            }
        }

        Pet newPet = new Pet(name, species, breed, age, gender, weight, vacStatus, photoUrl, dob, color, allergies, notes, owner);
        return petRepository.save(newPet);
    }

    // ─── 4. Shelters & Shelter Animals ────────────────────────────────────────
    private void seedSheltersAndAnimals() {
        // Shelter 1: Paws & Hope Sanctuary (Emma Watson)
        User emma = userRepository.findByEmail("shelter@petverse.com").orElseGet(() -> {
            User u = new User("Emma Watson", "shelter@petverse.com", passwordEncoder.encode("Password123!"), "9876543212", "Shelter Manager");
            return userRepository.save(u);
        });
        emma.setEnabled(true);
        userRepository.save(emma);

        Shelter pawsHope = shelterRepository.findByManagerId(emma.getId()).orElseGet(() -> {
            Shelter s = new Shelter();
            s.setManager(emma);
            return s;
        });
        pawsHope.setShelterName("Paws & Hope Animal Sanctuary");
        pawsHope.setDescription("Compassionate rescue, surgical rehabilitation, and lifetime care sanctuary for abandoned and injured companion animals.");
        pawsHope.setOrganizationType(ShelterOrganizationType.NGO);
        pawsHope.setRegistrationNumber("SHELTER-KL-2021-042");
        pawsHope.setAddressLine("Hill View Sanctuary Road, Aluva");
        pawsHope.setCity("Kochi");
        pawsHope.setState("Kerala");
        pawsHope.setPincode("683101");
        pawsHope.setCapacity(85);
        pawsHope.setVeterinaryCareArrangements("Daily morning rounds by Dr. Sarah Jenkins and 24/7 on-call trauma surgical support from Central Pet Hospital.");
        pawsHope.setVerificationStatus(VerificationStatus.APPROVED);
        shelterRepository.save(pawsHope);

        // Shelter 2: Second Chance Pet Haven (Daniel Brooks)
        User daniel = userRepository.findByEmail("daniel.shelter@petverse.com").orElseGet(() -> {
            User u = new User("Daniel Brooks", "daniel.shelter@petverse.com", passwordEncoder.encode("Password123!"), "9876543230", "Shelter Manager");
            return userRepository.save(u);
        });
        daniel.setEnabled(true);
        userRepository.save(daniel);

        Shelter secondChance = shelterRepository.findByManagerId(daniel.getId()).orElseGet(() -> {
            Shelter s = new Shelter();
            s.setManager(daniel);
            return s;
        });
        secondChance.setShelterName("Second Chance Pet Haven");
        secondChance.setDescription("Sprawling 2-acre rescue haven dedicated to street dog rehabilitation, foster programs, and adoption matchmaking.");
        secondChance.setOrganizationType(ShelterOrganizationType.TRUST);
        secondChance.setRegistrationNumber("SHELTER-KA-2019-118");
        secondChance.setAddressLine("Plot 14, Green Valley Enclave, Sarjapur");
        secondChance.setCity("Bangalore");
        secondChance.setState("Karnataka");
        secondChance.setPincode("560035");
        secondChance.setCapacity(120);
        secondChance.setVeterinaryCareArrangements("Full-time veterinary clinic wing staffed with surgical suite and isolation wards.");
        secondChance.setVerificationStatus(VerificationStatus.APPROVED);
        shelterRepository.save(secondChance);

        // Shelter Animals for Paws & Hope
        User drSarah = userRepository.findByEmail("vet@petverse.com").orElse(null);
        User drMarcus = userRepository.findByEmail("dr.marcus@petverse.com").orElse(null);
        User drPriya = userRepository.findByEmail("dr.priya@petverse.com").orElse(null);

        // Animal 1: Buddy (Ready for Adoption)
        Animal buddy = createOrUpdateAnimal(
                pawsHope, "SH-PAWS-001", "Buddy", "Dog", "Labrador Retriever Mix",
                AnimalSex.MALE, 24, "Golden", "White star mark on chest", 26.5,
                "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
                "98514100889211", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Bright, alert, healthy body condition", null,
                "Gentle and eager to please. Friendly with cats and fellow canines.", null, emma
        );
        addMedicalAndVaccine(buddy, drSarah, "Annual Preventive Examination",
                "Fully healthy adult dog. Clear lungs, sound heart sounds, clean ears.",
                "Administered multivitamin paste and broad-spectrum dewormer.", "Rabies Vaccine Booster");
        createAdoptionListing(buddy, AnimalSize.LARGE, "Gentle, loyal, and loves outdoor fetch",
                "Needs 45 minutes of daily exercise. Good with first-time dog owners.", 40.0,
                "Buddy was rescued from an industrial park and has grown into the gentlest companion. He is fully house-trained, knows basic obedience, and loves curling up by your feet.");

        // Animal 2: Shadow (Ready for Adoption)
        Animal shadow = createOrUpdateAnimal(
                pawsHope, "SH-PAWS-002", "Shadow", "Dog", "Indian Pariah / Indie Pup",
                AnimalSex.MALE, 8, "Black & Tan", "Four white paws", 12.5,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600",
                "98514100889212", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Recovered from puppyhood malnutrition", null,
                "Quick learner, watchful, very loyal once bonded.", null, emma
        );
        addMedicalAndVaccine(shadow, drSarah, "Post-Intake Recovery Evaluation",
                "Normal growth velocity. Bloodwork shows recovered hematocrit levels.",
                "Prescribed balanced growth diet with calcium supplements.", "DHPP 7-in-1 Vaccine");
        createAdoptionListing(shadow, AnimalSize.MEDIUM, "Energetic, intelligent, and highly affectionate",
                "Fenced yard preferred. Very playful with other dogs.", 25.0,
                "Shadow is an exceptionally smart 8-month-old indie puppy. He learns commands in minutes and is looking for an active family ready for fun hikes.");

        // Animal 3: Cleo (Ready for Adoption)
        Animal cleo = createOrUpdateAnimal(
                pawsHope, "SH-PAWS-003", "Cleo", "Cat", "Domestic Calico",
                AnimalSex.FEMALE, 14, "Calico Tricolor", "Distinct black patch over left ear", 3.8,
                "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600",
                "98514100889213", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy, spayed adult feline", null,
                "Affectionate lap cat who enjoys head chin rubs and quiet rooms.", null, emma
        );
        addMedicalAndVaccine(cleo, drPriya, "Feline Pre-Adoption Wellness Check",
                "FIV/FeLV negative. Teeth clean and gums pink.",
                "Preventive topical flea/tick spot-on applied.", "FVRCP 3-in-1 Feline Vaccine");
        createAdoptionListing(cleo, AnimalSize.SMALL, "Calm, gentle, and adores cuddles",
                "Indoor-only home preferred. Quiet environment.", 30.0,
                "Cleo is a serene 1-year-old Calico queen. She will greet you with sweet purrs and happily nap next to your desk while you work.");

        // Animal 4: Barnaby (Under Medical Care - Splinted leg recovery)
        Animal barnaby = createOrUpdateAnimal(
                pawsHope, "SH-PAWS-004", "Barnaby", "Dog", "Indie Hound Cross",
                AnimalSex.MALE, 24, "Fawn Brown", "Black muzzle", 20.0,
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
                "98514100889214", AnimalStatus.UNDER_MEDICAL_CARE, SterilizationStatus.NOT_STERILIZED,
                "Healing right hind leg hairline fracture", "Hind right metatarsal splint in place",
                "Patient, calm demeanor despite injury. Takes oral medicines easily.", "Leg fracture", emma
        );
        addMedicalAndVaccine(barnaby, drMarcus, "Orthopedic Fracture Progress Check",
                "Bone callus formation evident on palpation. Mild swelling subsided.",
                "Meloxicam 0.1mg/kg oral suspension, cage rest for 10 more days.", "Anti-Rabies Primary");

        // Animal 5: Whiskers (In Shelter Care - Overdue care alert)
        createOrUpdateAnimal(
                pawsHope, "SH-PAWS-005", "Whiskers", "Cat", "Domestic Shorthair Kitten",
                AnimalSex.FEMALE, 4, "Grey Tabby", "Pink nose", 1.6,
                "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600",
                null, AnimalStatus.IN_SHELTER_CARE, SterilizationStatus.SCHEDULED,
                "Found as stray in neighborhood garden", null,
                "Curious and vocal kitten. Socialized with shelter staff.", null, emma
        );

        // Shelter Animals for Second Chance Haven
        Animal max = createOrUpdateAnimal(
                secondChance, "SH-SEC-001", "Max", "Dog", "Boxer Mix",
                AnimalSex.MALE, 36, "Brindle & White", "Floppy ears, white chest blaze", 29.5,
                "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=600",
                "98514100994115", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Athletic, healthy adult canine", null,
                "Strong, playful, loves tug-of-war and long walks.", null, daniel
        );
        addMedicalAndVaccine(max, drSarah, "Routine Shelter Intake Physical",
                "Robust musculature, normal cardiovascular sounds.",
                "Heartworm preventive administered.", "DHPP Annual Booster");
        createAdoptionListing(max, AnimalSize.LARGE, "Playful, protective, and full of life",
                "Experienced dog owner preferred. Great jogging companion.", 45.0,
                "Max is a muscular and loving Boxer mix who loves human companionship. He walks beautifully on leash and knows sit, stay, and paw.");

        Animal penny = createOrUpdateAnimal(
                secondChance, "SH-SEC-002", "Penny", "Dog", "Golden Mix",
                AnimalSex.FEMALE, 18, "Cream Golden", "Feathered tail", 22.0,
                "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
                "98514100994116", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Cheerful, healthy young female", null,
                "Gentle temperament, house trained, loves everyone she meets.", null, daniel
        );
        createAdoptionListing(penny, AnimalSize.MEDIUM, "Warm-hearted, joyful, and affectionate",
                "Wonderful family dog. Good with young kids.", 50.0,
                "Penny radiates happiness wherever she goes. She is eager to learn, adores belly rubs, and is ready to be your family's best friend.");
    }

    private Animal createOrUpdateAnimal(Shelter shelter, String code, String name, String species,
                                        String breed, AnimalSex sex, int ageMonths, String color,
                                        String marks, double weight, String photoUrl, String microchip,
                                        AnimalStatus status, SterilizationStatus sterilization,
                                        String condition, String injuries, String behaviour,
                                        String medicalConcerns, User recordedBy) {
        Animal animal = animalRepository.findByAnimalCode(code).orElseGet(() -> {
            Animal a = new Animal();
            a.setAnimalCode(code);
            a.setShelter(shelter);
            return a;
        });

        animal.setName(name);
        animal.setSpecies(species);
        animal.setBreed(breed);
        animal.setSex(sex);
        animal.setEstimatedAgeMonths(ageMonths);
        animal.setColor(color);
        animal.setDistinguishingMarks(marks);
        animal.setWeightKg(weight);
        animal.setPrimaryPhotoBase64(photoUrl);
        animal.setMicrochipNumber(microchip);
        animal.setStatus(status);
        animal.setSterilizationStatus(sterilization);
        animal.setGeneralCondition(condition);
        animal.setVisibleInjuries(injuries);
        animal.setBehaviourObservations(behaviour);
        animal.setImmediateMedicalConcerns(medicalConcerns);
        animal.setInitialAssessmentRecordedAt(LocalDateTime.now().minusDays(20));
        animal.setInitialAssessmentRecordedBy(recordedBy);
        Animal saved = animalRepository.save(animal);

        // Intake event
        if (animalIntakeRepository.findByAnimalIdOrderByCreatedAtDesc(saved.getId()).isEmpty()) {
            AnimalIntake intake = new AnimalIntake();
            intake.setAnimal(saved);
            intake.setIntakeDate(LocalDate.now().minusDays(25));
            intake.setIntakeType(IntakeType.RESCUE);
            intake.setSourceInfo("Community rescue call / Stray animal rehabilitation program");
            intake.setRecordedBy(recordedBy);
            animalIntakeRepository.save(intake);
        }

        return saved;
    }

    private void addMedicalAndVaccine(Animal animal, User vet, String diagnosis, String notes, String treatment, String vaccineName) {
        if (vet == null) return;
        if (medicalRecordRepository.findByAnimalIdOrderByExaminationDateDesc(animal.getId()).isEmpty()) {
            MedicalRecord mr = new MedicalRecord();
            mr.setAnimal(animal);
            mr.setVeterinarian(vet);
            mr.setExaminationDate(LocalDate.now().minusDays(5));
            mr.setWeightKg(animal.getWeightKg());
            mr.setHealthStatus("Fit for Adoption");
            mr.setDiagnosis(diagnosis);
            mr.setTreatment(treatment);
            mr.setVeterinaryNotes(notes);
            mr.setFollowUpRequired(false);
            medicalRecordRepository.save(mr);
        }

        if (vaccinationRepository.findByAnimalIdOrderByDateAdministeredDesc(animal.getId()).isEmpty()) {
            Vaccination v = new Vaccination();
            v.setAnimal(animal);
            v.setVeterinarian(vet);
            v.setVaccineName(vaccineName);
            v.setDateAdministered(LocalDate.now().minusDays(5));
            v.setNextDueDate(LocalDate.now().plusMonths(12));
            v.setBatchLotNumber("VAC-LOT-2024-" + animal.getId());
            v.setNotes("Well tolerated. Normal post-vaccination monitoring.");
            vaccinationRepository.save(v);
        }
    }

    private void createAdoptionListing(Animal animal, AnimalSize size, String personality,
                                       String specialCare, double fee, String description) {
        if (adoptionListingRepository.findByAnimalId(animal.getId()).isEmpty()) {
            AdoptionListing listing = new AdoptionListing();
            listing.setAnimal(animal);
            listing.setSize(size);
            listing.setPersonality(personality);
            listing.setSpecialCareRequirements(specialCare);
            listing.setAdoptionFee(fee);
            listing.setListingDescription(description);
            listing.setStatus(VerificationStatus.APPROVED);
            listing.setSubmittedAt(LocalDateTime.now().minusDays(10));
            listing.setReviewedAt(LocalDateTime.now().minusDays(9));
            adoptionListingRepository.save(listing);
        }
    }

    // ─── 5. Appointments & Clinical Records ───────────────────────────────────
    private void seedAppointmentsAndClinicalRecords() {
        User drSarah = userRepository.findByEmail("vet@petverse.com").orElse(null);
        User drMarcus = userRepository.findByEmail("dr.marcus@petverse.com").orElse(null);
        User drPriya = userRepository.findByEmail("dr.priya@petverse.com").orElse(null);
        User drDavid = userRepository.findByEmail("dr.david@petverse.com").orElse(null);

        User alex = userRepository.findByEmail("owner@petverse.com").orElse(null);
        User jessica = userRepository.findByEmail("jessica@petverse.com").orElse(null);
        User michael = userRepository.findByEmail("michael@petverse.com").orElse(null);
        User sophia = userRepository.findByEmail("sophia@petverse.com").orElse(null);
        User liam = userRepository.findByEmail("liam@petverse.com").orElse(null);

        if (drSarah == null || alex == null || jessica == null) return;

        List<Pet> alexPets = petRepository.findByOwner(alex);
        List<Pet> jessicaPets = petRepository.findByOwner(jessica);
        List<Pet> michaelPets = michael != null ? petRepository.findByOwner(michael) : List.of();
        List<Pet> sophiaPets = sophia != null ? petRepository.findByOwner(sophia) : List.of();
        List<Pet> liamPets = liam != null ? petRepository.findByOwner(liam) : List.of();

        Pet milo = findPetByName(alexPets, "Milo");
        Pet luna = findPetByName(alexPets, "Luna");
        Pet bella = findPetByName(alexPets, "Bella");
        Pet rocky = findPetByName(jessicaPets, "Rocky");
        Pet oliver = findPetByName(jessicaPets, "Oliver");
        Pet pip = findPetByName(jessicaPets, "Pip");
        Pet daisy = findPetByName(michaelPets, "Daisy");
        Pet coco = findPetByName(sophiaPets, "Coco");
        Pet zeus = findPetByName(sophiaPets, "Zeus");
        Pet rusty = findPetByName(liamPets, "Rusty");
        Pet mochi = findPetByName(liamPets, "Mochi");

        LocalDate today = LocalDate.now();

        // ── Appointment 1: TODAY - Bella (Skin allergy) with Dr. Sarah [CONFIRMED]
        if (bella != null) {
            Appointment appt1 = createAppointmentIfAbsent(bella, alex, drSarah, today, "11:30 AM", "CONFIRMED",
                    "Severe itching and redness behind both ears. Skin scraping requested.");
            createChatMessage(alex, drSarah, appt1, "Hello Dr. Sarah! Bella has been scratching her ears non-stop since yesterday evening.");
            createChatMessage(drSarah, alex, appt1, "Hi Alex, please avoid giving any poultry treats before the 11:30 AM consultation. We will examine her ear canals and do a cytology test.");
        }

        // ── Appointment 2: TODAY - Rocky (Stifle Joint) with Dr. Sarah [IN_CONSULTATION]
        if (rocky != null) {
            Appointment appt2 = createAppointmentIfAbsent(rocky, jessica, drSarah, today, "02:30 PM", "IN_CONSULTATION",
                    "Gait analysis and stifle joint stiffness after intensive agility practice.");
            createChatMessage(jessica, drSarah, appt2, "Good afternoon Doctor, Rocky is outside in the waiting lobby. He is ready for examination.");
        }

        // ── Appointment 3: PENDING - Daisy with Dr. Sarah [PENDING - Doctor can Accept/Decline]
        if (daisy != null && michael != null) {
            createAppointmentIfAbsent(daisy, michael, drSarah, today.plusDays(1), "10:00 AM", "PENDING",
                    "Annual core vaccine boosters and routine dental check.");
        }

        // ── Appointment 4: PENDING - Zeus with Dr. Sarah [PENDING]
        if (zeus != null && sophia != null) {
            createAppointmentIfAbsent(zeus, sophia, drSarah, today.plusDays(2), "03:00 PM", "PENDING",
                    "Excessive seasonal coat blowing, dry skin flakes, and paw pad balm advice.");
        }

        // ── Appointment 5: UPCOMING - Rusty with Dr. Sarah [CONFIRMED]
        if (rusty != null && liam != null) {
            createAppointmentIfAbsent(rusty, liam, drSarah, today.plusDays(3), "11:00 AM", "CONFIRMED",
                    "Routine wellness checkup and weight monitoring.");
        }

        // ── Appointment 6: UPCOMING - Coco (Rabbit) with Dr. David Chen [CONFIRMED]
        if (coco != null && sophia != null && drDavid != null) {
            createAppointmentIfAbsent(coco, sophia, drDavid, today.plusDays(4), "02:00 PM", "CONFIRMED",
                    "Incisor tooth length check and dietary fiber consultation.");
        }

        // ── Appointment 7: UPCOMING - Pip (Bird) with Dr. David Chen [CONFIRMED]
        if (pip != null && drDavid != null) {
            createAppointmentIfAbsent(pip, jessica, drDavid, today.plusDays(5), "10:30 AM", "CONFIRMED",
                    "Avian beak grooming, wing inspection, and nutritional supplement check.");
        }

        // ── Appointment 8: UPCOMING - Oliver (Cat) with Dr. Priya Nair [CONFIRMED]
        if (oliver != null && drPriya != null) {
            createAppointmentIfAbsent(oliver, jessica, drPriya, today.plusDays(2), "04:00 PM", "CONFIRMED",
                    "Feline dental checkup and plaque prevention advice.");
        }

        // ── Appointment 9: COMPLETED - Milo with Dr. Sarah [COMPLETED]
        if (milo != null) {
            Appointment apptComp = createAppointmentIfAbsent(milo, alex, drSarah, today.minusDays(3), "10:00 AM", "COMPLETED",
                    "Routine checkup and rabies shot booster.");

            // Add Clinical Record
            if (petMedicalRecordRepository.findByPetIdOrderByExaminationDateDesc(milo.getId()).isEmpty()) {
                PetMedicalRecord mr = new PetMedicalRecord();
                mr.setPet(milo);
                mr.setVeterinarian(drSarah);
                mr.setAppointment(apptComp);
                mr.setExaminationDate(today.minusDays(3));
                mr.setWeightKg(28.5);
                mr.setHealthStatus("Healthy");
                mr.setSymptoms("Normal physical wellness check. Active and alert.");
                mr.setDiagnosis("Normal physical examination. Core vaccination due.");
                mr.setTreatment("Administered multivitamin paste and prescribed preventive deworming.");
                mr.setMedication("Pyrantel Pamoate 50mg/ml");
                mr.setLabInvestigations("Fecal flotation test clear.");
                mr.setVeterinaryNotes("Good body condition score (5/9). Clean teeth and healthy coat.");
                mr.setFollowUpRequired(true);
                mr.setFollowUpDate(today.plusMonths(6));
                mr.setFollowUpNotes("Biannual dental and wellness check.");
                petMedicalRecordRepository.save(mr);

                Prescription rx = new Prescription();
                rx.setAppointment(apptComp);
                rx.setPet(milo);
                rx.setVeterinarian(drSarah);
                rx.setMedicineName("Pyrantel Pamoate Suspension");
                rx.setDosage("5 ml");
                rx.setFrequency("Single dose");
                rx.setDuration("1 day");
                rx.setInstructions("Administer orally with morning meal.");
                prescriptionRepository.save(rx);
            }

            // Add Pet Vaccination
            if (petVaccinationRecordRepository.findByPetIdOrderByDateAdministeredDesc(milo.getId()).isEmpty()) {
                PetVaccinationRecord vr = new PetVaccinationRecord();
                vr.setPet(milo);
                vr.setVeterinarian(drSarah);
                vr.setVaccineName("Nobivac Rabies 3-Year");
                vr.setDateAdministered(today.minusDays(3));
                vr.setNextDueDate(today.plusYears(3));
                vr.setBatchLotNumber("NOB-RAB-2024-X99");
                vr.setNotes("Subcutaneous injection left hip. No immediate adverse reaction.");
                petVaccinationRecordRepository.save(vr);
            }

            // Add Pet Document
            if (petMedicalDocumentRepository.findByPetIdOrderByUploadedAtDesc(milo.getId()).isEmpty()) {
                PetMedicalDocument doc = new PetMedicalDocument();
                doc.setPet(milo);
                doc.setUploadedBy(drSarah);
                doc.setTitle("Complete Blood Count (CBC) Panel.pdf");
                doc.setDocumentType("LAB_REPORT");
                doc.setDocumentBase64("data:application/pdf;base64,JVBERi0xLjQKJUNCQ1JlcG9ydEV4YW1wbGU=");
                doc.setNotes("WBC, RBC, Platelets all within normal reference intervals.");
                petMedicalDocumentRepository.save(doc);
            }
        }

        // ── Appointment 10: COMPLETED - Mochi with Dr. Priya Nair [COMPLETED]
        if (mochi != null && drPriya != null && liam != null) {
            Appointment apptMochi = createAppointmentIfAbsent(mochi, liam, drPriya, today.minusDays(6), "03:30 PM", "COMPLETED",
                    "Head shaking and ear wax buildup.");
            if (petMedicalRecordRepository.findByPetIdOrderByExaminationDateDesc(mochi.getId()).isEmpty()) {
                PetMedicalRecord mr = new PetMedicalRecord();
                mr.setPet(mochi);
                mr.setVeterinarian(drPriya);
                mr.setAppointment(apptMochi);
                mr.setExaminationDate(today.minusDays(6));
                mr.setWeightKg(3.9);
                mr.setHealthStatus("Recovering");
                mr.setSymptoms("Bilateral brown ceruminous discharge and head tilting.");
                mr.setDiagnosis("Mild Otodectes cynotis (Ear Mite) infestation.");
                mr.setTreatment("Gentle ear canal flushing and topical miticide drops administered.");
                mr.setMedication("Otomax Otic Suspension");
                mr.setVeterinaryNotes("Tympanic membranes intact. Recheck in 10 days.");
                mr.setFollowUpRequired(true);
                mr.setFollowUpDate(today.plusDays(4));
                mr.setFollowUpNotes("Re-examine ear canals with otoscope.");
                petMedicalRecordRepository.save(mr);

                Prescription rx = new Prescription();
                rx.setAppointment(apptMochi);
                rx.setPet(mochi);
                rx.setVeterinarian(drPriya);
                rx.setMedicineName("Otic Ear Drops 15ml");
                rx.setDosage("4 drops in each ear");
                rx.setFrequency("Twice daily");
                rx.setDuration("7 days");
                rx.setInstructions("Massage base of ear gently for 30 seconds after instillation.");
                prescriptionRepository.save(rx);
            }
        }

        // Notifications
        if (notificationRepository.count() < 10) {
            notificationRepository.save(new Notification(drSarah, "New Appointment Request", "Daisy (Beagle) has booked a consultation for tomorrow.", "APPOINTMENT"));
            notificationRepository.save(new Notification(alex, "Appointment Confirmed ✅", "Your consultation for Bella has been confirmed for 11:30 AM today.", "APPOINTMENT"));
            notificationRepository.save(new Notification(jessica, "Doctor In Consultation", "Dr. Sarah Jenkins has started Rocky's consultation.", "APPOINTMENT"));
            notificationRepository.save(new Notification(drSarah, "Shelter Care Alert ⚠️", "Whiskers at Paws & Hope Sanctuary is due for initial kitten immunization.", "SYSTEM"));
        }
    }

    private Pet findPetByName(List<Pet> pets, String name) {
        if (pets == null) return null;
        for (Pet p : pets) {
            if (p.getName().equalsIgnoreCase(name)) return p;
        }
        return null;
    }

    private Appointment createAppointmentIfAbsent(Pet pet, User owner, User vet, LocalDate date, String time, String status, String notes) {
        List<Appointment> existing = appointmentRepository.findByPetId(pet.getId());
        for (Appointment a : existing) {
            if (a.getAppointmentDate().equals(date) && a.getAppointmentTime().equalsIgnoreCase(time)) {
                a.setStatus(status);
                a.setNotes(notes);
                return appointmentRepository.save(a);
            }
        }
        Appointment appt = new Appointment(pet, owner, vet, date, time, status, notes);
        return appointmentRepository.save(appt);
    }

    private void createChatMessage(User sender, User receiver, Appointment appointment, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setAppointment(appointment);
        msg.setContent(content);
        msg.setRead(true);
        chatMessageRepository.save(msg);
    }

    // ─── 6. Marketplace Categories & Products ─────────────────────────────────
    private void seedMarketplace() {
        if (categoryRepository.count() > 0 && productRepository.count() > 0) {
            return;
        }

        cartItemRepository.deleteAll();
        wishlistItemRepository.deleteAll();
        orderRepository.deleteAll();
        reviewRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        User seller = userRepository.findByEmail("seller@petverse.com").orElseGet(() -> {
            User s = new User("PetZoe Store", "seller@petverse.com", passwordEncoder.encode("Password123!"), "9876543214", "Marketplace Seller");
            s.setEnabled(true);
            return userRepository.save(s);
        });

        Category food = categoryRepository.save(new Category("Pet Food", "Premium nutrition for dogs, cats, birds, and small animals.", "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=400"));
        Category toys = categoryRepository.save(new Category("Toys & Accessories", "Fun toys, chews, and interactive accessories to keep pets happy.", "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=400"));
        Category grooming = categoryRepository.save(new Category("Grooming", "Shampoos, brushes, clippers, and all grooming essentials.", "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&q=80&w=400"));
        Category health = categoryRepository.save(new Category("Health & Wellness", "Supplements, medications, and preventive healthcare products.", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400"));
        Category beds = categoryRepository.save(new Category("Beds & Furniture", "Comfortable beds, crates, kennels, and cat trees.", "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"));

        List<Product> products = List.of(
                buildProduct("Royal Canin Adult Dog Food", "Complete and balanced nutrition for adult dogs. Rich in high-quality proteins.", "Royal Canin", 2499.0, 1999.0, "RC-DOG-ADULT-3KG", 85, "https://images.unsplash.com/photo-1589924691995-400dc9edfabb?auto=format&fit=crop&q=80&w=400", "Maize, Chicken meal, Wheat, Vegetable protein extracts, Chicken fat", "Weight: 3kg|Life stage: Adult (1-7 years)|Breed size: All breeds|Protein: 25%", true, true, food, seller),
                buildProduct("Whiskas Adult Cat Food Tuna", "Ocean-caught tuna in jelly for the ultimate feline dining experience.", "Whiskas", 1299.0, 999.0, "WHS-CAT-TUNA-2KG", 120, "https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&q=80&w=400", "Tuna (min. 4%), Fish & Fish derivatives, Meat & Animal derivatives", "Weight: 2kg|Life stage: Adult|Format: Dry pellets|Protein: 30%", true, true, food, seller),
                buildProduct("Pedigree Puppy Chicken & Milk", "Specially formulated dry food for puppies up to 12 months.", "Pedigree", 899.0, null, "PED-PUP-CKN-1KG", 200, "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400", "Whole grain corn, Poultry by-product meal, Soy meal, Beet pulp, Milk", "Weight: 1kg|Life stage: Puppy (0-12 months)|DHA for brain development", true, false, food, seller),
                buildProduct("KONG Classic Chew Toy", "Durable natural rubber toy. Fill with treats or peanut butter to keep dogs busy for hours.", "KONG", 1499.0, 1199.0, "KNG-CLS-MED", 60, "https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&q=80&w=400", "100% natural rubber", "Size: Medium (10-35kg dogs)|Dishwasher safe|Vet recommended", true, true, toys, seller),
                buildProduct("Feather Wand Cat Teaser", "Interactive feather wand toy to engage your cat's natural hunting instincts.", "PetLounge", 349.0, null, "PL-CAT-WAND-01", 150, "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=400", "Plastic wand, Natural feathers, Elastic cord", "Length: 60cm extended|Safe for cats of all ages", true, false, toys, seller),
                buildProduct("Himalaya Erina-EP Dog Shampoo", "Gentle herbal shampoo with neem and chickpea for healthy skin and coat.", "Himalaya", 299.0, 249.0, "HIM-SHP-ERINA-200ML", 300, "https://images.unsplash.com/photo-1527164153729-6abbee0c0938?auto=format&fit=crop&q=80&w=400", "Neem (Azadirachta indica), Chickpea (Cicer arietinum), Aloe vera", "Volume: 200ml|pH balanced|Vet recommended", true, true, grooming, seller),
                buildProduct("FURminator Deshedding Brush", "Reduces shedding by up to 90%. Reaches through topcoat to remove loose undercoat hair.", "FURminator", 2999.0, 2499.0, "FRM-BRUSH-MED-SHORT", 35, "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400", "Stainless steel, ABS plastic, rubber grip", "Blade: 6.35cm|For medium dogs|Short hair", true, true, grooming, seller),
                buildProduct("Beaphar Vitamin C Supplement", "Daily multivitamin supplement for dogs and cats to support immunity and energy.", "Beaphar", 799.0, 649.0, "BEA-VIT-C-150TAB", 200, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400", "Vitamin C, Vitamin E, Zinc, Biotin, Omega fatty acids", "150 tablets|Daily dose: 1 tablet|For dogs & cats 6 months+", true, true, health, seller),
                buildProduct("Tick & Flea Spot-On Treatment", "Monthly topical treatment that kills ticks and fleas within 48 hours of application.", "Frontline", 1199.0, null, "FL-SPOT-DOG-MED", 90, "https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?auto=format&fit=crop&q=80&w=400", "Fipronil 9.8%, (S)-Methoprene 8.8%", "3 pipettes per pack|For dogs 10-20kg|Waterproof", true, false, health, seller),
                buildProduct("Orthopedic Memory Foam Dog Bed", "Therapeutic memory foam bed that relieves joint pain and pressure points for senior dogs.", "ComfyPaws", 3499.0, 2799.0, "CP-BED-ORTH-MED", 30, "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400", "Memory foam core, Microfibre cover", "Size: 80x60cm|Washable cover|Non-slip base", true, true, beds, seller),
                buildProduct("Cat Tree Condo with Scratching Post", "5-level cat tree with cosy condo, multiple perches, and sisal scratching posts.", "Paws & Claws", 4999.0, 3999.0, "PC-TREE-5LVL", 15, "https://images.unsplash.com/photo-1615796153287-98eacf0abb13?auto=format&fit=crop&q=80&w=400", "Particleboard, Sisal rope, Plush fabric", "Height: 150cm|Base: 50x50cm|Weight limit: 15kg", true, true, beds, seller)
        );

        productRepository.saveAll(products);
    }

    private Product buildProduct(String name, String description, String brand,
                                 Double price, Double discountPrice, String sku,
                                 int stock, String imageUrl,
                                 String ingredients, String specifications,
                                 boolean approved, boolean featured,
                                 Category category, User seller) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setBrand(brand);
        p.setPrice(price);
        p.setDiscountPrice(discountPrice);
        p.setSku(sku);
        p.setStockQuantity(stock);
        p.setImageUrl(imageUrl);
        p.setIngredients(ingredients);
        p.setSpecifications(specifications);
        p.setApproved(approved);
        p.setFeatured(featured);
        p.setAverageRating(0.0);
        p.setReviewCount(0);
        p.setCategory(category);
        p.setSeller(seller);
        return p;
    }
}
