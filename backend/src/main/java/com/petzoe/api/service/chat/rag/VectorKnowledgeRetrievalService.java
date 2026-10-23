package com.petzoe.api.service.chat.rag;

import com.petzoe.api.dto.KnowledgeChunkSearchResultDTO;
import com.petzoe.api.repository.KnowledgeChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Hybrid Retrieval Service.
 * Combines dense semantic vector retrieval (PostgreSQL cosine similarity)
 * with lexical keyword search using Reciprocal Rank Fusion (RRF).
 * Enforces strict embedding model compatibility and dimension guards.
 */
@Service
public class VectorKnowledgeRetrievalService {

    private static final Logger log = LoggerFactory.getLogger(VectorKnowledgeRetrievalService.class);
    private static final int RRF_K = 60;

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

    public List<KnowledgeChunkSearchResultDTO> search(String query) {
        return search(query, maxChunksLimit);
    }

    public List<KnowledgeChunkSearchResultDTO> search(String query, int limit) {
        return searchHybrid(query, limit);
    }

    /**
     * Executes hybrid retrieval combining semantic vector search and exact lexical retrieval.
     */
    public List<KnowledgeChunkSearchResultDTO> searchHybrid(String query, int limit) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String activeModel = embeddingService.getActiveModelIdentifier();
        List<KnowledgeChunkSearchResultDTO> denseResults = new ArrayList<>();
        boolean denseAvailable = false;

        // 1. Semantic Dense Search (with strict model compatibility check)
        try {
            Float[] queryEmbedding = embeddingService.generateEmbedding(query);
            embeddingService.validateVector(queryEmbedding);

            List<KnowledgeChunkSearchResultDTO> rawDense = chunkRepository.searchSimilarChunksByModel(
                    queryEmbedding, activeModel, limit * 2);

            // Fallback to general query if model column is legacy
            if (rawDense.isEmpty()) {
                rawDense = chunkRepository.searchSimilarChunks(queryEmbedding, limit * 2);
            }

            denseResults = rawDense.stream()
                    .filter(r -> r.getSimilarityScore() != null && r.getSimilarityScore() >= minSimilarityThreshold)
                    .collect(Collectors.toList());

            denseAvailable = !denseResults.isEmpty();
            log.info("Dense vector retrieval for '{}' using model '{}' yielded {} candidate chunks",
                    query, activeModel, denseResults.size());
        } catch (Exception e) {
            log.warn("Dense vector retrieval skipped or failed for active model '{}': {}. Relying on lexical search.",
                    activeModel, e.getMessage());
        }

        // 2. Lexical Keyword Search
        List<String> keywords = extractKeywords(query);
        Map<Long, KnowledgeChunkSearchResultDTO> lexicalCandidates = new LinkedHashMap<>();

        for (String kw : keywords) {
            try {
                List<KnowledgeChunkSearchResultDTO> lexMatches = chunkRepository.searchByKeyword(kw, limit);
                for (KnowledgeChunkSearchResultDTO match : lexMatches) {
                    lexicalCandidates.putIfAbsent(match.getChunkId(), match);
                }
            } catch (Exception e) {
                log.debug("Lexical search error on keyword '{}': {}", kw, e.getMessage());
            }
        }
        List<KnowledgeChunkSearchResultDTO> lexicalResults = new ArrayList<>(lexicalCandidates.values());

        // 3. Reciprocal Rank Fusion (RRF)
        if (denseAvailable && !lexicalResults.isEmpty()) {
            return fuseRRF(denseResults, lexicalResults, limit);
        } else if (denseAvailable) {
            return denseResults.stream().limit(limit).collect(Collectors.toList());
        } else if (!lexicalResults.isEmpty()) {
            lexicalResults.forEach(r -> r.setRetrievalMethod("EXACT_LEXICAL"));
            return lexicalResults.stream().limit(limit).collect(Collectors.toList());
        }

        log.info("No knowledge chunks found matching query '{}' via hybrid search.", query);
        return Collections.emptyList();
    }

    private List<KnowledgeChunkSearchResultDTO> fuseRRF(List<KnowledgeChunkSearchResultDTO> dense,
                                                        List<KnowledgeChunkSearchResultDTO> lexical,
                                                        int limit) {
        Map<Long, Double> rrfScores = new HashMap<>();
        Map<Long, KnowledgeChunkSearchResultDTO> chunkMap = new HashMap<>();

        // RRF on Dense Ranks (1-indexed)
        for (int rank = 0; rank < dense.size(); rank++) {
            KnowledgeChunkSearchResultDTO item = dense.get(rank);
            chunkMap.put(item.getChunkId(), item);
            double score = 1.0 / (RRF_K + (rank + 1));
            rrfScores.put(item.getChunkId(), rrfScores.getOrDefault(item.getChunkId(), 0.0) + score);
        }

        // RRF on Lexical Ranks (1-indexed)
        for (int rank = 0; rank < lexical.size(); rank++) {
            KnowledgeChunkSearchResultDTO item = lexical.get(rank);
            chunkMap.put(item.getChunkId(), item);
            double score = 1.0 / (RRF_K + (rank + 1));
            rrfScores.put(item.getChunkId(), rrfScores.getOrDefault(item.getChunkId(), 0.0) + score);
        }

        // Sort by combined RRF score descending
        return rrfScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    KnowledgeChunkSearchResultDTO dto = chunkMap.get(entry.getKey());
                    dto.setRetrievalMethod("HYBRID_RRF");
                    dto.setSimilarityScore(entry.getValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<String> extractKeywords(String text) {
        if (text == null) return List.of();
        Set<String> stopWords = Set.of("the", "and", "for", "with", "about", "what", "when", "where",
                "should", "does", "have", "give", "from", "your", "this", "that", "need", "please", "help");

        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        return Arrays.stream(cleaned.split("\\s+"))
                .filter(w -> w.length() >= 4 && !stopWords.contains(w))
                .distinct()
                .limit(6)
                .collect(Collectors.toList());
    }

    public double getMinSimilarityThreshold() {
        return minSimilarityThreshold;
    }

    public int getMaxChunksLimit() {
        return maxChunksLimit;
    }
}
