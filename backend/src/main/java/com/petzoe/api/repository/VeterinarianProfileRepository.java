package com.petzoe.api.repository;

import com.petzoe.api.entity.VeterinarianProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VeterinarianProfileRepository extends JpaRepository<VeterinarianProfile, Long> {
    Optional<VeterinarianProfile> findByUserId(Long userId);
}
