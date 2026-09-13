package com.petzoe.api.repository;

import com.petzoe.api.entity.Shelter;
import com.petzoe.api.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {
    Optional<Shelter> findByManagerId(Long managerId);
    Optional<Shelter> findByManager_Email(String email);
    List<Shelter> findByVerificationStatus(VerificationStatus status);
    long countByVerificationStatus(VerificationStatus status);
}
