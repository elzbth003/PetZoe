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
import java.util.ArrayList;
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
     * Backward-compatible ingestion overload.
     */
    @Transactional
    public KnowledgeDocument ingestDocument(String title, String category, String publisher,
                                            String sourceUrl, String version, String fullContent) {
        return ingestDocument(title, category, publisher, sourceUrl, version, fullContent,
                null, "Canine and Feline", category, "OFFICIAL_CLINICAL_GUIDELINE", "Open Access / Educational Attribution");
    }

    /**
     * Research-grade ingestion with complete source provenance and metadata.
     */
    @Transactional
    public KnowledgeDocument ingestDocument(String title, String category, String publisher,
                                            String sourceUrl, String version, String fullContent,
                                            String doi, String species, String clinicalTopic,
                                            String evidenceType, String license) {
        String contentHash = computeHash(fullContent);

        KnowledgeDocument document = documentRepository.findByContentHash(contentHash).orElse(null);
        if (document != null && "ACTIVE".equals(document.getStatus())) {
            // Check if chunks have matching embedding model
            List<KnowledgeChunk> existingChunks = chunkRepository.findByDocumentIdOrderByChunkIndexAsc(document.getId());
            boolean modelMatches = !existingChunks.isEmpty() && 
                    existingChunks.stream().allMatch(c -> embeddingService.isModelCompatible(c.getEmbeddingModel(), c.getEmbeddingDimension()));
            
            if (modelMatches) {
                log.info("Document '{}' is already indexed with active model '{}'.", title, embeddingService.getActiveModelIdentifier());
                return document;
            }
            log.info("Document '{}' exists but embedding model differs. Re-indexing chunks...", title);
        }

        if (document == null) {
            document = new KnowledgeDocument(title, sourceUrl, publisher, category, version, contentHash, "ACTIVE");
            document.setPublishedAt(LocalDateTime.now());
            document.setReviewedAt(LocalDateTime.now());
            document.setDoi(doi);
            document.setSpecies(species);
            document.setClinicalTopic(clinicalTopic);
            document.setEvidenceType(evidenceType);
            document.setLicense(license);
            document.setSourceVerificationStatus("VERIFIED");
            document.setAccessDate(LocalDateTime.now());
            document = documentRepository.save(document);
        } else {
            chunkRepository.deleteByDocumentId(document.getId());
            chunkRepository.flush();
            document.setTitle(title);
            document.setPublisher(publisher);
            document.setSourceUrl(sourceUrl);
            document.setCategory(category);
            document.setDocumentVersion(version);
            document.setDoi(doi);
            document.setSpecies(species);
            document.setClinicalTopic(clinicalTopic);
            document.setEvidenceType(evidenceType);
            document.setLicense(license);
            document.setSourceVerificationStatus("VERIFIED");
            document.setStatus("ACTIVE");
            document.setUpdatedAt(LocalDateTime.now());
            document = documentRepository.saveAndFlush(document);
        }

        List<DocumentChunkingService.RawChunk> rawChunks = chunkingService.chunkDocument(fullContent, title);
        log.info("Chunked document '{}' into {} chunks with active model '{}'. Generating embeddings...",
                title, rawChunks.size(), embeddingService.getActiveModelIdentifier());

        List<KnowledgeChunk> chunksToSave = new ArrayList<>();
        for (DocumentChunkingService.RawChunk rc : rawChunks) {
            String textForEmbedding = rc.getSectionTitle() + ": " + rc.getContent();
            Float[] embedding = embeddingService.generateEmbedding(textForEmbedding);
            String chunkHash = computeHash(textForEmbedding);

            KnowledgeChunk chunk = new KnowledgeChunk(
                    document,
                    rc.getChunkIndex(),
                    rc.getSectionTitle(),
                    rc.getContent(),
                    embedding,
                    embeddingService.getActiveModelIdentifier(),
                    embeddingService.getEmbeddingDimension(),
                    "ACTIVE",
                    species,
                    clinicalTopic,
                    chunkHash
            );
            chunksToSave.add(chunk);
        }
        chunkRepository.saveAllAndFlush(chunksToSave);

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
            return Integer.toHexString(content.hashCode());
        }
    }
}
