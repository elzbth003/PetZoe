package com.petzoe.api.service.chat.rag;

import com.petzoe.api.dto.KnowledgeChunkSearchResultDTO;
import com.petzoe.api.repository.KnowledgeChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class VectorKnowledgeRetrievalService {

    private static final Logger log = LoggerFactory.getLogger(VectorKnowledgeRetrievalService.class);

    private final KnowledgeChunkRepository chunkRepository;
    private final EmbeddingService embeddingService;

    @Value("${petzoe.rag.min-similarity:0.15}")
    private double minSimilarityThreshold;

    @Value("${petzoe.rag.max-chunks:4}")
    private int maxChunksLimit;

    public VectorKnowledgeRetrievalService(KnowledgeChunkRepository chunkRepository,
                                           EmbeddingService embeddingService) {
        this.chunkRepository = chunkRepository;
        this.embeddingService = embeddingService;
    }

    /**
     * Executes true vector similarity search using stored embeddings in PostgreSQL.
     * Generates query embedding at runtime, queries cosine similarity function,
     * and filters results by active status and minimum relevance threshold.
     */
    public List<KnowledgeChunkSearchResultDTO> search(String query) {
        return search(query, maxChunksLimit);
    }

    public List<KnowledgeChunkSearchResultDTO> search(String query, int limit) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        try {
            Float[] queryEmbedding = embeddingService.generateEmbedding(query);
            List<KnowledgeChunkSearchResultDTO> results = chunkRepository.searchSimilarChunks(queryEmbedding, limit);

            List<KnowledgeChunkSearchResultDTO> filtered = results.stream()
                    .filter(r -> r.getSimilarityScore() != null && r.getSimilarityScore() >= minSimilarityThreshold)
                    .collect(Collectors.toList());

            log.info("Vector retrieval for '{}' returned {} chunks (filtered from {} by threshold {})",
                    query, filtered.size(), results.size(), minSimilarityThreshold);

            return filtered;
        } catch (Exception e) {
            log.error("Vector retrieval failed for query '{}': {}", query, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
