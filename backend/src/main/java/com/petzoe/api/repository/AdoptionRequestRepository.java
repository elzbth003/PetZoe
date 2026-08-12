package com.petzoe.api.repository;

import com.petzoe.api.entity.AdoptionRequest;
import com.petzoe.api.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {
    List<AdoptionRequest> findByPetOwnerId(Long petOwnerId);
    Page<AdoptionRequest> findByStatus(VerificationStatus status, Pageable pageable);
}
