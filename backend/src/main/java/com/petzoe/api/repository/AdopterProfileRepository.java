package com.petzoe.api.repository;

import com.petzoe.api.entity.AdopterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdopterProfileRepository extends JpaRepository<AdopterProfile, Long> {
    Optional<AdopterProfile> findByUserId(Long userId);
}
