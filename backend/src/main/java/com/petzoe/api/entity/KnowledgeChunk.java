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

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public KnowledgeChunk() {}

    public KnowledgeChunk(KnowledgeDocument document, Integer chunkIndex, String sectionTitle,
                          String content, Float[] embedding, String embeddingModel) {
        this.document = document;
        this.chunkIndex = chunkIndex;
        this.sectionTitle = sectionTitle;
        this.content = content;
        this.embedding = embedding;
        this.embeddingModel = embeddingModel;
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
