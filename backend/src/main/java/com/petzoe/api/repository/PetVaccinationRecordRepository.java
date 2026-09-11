package com.petzoe.api.repository;

import com.petzoe.api.entity.PetVaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetVaccinationRecordRepository extends JpaRepository<PetVaccinationRecord, Long> {
    List<PetVaccinationRecord> findByPetIdOrderByDateAdministeredDesc(Long petId);
}
