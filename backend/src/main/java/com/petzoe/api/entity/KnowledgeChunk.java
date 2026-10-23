package com.petzoe.api.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_chunks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"document_id", "chunk_index"})
}, indexes = {
    @Index(name = "idx_knowledge_chunks_doc_id", columnList = "document_id")
})
public class KnowledgeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private KnowledgeDocument document;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "section_title")
    private String sectionTitle;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "embedding", nullable = false, columnDefinition = "real[]")
    private Float[] embedding;

    @Column(name = "embedding_model", nullable = false, length = 150)
    private String embeddingModel;

    @Column(name = "embedding_dimension")
    private Integer embeddingDimension = 768;

    @Column(name = "embedding_status", length = 50)
    private String embeddingStatus = "ACTIVE"; // ACTIVE, UNAVAILABLE, PENDING, FAILED

    @Column(name = "species", length = 100)
    private String species;

    @Column(name = "clinical_topic", length = 150)
    private String clinicalTopic;

    @Column(name = "chunk_hash", length = 64)
    private String chunkHash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public KnowledgeChunk() {}

    public KnowledgeChunk(KnowledgeDocument document, Integer chunkIndex, String sectionTitle,
                          String content, Float[] embedding, String embeddingModel) {
        this(document, chunkIndex, sectionTitle, content, embedding, embeddingModel, 768, "ACTIVE", null, null, null);
    }

    public KnowledgeChunk(KnowledgeDocument document, Integer chunkIndex, String sectionTitle,
                          String content, Float[] embedding, String embeddingModel,
                          Integer embeddingDimension, String embeddingStatus,
                          String species, String clinicalTopic, String chunkHash) {
        this.document = document;
        this.chunkIndex = chunkIndex;
        this.sectionTitle = sectionTitle;
        this.content = content;
        this.embedding = embedding;
        this.embeddingModel = embeddingModel;
        this.embeddingDimension = (embeddingDimension != null) ? embeddingDimension : 768;
        this.embeddingStatus = (embeddingStatus != null) ? embeddingStatus : "ACTIVE";
        this.species = species;
        this.clinicalTopic = clinicalTopic;
        this.chunkHash = chunkHash;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public KnowledgeDocument getDocument() { return document; }
    public void setDocument(KnowledgeDocument document) { this.document = document; }
    public Integer getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; }
    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Float[] getEmbedding() { return embedding; }
    public void setEmbedding(Float[] embedding) { this.embedding = embedding; }
    public String getEmbeddingModel() { return embeddingModel; }
    public void setEmbeddingModel(String embeddingModel) { this.embeddingModel = embeddingModel; }
    public Integer getEmbeddingDimension() { return embeddingDimension; }
    public void setEmbeddingDimension(Integer embeddingDimension) { this.embeddingDimension = embeddingDimension; }
    public String getEmbeddingStatus() { return embeddingStatus; }
    public void setEmbeddingStatus(String embeddingStatus) { this.embeddingStatus = embeddingStatus; }
    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }
    public String getClinicalTopic() { return clinicalTopic; }
    public void setClinicalTopic(String clinicalTopic) { this.clinicalTopic = clinicalTopic; }
    public String getChunkHash() { return chunkHash; }
    public void setChunkHash(String chunkHash) { this.chunkHash = chunkHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
