package com.petzoe.api.repository;

import com.petzoe.api.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {
    List<Animal> findByShelterId(Long shelterId);
    Optional<Animal> findByAnimalCode(String animalCode);
}
