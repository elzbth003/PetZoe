package com.petzoe.api.service.chat.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petzoe.api.service.chat.WebSafetyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * True live external HTTP web search provider using Google Custom Search JSON API
 * or compatible external REST search gateway.
 * Strictly checks domains, URLs, and DNS resolution via WebSafetyService before returning results.
 */
@Component
public class LiveWebSearchProvider implements WebSearchProvider {

    private static final Logger log = LoggerFactory.getLogger(LiveWebSearchProvider.class);

    private final String apiKey;
    private final String searchEngineId;
    private final WebSafetyService webSafetyService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public LiveWebSearchProvider(
            @Value("${petzoe.web.google.api-key:}") String apiKey,
            @Value("${petzoe.web.google.cx:}") String searchEngineId,
            WebSafetyService webSafetyService,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.searchEngineId = searchEngineId;
        this.webSafetyService = webSafetyService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String getProviderType() {
        return "LIVE_WEB";
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && searchEngineId != null && !searchEngineId.isBlank();
    }

    @Override
    public List<WebSearchResult> search(String query, int maxResults) {
        List<WebSearchResult> results = new ArrayList<>();
        if (!isAvailable() || query == null || query.isBlank()) {
            return results;
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format("https://www.googleapis.com/customsearch/v1?key=%s&cx=%s&q=%s&num=%d",
                    apiKey, searchEngineId, encodedQuery, Math.min(maxResults, 10));

            String responseBody = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (responseBody != null) {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode items = root.path("items");
                if (items.isArray()) {
                    String now = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    for (JsonNode item : items) {
                        String link = item.path("link").asText();
                        String title = item.path("title").asText();
                        String snippet = item.path("snippet").asText();
                        String domain = item.path("displayLink").asText();

                        // Safety check through WebSafetyService (SSRF, allowlist, DNS rebinding)
                        if (webSafetyService.isValidAndSafeUrl(link)) {
                            results.add(new WebSearchResult(
                                    title,
                                    link,
                                    domain,
                                    snippet,
                                    "Date unverified",
                                    now,
                                    webSafetyService.classifyDomain(domain),
                                    getProviderType()
                            ));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Live web search execution failed: {}", e.getMessage());
        }

        return results;
    }
}
