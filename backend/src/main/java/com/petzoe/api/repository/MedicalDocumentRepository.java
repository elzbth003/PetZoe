package com.petzoe.api.repository;

import com.petzoe.api.entity.MedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    List<MedicalDocument> findByAnimalIdOrderByUploadedAtDesc(Long animalId);
}
