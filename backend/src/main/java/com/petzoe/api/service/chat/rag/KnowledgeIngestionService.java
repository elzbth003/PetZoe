package com.petzoe.api.service.chat.rag;

import com.petzoe.api.entity.KnowledgeChunk;
import com.petzoe.api.entity.KnowledgeDocument;
import com.petzoe.api.repository.KnowledgeChunkRepository;
import com.petzoe.api.repository.KnowledgeDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class KnowledgeIngestionService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeIngestionService.class);

    private final KnowledgeDocumentRepository documentRepository;
    private final KnowledgeChunkRepository chunkRepository;
    private final DocumentChunkingService chunkingService;
    private final EmbeddingService embeddingService;

    public KnowledgeIngestionService(KnowledgeDocumentRepository documentRepository,
                                     KnowledgeChunkRepository chunkRepository,
                                     DocumentChunkingService chunkingService,
                                     EmbeddingService embeddingService) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
    }

    /**
     * Ingests or updates a knowledge document with section chunking and vector embeddings.
     */
    @Transactional
    public KnowledgeDocument ingestDocument(String title, String category, String publisher,
                                            String sourceUrl, String version, String fullContent) {
        String contentHash = computeHash(fullContent);

        KnowledgeDocument document = documentRepository.findByContentHash(contentHash).orElse(null);
        if (document != null && "ACTIVE".equals(document.getStatus())) {
            log.info("Document '{}' with hash {} is already indexed and active.", title, contentHash);
            return document;
        }

        if (document == null) {
            document = new KnowledgeDocument(title, sourceUrl, publisher, category, version, contentHash, "ACTIVE");
            document.setPublishedAt(LocalDateTime.now());
            document.setReviewedAt(LocalDateTime.now());
            document = documentRepository.save(document);
        } else {
            // Existing document updated - clear old chunks
            chunkRepository.deleteByDocumentId(document.getId());
            document.setTitle(title);
            document.setPublisher(publisher);
            document.setSourceUrl(sourceUrl);
            document.setCategory(category);
            document.setDocumentVersion(version);
            document.setStatus("ACTIVE");
            document.setUpdatedAt(LocalDateTime.now());
            document = documentRepository.save(document);
        }

        List<DocumentChunkingService.RawChunk> rawChunks = chunkingService.chunkDocument(fullContent, title);
        log.info("Chunked document '{}' into {} chunks. Generating embeddings...", title, rawChunks.size());

        for (DocumentChunkingService.RawChunk rc : rawChunks) {
            String textForEmbedding = rc.getSectionTitle() + ": " + rc.getContent();
            Float[] embedding = embeddingService.generateEmbedding(textForEmbedding);

            KnowledgeChunk chunk = new KnowledgeChunk(
                    document,
                    rc.getChunkIndex(),
                    rc.getSectionTitle(),
                    rc.getContent(),
                    embedding,
                    embeddingService.getEmbeddingModelName()
            );
            chunkRepository.save(chunk);
        }

        log.info("Successfully ingested document '{}' with {} vector chunks.", title, rawChunks.size());
        return document;
    }

    private String computeHash(String content) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash content", e);
        }
    }
}
