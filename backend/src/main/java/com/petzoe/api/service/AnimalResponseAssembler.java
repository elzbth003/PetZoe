package com.petzoe.api.service;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.Animal;
import com.petzoe.api.repository.AnimalIntakeRepository;
import com.petzoe.api.repository.MedicalDocumentRepository;
import com.petzoe.api.repository.MedicalRecordRepository;
import com.petzoe.api.repository.PreventiveCareRecordRepository;
import com.petzoe.api.repository.VaccinationRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.stream.Collectors;

/**
 * Builds the full AnimalResponseDTO (identification + intake history +
 * medical bundle) for both the shelter-facing and veterinarian-facing
 * animal endpoints, so the two don't duplicate the fetch/assembly logic.
 */
@Component
public class AnimalResponseAssembler {

    private final AnimalIntakeRepository animalIntakeRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PreventiveCareRecordRepository preventiveCareRecordRepository;

    public AnimalResponseAssembler(AnimalIntakeRepository animalIntakeRepository,
                                    MedicalRecordRepository medicalRecordRepository,
                                    VaccinationRepository vaccinationRepository,
                                    MedicalDocumentRepository medicalDocumentRepository,
                                    PreventiveCareRecordRepository preventiveCareRecordRepository) {
        this.animalIntakeRepository = animalIntakeRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.preventiveCareRecordRepository = preventiveCareRecordRepository;
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

        return new AnimalResponseDTO(animal, intakeHistory, medicalRecords, vaccinations, medicalDocuments, preventiveCareRecords);
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
}
