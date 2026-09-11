package com.petzoe.api.repository;

import com.petzoe.api.entity.PetMedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetMedicalDocumentRepository extends JpaRepository<PetMedicalDocument, Long> {
    List<PetMedicalDocument> findByPetIdOrderByUploadedAtDesc(Long petId);
}
