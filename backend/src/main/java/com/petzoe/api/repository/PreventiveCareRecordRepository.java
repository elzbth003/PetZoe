package com.petzoe.api.repository;

import com.petzoe.api.entity.PreventiveCareRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreventiveCareRecordRepository extends JpaRepository<PreventiveCareRecord, Long> {
    List<PreventiveCareRecord> findByAnimalIdOrderByDateAdministeredDesc(Long animalId);
}
