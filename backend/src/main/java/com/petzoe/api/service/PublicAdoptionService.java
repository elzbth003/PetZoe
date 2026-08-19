package com.petzoe.api.service;

import com.petzoe.api.dto.PublicAnimalDetailDTO;
import com.petzoe.api.dto.PublicAnimalSummaryDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.AdoptionListingRepository;
import com.petzoe.api.repository.AnimalRepository;
import com.petzoe.api.repository.MedicalRecordRepository;
import com.petzoe.api.repository.VaccinationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Public, unauthenticated browsing of adoptable animals (spec section 11).
 * Only animals whose status is READY_FOR_ADOPTION AND whose shelter is still
 * APPROVED are searchable — a shelter suspended after listing an animal
 * immediately drops out of public results even though the animal row itself
 * hasn't changed.
 */
@Service
public class PublicAdoptionService {

    /** Statuses visible on the detail page even though they no longer show up in search —
     * so a shared link doesn't 404 outright once an application/adoption is in progress. */
    private static final Set<AnimalStatus> DETAIL_VISIBLE_STATUSES = EnumSet.of(
            AnimalStatus.READY_FOR_ADOPTION, AnimalStatus.ADOPTION_PENDING, AnimalStatus.ADOPTED);

    private final AnimalRepository animalRepository;
    private final AdoptionListingRepository adoptionListingRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;

    public PublicAdoptionService(AnimalRepository animalRepository,
                                  AdoptionListingRepository adoptionListingRepository,
                                  MedicalRecordRepository medicalRecordRepository,
                                  VaccinationRepository vaccinationRepository) {
        this.animalRepository = animalRepository;
        this.adoptionListingRepository = adoptionListingRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
    }

    public Page<PublicAnimalSummaryDTO> search(String species, String breed, AnimalSex sex, AnimalSize size,
                                                String city, String state, Pageable pageable) {
        List<Animal> available = animalRepository.findByStatusAndShelter_VerificationStatus(
                AnimalStatus.READY_FOR_ADOPTION, VerificationStatus.APPROVED);

        List<PublicAnimalSummaryDTO> filtered = available.stream()
                .filter(a -> species == null || species.isBlank() || a.getSpecies().equalsIgnoreCase(species))
                .filter(a -> breed == null || breed.isBlank() || (a.getBreed() != null && a.getBreed().toLowerCase().contains(breed.toLowerCase())))
                .filter(a -> sex == null || a.getSex() == sex)
                .filter(a -> city == null || city.isBlank() || (a.getShelter().getCity() != null && a.getShelter().getCity().equalsIgnoreCase(city)))
                .filter(a -> state == null || state.isBlank() || (a.getShelter().getState() != null && a.getShelter().getState().equalsIgnoreCase(state)))
                .sorted(Comparator.comparing(Animal::getCreatedAt).reversed())
                .map(a -> {
                    AdoptionListing listing = adoptionListingRepository.findByAnimalId(a.getId()).orElse(null);
                    return new PublicAnimalSummaryDTO(a, listing, "Available");
                })
                .filter(dto -> size == null || dto.getSize() == size)
                .collect(Collectors.toList());

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    public List<String> getDistinctSpecies() {
        return animalRepository.findByStatusAndShelter_VerificationStatus(AnimalStatus.READY_FOR_ADOPTION, VerificationStatus.APPROVED)
                .stream().map(Animal::getSpecies).distinct().sorted().collect(Collectors.toList());
    }

    public PublicAnimalDetailDTO getAnimalDetail(Long id) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("This animal is not available for adoption."));

        if (!DETAIL_VISIBLE_STATUSES.contains(animal.getStatus())
                || animal.getShelter().getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new NoSuchElementException("This animal is not available for adoption.");
        }

        AdoptionListing listing = adoptionListingRepository.findByAnimalId(animal.getId())
                .orElseThrow(() -> new NoSuchElementException("This animal is not available for adoption."));

        String healthSummary = medicalRecordRepository.findByAnimalIdOrderByExaminationDateDesc(animal.getId())
                .stream().findFirst().map(MedicalRecord::getHealthStatus).orElse("Health assessment pending.");

        String vaccinationStatus = computeVaccinationStatus(animal.getId());

        String adoptionStatus = switch (animal.getStatus()) {
            case READY_FOR_ADOPTION -> "Available";
            case ADOPTION_PENDING -> "Adoption Pending";
            case ADOPTED -> "Adopted";
            default -> "Unavailable";
        };

        return new PublicAnimalDetailDTO(animal, listing, healthSummary, vaccinationStatus, adoptionStatus);
    }

    private String computeVaccinationStatus(Long animalId) {
        List<com.petzoe.api.entity.Vaccination> vaccinations = vaccinationRepository.findByAnimalIdOrderByDateAdministeredDesc(animalId);
        if (vaccinations.isEmpty()) {
            return "No vaccination records";
        }
        LocalDate today = LocalDate.now();
        boolean anyOverdue = vaccinations.stream().anyMatch(v -> v.getNextDueDate() != null && v.getNextDueDate().isBefore(today));
        return anyOverdue ? "Vaccination overdue" : "Up to date";
    }
}
