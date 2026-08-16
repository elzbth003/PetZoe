package com.petzoe.api.repository;

import com.petzoe.api.entity.AnimalIntake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalIntakeRepository extends JpaRepository<AnimalIntake, Long> {
    List<AnimalIntake> findByAnimalIdOrderByCreatedAtDesc(Long animalId);
    Optional<AnimalIntake> findFirstByAnimalIdOrderByCreatedAtDesc(Long animalId);
}
