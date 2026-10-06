package com.petzoe.api.repository;

import com.petzoe.api.entity.PetRehomeListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRehomeListingRepository extends JpaRepository<PetRehomeListing, Long> {

    List<PetRehomeListing> findByStatusOrderByCreatedAtDesc(String status);

    List<PetRehomeListing> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<PetRehomeListing> findByPetIdAndStatus(Long petId, String status);

    boolean existsByPetIdAndStatus(Long petId, String status);

    @Query("SELECT l FROM PetRehomeListing l WHERE l.status = 'ACTIVE' " +
           "AND (CAST(:species AS string) IS NULL OR LOWER(l.pet.species) = LOWER(CAST(:species AS string))) " +
           "AND (CAST(:query AS string) IS NULL " +
           "     OR LOWER(l.title) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) " +
           "     OR LOWER(l.pet.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) " +
           "     OR LOWER(l.pet.breed) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) " +
           "     OR LOWER(l.city) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) " +
           "     OR LOWER(l.pet.petCode) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<PetRehomeListing> searchActiveListings(@Param("species") String species, @Param("query") String query);
}
