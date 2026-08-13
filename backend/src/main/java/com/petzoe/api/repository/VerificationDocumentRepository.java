package com.petzoe.api.repository;

import com.petzoe.api.entity.VerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, Long> {
    List<VerificationDocument> findByVeterinarianProfileId(Long veterinarianProfileId);
}
