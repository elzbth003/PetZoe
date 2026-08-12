package com.petzoe.api.repository;

import com.petzoe.api.entity.AdoptionPet;
import com.petzoe.api.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionPetRepository extends JpaRepository<AdoptionPet, Long> {
    Page<AdoptionPet> findByVerificationStatus(VerificationStatus status, Pageable pageable);
    List<AdoptionPet> findByShelterManagerId(Long shelterManagerId);
}
