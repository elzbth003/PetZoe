package com.petzoe.api.repository;

import com.petzoe.api.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByAnimalIdOrderByDateAdministeredDesc(Long animalId);
}
