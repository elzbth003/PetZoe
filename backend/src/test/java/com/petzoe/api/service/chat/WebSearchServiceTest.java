package com.petzoe.api.service.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petzoe.api.service.chat.web.CuratedVeterinaryWebProvider;
import com.petzoe.api.service.chat.web.LiveWebSearchProvider;
import com.petzoe.api.service.chat.web.WebSearchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class WebSearchServiceTest {

    private WebSearchService webSearchService;
    private WebSafetyService safetyService;
    private SearchQuerySanitizer sanitizer;
    private CuratedVeterinaryWebProvider curatedProvider;
    private LiveWebSearchProvider liveProvider;

    @BeforeEach
    void setUp() {
        safetyService = new WebSafetyService("wsava.org,aaha.org,avma.org,ncbi.nlm.nih.gov,pubmed.ncbi.nlm.nih.gov,vetmed.ucdavis.edu,cdc.gov,fda.gov");
        sanitizer = new SearchQuerySanitizer();
        curatedProvider = new CuratedVeterinaryWebProvider();
        liveProvider = new LiveWebSearchProvider("", "", safetyService, new ObjectMapper());

        webSearchService = new WebSearchService(
                true,
                "CURATED_VET",
                5,
                3,
                3600,
                sanitizer,
                safetyService,
                curatedProvider,
                liveProvider
        );
    }

    @Test
    @DisplayName("Searches trusted sources and returns curated results for vaccination guidelines")
    void testSearchVaccinationGuidelines() {
        List<WebSearchResult> results = webSearchService.searchTrustedSources("What are the latest WSAVA vaccination guidelines for puppies?");

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.size() <= 3, "Results should respect maxSources limit");

        WebSearchResult first = results.get(0);
        assertNotNull(first.getTitle());
        assertNotNull(first.getUrl());
        assertNotNull(first.getDomain());
        assertNotNull(first.getRetrievedAt(), "RetrievedAt timestamp must be present");
        assertEquals("TRUSTED", first.getTrustStatus());
        assertEquals("CURATED_REFERENCE", first.getProviderType());
    }

    @Test
    @DisplayName("Returns empty list when web search is disabled via configuration")
    void testSearchDisabled() {
        WebSearchService disabledService = new WebSearchService(
                false,
                "CURATED_VET",
                5,
                3,
                3600,
                sanitizer,
                safetyService,
                curatedProvider,
                liveProvider
        );

        List<WebSearchResult> results = disabledService.searchTrustedSources("WSAVA guidelines");
        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    @DisplayName("Caches safe public query results across subsequent calls")
    void testSearchCaching() {
        webSearchService.clearCache();
        List<WebSearchResult> firstCall = webSearchService.searchTrustedSources("canine parvovirus prevention");
        List<WebSearchResult> secondCall = webSearchService.searchTrustedSources("canine parvovirus prevention");

        assertSame(firstCall, secondCall, "Second call should return cached result list instance");
    }

    @Test
    @DisplayName("Returns empty list when sanitized query is empty or PII-only")
    void testSearchSanitizationStripsAll() {
        List<WebSearchResult> results = webSearchService.searchTrustedSources("   ");
        assertTrue(results.isEmpty());
    }
}
