package com.petzoe.api.repository;

import com.petzoe.api.entity.PetMedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PetMedicalRecordRepository extends JpaRepository<PetMedicalRecord, Long> {
    List<PetMedicalRecord> findByPetIdOrderByExaminationDateDesc(Long petId);
    List<PetMedicalRecord> findByVeterinarianIdOrderByExaminationDateDesc(Long veterinarianId);
    List<PetMedicalRecord> findByVeterinarianIdAndFollowUpRequiredTrueOrderByFollowUpDateAsc(Long veterinarianId);
    long countByVeterinarianIdAndFollowUpRequiredTrueAndFollowUpDateLessThanEqual(Long veterinarianId, LocalDate date);
}
