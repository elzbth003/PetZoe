package com.petzoe.api.repository;

import com.petzoe.api.entity.ShelterDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShelterDocumentRepository extends JpaRepository<ShelterDocument, Long> {
    List<ShelterDocument> findByShelterId(Long shelterId);
}
