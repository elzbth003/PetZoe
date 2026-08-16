package com.petzoe.api.repository;

import com.petzoe.api.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByAnimalIdOrderByExaminationDateDesc(Long animalId);
}
