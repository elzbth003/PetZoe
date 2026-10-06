package com.petzoe.api.service.chat;

import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PetZoeToolService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final PetVaccinationRecordRepository vaccinationRecordRepository;
    private final PetMedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PetRehomeListingRepository rehomeListingRepository;
    private final ProductRepository productRepository;

    public PetZoeToolService(UserRepository userRepository,
                             PetRepository petRepository,
                             AppointmentRepository appointmentRepository,
                             PetVaccinationRecordRepository vaccinationRecordRepository,
                             PetMedicalRecordRepository medicalRecordRepository,
                             PrescriptionRepository prescriptionRepository,
                             PetRehomeListingRepository rehomeListingRepository,
                             ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.rehomeListingRepository = rehomeListingRepository;
        this.productRepository = productRepository;
    }

    /**
     * Retrieves the caller's registered pets.
     */
    public String getUserPets(String userEmail) {
        return getUserPets(userEmail, null);
    }

    /**
     * Retrieves the caller's registered pets, optionally filtered by pet name or Pet ID.
     */
    public String getUserPets(String userEmail, String petQuery) {
        if (userEmail == null || userEmail.isBlank()) {
            return "Please log in to your PetZoe account to view your registered pets.";
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return "User account could not be found.";
        }

        List<Pet> pets = petRepository.findByOwner(user);
        if (pets.isEmpty()) {
            return "You do not have any pets registered in your PetZoe profile yet. You can register your pet anytime from your dashboard!";
        }

        if (petQuery != null && !petQuery.isBlank()) {
            String cleanQuery = petQuery.trim().toLowerCase();
            List<Pet> matched = pets.stream()
                    .filter(p -> (p.getName() != null && (p.getName().equalsIgnoreCase(cleanQuery) || p.getName().toLowerCase().contains(cleanQuery))) ||
                                 (p.getPetCode() != null && (p.getPetCode().equalsIgnoreCase(cleanQuery) || p.getPetCode().toLowerCase().contains(cleanQuery))))
                    .collect(Collectors.toList());

            if (matched.isEmpty()) {
                return "Could not find a pet matching '" + petQuery + "' under your account. Your registered pets are: " +
                        pets.stream().map(Pet::getName).collect(Collectors.joining(", ")) + ".";
            }

            StringBuilder sb = new StringBuilder();
            for (Pet pet : matched) {
                sb.append(String.format("### Pet Profile: **%s** (`%s`)\n", pet.getName(), pet.getPetCode()));
                sb.append(String.format("• **Species**: %s | **Breed**: %s | **Gender**: %s\n",
                        pet.getSpecies(), pet.getBreed(), pet.getGender()));
                sb.append(String.format("• **Age**: %d %s old\n",
                        pet.getAge(), pet.getAge() == 1 ? "year" : "years"));
                sb.append(String.format("• **Immunization Status**: %s\n", pet.getVaccinationStatus()));
                if (pet.getWeight() != null) {
                    sb.append(String.format("• **Weight**: %.1f kg\n", pet.getWeight()));
                }
                if (pet.getColor() != null && !pet.getColor().isBlank()) {
                    sb.append(String.format("• **Color**: %s\n", pet.getColor()));
                }
                sb.append("\nYou can ask for ").append(pet.getName()).append("'s vaccination records, medical history, or upcoming appointments anytime!");
            }
            return sb.toString();
        }

        StringBuilder sb = new StringBuilder("Here are the pets registered to your profile:\n");
        for (Pet pet : pets) {
            sb.append(String.format("• **%s** (%s) — %s, %s, %d %s old | Immunization: %s | Pet ID: `%s`\n",
                    pet.getName(),
                    pet.getSpecies(),
                    pet.getBreed(),
                    pet.getGender(),
                    pet.getAge(),
                    pet.getAge() == 1 ? "year" : "years",
                    pet.getVaccinationStatus(),
                    pet.getPetCode()));
        }
        return sb.toString();
    }

    /**
     * Retrieves the caller's upcoming appointments.
     */
    public String getUpcomingAppointments(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return "Please log in to view your upcoming veterinary consultations.";
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return "User account could not be found.";

        List<Appointment> appointments;
        if ("Veterinarian".equalsIgnoreCase(user.getRole())) {
            appointments = appointmentRepository.findByVeterinarian(user).stream()
                    .filter(a -> "UPCOMING".equalsIgnoreCase(a.getStatus()) || "CONFIRMED".equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());
        } else {
            appointments = appointmentRepository.findByOwner(user).stream()
                    .filter(a -> "UPCOMING".equalsIgnoreCase(a.getStatus()) || "CONFIRMED".equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());
        }

        if (appointments.isEmpty()) {
            return "You have no upcoming veterinary appointments scheduled. You can book an appointment anytime with our verified doctors.";
        }

        StringBuilder sb = new StringBuilder("Here are your upcoming appointments:\n");
        for (Appointment a : appointments) {
            String doctorName = (a.getVeterinarian() != null) ? a.getVeterinarian().getName() : "Assigned Veterinarian";
            String petName = (a.getPet() != null) ? a.getPet().getName() : "Patient";
            sb.append(String.format("• **%s** with Dr. %s on **%s** at **%s** (Status: %s) — Reason: %s\n",
                    petName,
                    doctorName,
                    a.getAppointmentDate(),
                    a.getAppointmentTime(),
                    a.getStatus(),
                    a.getNotes() != null ? a.getNotes() : "Routine Consultation"));
        }
        return sb.toString();
    }

    /**
     * Retrieves vaccination records for the caller's pets.
     */
    public String getVaccinationHistory(String userEmail, String petNameQuery) {
        if (userEmail == null || userEmail.isBlank()) {
            return "Please log in to view vaccination records.";
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return "User not found.";

        List<Pet> pets = petRepository.findByOwner(user);
        if (pets.isEmpty()) {
            return "No pets found in your profile to check vaccination records.";
        }

        if (petNameQuery != null && !petNameQuery.isBlank()) {
            pets = pets.stream()
                    .filter(p -> p.getName().equalsIgnoreCase(petNameQuery.trim()) || p.getPetCode().equalsIgnoreCase(petNameQuery.trim()))
                    .collect(Collectors.toList());
        }

        if (pets.isEmpty()) {
            return "Could not find a pet matching '" + petNameQuery + "' under your account.";
        }

        StringBuilder sb = new StringBuilder();
        for (Pet pet : pets) {
            List<PetVaccinationRecord> records = vaccinationRecordRepository.findByPetIdOrderByDateAdministeredDesc(pet.getId());
            sb.append(String.format("### Immunization History for %s (`%s`)\n", pet.getName(), pet.getPetCode()));
            sb.append("Current Status: **").append(pet.getVaccinationStatus()).append("**\n");

            if (records.isEmpty()) {
                sb.append("_No detailed vaccine administration entries logged yet._\n\n");
            } else {
                for (PetVaccinationRecord rec : records) {
                    sb.append(String.format("• **%s** (Administered: %s, Next Due: %s, Batch: %s)\n",
                            rec.getVaccineName(),
                            rec.getDateAdministered(),
                            rec.getNextDueDate() != null ? rec.getNextDueDate() : "N/A",
                            rec.getBatchLotNumber() != null ? rec.getBatchLotNumber() : "Verified"));
                }
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    /**
     * Retrieves clinical medical records for the caller's pets.
     */
    public String getMedicalRecords(String userEmail, String petNameQuery) {
        if (userEmail == null || userEmail.isBlank()) {
            return "Please log in to view clinical medical records.";
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return "User not found.";

        List<Pet> pets = petRepository.findByOwner(user);
        if (pets.isEmpty()) return "No pets found in your profile.";

        if (petNameQuery != null && !petNameQuery.isBlank()) {
            pets = pets.stream()
                    .filter(p -> p.getName().equalsIgnoreCase(petNameQuery.trim()) || p.getPetCode().equalsIgnoreCase(petNameQuery.trim()))
                    .collect(Collectors.toList());
        }

        if (pets.isEmpty()) {
            return "Could not find a pet matching '" + petNameQuery + "' under your account.";
        }

        StringBuilder sb = new StringBuilder();
        for (Pet pet : pets) {
            List<PetMedicalRecord> records = medicalRecordRepository.findByPetIdOrderByExaminationDateDesc(pet.getId());
            sb.append(String.format("### Clinical Records for %s (`%s`)\n", pet.getName(), pet.getPetCode()));

            if (records.isEmpty()) {
                sb.append("_No clinical consultation records filed yet._\n\n");
            } else {
                for (PetMedicalRecord rec : records) {
                    sb.append(String.format("• **%s** (Exam Date: %s) — Diagnosis: *%s*\n  Treatment: %s\n",
                            rec.getVeterinarian() != null ? "Dr. " + rec.getVeterinarian().getName() : "Attending Vet",
                            rec.getExaminationDate(),
                            rec.getDiagnosis() != null ? rec.getDiagnosis() : "General Checkup",
                            rec.getTreatment() != null ? rec.getTreatment() : "Follow general pet-care advice"));
                }
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    /**
     * Retrieves prescription history for the caller's pets.
     */
    public String getPrescriptionHistory(String userEmail, String petNameQuery) {
        if (userEmail == null || userEmail.isBlank()) {
            return "Please log in to view active prescriptions.";
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return "User not found.";

        List<Pet> pets = petRepository.findByOwner(user);
        if (pets.isEmpty()) return "No pets found in your profile.";

        if (petNameQuery != null && !petNameQuery.isBlank()) {
            pets = pets.stream()
                    .filter(p -> p.getName().equalsIgnoreCase(petNameQuery.trim()) || p.getPetCode().equalsIgnoreCase(petNameQuery.trim()))
                    .collect(Collectors.toList());
        }

        if (pets.isEmpty()) {
            return "Could not find a pet matching '" + petNameQuery + "' under your account.";
        }

        StringBuilder sb = new StringBuilder();
        for (Pet pet : pets) {
            List<Prescription> prescriptions = prescriptionRepository.findByPetIdOrderByCreatedAtDesc(pet.getId());
            sb.append(String.format("### Prescriptions for %s (`%s`)\n", pet.getName(), pet.getPetCode()));

            if (prescriptions.isEmpty()) {
                sb.append("_No active electronic prescriptions._\n\n");
            } else {
                for (Prescription rx : prescriptions) {
                    sb.append(String.format("• **%s** — Dosage: %s | Frequency: %s | Duration: %s (Prescribed by Dr. %s)\n",
                            rx.getMedicineName(),
                            rx.getDosage() != null ? rx.getDosage() : "As directed",
                            rx.getFrequency() != null ? rx.getFrequency() : "Daily",
                            rx.getDuration() != null ? rx.getDuration() : "Standard course",
                            rx.getVeterinarian() != null ? rx.getVeterinarian().getName() : "Attending Doctor"));
                }
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    /**
     * Searches verified veterinarians. Publicly accessible.
     */
    public String searchVeterinarians(String cityQuery, String specQuery) {
        List<User> vets = userRepository.findByRole("Veterinarian").stream()
                .filter(u -> u.isEnabled() && u.getVerificationStatus() == VerificationStatus.APPROVED)
                .collect(Collectors.toList());

        if (specQuery != null && !specQuery.isBlank()) {
            vets = vets.stream()
                    .filter(v -> v.getSpecialization() != null && v.getSpecialization().toLowerCase().contains(specQuery.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (vets.isEmpty()) {
            return "No verified veterinarians matching your search were found. You can browse all verified doctors in the PetZoe Veterinarian Directory.";
        }

        StringBuilder sb = new StringBuilder("Here are certified PetZoe veterinarians available for consultations:\n");
        for (User v : vets.stream().limit(5).collect(Collectors.toList())) {
            sb.append(String.format("• **Dr. %s** — Specialization: %s | %s\n",
                    v.getName(),
                    v.getSpecialization() != null ? v.getSpecialization() : "General Practice",
                    v.getAddress() != null ? v.getAddress() : "Available for online & clinic appointments"));
        }
        return sb.toString();
    }

    /**
     * Searches active community and shelter adoption listings. Publicly accessible.
     */
    public String searchAdoptionListings(String speciesQuery) {
        StringBuilder sb = new StringBuilder("### Pet Adoption on PetZoe:\n");
        sb.append("1. **Find a Pet**: Explore the **Rehoming Board** (`/rehoming`) for community adoptions or **Shelter Adoptions** (`/adopt`) for rescues.\n");
        sb.append("2. **Review Profiles**: Check verified photos, medical history, immunization status, and permanent Pet IDs (`PZ-PET-XXXXXX`).\n");
        sb.append("3. **Apply & Connect**: Click 'Adopt Me' to connect directly with the pet's caregiver or shelter.\n\n");

        List<PetRehomeListing> listings;
        if (speciesQuery != null && !speciesQuery.isBlank()) {
            String trimmed = speciesQuery.trim().toLowerCase();
            listings = rehomeListingRepository.findByStatusOrderByCreatedAtDesc("ACTIVE").stream()
                    .filter(l -> l.getPet() != null && l.getPet().getSpecies() != null &&
                            (l.getPet().getSpecies().toLowerCase().contains(trimmed) || trimmed.contains(l.getPet().getSpecies().toLowerCase())))
                    .collect(Collectors.toList());
        } else {
            listings = rehomeListingRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
        }

        if (listings.isEmpty()) {
            sb.append("Currently, there are no active listings matching that search. Visit the Rehoming Board (`/rehoming`) or Shelter Adoptions (`/adopt`) to see all pets awaiting a loving home!");
            return sb.toString();
        }

        sb.append("Here are pets currently looking for a forever home:\n");
        for (PetRehomeListing l : listings.stream().limit(5).collect(Collectors.toList())) {
            sb.append(String.format("• **%s** (%s, %s, %s) in %s — Title: *%s* (Pet ID: `%s`)\n",
                    l.getPet().getName(),
                    l.getPet().getSpecies(),
                    l.getPet().getBreed(),
                    l.getPet().getAge() + " yrs",
                    l.getCity() != null ? l.getCity() : "Nearby",
                    l.getTitle(),
                    l.getPet().getPetCode()));
        }
        return sb.toString();
    }

    /**
     * Searches approved marketplace products. Publicly accessible.
     */
    public String searchMarketplaceProducts(String query) {
        if (query == null || query.isBlank()) query = "Pet";
        List<Product> products = productRepository.searchApproved(query, PageRequest.of(0, 5)).getContent();
        if (products.isEmpty()) {
            return "No products matching '" + query + "' were found. Visit our PetZoe Marketplace (/marketplace) to browse certified food, medicines, and toys.";
        }

        StringBuilder sb = new StringBuilder("Here are certified marketplace products for your pets:\n");
        for (Product p : products) {
            sb.append(String.format("• **%s** (Brand: %s) — Price: $%.2f | Stock: %d\n",
                    p.getName(),
                    p.getBrand() != null ? p.getBrand() : "PetZoe Essentials",
                    p.getPrice(),
                    p.getStockQuantity()));
        }
        return sb.toString();
    }

    /**
     * Contextual navigation help.
     */
    public String getPlatformHelp(String topic) {
        if (topic == null) topic = "general";
        String lower = topic.toLowerCase();
        if (lower.contains("pet") || lower.contains("add pet")) {
            return "To register a new pet, go to **My Pets** on your Owner Dashboard and click **'Add Pet'**. Each pet receives a permanent, tamper-proof Pet ID code!";
        }
        if (lower.contains("appointment") || lower.contains("book")) {
            return "To book a visit, go to **Appointments** on your Dashboard, select a certified veterinarian, and pick an available date and time slot.";
        }
        if (lower.contains("adopt") || lower.contains("rehome")) {
            return "You can explore pets for adoption on the **Community Rehoming Board** (`/rehoming`) or institutional rescues at **Shelter Adoptions** (`/adopt`).";
        }
        if (lower.contains("shop") || lower.contains("product")) {
            return "Explore high-quality nutrition, pharmacy supplements, and accessories on the **PetZoe Marketplace** (`/marketplace`).";
        }
        return "PetZoe is a complete digital pet healthcare platform offering permanent Pet ID tracking, veterinary telehealth appointments, community rehoming, and a certified pet marketplace.";
    }
}
