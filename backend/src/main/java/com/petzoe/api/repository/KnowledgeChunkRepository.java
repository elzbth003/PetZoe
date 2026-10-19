package com.petzoe.api.repository;

import com.petzoe.api.dto.KnowledgeChunkSearchResultDTO;
import com.petzoe.api.entity.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {

    List<KnowledgeChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    void deleteByDocumentId(Long documentId);

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
            CAST(cosine_similarity_arr(kc.embedding, :queryEmbedding) AS double)
        )
        FROM KnowledgeChunk kc
        JOIN kc.document kd
        WHERE kd.status = 'ACTIVE'
        ORDER BY cosine_similarity_arr(kc.embedding, :queryEmbedding) DESC
        LIMIT :limit
    """)
    List<KnowledgeChunkSearchResultDTO> searchSimilarChunks(
            @Param("queryEmbedding") Float[] queryEmbedding,
            @Param("limit") int limit
    );
}
