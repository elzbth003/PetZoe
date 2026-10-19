package com.petzoe.api.dto;

public class KnowledgeChunkSearchResultDTO {
    private Long chunkId;
    private Long documentId;
    private String documentTitle;
    private String sourceUrl;
    private String publisher;
    private String category;
    private String documentVersion;
    private String sectionTitle;
    private String content;
    private Double similarityScore;

    public KnowledgeChunkSearchResultDTO() {}

    public KnowledgeChunkSearchResultDTO(Long chunkId, Long documentId, String documentTitle,
                                         String sourceUrl, String publisher, String category,
                                         String documentVersion, String sectionTitle, String content,
                                         Double similarityScore) {
        this.chunkId = chunkId;
        this.documentId = documentId;
        this.documentTitle = documentTitle;
        this.sourceUrl = sourceUrl;
        this.publisher = publisher;
        this.category = category;
        this.documentVersion = documentVersion;
        this.sectionTitle = sectionTitle;
        this.content = content;
        this.similarityScore = similarityScore;
    }

    public Long getChunkId() { return chunkId; }
    public void setChunkId(Long chunkId) { this.chunkId = chunkId; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDocumentVersion() { return documentVersion; }
    public void setDocumentVersion(String documentVersion) { this.documentVersion = documentVersion; }
    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
}
