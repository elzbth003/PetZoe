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
            return fuseRRF(denseResults, lexicalResults, limit, query);
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
                                                        int limit,
                                                        String query) {
        Map<Long, Double> rrfScores = new HashMap<>();
        Map<Long, KnowledgeChunkSearchResultDTO> chunkMap = new HashMap<>();

        String lowerQuery = (query != null) ? query.toLowerCase() : "";
        String targetSpecies = null;
        if (lowerQuery.contains("dog") || lowerQuery.contains("puppy") || lowerQuery.contains("canine")) {
            targetSpecies = "canine";
        } else if (lowerQuery.contains("cat") || lowerQuery.contains("kitten") || lowerQuery.contains("feline")) {
            targetSpecies = "feline";
        } else if (lowerQuery.contains("rabbit") || lowerQuery.contains("bunny")) {
            targetSpecies = "rabbit";
        } else if (lowerQuery.contains("bird") || lowerQuery.contains("avian")) {
            targetSpecies = "bird";
        }

        boolean asksNormalVitalSigns = (lowerQuery.contains("normal") || lowerQuery.contains("resting") ||
                lowerQuery.contains("vital") || lowerQuery.contains("heart rate") || lowerQuery.contains("range") ||
                lowerQuery.contains("temperature") || lowerQuery.contains("breathing rate"));
        boolean asksEmergencyCPR = (lowerQuery.contains("cpr") || lowerQuery.contains("cardiac arrest") ||
                lowerQuery.contains("resuscitation") || lowerQuery.contains("chest compression"));

        // RRF on Dense Ranks (1-indexed)
        for (int rank = 0; rank < dense.size(); rank++) {
            KnowledgeChunkSearchResultDTO item = dense.get(rank);
            chunkMap.put(item.getChunkId(), item);
            double score = 1.0 / (RRF_K + (rank + 1));
            score = applyRelevanceAdjustment(score, item, targetSpecies, asksNormalVitalSigns, asksEmergencyCPR);
            rrfScores.put(item.getChunkId(), rrfScores.getOrDefault(item.getChunkId(), 0.0) + score);
        }

        // RRF on Lexical Ranks (1-indexed)
        for (int rank = 0; rank < lexical.size(); rank++) {
            KnowledgeChunkSearchResultDTO item = lexical.get(rank);
            chunkMap.put(item.getChunkId(), item);
            double score = 1.0 / (RRF_K + (rank + 1));
            score = applyRelevanceAdjustment(score, item, targetSpecies, asksNormalVitalSigns, asksEmergencyCPR);
            rrfScores.put(item.getChunkId(), rrfScores.getOrDefault(item.getChunkId(), 0.0) + score);
        }

        // Sort by combined RRF score descending
        return rrfScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    KnowledgeChunkSearchResultDTO dto = chunkMap.get(entry.getKey());
                    dto.setRetrievalMethod("HYBRID_RRF");
                    dto.setRrfScore(entry.getValue());
                    // Keep existing similarityScore (cosine similarity from dense search) intact
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private double applyRelevanceAdjustment(double score,
                                            KnowledgeChunkSearchResultDTO item,
                                            String targetSpecies,
                                            boolean asksNormalVitalSigns,
                                            boolean asksEmergencyCPR) {
        double adjusted = score;

        // Species Relevance Filtering / Boosting
        if (targetSpecies != null && item.getSpecies() != null) {
            String itemSpecies = item.getSpecies().toLowerCase();
            if (itemSpecies.contains(targetSpecies) || itemSpecies.contains("all") || itemSpecies.contains("canine and feline")) {
                adjusted *= 1.30; // Boost matching species
            } else if (!itemSpecies.contains("all") && !itemSpecies.contains("and")) {
                adjusted *= 0.65; // Demote exclusively mismatching species
            }
        }

        // Topic-Aware Guard: Vital signs vs Emergency CPR
        String topic = (item.getClinicalTopic() != null) ? item.getClinicalTopic().toLowerCase() : "";
        String title = (item.getDocumentTitle() != null) ? item.getDocumentTitle().toLowerCase() : "";

        if (asksNormalVitalSigns && !asksEmergencyCPR) {
            if (topic.contains("vital") || topic.contains("physiology") || title.contains("vital")) {
                adjusted *= 1.60;
            } else if (topic.contains("emergency resuscitation") || topic.contains("cpr") || title.contains("cpr")) {
                adjusted *= 0.50; // De-prioritize CPR when user is asking for normal resting values
            }
        } else if (asksEmergencyCPR) {
            if (topic.contains("emergency resuscitation") || topic.contains("cpr") || title.contains("cpr")) {
                adjusted *= 1.60;
            }
        }

        return adjusted;
    }

    private List<String> extractKeywords(String text) {
        if (text == null) return List.of();
        Set<String> stopWords = Set.of("the", "and", "for", "with", "about", "what", "when", "where",
                "should", "does", "have", "give", "from", "your", "this", "that", "need", "please", "help",
                "tell", "know", "how", "why", "can", "much", "many", "between", "differ");

        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        List<String> rawTokens = Arrays.stream(cleaned.split("\\s+"))
                .filter(w -> (w.length() >= 4 || isMeaningfulShortWord(w)) && !stopWords.contains(w))
                .distinct()
                .collect(Collectors.toList());

        List<String> result = new ArrayList<>();
        for (String token : rawTokens) {
            result.add(token);
            // Singular / Plural lemmatization
            if (token.endsWith("ies") && token.length() > 4) {
                result.add(token.substring(0, token.length() - 3) + "y");
            } else if (token.endsWith("s") && token.length() > 3 && !token.endsWith("ss")) {
                result.add(token.substring(0, token.length() - 1));
            }
        }

        return result.stream().distinct().limit(8).collect(Collectors.toList());
    }

    private boolean isMeaningfulShortWord(String word) {
        return word.equals("dog") || word.equals("cat") || word.equals("pet") ||
               word.equals("pup") || word.equals("vet") || word.equals("eat") ||
               word.equals("egg") || word.equals("flu") || word.equals("cpr") ||
               word.equals("ckd") || word.equals("bcs") || word.equals("rer") ||
               word.equals("der") || word.equals("wet") || word.equals("dry") ||
               word.equals("fur") || word.equals("raw") || word.equals("hay");
    }

    public double getMinSimilarityThreshold() {
        return minSimilarityThreshold;
    }

    public int getMaxChunksLimit() {
        return maxChunksLimit;
    }
}
