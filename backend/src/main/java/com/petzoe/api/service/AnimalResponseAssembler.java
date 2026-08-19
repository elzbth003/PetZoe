package com.petzoe.api.service;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.Animal;
import com.petzoe.api.entity.AdoptionListing;
import com.petzoe.api.repository.AdoptionListingRepository;
import com.petzoe.api.repository.AnimalIntakeRepository;
import com.petzoe.api.repository.MedicalDocumentRepository;
import com.petzoe.api.repository.MedicalRecordRepository;
import com.petzoe.api.repository.PreventiveCareRecordRepository;
import com.petzoe.api.repository.VaccinationRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Builds the full AnimalResponseDTO (identification + intake history +
 * medical bundle + adoption listing) for both the shelter-facing and
 * veterinarian-facing animal endpoints, so the two don't duplicate the
 * fetch/assembly logic.
 */
@Component
public class AnimalResponseAssembler {

    private final AnimalIntakeRepository animalIntakeRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PreventiveCareRecordRepository preventiveCareRecordRepository;
    private final AdoptionListingRepository adoptionListingRepository;

    public AnimalResponseAssembler(AnimalIntakeRepository animalIntakeRepository,
                                    MedicalRecordRepository medicalRecordRepository,
                                    VaccinationRepository vaccinationRepository,
                                    MedicalDocumentRepository medicalDocumentRepository,
                                    PreventiveCareRecordRepository preventiveCareRecordRepository,
                                    AdoptionListingRepository adoptionListingRepository) {
        this.animalIntakeRepository = animalIntakeRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.preventiveCareRecordRepository = preventiveCareRecordRepository;
        this.adoptionListingRepository = adoptionListingRepository;
    }

    public AnimalResponseDTO assemble(Animal animal) {
        var intakeHistory = animalIntakeRepository.findByAnimalIdOrderByCreatedAtDesc(animal.getId())
                .stream().map(AnimalIntakeDTO::new).collect(Collectors.toList());
        var medicalRecords = medicalRecordRepository.findByAnimalIdOrderByExaminationDateDesc(animal.getId())
                .stream().map(MedicalRecordDTO::new).collect(Collectors.toList());
        var vaccinations = vaccinationRepository.findByAnimalIdOrderByDateAdministeredDesc(animal.getId())
                .stream().map(VaccinationDTO::new).collect(Collectors.toList());
        var medicalDocuments = medicalDocumentRepository.findByAnimalIdOrderByUploadedAtDesc(animal.getId())
                .stream().map(MedicalDocumentDTO::new).collect(Collectors.toList());
        var preventiveCareRecords = preventiveCareRecordRepository.findByAnimalIdOrderByDateAdministeredDesc(animal.getId())
                .stream().map(PreventiveCareDTO::new).collect(Collectors.toList());

        AdoptionListingDTO listingDTO = adoptionListingRepository.findByAnimalId(animal.getId())
                .map(listing -> new AdoptionListingDTO(listing,
                        computeMissingRequirements(animal, medicalRecords, vaccinations, medicalDocuments, listing)))
                .orElse(null);

        return new AnimalResponseDTO(animal, intakeHistory, medicalRecords, vaccinations, medicalDocuments,
                preventiveCareRecords, listingDTO);
    }

    /** Whether this animal has any vaccination or preventive-care item past its due date. */
    public boolean hasOverdueCare(Animal animal) {
        LocalDate today = LocalDate.now();
        boolean overdueVaccination = vaccinationRepository.findByAnimalIdOrderByDateAdministeredDesc(animal.getId())
                .stream().anyMatch(v -> v.getNextDueDate() != null && v.getNextDueDate().isBefore(today));
        boolean overduePreventiveCare = preventiveCareRecordRepository.findByAnimalIdOrderByDateAdministeredDesc(animal.getId())
                .stream().anyMatch(r -> r.getNextDueDate() != null && r.getNextDueDate().isBefore(today));
        return overdueVaccination || overduePreventiveCare;
    }

    /**
     * Advisory checklist for admin listing review (spec section 10) — not all
     * items are hard submission blockers, some (like vaccination) only apply
     * "where applicable" and are left to admin judgement.
     */
    public List<String> computeMissingRequirements(Animal animal, List<MedicalRecordDTO> medicalRecords,
                                                     List<VaccinationDTO> vaccinations,
                                                     List<MedicalDocumentDTO> medicalDocuments,
                                                     AdoptionListing listing) {
        List<String> missing = new ArrayList<>();
        if (animal.getInitialAssessmentRecordedAt() == null) missing.add("Initial shelter assessment not recorded");
        if (medicalRecords.isEmpty()) missing.add("No veterinary assessment recorded");
        if (vaccinations.isEmpty()) missing.add("No vaccination records (confirm not applicable)");
        if (medicalDocuments.isEmpty()) missing.add("No supporting medical documents uploaded");
        if (listing == null || listing.getPersonality() == null || listing.getPersonality().isBlank())
            missing.add("Listing personality description missing");
        if (listing == null || listing.getListingDescription() == null || listing.getListingDescription().isBlank())
            missing.add("Listing description missing");
        return missing;
    }
}
