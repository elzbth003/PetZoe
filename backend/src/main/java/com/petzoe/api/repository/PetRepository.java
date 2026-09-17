package com.petzoe.api.repository;

import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwner(User owner);
    Optional<Pet> findByPetCode(String petCode);
    Optional<Pet> findByPetCodeIgnoreCase(String petCode);
    boolean existsByPetCode(String petCode);

    @Query(value = "SELECT 'PZ-PET-' || LPAD(nextval('pet_code_seq')::text, 6, '0')", nativeQuery = true)
    String getNextPetCode();
}
