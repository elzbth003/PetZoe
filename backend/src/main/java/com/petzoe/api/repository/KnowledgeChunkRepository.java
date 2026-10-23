package com.petzoe.api.repository;

import com.petzoe.api.dto.KnowledgeChunkSearchResultDTO;
import com.petzoe.api.entity.KnowledgeChunk;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {

    List<KnowledgeChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM KnowledgeChunk kc WHERE kc.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);

    @Query(value = """
        SELECT new com.petzoe.api.dto.KnowledgeChunkSearchResultDTO(
            kc.id,
            kd.id,
            kd.title,
            kd.sourceUrl,
            kd.publisher,
            kd.category,
            kd.documentVersion,
            kc.sectionTitle,
            kc.content,
            CAST(cosine_similarity_arr(kc.embedding, :queryEmbedding) AS double),
            'SEMANTIC_DENSE',
            kc.species,
            kc.clinicalTopic,
            kd.evidenceType,
            kd.license
        )
        FROM KnowledgeChunk kc
        JOIN kc.document kd
        WHERE kd.status = 'ACTIVE'
          AND (kc.embeddingStatus IS NULL OR kc.embeddingStatus = 'ACTIVE')
        ORDER BY cosine_similarity_arr(kc.embedding, :queryEmbedding) DESC
    """)
    List<KnowledgeChunkSearchResultDTO> searchSimilarChunks(
            @Param("queryEmbedding") Float[] queryEmbedding,
            Pageable pageable
    );

    default List<KnowledgeChunkSearchResultDTO> searchSimilarChunks(Float[] queryEmbedding, int limit) {
        return searchSimilarChunks(queryEmbedding, PageRequest.of(0, Math.max(1, limit)));
    }

    @Query(value = """
        SELECT new com.petzoe.api.dto.KnowledgeChunkSearchResultDTO(
            kc.id,
            kd.id,
            kd.title,
            kd.sourceUrl,
            kd.publisher,
            kd.category,
            kd.documentVersion,
            kc.sectionTitle,
            kc.content,
            CAST(cosine_similarity_arr(kc.embedding, :queryEmbedding) AS double),
            'SEMANTIC_DENSE',
            kc.species,
            kc.clinicalTopic,
            kd.evidenceType,
            kd.license
        )
        FROM KnowledgeChunk kc
        JOIN kc.document kd
        WHERE kd.status = 'ACTIVE'
          AND kc.embeddingModel = :embeddingModel
          AND (kc.embeddingStatus IS NULL OR kc.embeddingStatus = 'ACTIVE')
        ORDER BY cosine_similarity_arr(kc.embedding, :queryEmbedding) DESC
    """)
    List<KnowledgeChunkSearchResultDTO> searchSimilarChunksByModel(
            @Param("queryEmbedding") Float[] queryEmbedding,
            @Param("embeddingModel") String embeddingModel,
            Pageable pageable
    );

    default List<KnowledgeChunkSearchResultDTO> searchSimilarChunksByModel(Float[] queryEmbedding, String embeddingModel, int limit) {
        return searchSimilarChunksByModel(queryEmbedding, embeddingModel, PageRequest.of(0, Math.max(1, limit)));
    }

    @Query(value = """
        SELECT new com.petzoe.api.dto.KnowledgeChunkSearchResultDTO(
            kc.id,
            kd.id,
            kd.title,
            kd.sourceUrl,
            kd.publisher,
            kd.category,
            kd.documentVersion,
            kc.sectionTitle,
            kc.content,
            1.0,
            'EXACT_LEXICAL',
            kc.species,
            kc.clinicalTopic,
            kd.evidenceType,
            kd.license
        )
        FROM KnowledgeChunk kc
        JOIN kc.document kd
        WHERE kd.status = 'ACTIVE'
          AND (
              LOWER(kc.content) LIKE LOWER(CONCAT('%', :term, '%'))
              OR LOWER(kc.sectionTitle) LIKE LOWER(CONCAT('%', :term, '%'))
              OR LOWER(kd.title) LIKE LOWER(CONCAT('%', :term, '%'))
          )
    """)
    List<KnowledgeChunkSearchResultDTO> searchByKeyword(
            @Param("term") String term,
            Pageable pageable
    );

    default List<KnowledgeChunkSearchResultDTO> searchByKeyword(String term, int limit) {
        return searchByKeyword(term, PageRequest.of(0, Math.max(1, limit)));
    }
}
