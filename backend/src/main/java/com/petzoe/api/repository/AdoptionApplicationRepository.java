package com.petzoe.api.repository;

import com.petzoe.api.entity.AdoptionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionApplicationRepository extends JpaRepository<AdoptionApplication, Long> {
    List<AdoptionApplication> findByAdopterIdOrderByCreatedAtDesc(Long adopterId);
    Optional<AdoptionApplication> findByAnimalIdAndAdopterId(Long animalId, Long adopterId);
    List<AdoptionApplication> findByAnimal_Shelter_ManagerIdOrderByCreatedAtDesc(Long managerId);

    @org.springframework.data.jpa.repository.Query("SELECT a.status, COUNT(a) FROM AdoptionApplication a GROUP BY a.status")
    List<Object[]> countByStatusGrouped();
}
