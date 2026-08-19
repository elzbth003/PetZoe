package com.petzoe.api.repository;

import com.petzoe.api.entity.AdoptionListing;
import com.petzoe.api.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionListingRepository extends JpaRepository<AdoptionListing, Long> {
    Optional<AdoptionListing> findByAnimalId(Long animalId);
    List<AdoptionListing> findByStatus(VerificationStatus status);
}
