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
    private final AdopterProfileRepository adopterProfileRepository;
    private final AdoptionApplicationRepository adoptionApplicationRepository;
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
                               AdopterProfileRepository adopterProfileRepository,
                               AdoptionApplicationRepository adoptionApplicationRepository,
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
        this.adopterProfileRepository = adopterProfileRepository;
        this.adoptionApplicationRepository = adoptionApplicationRepository;
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
        seedAdoptersAndApplications();
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

        if (userRepository.findByEmail("admin@petzoe.com").isEmpty()) {
            User adminPetzoe = new User("System Administrator", "admin@petzoe.com",
                    passwordEncoder.encode(adminPassword), "9876543215", "Admin");
            adminPetzoe.setVerificationStatus(VerificationStatus.APPROVED);
            adminPetzoe.setEnabled(true);
            userRepository.save(adminPetzoe);
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
    // ─── 4. Shelters & Shelter Animals ────────────────────────────────────────
    private void seedSheltersAndAnimals() {
        User drSarah = userRepository.findByEmail("vet@petverse.com").orElse(null);
        User drMarcus = userRepository.findByEmail("dr.marcus@petverse.com").orElse(null);
        User drPriya = userRepository.findByEmail("dr.priya@petverse.com").orElse(null);

        // Shelter 1: Paws & Hope Animal Sanctuary (Kochi, Kerala)
        User emma = getOrCreateShelterManager("Emma Watson", "shelter@petverse.com", "9876543212");
        Shelter pawsHope = getOrCreateShelter(emma, "Paws & Hope Animal Sanctuary",
                "Compassionate rescue, surgical rehabilitation, and lifetime care sanctuary for abandoned and injured companion animals.",
                ShelterOrganizationType.NGO, "SHELTER-KL-2021-042", "Hill View Sanctuary Road, Aluva", "Kochi", "Kerala", "683101", 85,
                "Daily morning rounds by Dr. Sarah Jenkins and 24/7 on-call trauma surgical support from Central Pet Hospital.");

        // Shelter 2: Second Chance Pet Haven (Bangalore, Karnataka)
        User daniel = getOrCreateShelterManager("Daniel Brooks", "daniel.shelter@petverse.com", "9876543230");
        Shelter secondChance = getOrCreateShelter(daniel, "Second Chance Pet Haven",
                "Sprawling 2-acre rescue haven dedicated to street dog rehabilitation, foster programs, and adoption matchmaking.",
                ShelterOrganizationType.TRUST, "SHELTER-KA-2019-118", "Plot 14, Green Valley Enclave, Sarjapur", "Bangalore", "Karnataka", "560035", 120,
                "Full-time veterinary clinic wing staffed with surgical suite and isolation wards.");

        // Shelter 3: Happy Tails Rescue & Care (Chennai, Tamil Nadu)
        User rajesh = getOrCreateShelterManager("Rajesh Menon", "rajesh.happytails@petverse.com", "9876543251");
        Shelter happyTails = getOrCreateShelter(rajesh, "Happy Tails Rescue & Care",
                "Dedicated rescue community striving to foster, heal, and find forever families for rescued indie street dogs and abandoned cats.",
                ShelterOrganizationType.NGO, "SHELTER-TN-2020-077", "33 Beach Road Animal Complex, Besant Nagar", "Chennai", "Tamil Nadu", "600090", 95,
                "Partnered with Chennai Veterinary Polyclinic for emergency stabilization and clinical sterilizations.");

        // Shelter 4: Compassion Paw Foundation (Pune, Maharashtra)
        User neha = getOrCreateShelterManager("Neha Kulkarni", "neha.compassion@petverse.com", "9876543252");
        Shelter compassionPaw = getOrCreateShelter(neha, "Compassion Paw Foundation",
                "Committed animal rescue foundation with dedicated canine agility and sensory recovery parks for traumatized animals.",
                ShelterOrganizationType.TRUST, "SHELTER-MH-2018-204", "Sector 7, Baner Hills Rescue Campus", "Pune", "Maharashtra", "411001", 110,
                "Resident veterinary surgeon with digital radiography and ultrasonic dental unit.");

        // Shelter 5: Guardian Angels Animal Sanctuary (Hyderabad, Telangana)
        User vikram = getOrCreateShelterManager("Vikram Sharma", "vikram.angels@petverse.com", "9876543253");
        Shelter guardianAngels = getOrCreateShelter(vikram, "Guardian Angels Animal Sanctuary",
                "Animal shelter offering specialized feline isolation catteries, puppy nurseries, and geriatric pet hospice care.",
                ShelterOrganizationType.NGO, "SHELTER-TS-2022-091", "Plot 19, Bio-Park Valley, Madhapur", "Hyderabad", "Telangana", "500081", 80,
                "On-site veterinary OPD clinic providing free anti-rabies and sterilization camps.");

        // Shelter 6: Haven for Strays Society (Kolkata, West Bengal) - PENDING
        User ananya = getOrCreateShelterManager("Ananya Das", "ananya.haven@petverse.com", "9876543254", VerificationStatus.PENDING);
        Shelter havenStrays = getOrCreateShelter(ananya, "Haven for Strays Society",
                "Urban animal rescue foundation focused on medical critical care, community feeding routes, and adoption fairs.",
                ShelterOrganizationType.NGO, "SHELTER-WB-2021-143", "Block CB, Salt Lake Care Hub", "Kolkata", "West Bengal", "700091", 100,
                "Collaborative care agreement with West Bengal University of Animal and Fishery Sciences.", VerificationStatus.PENDING);

        // Shelter 7: Safe Paws Foster & Rescue Center (New Delhi, Delhi) - PENDING
        User karan = getOrCreateShelterManager("Karan Kapoor", "karan.safepaws@petverse.com", "9876543255", VerificationStatus.PENDING);
        Shelter safePaws = getOrCreateShelter(karan, "Safe Paws Foster & Rescue Center",
                "Capital rescue sanctuary specializing in neonatal puppy bottle-feeding, behavioral desensitization, and loving adoptions.",
                ShelterOrganizationType.TRUST, "SHELTER-DL-2019-058", "Sector B, Pocket 2, Vasant Kunj", "New Delhi", "Delhi", "110070", 90,
                "Round-the-clock emergency transport ambulance and trauma triage center.", VerificationStatus.PENDING);

        // Shelter 8: Shanti Animal Welfare Trust (Ahmedabad, Gujarat) - UNDER_REVIEW
        User meera = getOrCreateShelterManager("Meera Joshi", "meera.shanti@petverse.com", "9876543256", VerificationStatus.UNDER_REVIEW);
        Shelter shantiTrust = getOrCreateShelter(meera, "Shanti Animal Welfare Trust",
                "Sprawling rehabilitation center caring for injured community pets, blind/senior canines, and rescued mother cats.",
                ShelterOrganizationType.TRUST, "SHELTER-GJ-2020-312", "Bopal Animal Rehabilitation Grounds", "Ahmedabad", "Gujarat", "380054", 75,
                "Veterinary staff handling orthopedic hydrotherapy, laser recovery, and daily nutrition planning.", VerificationStatus.UNDER_REVIEW);

        // Shelter 9: Green Valley Animal Refuge (Thiruvananthapuram, Kerala)
        User rohit = getOrCreateShelterManager("Rohit Chacko", "rohit.greenvalley@petverse.com", "9876543257");
        Shelter greenValley = getOrCreateShelter(rohit, "Green Valley Animal Refuge",
                "Eco-sanctuary built in lush tropical foothills prioritizing ethical low-stress animal housing and positive-reinforcement adoption training.",
                ShelterOrganizationType.NGO, "SHELTER-KL-2022-019", "Kowdiar Eco-Sanctuary Drive", "Thiruvananthapuram", "Kerala", "695003", 65,
                "Mobile veterinary team and comprehensive quarantine isolation units.");

        // Shelter 10: Whispering Pines Animal Shelter (Mysuru, Karnataka)
        User sunita = getOrCreateShelterManager("Sunita Rao", "sunita.whispering@petverse.com", "9876543258");
        Shelter whisperingPines = getOrCreateShelter(sunita, "Whispering Pines Animal Shelter",
                "Heritage shelter promoting the adoption of indigenous Indian indie dogs and championing high-welfare shelter practices.",
                ShelterOrganizationType.TRUST, "SHELTER-KA-2021-084", "Chamundi Foothills Rescue Enclosure", "Mysuru", "Karnataka", "570002", 70,
                "Dedicated veterinary clinic with regular pathology tests, spay/neuter facilities, and adoption counselling.");

        // Shelter 11: Karuna Animal Rescue Society (Jaipur, Rajasthan) - PENDING
        User harsh = getOrCreateShelterManager("Harshvardhan Singh", "harsh.karuna@petverse.com", "9876543271", VerificationStatus.PENDING);
        Shelter karunaSociety = getOrCreateShelter(harsh, "Karuna Animal Rescue Society",
                "Dedicated rescue NGO in Rajasthan providing critical field rescue, thermal relief shelters, and community indie dog adoptions.",
                ShelterOrganizationType.NGO, "SHELTER-RJ-2023-014", "Plot 55, Mansarovar Animal Care Zone", "Jaipur", "Rajasthan", "302020", 90,
                "Affiliated with Jaipur Veterinary College with dedicated surgical ambulance support.", VerificationStatus.PENDING);

        // Shelter 12: Bhoomi Animal Welfare Trust (Lucknow, Uttar Pradesh) - PENDING
        User pratibha = getOrCreateShelterManager("Pratibha Verma", "pratibha.bhoomi@petverse.com", "9876543272", VerificationStatus.PENDING);
        Shelter bhoomiTrust = getOrCreateShelter(pratibha, "Bhoomi Animal Welfare Trust",
                "Shelter providing haven and medical care for abandoned companion animals, street puppies, and injured birds.",
                ShelterOrganizationType.TRUST, "SHELTER-UP-2022-088", "Kisan Path Shelter Enclosure, Gomti Nagar Ext", "Lucknow", "Uttar Pradesh", "226010", 85,
                "Resident veterinarian and pathology lab for round-the-clock trauma admissions.", VerificationStatus.PENDING);

        // Shelter 13: Blue Cross Rescue Guild (Coimbatore, Tamil Nadu) - APPROVED
        User senthil = getOrCreateShelterManager("Senthil Nathan", "senthil.bluecross@petverse.com", "9876543273");
        Shelter blueCross = getOrCreateShelter(senthil, "Blue Cross Rescue Guild",
                "Community animal rehabilitation facility with custom indie dog playpens, hydrotherapy pool, and feline recovery suites.",
                ShelterOrganizationType.NGO, "SHELTER-TN-2019-142", "Peelamedu Wildlife Link Road", "Coimbatore", "Tamil Nadu", "641004", 105,
                "Two full-time veterinary surgeons on staff with fully equipped x-ray and ultrasound suite.");

        // Shelter 14: Navjeevan Pet Sanctuary (Surat, Gujarat) - APPROVED
        User jignesh = getOrCreateShelterManager("Jignesh Patel", "jignesh.navjeevan@petverse.com", "9876543274");
        Shelter navjeevan = getOrCreateShelter(jignesh, "Navjeevan Pet Sanctuary",
                "Modern pet sanctuary dedicated to ethical rescue, microchipping, and compassionate matchmaking for forever homes.",
                ShelterOrganizationType.TRUST, "SHELTER-GJ-2021-067", "Dumas Road Welfare Haven", "Surat", "Gujarat", "395007", 95,
                "Mobile sterilization van and weekly specialized orthopaedic clinic.");

        // Shelter 15: Himalayan Animal Rescue Hub (Dehradun, Uttarakhand) - APPROVED
        User aarti = getOrCreateShelterManager("Aarti Bisht", "aarti.himalayan@petverse.com", "9876543275");
        Shelter himalayanHub = getOrCreateShelter(aarti, "Himalayan Animal Rescue Hub",
                "Foothills sanctuary focusing on mountain indie rescues, winter fleece shelters, and ethical high-altitude foster care.",
                ShelterOrganizationType.NGO, "SHELTER-UK-2020-033", "Rajpur Road Animal Campus", "Dehradun", "Uttarakhand", "248009", 70,
                "Emergency mountain rescue unit and heated recovery infirmary.");

        // Shelter 16: Indus Animal Life Foundation (Chandigarh) - UNDER_REVIEW
        User gurpreet = getOrCreateShelterManager("Gurpreet Singh", "gurpreet.indus@petverse.com", "9876543276", VerificationStatus.UNDER_REVIEW);
        Shelter indusFoundation = getOrCreateShelter(gurpreet, "Indus Animal Life Foundation",
                "Holistic animal welfare society offering free street-animal emergency response, vaccination drives, and humane adoption education.",
                ShelterOrganizationType.TRUST, "SHELTER-CH-2022-045", "Sector 38 West, Rescue Compound", "Chandigarh", "Chandigarh", "160036", 80,
                "Collaboration with Punjab Agricultural University Veterinary College.", VerificationStatus.UNDER_REVIEW);

        // Shelter 17: Coastal Strays Rescue Alliance (Panaji, Goa) - APPROVED
        User cedric = getOrCreateShelterManager("Cedric Fernandes", "cedric.coastal@petverse.com", "9876543277");
        Shelter coastalStrays = getOrCreateShelter(cedric, "Coastal Strays Rescue Alliance",
                "Beachside rescue organization rescuing abandoned holiday pets, community beach dogs, and injured coastal wildlife.",
                ShelterOrganizationType.NGO, "SHELTER-GA-2018-029", "Miramar Beach Sanctuary Zone", "Panaji", "Goa", "403001", 60,
                "In-house veterinary clinic with sterile operating theatre and isolation ward.");

        // Shelter 18: Madhya Animal Seva Trust (Indore, Madhya Pradesh) - APPROVED
        User pooja = getOrCreateShelterManager("Pooja Chouhan", "pooja.madhya@petverse.com", "9876543278");
        Shelter madhyaSeva = getOrCreateShelter(pooja, "Madhya Animal Seva Trust",
                "Animal seva sanctuary focused on street cow and indie canine trauma care, animal birth control, and family adoptions.",
                ShelterOrganizationType.TRUST, "SHELTER-MP-2020-112", "Super Corridor Welfare Enclave", "Indore", "Madhya Pradesh", "452005", 115,
                "Resident surgical veterinarian with high-frequency X-ray unit.");

        // Shelter 19: Brahmaputra Pet Care Haven (Guwahati, Assam) - PENDING
        User bikram = getOrCreateShelterManager("Bikram Borah", "bikram.brahmaputra@petverse.com", "9876543279", VerificationStatus.PENDING);
        Shelter brahmaputraHaven = getOrCreateShelter(bikram, "Brahmaputra Pet Care Haven",
                "Northeast region shelter offering flood disaster animal rescue, rehabilitation facilities, and safe family adoptions.",
                ShelterOrganizationType.NGO, "SHELTER-AS-2023-005", "VIP Road Animal Rescue Center, Six Mile", "Guwahati", "Assam", "781022", 75,
                "Emergency flood response boat unit and veterinary triage hospital.", VerificationStatus.PENDING);

        // Shelter 20: Malabar Animal Care Society (Kozhikode, Kerala) - APPROVED
        User fathima = getOrCreateShelterManager("Fathima Rahman", "fathima.malabar@petverse.com", "9876543280");
        Shelter malabarCare = getOrCreateShelter(fathima, "Malabar Animal Care Society",
                "Coastal Kerala shelter promoting compassion towards community animals, ethical ABC sterilizations, and loving adoptions.",
                ShelterOrganizationType.NGO, "SHELTER-KL-2021-081", "Beypore Harbor Rescue Complex", "Kozhikode", "Kerala", "673015", 80,
                "Partnered with Calicut District Veterinary Hospital for advanced surgeries and pathology.");

        // ── Animals for Shelter 1: Paws & Hope ──
        Animal buddy = createOrUpdateAnimal(pawsHope, "SH-PAWS-001", "Buddy", "Dog", "Labrador Retriever Mix",
                AnimalSex.MALE, 24, "Golden", "White star mark on chest", 26.5,
                "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
                "98514100889211", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Bright, alert, healthy body condition", null,
                "Gentle and eager to please. Friendly with cats and fellow canines.", null, emma);
        addMedicalAndVaccine(buddy, drSarah, "Annual Preventive Examination",
                "Fully healthy adult dog. Clear lungs, sound heart sounds, clean ears.",
                "Administered multivitamin paste and broad-spectrum dewormer.", "Rabies Vaccine Booster");
        createAdoptionListing(buddy, AnimalSize.LARGE, "Gentle, loyal, and loves outdoor fetch",
                "Needs 45 minutes of daily exercise. Good with first-time dog owners.", 40.0,
                "Buddy was rescued from an industrial park and has grown into the gentlest companion. Fully house-trained and great with kids.");

        Animal shadow = createOrUpdateAnimal(pawsHope, "SH-PAWS-002", "Shadow", "Dog", "Indian Pariah / Indie Pup",
                AnimalSex.MALE, 8, "Black & Tan", "Four white paws", 12.5,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600",
                "98514100889212", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Recovered from puppyhood malnutrition", null,
                "Quick learner, watchful, very loyal once bonded.", null, emma);
        addMedicalAndVaccine(shadow, drSarah, "Post-Intake Recovery Evaluation",
                "Normal growth velocity. Bloodwork shows recovered hematocrit levels.",
                "Prescribed balanced growth diet with calcium supplements.", "DHPP 7-in-1 Vaccine");
        createAdoptionListing(shadow, AnimalSize.MEDIUM, "Energetic, intelligent, and highly affectionate",
                "Fenced yard preferred. Very playful with other dogs.", 25.0,
                "Shadow is an exceptionally smart 8-month-old indie puppy. He learns commands in minutes and loves active adventures.");

        Animal cleo = createOrUpdateAnimal(pawsHope, "SH-PAWS-003", "Cleo", "Cat", "Domestic Calico",
                AnimalSex.FEMALE, 14, "Calico Tricolor", "Distinct black patch over left ear", 3.8,
                "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600",
                "98514100889213", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy, spayed adult feline", null,
                "Affectionate lap cat who enjoys head chin rubs and quiet rooms.", null, emma);
        addMedicalAndVaccine(cleo, drPriya, "Feline Pre-Adoption Wellness Check",
                "FIV/FeLV negative. Teeth clean and gums pink.",
                "Preventive topical flea/tick spot-on applied.", "FVRCP 3-in-1 Feline Vaccine");
        createAdoptionListing(cleo, AnimalSize.SMALL, "Calm, gentle, and adores cuddles",
                "Indoor-only home preferred. Quiet environment.", 30.0,
                "Cleo is a serene 1-year-old Calico queen. She will greet you with sweet purrs and happily curl up on your lap while you work.");

        Animal barnaby = createOrUpdateAnimal(pawsHope, "SH-PAWS-004", "Barnaby", "Dog", "Indie Hound Cross",
                AnimalSex.MALE, 24, "Fawn Brown", "Black muzzle", 20.0,
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
                "98514100889214", AnimalStatus.UNDER_MEDICAL_CARE, SterilizationStatus.NOT_STERILIZED,
                "Healing right hind leg hairline fracture", "Hind right metatarsal splint in place",
                "Patient, calm demeanor despite injury. Takes oral medicines easily.", "Leg fracture", emma);
        addMedicalAndVaccine(barnaby, drMarcus, "Orthopedic Fracture Progress Check",
                "Bone callus formation evident on palpation. Swelling subsided.",
                "Meloxicam 0.1mg/kg oral suspension, cage rest for 10 more days.", "Anti-Rabies Primary");

        // ── Animals for Shelter 2: Second Chance ──
        Animal max = createOrUpdateAnimal(secondChance, "SH-SEC-001", "Max", "Dog", "Boxer Mix",
                AnimalSex.MALE, 36, "Brindle & White", "Floppy ears, white chest blaze", 29.5,
                "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=600",
                "98514100994115", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Athletic, healthy adult canine", null,
                "Strong, playful, loves tug-of-war and long walks.", null, daniel);
        addMedicalAndVaccine(max, drSarah, "Routine Shelter Intake Physical",
                "Robust musculature, normal cardiovascular sounds.",
                "Heartworm preventive administered.", "DHPP Annual Booster");
        createAdoptionListing(max, AnimalSize.LARGE, "Playful, protective, and full of life",
                "Experienced dog owner preferred. Great jogging companion.", 45.0,
                "Max is a muscular, joyful Boxer mix who loves human companionship. He walks beautifully on leash and knows sit, stay, and paw.");

        Animal penny = createOrUpdateAnimal(secondChance, "SH-SEC-002", "Penny", "Dog", "Golden Mix",
                AnimalSex.FEMALE, 18, "Cream Golden", "Feathered tail", 22.0,
                "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
                "98514100994116", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Cheerful, healthy young female", null,
                "Gentle temperament, house trained, loves everyone she meets.", null, daniel);
        createAdoptionListing(penny, AnimalSize.MEDIUM, "Warm-hearted, joyful, and affectionate",
                "Wonderful family dog. Great with young kids.", 50.0,
                "Penny radiates happiness wherever she goes. She is eager to learn, adores belly rubs, and is ready to be your family's best friend.");

        Animal oliver = createOrUpdateAnimal(secondChance, "SH-SEC-003", "Oliver", "Cat", "Domestic Orange Tabby",
                AnimalSex.MALE, 12, "Orange Mackerel", "Classic white mittens", 4.2,
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
                "98514100994117", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Vibrant, energetic juvenile cat", null,
                "Playful, curious, loves feather wands and window perches.", null, daniel);
        createAdoptionListing(oliver, AnimalSize.SMALL, "Playful, chatty, and curious explorer",
                "Indoor home with scratching tree preferred.", 30.0,
                "Oliver is a bright 1-year-old ginger boy who chirps happily when you walk in the room. He is great with other cats.");

        // ── Animals for Shelter 3: Happy Tails (Chennai) ──
        Animal bruno = createOrUpdateAnimal(happyTails, "SH-HT-001", "Bruno", "Dog", "Beagle Indie Cross",
                AnimalSex.MALE, 20, "Tricolor Brown/Black", "Floppy hound ears", 16.0,
                "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=600",
                "98514100771201", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Active, healthy, loves tracking scent trails", null,
                "Sniffing enthusiast, good on leash, friendly with children.", null, rajesh);
        createAdoptionListing(bruno, AnimalSize.MEDIUM, "Inquisitive, social, and gentle hound mix",
                "Needs daily neighborhood sniff-walks.", 35.0,
                "Bruno is a loving 20-month-old hound mix who will steal your heart with his big expressive eyes and joyful tail wags.");

        Animal mittens = createOrUpdateAnimal(happyTails, "SH-HT-002", "Mittens", "Cat", "Tuxedo Shorthair",
                AnimalSex.FEMALE, 10, "Black & White", "Symmetrical white chest bib", 3.2,
                "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600",
                "98514100771202", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy young adult cat", null,
                "Sweet, quiet purrer who loves gentle brushing.", null, rajesh);
        createAdoptionListing(mittens, AnimalSize.SMALL, "Graceful, quiet, and devoted cuddlebug",
                "Cozy apartment or quiet household.", 25.0,
                "Mittens is dressed for a black-tie gala every single day. She loves sunbeams and curling up quietly beside you while reading.");

        // ── Animals for Shelter 4: Compassion Paw (Pune) ──
        Animal rocky = createOrUpdateAnimal(compassionPaw, "SH-CPF-001", "Rocky", "Dog", "German Shepherd Mix",
                AnimalSex.MALE, 30, "Sable Tan & Black", "Erect ears, alert posture", 31.0,
                "https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&q=80&w=600",
                "98514100771203", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Excellent athletic conditioning", null,
                "Loyal, highly trainable, eager for tasks.", null, neha);
        createAdoptionListing(rocky, AnimalSize.LARGE, "Intelligent, loyal protector and athletic partner",
                "Active owners with yard preferred.", 45.0,
                "Rocky is a noble German Shepherd cross who thrives with agility games, frisbee fetch, and dedicated obedience companionship.");

        Animal bella = createOrUpdateAnimal(compassionPaw, "SH-CPF-002", "Bella", "Dog", "Cocker Spaniel Indie Mix",
                AnimalSex.FEMALE, 15, "Caramel Gold", "Wavy coat with soft feathered ears", 14.5,
                "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=600",
                "98514100771204", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy, spayed young dog", null,
                "Gentle soul, affectionate, loves everyone.", null, neha);
        createAdoptionListing(bella, AnimalSize.MEDIUM, "Sweet, cheerful, and loves cuddling",
                "Regular grooming recommended.", 35.0,
                "Bella has the gentlest heart and silky caramel fur. She gets along with all dogs and loves nothing more than giving joyful kisses.");

        // ── Animals for Shelter 5: Guardian Angels (Hyderabad) ──
        Animal simba = createOrUpdateAnimal(guardianAngels, "SH-GA-001", "Simba", "Cat", "Persian Indie Cross",
                AnimalSex.MALE, 16, "Cream Buff", "Plush fluffy tail", 4.5,
                "https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&q=80&w=600",
                "98514100771205", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy semi-longhair feline", null,
                "Calm, regal, adores head scratches.", null, vikram);
        createAdoptionListing(simba, AnimalSize.SMALL, "Regal, fluffy, and serene gentleman",
                "Daily coat brushing required.", 30.0,
                "Simba looks like a miniature lion with a heart of pure gold. He will supervise your household with serene, loving grace.");

        Animal milo = createOrUpdateAnimal(guardianAngels, "SH-GA-002", "Milo", "Dog", "Dachshund Indie Cross",
                AnimalSex.MALE, 14, "Reddish Brown", "Long body, short energetic legs", 9.5,
                "https://images.unsplash.com/photo-1521673461164-de300ebcf4d7?auto=format&fit=crop&q=80&w=600",
                "98514100771206", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Spirited, playful young dog", null,
                "Courageous and spunky, loves blanket burrowing.", null, vikram);
        createAdoptionListing(milo, AnimalSize.SMALL, "Spunky, loving, and full of personality",
                "Avoid jumping from high furniture to protect back.", 35.0,
                "Milo may be small in stature, but he has an enormous personality. He loves burrowing under soft blankets and going on lively park walks.");

        // ── Animals for Shelter 6: Haven for Strays (Kolkata) ──
        Animal luna = createOrUpdateAnimal(havenStrays, "SH-HFS-001", "Luna", "Dog", "Indie Pointer Mix",
                AnimalSex.FEMALE, 11, "White with Black Patches", "Alert upright ears", 15.0,
                "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&q=80&w=600",
                "98514100771207", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Vibrant young dog with shiny coat", null,
                "Friendly, quick to learn, loves outdoor games.", null, ananya);
        createAdoptionListing(luna, AnimalSize.MEDIUM, "Joyful, agile, and wonderfully loyal",
                "Enjoys interactive puzzle toys.", 25.0,
                "Luna was rescued as a fragile puppy and has blossomed into a graceful, loyal companion ready to shower her new family with affection.");

        // ── Animals for Shelter 7: Safe Paws (New Delhi) ──
        Animal cooper = createOrUpdateAnimal(safePaws, "SH-SP-001", "Cooper", "Dog", "Golden Retriever Cross",
                AnimalSex.MALE, 22, "Warm Honey", "Wavy feathered tail", 27.0,
                "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=600",
                "98514100771208", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy, active adult canine", null,
                "Super friendly with all strangers and other pets.", null, karan);
        createAdoptionListing(cooper, AnimalSize.LARGE, "Affectionate, goofy, and loves water",
                "Great family companion for homes with children.", 40.0,
                "Cooper is a quintessential gentle giant who loves tennis balls, splashing in water puddles, and snuggling his head against your shoulder.");

        // ── Animals for Shelter 8: Shanti Trust (Ahmedabad) ──
        Animal daisy = createOrUpdateAnimal(shantiTrust, "SH-SAW-002", "Daisy", "Dog", "Poodle Indie Cross",
                AnimalSex.FEMALE, 12, "Cream White", "Soft curly fleece coat", 11.0,
                "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&q=80&w=600",
                "98514100771209", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Hypoallergenic coat type, healthy teeth", null,
                "Delicate, polite, very loving with gentle people.", null, meera);
        createAdoptionListing(daisy, AnimalSize.SMALL, "Gentle, low-shedding, and polite angel",
                "Ideal for apartment living.", 35.0,
                "Daisy is a sweet curly-coated angel who walks like a ballerina and loves nap time. She is low-shedding and wonderfully polite indoors.");

        // ── Animals for Shelter 9: Green Valley (Thiruvananthapuram) ──
        Animal charlie = createOrUpdateAnimal(greenValley, "SH-GV-001", "Charlie", "Dog", "Corgi Indie Mix",
                AnimalSex.MALE, 14, "Fawn with White Collar", "Thick fox brush tail", 13.5,
                "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&q=80&w=600",
                "98514100771210", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "Healthy, cheerful, sturdy build", null,
                "Playful herding instincts, affectionate.", null, rohit);
        createAdoptionListing(charlie, AnimalSize.MEDIUM, "Happy, smiling companion with cute foxy ears",
                "Loves ball play and garden fetch.", 30.0,
                "Charlie's smile will instantly brighten your day! He is full of good cheer, eager to please, and loves curling up beside you.");

        // ── Animals for Shelter 10: Whispering Pines (Mysuru) ──
        Animal toby = createOrUpdateAnimal(whisperingPines, "SH-WP-001", "Toby", "Dog", "Border Collie Mix",
                AnimalSex.MALE, 26, "Black & White", "One blue eye, one brown eye", 21.0,
                "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=600",
                "98514100771211", AnimalStatus.READY_FOR_ADOPTION, SterilizationStatus.STERILIZED,
                "High mental acuity, athletic build", null,
                "Smart, observant, thrives with interactive games.", null, sunita);
        createAdoptionListing(toby, AnimalSize.MEDIUM, "Intelligent, soulful, and devoted working cross",
                "Requires mental stimulation and daily exercise.", 40.0,
                "Toby is a brilliant and soulful companion with stunning heterochromia eyes. He learns tricks effortlessly and bonds deeply with his human.");
    }

    // ─── 4b. Adopters & Adoption Applications ───────────────────────────────────
    private void seedAdoptersAndApplications() {
        // 1. Aarav Patel (Bangalore)
        User aarav = getOrCreateAdopter("Aarav Patel", "adopter.aarav@petverse.com", "9876543261",
                "42 Palm Meadows, Whitefield, Bangalore, KA", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "1 friendly Golden Retriever (6 yrs, fully vaccinated)", "10+ years raising companion dogs with daily exercise and training",
                "Registered with Bangalore Pet Specialty Hospital for preventive vaccinations and wellness care");

        // 2. Priya Sen (Kochi)
        User priya = getOrCreateAdopter("Priya Sen", "adopter.priya@petverse.com", "9876543262",
                "Flat 304, Skyline Riverview, Kakkanad, Kochi, KL", HousingType.APARTMENT, LivingArrangement.ALONE,
                "None currently (previous childhood foster experience)", "Grew up in a multi-cat household; work remotely from home full-time",
                "Central Pet Hospital with Dr. Sarah Jenkins as family veterinarian");

        // 3. Rohan Gupta (Chennai)
        User rohan = getOrCreateAdopter("Rohan Gupta", "adopter.rohan@petverse.com", "9876543263",
                "15 Nilgiri Enclave, 2nd Main, Besant Nagar, Chennai, TN", HousingType.RENTED_HOUSE, LivingArrangement.WITH_ROOMMATES,
                "None currently", "Regular volunteer at community animal shelters; active long-distance runner",
                "Chennai Veterinary Polyclinic emergency plan established");

        // 4. Kavita Nair (Pune)
        User kavita = getOrCreateAdopter("Kavita Nair", "adopter.kavita@petverse.com", "9876543264",
                "88 Koregaon Park South Road, Pune, MH", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "None (had family dogs for over 15 years)", "Experienced pet parent with enclosed 1,500 sq.ft private garden",
                "Pune Advanced Veterinary Clinic with 24-hr trauma support");

        // 5. Siddharth Roy (Hyderabad)
        User siddharth = getOrCreateAdopter("Siddharth Roy", "adopter.siddharth@petverse.com", "9876543265",
                "Green Oasis Acres, Shamshabad Rural, Hyderabad, TS", HousingType.FARM, LivingArrangement.WITH_FAMILY,
                "2 friendly rescued farm canines", "30 years living on farms with large-breed dogs, horses, and rescued livestock",
                "Visiting farm veterinarian with on-call surgical capabilities");

        // 6. Sneha Varma (Kolkata)
        User sneha = getOrCreateAdopter("Sneha Varma", "adopter.sneha@petverse.com", "9876543266",
                "5B Salt Lake Sector III, Kolkata, WB", HousingType.APARTMENT, LivingArrangement.WITH_FAMILY,
                "1 neutered domestic cat (4 yrs)", "Experienced cat caregiver with fully netted balconies and scratch perches",
                "Salt Lake Animal Clinic with regular annual preventive vaccination protocols");

        // 7. Arjun Mehta (New Delhi)
        User arjun = getOrCreateAdopter("Arjun Mehta", "adopter.arjun@petverse.com", "9876543267",
                "C-14 Vasant Vihar, New Delhi, DL", HousingType.OWNED_HOUSE, LivingArrangement.ALONE,
                "None currently", "Author and remote journalist looking for a loyal, calm companion for neighborhood walks",
                "Vasant Kunj Pet Medical Center regular client");

        // 8. Divya Iyer (Ahmedabad)
        User divya = getOrCreateAdopter("Divya Iyer", "adopter.divya@petverse.com", "9876543268",
                "21 Bodakdev Greens, SG Highway, Ahmedabad, GJ", HousingType.APARTMENT, LivingArrangement.WITH_ROOMMATES,
                "None currently", "Certified animal foster parent with experience socializing nervous rescued puppies",
                "Ahmedabad Animal Welfare Polyclinic on speed dial");

        // 9. Manish Reddy (Thiruvananthapuram)
        User manish = getOrCreateAdopter("Manish Reddy", "adopter.manish@petverse.com", "9876543269",
                "Kowdiar Villa 9, Palace Gardens, Thiruvananthapuram, KL", HousingType.RENTED_HOUSE, LivingArrangement.WITH_FAMILY,
                "None (recent homeowners with pet-approved agreement)", "Family with two teenage children eager to adopt an indie rescue",
                "Government Veterinary Hospital, Palayam medical arrangement");

        // 10. Tanya Fernandez (Mysuru)
        User tanya = getOrCreateAdopter("Tanya Fernandez", "adopter.tanya@petverse.com", "9876543270",
                "7 Chamundi Hill View, Gokulam 3rd Stage, Mysuru, KA", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "1 elderly rescued indie dog (11 yrs, calm)", "Lifelong animal rescuer committed to positive reinforcement and ethical care",
                "Mysuru Pet Hospital dedicated veterinarian on call");

        // 11. Kabir Mehra (Jaipur)
        User kabir = getOrCreateAdopter("Kabir Mehra", "adopter.kabir@petverse.com", "9876543281",
                "18 Malviya Nagar Sector 4, Jaipur, RJ", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "None currently", "Lifelong dog lover looking to adopt an indie pup for our spacious family courtyard",
                "Jaipur Small Animal Clinic 24hr care");

        // 12. Ishita Saxena (Lucknow)
        User ishita = getOrCreateAdopter("Ishita Saxena", "adopter.ishita@petverse.com", "9876543282",
                "Flat 602, Gomti Vista Towers, Gomti Nagar, Lucknow, UP", HousingType.APARTMENT, LivingArrangement.ALONE,
                "1 neutered Persian mix cat (3 yrs)", "Remote software engineer, quiet home with secured cat safety screens",
                "Lucknow Veterinary Polyclinic");

        // 13. Venkatesh Balan (Coimbatore)
        User venkatesh = getOrCreateAdopter("Venkatesh Balan", "adopter.venkatesh@petverse.com", "9876543283",
                "52 Race Course Road, Coimbatore, TN", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "1 rescued Indie hound (5 yrs)", "Active outdoor family with daily morning trail walks on hills",
                "Coimbatore Blue Cross Hospital");

        // 14. Ritu Shah (Surat)
        User ritu = getOrCreateAdopter("Ritu Shah", "adopter.ritu@petverse.com", "9876543284",
                "Villa 14, Piplod Greens, Surat, GJ", HousingType.RENTED_HOUSE, LivingArrangement.WITH_ROOMMATES,
                "None currently", "Architect who loves animals; pet-friendly gated society with designated dog play park",
                "Surat City Pet Clinic");

        // 15. Aditya Rawat (Dehradun)
        User aditya = getOrCreateAdopter("Aditya Rawat", "adopter.aditya@petverse.com", "9876543285",
                "8 Mussorie Diversion Road, Dehradun, UK", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "2 friendly rescued mountain mixes", "Experienced caregiver on a half-acre natural hillside estate",
                "Dehradun Valley Vet Specialists");

        // 16. Simran Kaur (Chandigarh)
        User simran = getOrCreateAdopter("Simran Kaur", "adopter.simran@petverse.com", "9876543286",
                "House 210, Sector 18, Chandigarh, CH", HousingType.APARTMENT, LivingArrangement.ALONE,
                "None currently", "University professor, predictable daily routine with great proximity to Sukhna Lake parks",
                "Chandigarh Sector 22 Veterinary Hospital");

        // 17. Alfonso D'Souza (Panaji, Goa)
        User alfonso = getOrCreateAdopter("Alfonso D'Souza", "adopter.alfonso@petverse.com", "9876543287",
                "Villa Sol, Miramar Beach Road, Panaji, GA", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "1 rescue Labrador mix (7 yrs)", "Spacious beachside villa with fenced lawn, daily coastal exercise",
                "Panaji Animal Care Center");

        // 18. Deepak Sharma (Indore)
        User deepak = getOrCreateAdopter("Deepak Sharma", "adopter.deepak@petverse.com", "9876543288",
                "44 Scheme 54, Vijay Nagar, Indore, MP", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "None currently", "Business owner working from home; children enthusiastic about caring for a rescue puppy",
                "Indore Veterinary Hospital");

        // 19. Anamika Baruah (Guwahati)
        User anamika = getOrCreateAdopter("Anamika Baruah", "adopter.anamika@petverse.com", "9876543289",
                "Flat 4B, Brahmaputra Heights, Zoo Road, Guwahati, AS", HousingType.APARTMENT, LivingArrangement.ALONE,
                "1 rescued calico cat (2 yrs)", "Writer and educator, calm sunlit apartment with cat climbers",
                "Guwahati Pet Health Clinic");

        // 20. Zuhair Koya (Kozhikode)
        User zuhair = getOrCreateAdopter("Zuhair Koya", "adopter.zuhair@petverse.com", "9876543290",
                "Sea Breeze House, Beach Road, Kozhikode, KL", HousingType.OWNED_HOUSE, LivingArrangement.WITH_FAMILY,
                "None currently", "Experienced pet owner who grew up caring for injured birds and indie puppies",
                "Calicut District Veterinary Hospital");

        // ── Seed Adoption Applications Across Lifecycle States ──
        animalRepository.findByAnimalCode("SH-PAWS-001").ifPresent(buddy ->
                createOrUpdateAdoptionApplication(buddy, aarav, AdoptionApplicationStatus.APPROVED,
                        "We are looking for a playful, gentle canine to join our loving family and companion our 6-year-old retriever.",
                        "Spacious fenced garden, twice-daily walks around Whitefield park, and dedicated family time.",
                        "Home check conducted by shelter team. Outstanding family environment. Recommended for adoption."));

        animalRepository.findByAnimalCode("SH-PAWS-003").ifPresent(cleo ->
                createOrUpdateAdoptionApplication(cleo, priya, AdoptionApplicationStatus.COMPLETED,
                        "I work from home and want to provide a quiet, affectionate forever sanctuary for an indoor cat.",
                        "Sunny apartment with custom cat wall shelves, window beds, and premium wet/dry nutrition.",
                        "Adoption finalized and certificate handed over. Follow-up photo updates show Cleo thriving!"));

        animalRepository.findByAnimalCode("SH-PAWS-002").ifPresent(shadow ->
                createOrUpdateAdoptionApplication(shadow, rohan, AdoptionApplicationStatus.HOUSE_CHECK_PENDING,
                        "I love indies and want an energetic companion for trail running and outdoor adventures.",
                        "Active lifestyle with daily running routine. Roommates are all enthusiastic dog lovers.",
                        "Preliminary interview passed. Virtual house safety check scheduled with applicant."));

        animalRepository.findByAnimalCode("SH-SEC-002").ifPresent(penny ->
                createOrUpdateAdoptionApplication(penny, kavita, AdoptionApplicationStatus.UNDER_REVIEW,
                        "Our family has deeply missed having a gentle dog in our home. We want to welcome Penny as our daughter's best friend.",
                        "Private fenced lawn, family members home throughout the day, regular weekend outings.",
                        "Application reviewed by shelter manager. Verified spacious accommodation and solid prior pet history."));

        animalRepository.findByAnimalCode("SH-SEC-001").ifPresent(max ->
                createOrUpdateAdoptionApplication(max, siddharth, AdoptionApplicationStatus.SUBMITTED,
                        "Max will have 5 acres of open secure grounds to run, play, and live a joyful life on our family farm.",
                        "Large open-air farm estate, fresh balanced meals, daily runs, and 24-hr farm veterinary visits.",
                        "New submission received. Awaiting initial questionnaire review."));

        animalRepository.findByAnimalCode("SH-SEC-003").ifPresent(oliver ->
                createOrUpdateAdoptionApplication(oliver, sneha, AdoptionApplicationStatus.APPROVED,
                        "Looking for a playful companion for our resident cat and a sweet ginger boy to cherish.",
                        "Gradual scent-swapping introduction in a dedicated nursery room, high-protein grain-free diet.",
                        "Application approved! Adopter has extensive feline experience and secure balcony netting."));

        animalRepository.findByAnimalCode("SH-HT-001").ifPresent(bruno ->
                createOrUpdateAdoptionApplication(bruno, arjun, AdoptionApplicationStatus.SHELTER_REVIEW,
                        "I am looking for a calm, loyal dog who enjoys peaceful neighborhood morning strolls.",
                        "Independent quiet home, dedicated daily walking schedule, full-time companion presence.",
                        "Application under final review by shelter director. Positive initial telephone interview."));

        animalRepository.findByAnimalCode("SH-HFS-001").ifPresent(luna ->
                createOrUpdateAdoptionApplication(luna, divya, AdoptionApplicationStatus.SUBMITTED,
                        "Luna's playful eyes stole my heart. I want to give her the caring forever home she deserves.",
                        "Structured routine, enrichment puzzle toys, and positive reinforcement reward-based training.",
                        "New application submitted. Assigned to foster evaluation team."));

        animalRepository.findByAnimalCode("SH-SP-001").ifPresent(cooper ->
                createOrUpdateAdoptionApplication(cooper, manish, AdoptionApplicationStatus.UNDER_REVIEW,
                        "We are ready as a family to adopt our first rescue dog and provide Cooper with infinite love and fun.",
                        "All family members involved in daily walks and feeding. Pet-friendly society with huge central lawn.",
                        "Application received and documents verified. Landlord pet approval letter confirmed on file."));

        animalRepository.findByAnimalCode("SH-SAW-002").ifPresent(daisy ->
                createOrUpdateAdoptionApplication(daisy, tanya, AdoptionApplicationStatus.APPROVED,
                        "Daisy's gentle nature is perfect for our quiet household and our senior dog companion.",
                        "Peaceful ground-floor bungalow with gentle garden walks and top-tier veterinary care.",
                        "Adoption approved! Safe, peaceful environment with experienced senior caregiver."));

        animalRepository.findByAnimalCode("SH-HT-002").ifPresent(bella ->
                createOrUpdateAdoptionApplication(bella, kabir, AdoptionApplicationStatus.UNDER_REVIEW,
                        "Seeking a playful rescue cat to bond with our quiet household.",
                        "Window perches, vertical cat scratchers, quality wet and dry meals.",
                        "Application under review by shelter team."));

        animalRepository.findByAnimalCode("SH-CP-001").ifPresent(rocky ->
                createOrUpdateAdoptionApplication(rocky, ishita, AdoptionApplicationStatus.SUBMITTED,
                        "Rocky would thrive with an attentive caregiver who works from home.",
                        "Enclosed safety netting, daily enrichment games, premium grain-free food.",
                        "Initial questionnaire submitted by applicant."));

        animalRepository.findByAnimalCode("SH-CP-002").ifPresent(mittens ->
                createOrUpdateAdoptionApplication(mittens, venkatesh, AdoptionApplicationStatus.APPROVED,
                        "Looking forward to adopting Mittens and welcoming her into our serene family home.",
                        "Quiet environment, sunny veranda, regular veterinary checkups.",
                        "Application approved! Prior cat owner with clean reference check."));

        animalRepository.findByAnimalCode("SH-GA-001").ifPresent(simba ->
                createOrUpdateAdoptionApplication(simba, ritu, AdoptionApplicationStatus.HOUSE_CHECK_PENDING,
                        "Simba's energetic spirit is perfect for our active home.",
                        "Daily park runs, gated community with pet play area.",
                        "Virtual house check scheduled for weekend."));

        animalRepository.findByAnimalCode("SH-GA-002").ifPresent(nala ->
                createOrUpdateAdoptionApplication(nala, aditya, AdoptionApplicationStatus.APPROVED,
                        "Excited to provide Nala with a loving, quiet forever mountain home.",
                        "Heated indoor space, custom wooden perches, continuous veterinary care.",
                        "Approved by shelter director."));

        animalRepository.findByAnimalCode("SH-HFS-002").ifPresent(milo ->
                createOrUpdateAdoptionApplication(milo, simran, AdoptionApplicationStatus.SUBMITTED,
                        "Milo is the sweetest kitten and I would love to nurture him.",
                        "Full-time apartment companionship, kitten vaccination package booked.",
                        "Application under initial screening."));

        animalRepository.findByAnimalCode("SH-SP-002").ifPresent(maya ->
                createOrUpdateAdoptionApplication(maya, alfonso, AdoptionApplicationStatus.SHELTER_REVIEW,
                        "Providing a warm, coastal sanctuary for a rescued cat.",
                        "Sunlit rooms, vet care on call, high protein diet.",
                        "Under final shelter review."));

        animalRepository.findByAnimalCode("SH-SAW-001").ifPresent(leo ->
                createOrUpdateAdoptionApplication(leo, deepak, AdoptionApplicationStatus.APPROVED,
                        "Our family has been longing for a loyal dog companion like Leo.",
                        "Spacious home, daily park walks, dedicated children's playtime.",
                        "Approved! Excellent family environment and committed adopters."));

        animalRepository.findByAnimalCode("SH-GV-001").ifPresent(tommy ->
                createOrUpdateAdoptionApplication(tommy, anamika, AdoptionApplicationStatus.UNDER_REVIEW,
                        "Ready to adopt Tommy and give him the best care possible.",
                        "Positive reinforcement training, regular vet visits, loving attention.",
                        "Review in progress."));

        animalRepository.findByAnimalCode("SH-WP-001").ifPresent(raja ->
                createOrUpdateAdoptionApplication(raja, zuhair, AdoptionApplicationStatus.APPROVED,
                        "Proud to adopt an indie dog and give Raja the home he deserves.",
                        "Long beach walks, high-quality nutrition, calm home environment.",
                        "Approved for adoption."));
    }

    private Shelter getOrCreateShelter(User manager, String name, String desc,
                                       ShelterOrganizationType type, String regNo,
                                       String address, String city, String state, String pincode,
                                       int capacity, String vetCareArrangements) {
        return getOrCreateShelter(manager, name, desc, type, regNo, address, city, state, pincode, capacity, vetCareArrangements, VerificationStatus.APPROVED);
    }

    private Shelter getOrCreateShelter(User manager, String name, String desc,
                                       ShelterOrganizationType type, String regNo,
                                       String address, String city, String state, String pincode,
                                       int capacity, String vetCareArrangements, VerificationStatus status) {
        Shelter s = shelterRepository.findByManagerId(manager.getId()).orElseGet(() -> {
            Shelter shelter = new Shelter();
            shelter.setManager(manager);
            return shelter;
        });
        s.setShelterName(name);
        s.setDescription(desc);
        s.setOrganizationType(type);
        s.setRegistrationNumber(regNo);
        s.setAddressLine(address);
        s.setCity(city);
        s.setState(state);
        s.setPincode(pincode);
        s.setCapacity(capacity);
        s.setVeterinaryCareArrangements(vetCareArrangements);
        s.setVerificationStatus(status);
        return shelterRepository.save(s);
    }

    private User getOrCreateShelterManager(String name, String email, String phone) {
        return getOrCreateShelterManager(name, email, phone, VerificationStatus.APPROVED);
    }

    private User getOrCreateShelterManager(String name, String email, String phone, VerificationStatus status) {
        User u = userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User(name, email, passwordEncoder.encode("Password123!"), phone, "Shelter Manager");
            return user;
        });
        u.setName(name);
        u.setRole("Shelter Manager");
        u.setEnabled(true);
        u.setVerificationStatus(status);
        return userRepository.save(u);
    }

    private User getOrCreateAdopter(String name, String email, String phone, String address,
                                   HousingType housing, LivingArrangement living,
                                   String existingPets, String prevExp, String vetPlan) {
        User u = userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User(name, email, passwordEncoder.encode("Password123!"), phone, "Pet Owner");
            return user;
        });
        u.setName(name);
        u.setRole("Pet Owner");
        u.setEnabled(true);
        u.setAddress(address);
        User saved = userRepository.save(u);

        AdopterProfile profile = adopterProfileRepository.findByUserId(saved.getId()).orElseGet(() -> {
            AdopterProfile p = new AdopterProfile();
            p.setUser(saved);
            return p;
        });
        profile.setAddress(address);
        profile.setHousingType(housing);
        profile.setLivingArrangement(living);
        profile.setExistingPets(existingPets);
        profile.setPreviousPetExperience(prevExp);
        profile.setHouseholdMembers("Cooperative animal-loving household members committed to daily enrichment");
        profile.setPetCareExperience(prevExp);
        profile.setVeterinaryCarePlan(vetPlan);
        profile.setCanProvideFoodAndHousing(true);
        adopterProfileRepository.save(profile);

        return saved;
    }

    private void createOrUpdateAdoptionApplication(Animal animal, User adopter,
                                                   AdoptionApplicationStatus status,
                                                   String reason, String carePlan, String shelterNotes) {
        if (animal == null || adopter == null) return;
        AdopterProfile profile = adopterProfileRepository.findByUserId(adopter.getId()).orElse(null);
        if (profile == null) return;

        AdoptionApplication app = adoptionApplicationRepository.findByAnimalIdAndAdopterId(animal.getId(), adopter.getId()).orElseGet(() -> {
            AdoptionApplication a = new AdoptionApplication();
            a.setAnimal(animal);
            a.setAdopter(adopter);
            a.setAdopterProfile(profile);
            return a;
        });

        app.setStatus(status);
        app.setReasonForAdoption(reason);
        app.setPetCarePlan(carePlan);
        app.setVeterinaryCarePlanNotes("Regular bi-annual check-ups and immediate emergency veterinary coverage");
        app.setShelterNotes(shelterNotes);
        app.setSubmittedAt(LocalDateTime.now().minusDays(14));
        if (status == AdoptionApplicationStatus.APPROVED || status == AdoptionApplicationStatus.COMPLETED) {
            app.setDecidedAt(LocalDateTime.now().minusDays(3));
        }
        adoptionApplicationRepository.save(app);
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
        // Ensure Categories
        Category food = getOrCreateCategory("Pet Food", "Premium nutrition for dogs, cats, birds, and small animals.", "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=400");
        Category toys = getOrCreateCategory("Toys & Accessories", "Fun toys, chews, and interactive accessories to keep pets happy.", "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=400");
        Category grooming = getOrCreateCategory("Grooming", "Shampoos, brushes, clippers, and all grooming essentials.", "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&q=80&w=400");
        Category health = getOrCreateCategory("Health & Wellness", "Supplements, medications, and preventive healthcare products.", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400");
        Category beds = getOrCreateCategory("Beds & Furniture", "Comfortable beds, crates, kennels, and cat trees.", "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400");
        Category accessories = getOrCreateCategory("Accessories & Apparel", "Collars, leashes, harnesses, bowls, and pet wearables.", "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400");

        // Vendor 1: PetZoe Official Store
        User sellerPetZoe = getOrCreateVendor(
                "PetZoe Official Store", "seller@petverse.com", "9876543214",
                "The official PetZoe direct store providing veterinary-approved nutrition, health gear, and certified pet essentials.",
                "PetZoe Logistics Center, Brigade Tech Gardens, Bangalore, KA",
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=200"
        );

        // Vendor 2: Paws & Tails Nutrition Co.
        User vendorPawsTails = getOrCreateVendor(
                "Paws & Tails Nutrition Co.", "vendor.pawstails@petverse.com", "9876543241",
                "Crafting premium, organic, grain-free canine and feline nutrition using ethically sourced farm-fresh ingredients.",
                "14 Green Valley Industrial Estate, Andheri East, Mumbai, MH",
                "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200"
        );

        // Vendor 3: VetCare Pharma & Wellness
        User vendorVetCare = getOrCreateVendor(
                "VetCare Pharma & Wellness", "vendor.vetcare@petverse.com", "9876543242",
                "Licensed veterinary pharmacy offering clinical supplements, parasite controls, emergency first aid, and dental hygiene.",
                "Tech Zone Bio-Park, Kalamassery, Kochi, KL",
                "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=200"
        );

        // Vendor 4: Bark & Purr Luxury Boutique
        User vendorBarkPurr = getOrCreateVendor(
                "Bark & Purr Luxury Boutique", "vendor.barkpurr@petverse.com", "9876543243",
                "High-end pet lifestyle goods: orthopedic memory foam bedding, artisan Italian leather collars, modern cat trees, and travel gear.",
                "Plot 88 DLF Phase IV, Gurugram, NCR",
                "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=200"
        );

        // Vendor 5: PlayfulPaws Toys & Gear
        User vendorPlayfulPaws = getOrCreateVendor(
                "PlayfulPaws Toys & Gear", "vendor.playfulpaws@petverse.com", "9876543244",
                "Makers of ultra-durable chew toys, cognitive puzzle feeders, interactive laser balls, and high-energy agility gear.",
                "HITEC City Tech Commons, Hyderabad, TS",
                "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=200"
        );

        // Vendor 6: PureGlow Pet Spa & Grooming
        User vendorPureGlow = getOrCreateVendor(
                "PureGlow Pet Spa & Grooming", "vendor.pureglow@petverse.com", "9876543245",
                "Botanical grooming supplies, hypoallergenic soothing shampoos, ultrasonic deshedding tools, and salon-grade grooming accessories.",
                "Jubilee Hills Pet Wellness Avenue, Hyderabad, TS",
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=200"
        );

        // ── Products for Vendor 1: PetZoe Official Store ──
        createProductIfNotExists("Royal Canin Adult Dog Food", "Complete and balanced nutrition for adult dogs. Rich in high-quality proteins.",
                "Royal Canin", 2499.0, 1999.0, "RC-DOG-ADULT-3KG", 85,
                "https://images.unsplash.com/photo-1589924691995-400dc9edfabb?auto=format&fit=crop&q=80&w=400",
                "Maize, Chicken meal, Wheat, Vegetable protein extracts, Chicken fat",
                "Weight: 3kg|Life stage: Adult (1-7 years)|Breed size: All breeds|Protein: 25%",
                true, true, food, sellerPetZoe);

        createProductIfNotExists("Whiskas Adult Cat Food Tuna", "Ocean-caught tuna in jelly for the ultimate feline dining experience.",
                "Whiskas", 1299.0, 999.0, "WHS-CAT-TUNA-2KG", 120,
                "https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&q=80&w=400",
                "Tuna (min. 4%), Fish & Fish derivatives, Meat & Animal derivatives",
                "Weight: 2kg|Life stage: Adult|Format: Dry pellets|Protein: 30%",
                true, true, food, sellerPetZoe);

        createProductIfNotExists("Pedigree Puppy Chicken & Milk", "Specially formulated dry food for puppies up to 12 months with DHA.",
                "Pedigree", 899.0, null, "PED-PUP-CKN-1KG", 200,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400",
                "Whole grain corn, Poultry by-product meal, Soy meal, Beet pulp, Milk",
                "Weight: 1kg|Life stage: Puppy (0-12 months)|DHA for brain development",
                true, false, food, sellerPetZoe);

        createProductIfNotExists("PetZoe Heavy-Duty Travel Crate", "IATA-compliant airline-approved pet carrier crate with secure dual-spring latch.",
                "PetZoe Essentials", 3999.0, 3499.0, "PZ-TRV-CRATE-L", 40,
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400",
                "High-impact Polypropylene, Steel wire door",
                "Dimensions: 71x52x55 cm|Weight Capacity: up to 18kg|Airline Approved",
                true, true, accessories, sellerPetZoe);

        // ── Products for Vendor 2: Paws & Tails Nutrition Co. ──
        createProductIfNotExists("Acana Wild Prairie Grain-Free Dog Food", "Biologically appropriate nutrition packed with free-run chicken, turkey, and whole wild-caught fish.",
                "Acana", 3199.0, 2799.0, "ACN-DOG-WILD-2KG", 60,
                "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400",
                "Fresh chicken meat (8%), Fresh turkey meat (8%), Chicken giblets, Dehydrated pollock",
                "Weight: 2kg|Grain-Free: Yes|Protein: 35%|Origin: Canada",
                true, true, food, vendorPawsTails);

        createProductIfNotExists("Farmina N&D Ocean Herring & Orange Cat Food", "Grain-free ancestral formula for adult cats rich in wild North Sea herring and sweet Sicilian oranges.",
                "Farmina", 1850.0, 1599.0, "ND-CAT-HRG-1.5KG", 75,
                "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=400",
                "Fresh wild herring (32%), Dehydrated herring, Sweet potatoes, Dried orange",
                "Weight: 1.5kg|Low Glycemic Index|Omega-3 Fatty Acids: 2.1%",
                true, true, food, vendorPawsTails);

        createProductIfNotExists("PureBites Freeze-Dried Raw Beef Liver Treats", "Single-ingredient 100% pure USDA-inspected raw beef liver treats for dogs and cats.",
                "PureBites", 699.0, 599.0, "PB-TRT-BEEF-100G", 110,
                "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=400",
                "100% Pure Beef Liver",
                "Net Weight: 100g|Calories: 5 kcal per treat|Zero Preservatives",
                true, false, food, vendorPawsTails);

        createProductIfNotExists("Dental Chew Bones - Spearmint & Chlorophyll", "Veterinary formulated grain-free dental chews that reduce tartar buildup and freshen breath.",
                "Paws & Tails", 499.0, 429.0, "DC-BONE-MINT-L", 140,
                "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=400",
                "Potato starch, Glycerin, Powdered cellulose, Chlorophyll, Mint extract",
                "Pack Size: 12 bones|Size: Large (25kg+)|VOHC Accepted",
                true, false, food, vendorPawsTails);

        // ── Products for Vendor 3: VetCare Pharma & Wellness ──
        createProductIfNotExists("Beaphar Vitamin C & Calcium Supplement", "Daily clinical multivitamin tablets to support bone density, joint mobility, and systemic immunity.",
                "Beaphar", 799.0, 649.0, "BEA-VIT-C-150TAB", 200,
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Vitamin C, Calcium carbonate, Zinc gluconate, Biotin, Brewer's yeast",
                "150 chewable tablets|Dosage: 1 tab per 10kg body weight|For Dogs & Cats",
                true, true, health, vendorVetCare);

        createProductIfNotExists("Frontline Plus Flea & Tick Spot-On Treatment", "Fast-acting, long-lasting topical monthly treatment against fleas, ticks, and chewing lice.",
                "Frontline", 1199.0, 1049.0, "FL-SPOT-DOG-MED", 90,
                "https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?auto=format&fit=crop&q=80&w=400",
                "Fipronil 9.8%, (S)-Methoprene 8.8%",
                "3 Pipettes (3-month supply)|Weight Range: 10-20kg|Waterproof formula",
                true, true, health, vendorVetCare);

        createProductIfNotExists("Pet First Aid & Emergency Medical Kit", "Comprehensive 50-piece veterinary trauma kit including sterile bandages, tick remover, and saline wash.",
                "VetCare Emergency", 1499.0, 1299.0, "VET-FAK-EMERG-PRO", 50,
                "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?auto=format&fit=crop&q=80&w=400",
                "Sterile gauze, Cohesive wrap, Antiseptic wipes, Digital pet thermometer, Tick tweezer",
                "50 Pieces|Rip-stop nylon pouch with carabiner|Includes Vet First Aid Manual",
                true, true, health, vendorVetCare);

        createProductIfNotExists("Virbac Dual-Action Enzymatic Toothpaste & Brush Set", "Patented C.E.T. dual-enzyme dental system that inhibits plaque and freshens breath naturally.",
                "Virbac", 550.0, 480.0, "VB-DENT-ENZYM-KIT", 130,
                "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=400",
                "Glucose oxidase, Lactoperoxidase, Poultry flavoring",
                "Paste: 70g|Dual-ended toothbrush + Finger brush included|No rinsing required",
                true, false, health, vendorVetCare);

        createProductIfNotExists("Nutri-Plus High-Calorie Energy Gel", "Nutritional energy paste for recovering, pregnant, working, or convalescing dogs and cats.",
                "Virbac", 850.0, 750.0, "VB-NUTRI-GEL-120G", 80,
                "https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&q=80&w=400",
                "Triglycerides, Essential fatty acids, Vitamins A, D3, E, B-complex",
                "Net Weight: 120.5g|Easy-to-administer paste|Highly palatable",
                true, false, health, vendorVetCare);

        // ── Products for Vendor 4: Bark & Purr Luxury Boutique ──
        createProductIfNotExists("Orthopedic Memory Foam Dog Bed", "Medical-grade therapeutic memory foam bed with water-resistant liner and machine-washable plush cover.",
                "Bark & Purr Luxe", 3499.0, 2799.0, "CP-BED-ORTH-MED", 30,
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400",
                "High-density Orthopedic Memory Foam, Microfiber suede cover, Non-slip rubber base",
                "Size: Medium (80x60x10 cm)|Removable zipper cover|Relieves arthritis",
                true, true, beds, vendorBarkPurr);

        createProductIfNotExists("Cat Tree Condo with Multi-Level Sisal Scratching Posts", "5-tier modern luxury feline playground with cozy hideaway cube, hammock, and natural sisal rope.",
                "Bark & Purr Luxe", 4999.0, 3999.0, "PC-TREE-5LVL", 20,
                "https://images.unsplash.com/photo-1615796153287-98eacf0abb13?auto=format&fit=crop&q=80&w=400",
                "Solid engineered particle board, 100% natural sisal rope, Faux-fur plush",
                "Height: 145cm|Base: 50x50 cm|Max load: 20kg|Sturdy anti-toppling kit",
                true, true, beds, vendorBarkPurr);

        createProductIfNotExists("Cozy Calming Donut Shag Pet Bed", "Self-warming circular faux fur anti-anxiety donut cuddler that promotes restful deep sleep.",
                "Bark & Purr Luxe", 2299.0, 1899.0, "BP-BED-DONUT-GRY", 45,
                "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=400",
                "Shag vegan fur, Premium virgin AirLOFT fibers",
                "Diameter: 65cm|For pets up to 12kg|Machine washable and dryer safe",
                true, true, beds, vendorBarkPurr);

        createProductIfNotExists("Handcrafted Artisan Leather Dog Collar", "Hand-stitched full-grain bridle leather collar with antiqued solid brass hardware and D-ring.",
                "Bark & Purr Luxe", 1499.0, 1199.0, "BP-COL-LTHR-BRN", 60,
                "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400",
                "100% Genuine Full-Grain Cowhide Leather, Solid Brass",
                "Neck Size: Adjustable 38-48 cm|Width: 2.5 cm|Rich Chestnut Brown",
                true, false, accessories, vendorBarkPurr);

        createProductIfNotExists("No-Pull Tactical Dog Harness with Control Handle", "Military-grade 1050D nylon vest with front clip for no-pull leash control and heavy-duty top handle.",
                "Bark & Purr Luxe", 1299.0, 999.0, "BP-HRN-TACT-BLK", 70,
                "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=400",
                "1050D Nylon waterproof fabric, Breathable air mesh, Metal alloy shoulder buckles",
                "Size: Large (Chest 68-91 cm)|Reflective 3M stitching|MOLLE webbing panels",
                true, false, accessories, vendorBarkPurr);

        // ── Products for Vendor 5: PlayfulPaws Toys & Gear ──
        createProductIfNotExists("KONG Classic Ultra-Durable Rubber Chew Toy", "Legendary natural red rubber formula designed for strong chewers. Stuffed with kibble or peanut butter.",
                "KONG", 1499.0, 1199.0, "KNG-CLS-MED", 60,
                "https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&q=80&w=400",
                "100% All-Natural KONG Classic Red Rubber",
                "Size: Medium (7-16kg dogs)|Dishwasher safe|Erratic bounce for fetch",
                true, true, toys, vendorPlayfulPaws);

        createProductIfNotExists("Interactive Feather Wand Cat Teaser with Bell", "Flexible carbon-fiber rod with replaceable iridescent feathers that triggers predatory instincts.",
                "PlayfulPaws", 349.0, 299.0, "PL-CAT-WAND-01", 150,
                "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=400",
                "Carbon fiber wand, Real pheasant feathers, Sisal cord",
                "Telescopic length: 90 cm|Includes 3 feather refills and safety bell",
                true, false, toys, vendorPlayfulPaws);

        createProductIfNotExists("Outward Hound Interactive Hide-A-Squirrel Puzzle", "Plush cognitive puzzle game that challenges dogs to sniff, hunt, and extract squeaky squirrels.",
                "Outward Hound", 1299.0, 1099.0, "OH-SQRL-PZZL-L", 55,
                "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=400",
                "Reinforced plush trunk, Squeaker squirrel inserts",
                "Size: Large (Trunk + 3 Squeaky Squirrels)|Prevents boredom and destructive chewing",
                true, true, toys, vendorPlayfulPaws);

        createProductIfNotExists("Automatic Rolling Laser Ball Cat Toy with LED", "360-degree self-rotating smart sphere with built-in red laser and LED glow that rolls unpredictably.",
                "PlayfulPaws", 899.0, 749.0, "PP-BALL-LASER-AUTO", 80,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400",
                "Food-grade ABS plastic, Rechargeable Lithium battery",
                "USB Rechargeable|Runtime: 4 hours|Automatic 45-min timer shutoff",
                true, false, toys, vendorPlayfulPaws);

        createProductIfNotExists("Triple-Knot Heavy-Duty Cotton Rope Tug Toy", "Dense natural cotton rope built for tug-of-war, interactive bonding, and flossing teeth during play.",
                "PlayfulPaws", 449.0, 379.0, "PP-ROPE-TUG-3KNT", 110,
                "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=400",
                "100% Natural Cotton Fibers, Non-toxic dyes",
                "Length: 55 cm|Weight: 450g|3 Knots for dual hand grip",
                true, false, toys, vendorPlayfulPaws);

        // ── Products for Vendor 6: PureGlow Pet Spa & Grooming ──
        createProductIfNotExists("Himalaya Erina-EP Herbal Neem Dog Shampoo", "Ayurvedic soothing shampoo with organic neem, eucalyptus, and chickpea to eliminate fleas and soothe skin.",
                "Himalaya", 299.0, 249.0, "HIM-SHP-ERINA-200ML", 300,
                "https://images.unsplash.com/photo-1527164153729-6abbee0c0938?auto=format&fit=crop&q=80&w=400",
                "Azadirachta indica (Neem), Cicer arietinum (Chickpea), Eucalyptus oil",
                "Volume: 200ml|pH balanced for dogs & cats|Veterinarian tested",
                true, true, grooming, vendorPureGlow);

        createProductIfNotExists("FURminator Undercoat Deshedding Tool", "Stainless steel deShedding edge reaches deep beneath topcoat to safely remove loose undercoat hair.",
                "FURminator", 2999.0, 2499.0, "FRM-BRUSH-MED-SHORT", 35,
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400",
                "Stainless steel edge, Ergonomic rubber grip handle, FURejector button",
                "Size: Medium Dogs (9-23kg)|Coat: Short hair (under 5 cm)|Reduces shedding by 90%",
                true, true, grooming, vendorPureGlow);

        createProductIfNotExists("Burt's Bees Colloidal Oatmeal Hypoallergenic Dog Shampoo", "99.7% natural tearless formulation enriched with colloidal oat flour, honey, and beeswax for sensitive skin.",
                "Burt's Bees", 749.0, 649.0, "BB-SHP-OATM-473ML", 95,
                "https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&q=80&w=400",
                "Colloidal Oat Flour, Honey, Beeswax, Potassium Sorbate",
                "Volume: 473ml (16 fl oz)|Sulfate-free & Cruelty-free|Tearless pH balanced",
                true, false, grooming, vendorPureGlow);

        createProductIfNotExists("Professional Stainless Steel Pet Nail Clipper with Safety Guard", "Ultra-sharp 3.5mm surgical steel blades with built-in quick sensor safety stop and nail file.",
                "PureGlow Grooming", 499.0, 399.0, "PG-NAIL-PRO-SS", 120,
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400",
                "High-grade Stainless Steel, Non-slip rubber handles",
                "Safety stop guard to prevent over-cutting|Ergonomic spring mechanism|Hidden nail file in handle",
                true, false, grooming, vendorPureGlow);

        createProductIfNotExists("Pet Odor Neutralizing Lavender Grooming Wipes (100 Pack)", "Gentle alcohol-free cleansing wipes infused with aloe vera, chamomile, and natural lavender calming oil.",
                "PureGlow Grooming", 399.0, 329.0, "PG-WIPE-LAV-100PK", 180,
                "https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&q=80&w=400",
                "Purified water, Aloe Barbadensis leaf extract, Chamomile, Lavender essential oil",
                "Pack count: 100 textured wipes|Extra large 20x20 cm|Hypoallergenic & alcohol-free",
                true, false, grooming, vendorPureGlow);
    }

    private Category getOrCreateCategory(String name, String description, String imageUrl) {
        return categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Category c = new Category(name, description, imageUrl);
            return categoryRepository.save(c);
        });
    }

    private User getOrCreateVendor(String name, String email, String phone, String bio, String address, String profileImage) {
        return userRepository.findByEmail(email).map(existing -> {
            existing.setName(name);
            existing.setRole("Marketplace Seller");
            existing.setVerificationStatus(VerificationStatus.APPROVED);
            existing.setEnabled(true);
            existing.setBio(bio);
            existing.setAddress(address);
            if (profileImage != null && (existing.getProfileImage() == null || existing.getProfileImage().isBlank())) {
                existing.setProfileImage(profileImage);
            }
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User s = new User(name, email, passwordEncoder.encode("Password123!"), phone, "Marketplace Seller");
            s.setVerificationStatus(VerificationStatus.APPROVED);
            s.setEnabled(true);
            s.setBio(bio);
            s.setAddress(address);
            s.setProfileImage(profileImage);
            return userRepository.save(s);
        });
    }

    private void createProductIfNotExists(String name, String description, String brand,
                                          Double price, Double discountPrice, String sku,
                                          int stock, String imageUrl,
                                          String ingredients, String specifications,
                                          boolean approved, boolean featured,
                                          Category category, User seller) {
        if (productRepository.existsBySku(sku)) {
            return;
        }
        Product p = buildProduct(name, description, brand, price, discountPrice, sku,
                stock, imageUrl, ingredients, specifications, approved, featured, category, seller);
        productRepository.save(p);
    }

    private Product buildProduct(String name, String description, String brand,
                                 Double price, Double discountPrice, String sku,
                                 int stock, String imageUrl,
                                 String ingredients, String specifications,
                                 boolean approved, boolean featured,
                                 Category category, User seller) {
        Product p = new Product();
        p.setName(name);
        p.setShortDescription(description.length() > 120 ? description.substring(0, 117) + "..." : description);
        p.setDescription(description);
        p.setBrand(brand);
        p.setPrice(price);
        p.setMrp(discountPrice != null && discountPrice < price ? price * 1.2 : price * 1.15);
        p.setDiscountPrice(discountPrice);
        p.setSku(sku);
        p.setStockQuantity(stock);
        p.setLowStockThreshold(5);
        p.setImageUrl(imageUrl);
        p.setIngredients(ingredients);
        p.setSpecifications(specifications);
        p.setApproved(approved);
        p.setStatus(ProductStatus.APPROVED);
        p.setFeatured(featured);
        p.setAverageRating(Math.round((4.1 + Math.random() * 0.8) * 10.0) / 10.0);
        p.setReviewCount((int) (12 + Math.random() * 75));
        p.setCategory(category);
        p.setSeller(seller);
        return p;
    }
}
