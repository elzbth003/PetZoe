package com.petzoe.api.repository;

import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VetScanRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VetScanRecordRepository extends JpaRepository<VetScanRecord, Long> {

    List<VetScanRecord> findByPetOrderByCreatedAtDesc(Pet pet);

    List<VetScanRecord> findByPetIdOrderByCreatedAtDesc(Long petId);

    Optional<VetScanRecord> findTopByPetAndStatusOrderByCreatedAtDesc(Pet pet, String status);

    Optional<VetScanRecord> findTopByPetIdAndStatusOrderByCreatedAtDesc(Long petId, String status);

    List<VetScanRecord> findByOwnerOrderByCreatedAtDesc(User owner);

    long countByPet(Pet pet);
}
