package com.petzoe.api.service.chat.web;

import java.util.List;

public interface WebSearchProvider {

    /**
     * Executes external search for the sanitized query, returning a list of WebSearchResults.
     */
    List<WebSearchResult> search(String query, int maxResults);

    /**
     * Identifies provider type ("LIVE_WEB" or "CURATED_REFERENCE").
     */
    String getProviderType();

    /**
     * Indicates whether this provider is currently available and configured.
     */
    boolean isAvailable();
}
