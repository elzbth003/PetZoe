package com.petzoe.api.repository;

import com.petzoe.api.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    Optional<KnowledgeDocument> findByContentHash(String contentHash);
    List<KnowledgeDocument> findByStatus(String status);
    List<KnowledgeDocument> findByCategoryAndStatus(String category, String status);
}
