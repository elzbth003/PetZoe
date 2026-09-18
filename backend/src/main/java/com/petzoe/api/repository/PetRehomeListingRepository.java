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
           "AND (:species IS NULL OR LOWER(l.pet.species) = LOWER(:species)) " +
           "AND (:query IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(l.pet.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(l.pet.breed) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(l.city) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(l.pet.petCode) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<PetRehomeListing> searchActiveListings(@Param("species") String species, @Param("query") String query);
}
