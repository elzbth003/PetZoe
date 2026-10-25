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
    private Double rrfScore;
    private String retrievalMethod = "SEMANTIC_DENSE"; // SEMANTIC_DENSE, EXACT_LEXICAL, HYBRID_RRF
    private String species;
    private String clinicalTopic;
    private String evidenceType = "OFFICIAL_CLINICAL_GUIDELINE";
    private String license;

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
        this.retrievalMethod = "SEMANTIC_DENSE";
    }

    public KnowledgeChunkSearchResultDTO(Long chunkId, Long documentId, String documentTitle,
                                         String sourceUrl, String publisher, String category,
                                         String documentVersion, String sectionTitle, String content,
                                         Double similarityScore, String retrievalMethod,
                                         String species, String clinicalTopic, String evidenceType, String license) {
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
        this.retrievalMethod = retrievalMethod;
        this.species = species;
        this.clinicalTopic = clinicalTopic;
        this.evidenceType = evidenceType;
        this.license = license;
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
    public Double getRrfScore() { return rrfScore; }
    public void setRrfScore(Double rrfScore) { this.rrfScore = rrfScore; }
    public String getRetrievalMethod() { return retrievalMethod; }
    public void setRetrievalMethod(String retrievalMethod) { this.retrievalMethod = retrievalMethod; }
    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }
    public String getClinicalTopic() { return clinicalTopic; }
    public void setClinicalTopic(String clinicalTopic) { this.clinicalTopic = clinicalTopic; }
    public String getEvidenceType() { return evidenceType; }
    public void setEvidenceType(String evidenceType) { this.evidenceType = evidenceType; }
    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }
}
