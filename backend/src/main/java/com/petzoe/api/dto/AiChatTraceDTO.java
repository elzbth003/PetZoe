package com.petzoe.api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AiChatTraceDTO {

    private String traceId;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String intent;
    private String retrievalMode;
    private String candidatePetName;
    private List<String> sourcesPlanned = new ArrayList<>();
    private List<String> sourcesInvoked = new ArrayList<>();
    private List<String> sourcesIncludedInPrompt = new ArrayList<>();
    private String embeddingModel;
    private Integer embeddingDimension;
    private String embeddingCompatibilityStatus;
    private List<Long> retrievedChunkIds = new ArrayList<>();
    private String retrievalMethod = "NONE";
    private Double topSimilarityScore;
    private Integer citedSourcesCount = 0;
    private Long retrievalDurationMs = 0L;
    private Long generationDurationMs = 0L;
    private Long totalDurationMs = 0L;
    private String modelProvider;
    private String noEvidenceReason;

    public AiChatTraceDTO() {}

    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public String getRetrievalMode() { return retrievalMode; }
    public void setRetrievalMode(String retrievalMode) { this.retrievalMode = retrievalMode; }

    public String getCandidatePetName() { return candidatePetName; }
    public void setCandidatePetName(String candidatePetName) { this.candidatePetName = candidatePetName; }

    public List<String> getSourcesPlanned() { return sourcesPlanned; }
    public void setSourcesPlanned(List<String> sourcesPlanned) { this.sourcesPlanned = sourcesPlanned; }

    public List<String> getSourcesInvoked() { return sourcesInvoked; }
    public void setSourcesInvoked(List<String> sourcesInvoked) { this.sourcesInvoked = sourcesInvoked; }

    public List<String> getSourcesIncludedInPrompt() { return sourcesIncludedInPrompt; }
    public void setSourcesIncludedInPrompt(List<String> sourcesIncludedInPrompt) { this.sourcesIncludedInPrompt = sourcesIncludedInPrompt; }

    public String getEmbeddingModel() { return embeddingModel; }
    public void setEmbeddingModel(String embeddingModel) { this.embeddingModel = embeddingModel; }

    public Integer getEmbeddingDimension() { return embeddingDimension; }
    public void setEmbeddingDimension(Integer embeddingDimension) { this.embeddingDimension = embeddingDimension; }

    public String getEmbeddingCompatibilityStatus() { return embeddingCompatibilityStatus; }
    public void setEmbeddingCompatibilityStatus(String embeddingCompatibilityStatus) { this.embeddingCompatibilityStatus = embeddingCompatibilityStatus; }

    public List<Long> getRetrievedChunkIds() { return retrievedChunkIds; }
    public void setRetrievedChunkIds(List<Long> retrievedChunkIds) { this.retrievedChunkIds = retrievedChunkIds; }

    public String getRetrievalMethod() { return retrievalMethod; }
    public void setRetrievalMethod(String retrievalMethod) { this.retrievalMethod = retrievalMethod; }

    public Double getTopSimilarityScore() { return topSimilarityScore; }
    public void setTopSimilarityScore(Double topSimilarityScore) { this.topSimilarityScore = topSimilarityScore; }

    public Integer getCitedSourcesCount() { return citedSourcesCount; }
    public void setCitedSourcesCount(Integer citedSourcesCount) { this.citedSourcesCount = citedSourcesCount; }

    public Long getRetrievalDurationMs() { return retrievalDurationMs; }
    public void setRetrievalDurationMs(Long retrievalDurationMs) { this.retrievalDurationMs = retrievalDurationMs; }

    public Long getGenerationDurationMs() { return generationDurationMs; }
    public void setGenerationDurationMs(Long generationDurationMs) { this.generationDurationMs = generationDurationMs; }

    public Long getTotalDurationMs() { return totalDurationMs; }
    public void setTotalDurationMs(Long totalDurationMs) { this.totalDurationMs = totalDurationMs; }

    public String getModelProvider() { return modelProvider; }
    public void setModelProvider(String modelProvider) { this.modelProvider = modelProvider; }

    public String getNoEvidenceReason() { return noEvidenceReason; }
    public void setNoEvidenceReason(String noEvidenceReason) { this.noEvidenceReason = noEvidenceReason; }
}
