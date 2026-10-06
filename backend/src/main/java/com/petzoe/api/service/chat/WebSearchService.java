package com.petzoe.api.service.chat;

import com.petzoe.api.service.chat.web.CuratedVeterinaryWebProvider;
import com.petzoe.api.service.chat.web.LiveWebSearchProvider;
import com.petzoe.api.service.chat.web.WebSearchProvider;
import com.petzoe.api.service.chat.web.WebSearchResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * High-level web search orchestration service.
 * Handles provider selection, caching, query sanitization, and result validation.
 */
@Service
public class WebSearchService {

    private static final Logger log = LoggerFactory.getLogger(WebSearchService.class);

    private final boolean enabled;
    private final String configuredProvider;
    private final int maxResults;
    private final int maxSources;
    private final long cacheTtlSeconds;

    private final SearchQuerySanitizer querySanitizer;
    private final WebSafetyService webSafetyService;
    private final CuratedVeterinaryWebProvider curatedProvider;
    private final LiveWebSearchProvider liveProvider;

    // Cache entry wrapper
    private static class CacheEntry {
        final List<WebSearchResult> results;
        final long expiresAt;

        CacheEntry(List<WebSearchResult> results, long expiresAt) {
            this.results = results;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, CacheEntry> publicSearchCache = new ConcurrentHashMap<>();

    public WebSearchService(
            @Value("${petzoe.web.enabled:true}") boolean enabled,
            @Value("${petzoe.web.provider:CURATED_VET}") String configuredProvider,
            @Value("${petzoe.web.max-results:5}") int maxResults,
            @Value("${petzoe.web.max-sources:3}") int maxSources,
            @Value("${petzoe.web.cache-ttl-seconds:3600}") long cacheTtlSeconds,
            SearchQuerySanitizer querySanitizer,
            WebSafetyService webSafetyService,
            CuratedVeterinaryWebProvider curatedProvider,
            LiveWebSearchProvider liveProvider) {
        this.enabled = enabled;
        this.configuredProvider = configuredProvider;
        this.maxResults = maxResults;
        this.maxSources = maxSources;
        this.cacheTtlSeconds = cacheTtlSeconds;
        this.querySanitizer = querySanitizer;
        this.webSafetyService = webSafetyService;
        this.curatedProvider = curatedProvider;
        this.liveProvider = liveProvider;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Executes safe, validated search against trusted sources.
     */
    public List<WebSearchResult> searchTrustedSources(String rawQuery) {
        if (!enabled) {
            log.info("Web search is disabled via configuration.");
            return Collections.emptyList();
        }

        String sanitizedQuery = querySanitizer.sanitizeForWebSearch(rawQuery);
        if (sanitizedQuery == null || sanitizedQuery.isBlank()) {
            log.info("Query was empty after sanitization. No external search dispatched.");
            return Collections.emptyList();
        }

        // Check cache for sanitized public query
        String cacheKey = sanitizedQuery.toLowerCase().trim();
        CacheEntry cached = publicSearchCache.get(cacheKey);
        long now = System.currentTimeMillis();
        if (cached != null && cached.expiresAt > now) {
            log.debug("Returning {} cached web results for query: '{}'", cached.results.size(), sanitizedQuery);
            return cached.results;
        }

        // Determine provider
        WebSearchProvider provider = resolveProvider();
        log.info("Dispatching web search using provider '{}' for sanitized query: '{}'", provider.getProviderType(), sanitizedQuery);

        List<WebSearchResult> rawResults;
        try {
            rawResults = provider.search(sanitizedQuery, maxResults);
        } catch (Exception e) {
            log.warn("Web search provider failed: {}. Falling back to curated references.", e.getMessage());
            rawResults = curatedProvider.search(sanitizedQuery, maxResults);
        }

        if (rawResults == null || rawResults.isEmpty()) {
            // If live provider returned nothing, try curated fallback
            if (!provider.getProviderType().equals(curatedProvider.getProviderType())) {
                rawResults = curatedProvider.search(sanitizedQuery, maxResults);
            }
        }

        // Validate and filter: only keep results with TRUSTED or ALLOWED domains and safe URLs
        List<WebSearchResult> validatedResults = (rawResults != null ? rawResults : Collections.<WebSearchResult>emptyList()).stream()
                .filter(r -> r.getUrl() != null && webSafetyService.isValidAndSafeUrl(r.getUrl()))
                .filter(r -> "TRUSTED".equalsIgnoreCase(r.getTrustStatus()) || "ALLOWED".equalsIgnoreCase(r.getTrustStatus()))
                .limit(maxSources)
                .collect(Collectors.toList());

        // Cache the safe public results
        if (!validatedResults.isEmpty()) {
            publicSearchCache.put(cacheKey, new CacheEntry(validatedResults, now + (cacheTtlSeconds * 1000)));
        }

        return validatedResults;
    }

    private WebSearchProvider resolveProvider() {
        if ("LIVE_WEB".equalsIgnoreCase(configuredProvider) || "GOOGLE".equalsIgnoreCase(configuredProvider)) {
            if (liveProvider.isAvailable()) {
                return liveProvider;
            }
            log.info("Live search provider configured but unavailable. Falling back to curated provider.");
        }
        return curatedProvider;
    }

    public void clearCache() {
        publicSearchCache.clear();
    }
}
