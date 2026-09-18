package com.petzoe.api.repository;

import com.petzoe.api.entity.PetRehomeApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRehomeApplicationRepository extends JpaRepository<PetRehomeApplication, Long> {

    List<PetRehomeApplication> findByListingIdOrderByCreatedAtDesc(Long listingId);

    List<PetRehomeApplication> findByApplicantIdOrderByCreatedAtDesc(Long applicantId);

    List<PetRehomeApplication> findByListingIdAndStatus(Long listingId, String status);

    boolean existsByListingIdAndApplicantIdAndStatus(Long listingId, Long applicantId, String status);

    long countByListingId(Long listingId);

    long countByListingIdAndStatus(Long listingId, String status);
}
