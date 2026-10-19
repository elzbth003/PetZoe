package com.petzoe.api.service.chat;

import com.petzoe.api.dto.PatientContextDTO;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.PetMedicalRecord;
import com.petzoe.api.entity.PetVaccinationRecord;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.PetMedicalRecordRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.PetVaccinationRecordRepository;
import com.petzoe.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Resolves patient context securely within the authenticated user's ownership boundaries.
 * Extracts stated age from the prompt, detects age discrepancies against verified database records,
 * and retrieves factual deworming and immunization history without fabricating unrecorded care.
 */
@Service
@Transactional(readOnly = true)
public class PatientContextService {

    private static final Logger log = LoggerFactory.getLogger(PatientContextService.class);

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PetMedicalRecordRepository medicalRecordRepository;
    private final PetVaccinationRecordRepository vaccinationRecordRepository;

    private static final Pattern STATED_AGE_PATTERN = Pattern.compile(
            "(?i)\\b(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\\s*(months?|weeks?|years?|days?)\\s*(old)?\\b"
    );

    public PatientContextService(UserRepository userRepository,
                                 PetRepository petRepository,
                                 PetMedicalRecordRepository medicalRecordRepository,
                                 PetVaccinationRecordRepository vaccinationRecordRepository) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
    }

    /**
     * Resolves patient context for an identified pet name under the authenticated user's account.
     */
    public PatientContextDTO resolvePatientContext(String userEmail, String petCandidate, String rawMessage) {
        PatientContextDTO dto = new PatientContextDTO();

        // 1. Authorization check
        if (userEmail == null || userEmail.isBlank()) {
            dto.setAccessAuthorized(false);
            return dto;
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            dto.setAccessAuthorized(false);
            return dto;
        }

        if (petCandidate == null || petCandidate.isBlank()) {
            dto.setAccessAuthorized(false);
            return dto;
        }

        // 2. Fetch user's registered pets only (ownership isolation)
        List<Pet> userPets = petRepository.findByOwner(user);
        String cleanQuery = petCandidate.trim().toLowerCase();

        List<Pet> matched = userPets.stream()
                .filter(p -> (p.getName() != null && (p.getName().equalsIgnoreCase(cleanQuery) || p.getName().toLowerCase().contains(cleanQuery))) ||
                             (p.getPetCode() != null && (p.getPetCode().equalsIgnoreCase(cleanQuery) || p.getPetCode().toLowerCase().contains(cleanQuery))))
                .collect(Collectors.toList());

        if (matched.isEmpty()) {
            log.info("Pet candidate '{}' not found among {} registered pets for user '{}'", petCandidate, userPets.size(), userEmail);
            dto.setAccessAuthorized(false);
            dto.setNotFound(true);
            return dto;
        }

        if (matched.size() > 1) {
            log.info("Ambiguous pet query '{}' matched multiple pets for user '{}'", petCandidate, userEmail);
            dto.setAccessAuthorized(false);
            dto.setMultipleMatchesFound(true);
            dto.setMatchingPetNames(matched.stream().map(Pet::getName).collect(Collectors.toList()));
            return dto;
        }

        // 3. Exact unique patient resolved
        Pet pet = matched.get(0);
        dto.setAccessAuthorized(true);
        dto.setPetId(pet.getId());
        dto.setPetCode(pet.getPetCode());
        dto.setName(pet.getName());
        dto.setSpecies(pet.getSpecies());
        dto.setBreed(pet.getBreed());
        dto.setGender(pet.getGender());
        dto.setRegisteredAgeYears(pet.getAge());
        dto.setWeightKg(pet.getWeight());

        // 4. Stated age extraction & discrepancy analysis
        String statedAge = extractStatedAge(rawMessage);
        dto.setStatedAge(statedAge);

        if (statedAge != null) {
            boolean discrepancy = evaluateAgeDiscrepancy(statedAge, pet.getAge());
            dto.setHasAgeDiscrepancy(discrepancy);
            if (discrepancy) {
                dto.setAgeDiscrepancyNote(String.format(
                        "User stated age is %s, but PetZoe registered records list %s as %d %s old.",
                        statedAge, pet.getName(), pet.getAge(), pet.getAge() == 1 ? "year" : "years"
                ));
            }
        }

        // 5. Query factual deworming history (do not fabricate unrecorded care)
        List<PetMedicalRecord> medicalRecords = medicalRecordRepository.findByPetIdOrderByExaminationDateDesc(pet.getId());
        String dewormingHistory = extractDewormingHistory(medicalRecords);
        dto.setRecordedDewormingHistory(dewormingHistory);

        // 6. Immunization status
        List<PetVaccinationRecord> vaxRecords = vaccinationRecordRepository.findByPetIdOrderByDateAdministeredDesc(pet.getId());
        if (!vaxRecords.isEmpty()) {
            String vaxSummary = vaxRecords.stream()
                    .limit(3)
                    .map(v -> v.getVaccineName() + " (Administered: " + (v.getDateAdministered() != null ? v.getDateAdministered().toString() : "Recorded") + ")")
                    .collect(Collectors.joining(", "));
            dto.setRecordedVaccinationSummary(vaxSummary);
        } else {
            dto.setRecordedVaccinationSummary(pet.getVaccinationStatus() != null ? pet.getVaccinationStatus() : "No vaccination records on file");
        }

        // 7. Clinical notes / Allergies
        StringBuilder notes = new StringBuilder();
        if (pet.getAllergies() != null && !pet.getAllergies().isBlank()) {
            notes.append("Allergies: ").append(pet.getAllergies()).append(". ");
        }
        if (pet.getMedicalNotes() != null && !pet.getMedicalNotes().isBlank()) {
            notes.append("Medical Notes: ").append(pet.getMedicalNotes());
        }
        dto.setRelevantMedicalNotes(notes.toString().trim());

        return dto;
    }

    public String extractStatedAge(String message) {
        if (message == null || message.isBlank()) return null;
        Matcher m = STATED_AGE_PATTERN.matcher(message);
        if (m.find()) {
            return m.group(0).trim();
        }
        return null;
    }

    private boolean evaluateAgeDiscrepancy(String statedAge, Integer registeredAgeYears) {
        if (statedAge == null || registeredAgeYears == null) return false;
        String lower = statedAge.toLowerCase();

        // If stated age is in months or weeks (e.g. 2 months, 8 weeks), but registered age is 1+ years
        if ((lower.contains("month") || lower.contains("week") || lower.contains("day")) && registeredAgeYears >= 1) {
            return true;
        }

        // If stated in years but numbers differ
        Matcher numMatcher = Pattern.compile("\\d+").matcher(lower);
        if (numMatcher.find() && lower.contains("year")) {
            try {
                int statedYears = Integer.parseInt(numMatcher.group());
                return statedYears != registeredAgeYears;
            } catch (NumberFormatException ignored) {}
        }

        return false;
    }

    private String extractDewormingHistory(List<PetMedicalRecord> records) {
        if (records == null || records.isEmpty()) {
            return "No deworming treatment recorded (Note: Absence of records indicates no treatment has been logged in PetZoe; it does not confirm the pet has never received care outside the platform).";
        }

        List<String> dewormingEntries = records.stream()
                .filter(r -> {
                    String combined = (r.getTreatment() + " " + r.getMedication() + " " + r.getDiagnosis() + " " + r.getVeterinaryNotes()).toLowerCase();
                    return combined.contains("deworm") || combined.contains("worm") || combined.contains("anthelmintic") || combined.contains("parasite");
                })
                .map(r -> String.format("%s: %s (Medication: %s)",
                        r.getExaminationDate() != null ? r.getExaminationDate().toString() : "Date unrecorded",
                        r.getTreatment() != null ? r.getTreatment() : "Deworming administered",
                        r.getMedication() != null ? r.getMedication() : "Prescribed by vet"))
                .collect(Collectors.toList());

        if (dewormingEntries.isEmpty()) {
            return "No deworming treatment recorded in PetZoe medical history (Note: Absence of records indicates no treatment has been logged in PetZoe; it does not confirm the pet has never received care outside the platform).";
        }

        return String.join("; ", dewormingEntries);
    }
}
