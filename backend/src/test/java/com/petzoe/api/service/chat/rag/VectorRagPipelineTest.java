package com.petzoe.api.service.chat.rag;

import com.petzoe.api.dto.KnowledgeChunkSearchResultDTO;
import com.petzoe.api.entity.KnowledgeChunk;
import com.petzoe.api.entity.KnowledgeDocument;
import com.petzoe.api.repository.KnowledgeChunkRepository;
import com.petzoe.api.repository.KnowledgeDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VectorRagPipelineTest {

    @Mock
    private KnowledgeDocumentRepository documentRepository;

    @Mock
    private KnowledgeChunkRepository chunkRepository;

    private EmbeddingService embeddingService;
    private DocumentChunkingService chunkingService;
    private KnowledgeIngestionService ingestionService;
    private VectorKnowledgeRetrievalService retrievalService;

    @BeforeEach
    void setUp() {
        embeddingService = new EmbeddingService(new com.fasterxml.jackson.databind.ObjectMapper());
        chunkingService = new DocumentChunkingService();
        ingestionService = new KnowledgeIngestionService(documentRepository, chunkRepository, chunkingService, embeddingService);
        retrievalService = new VectorKnowledgeRetrievalService(chunkRepository, embeddingService);
        ReflectionTestUtils.setField(retrievalService, "minSimilarityThreshold", 0.15);
        ReflectionTestUtils.setField(retrievalService, "maxChunksLimit", 3);
    }

    @Test
    void testEmbeddingDimensionAndNormalization() {
        Float[] embedding = embeddingService.generateEmbedding("puppy vaccination schedule WSAVA");
        assertNotNull(embedding);
        assertEquals(768, embedding.length);

        double norm = 0.0;
        for (Float val : embedding) norm += val * val;
        assertEquals(1.0, Math.sqrt(norm), 0.001, "Embedding vector must be unit-length normalized");
    }

    @Test
    void testDocumentChunkingWithSections() {
        String markdown = """
                # Introduction
                Veterinary preventive health is essential.
                
                ### Core Vaccines
                Distemper, Adenovirus, Parvovirus, and Rabies are universally required.
                """;
        List<DocumentChunkingService.RawChunk> chunks = chunkingService.chunkDocument(markdown, "General");
        assertEquals(2, chunks.size());
        assertEquals("Introduction", chunks.get(0).getSectionTitle());
        assertEquals("Core Vaccines", chunks.get(1).getSectionTitle());
    }

    @Test
    void testIngestionSavesDocumentAndChunks() {
        when(documentRepository.findByContentHash(anyString())).thenReturn(Optional.empty());
        when(documentRepository.save(any(KnowledgeDocument.class))).thenAnswer(invocation -> {
            KnowledgeDocument doc = invocation.getArgument(0);
            doc.setId(10L);
            return doc;
        });

        KnowledgeDocument doc = ingestionService.ingestDocument(
                "WSAVA Guidelines", "VACCINATION", "WSAVA", "https://wsava.org", "1.0",
                "### Core Vaccines\nCore vaccines are vital."
        );

        assertNotNull(doc);
        verify(documentRepository, times(1)).save(any(KnowledgeDocument.class));
        verify(chunkRepository, times(1)).save(any(KnowledgeChunk.class));
    }

    @Test
    void testVectorRetrievalFiltersThreshold() {
        KnowledgeChunkSearchResultDTO topMatch = new KnowledgeChunkSearchResultDTO(
                1L, 10L, "WSAVA Guidelines", "https://wsava.org", "WSAVA", "VACCINATION",
                "1.0", "Core Vaccines", "Core vaccines prevent fatal disease.", 0.85
        );
        KnowledgeChunkSearchResultDTO lowMatch = new KnowledgeChunkSearchResultDTO(
                2L, 10L, "WSAVA Guidelines", "https://wsava.org", "WSAVA", "VACCINATION",
                "1.0", "Intro", "Intro text", 0.05
        );

        when(chunkRepository.searchSimilarChunks(any(Float[].class), eq(3)))
                .thenReturn(List.of(topMatch, lowMatch));

        List<KnowledgeChunkSearchResultDTO> results = retrievalService.search("vaccine schedule for dog");
        assertEquals(1, results.size(), "Low match under 0.15 threshold must be excluded");
        assertEquals("Core Vaccines", results.get(0).getSectionTitle());
        assertEquals(0.85, results.get(0).getSimilarityScore());
    }

    @Test
    void testPediatricDewormingChunkRetrieval() {
        KnowledgeChunkSearchResultDTO dewormingMatch = new KnowledgeChunkSearchResultDTO(
                5L, 20L, "CAPC and WSAVA Guidelines for Deworming", "https://capcvet.org",
                "CAPC", "PREVENTIVE_CARE", "2024.2", "Core Kitten Deworming Schedule",
                "Kittens should begin preventive anthelmintic treatment at 2 to 3 weeks of age. Repeat every 2 to 3 weeks until 12 weeks.",
                0.78
        );

        when(chunkRepository.searchSimilarChunks(any(Float[].class), eq(3)))
                .thenReturn(List.of(dewormingMatch));

        List<KnowledgeChunkSearchResultDTO> results = retrievalService.search("My pet Sylo is 2 months old should i give deworming medicine");
        assertEquals(1, results.size());
        assertEquals("Core Kitten Deworming Schedule", results.get(0).getSectionTitle());
        assertEquals("CAPC", results.get(0).getPublisher());
        assertEquals("https://capcvet.org", results.get(0).getSourceUrl());
        assertTrue(results.get(0).getContent().contains("2 to 3 weeks"));
    }

    @Test
    void testEmptyAndExceptionHandlingInRetrieval() {
        // Null / blank query returns empty list without error
        assertTrue(retrievalService.search("").isEmpty());
        assertTrue(retrievalService.search(null).isEmpty());

        // Repository exception handled gracefully
        when(chunkRepository.searchSimilarChunks(any(Float[].class), anyInt()))
                .thenThrow(new RuntimeException("Database timeout"));
        List<KnowledgeChunkSearchResultDTO> errorFallback = retrievalService.search("error query");
        assertNotNull(errorFallback);
        assertTrue(errorFallback.isEmpty(), "Should return empty list on exception instead of throwing");
    }
}
