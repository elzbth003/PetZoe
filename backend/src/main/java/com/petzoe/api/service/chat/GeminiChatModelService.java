package com.petzoe.api.service.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiChatModelService implements ChatModelService {

    private static final Logger log = LoggerFactory.getLogger(GeminiChatModelService.class);

    @Value("${petzoe.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${petzoe.ai.model:gemini-1.5-flash}")
    private String modelName;

    @Value("${petzoe.ai.temperature:0.4}")
    private double temperature;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiChatModelService(ObjectMapper objectMapper) {
        this.restClient = RestClient.builder().build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getProviderName() {
        return (apiKey != null && !apiKey.isBlank()) ? "GEMINI (" + modelName + ")" : "PETZOE_GROUNDED_LOCAL";
    }

    @Override
    public String generateResponse(String systemInstruction, String contextData, String userMessage, List<String> recentHistory) {
        // If Gemini API Key is configured and non-empty, call Google Gemini REST API
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            try {
                return callGeminiApi(systemInstruction, contextData, userMessage, recentHistory);
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to grounded rule engine: {}", e.getMessage());
            }
        }

        // Graceful Grounded Local Fallback (for offline testing, development, and when no key is supplied)
        return generateGroundedFallbackResponse(contextData, userMessage);
    }

    private String callGeminiApi(String systemInstruction, String contextData, String userMessage, List<String> recentHistory) throws Exception {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, apiKey);

        StringBuilder fullPrompt = new StringBuilder();
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            fullPrompt.append("SYSTEM INSTRUCTIONS:\n").append(systemInstruction).append("\n\n");
        }
        if (contextData != null && !contextData.isBlank()) {
            fullPrompt.append("VERIFIED PETZOE KNOWLEDGE & USER DATA (GROUND TRUTH):\n").append(contextData).append("\n\n");
        }
        if (recentHistory != null && !recentHistory.isEmpty()) {
            fullPrompt.append("RECENT CONVERSATION HISTORY:\n");
            for (String hist : recentHistory) {
                fullPrompt.append(hist).append("\n");
            }
            fullPrompt.append("\n");
        }
        fullPrompt.append("USER INQUIRY: ").append(userMessage).append("\n\nASSISTANT RESPONSE:");

        Map<String, Object> part = Map.of("text", fullPrompt.toString());
        Map<String, Object> contentObj = Map.of("role", "user", "parts", List.of(part));
        Map<String, Object> genConfig = Map.of("temperature", temperature, "maxOutputTokens", 1024);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(contentObj));
        requestBody.put("generationConfig", genConfig);

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        String responseBody = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonPayload)
                .retrieve()
                .body(String.class);

        if (responseBody != null) {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }

        return generateGroundedFallbackResponse(contextData, userMessage);
    }

    private String generateGroundedFallbackResponse(String contextData, String userMessage) {
        if (contextData != null && !contextData.isBlank()) {
            if (contextData.contains("TRUSTED EXTERNAL WEB SOURCES")) {
                return formatCuratedWebSummary(contextData);
            }
            return contextData;
        }

        String lower = (userMessage != null) ? userMessage.toLowerCase() : "";
        if (lower.contains("hi") || lower.contains("hello") || lower.contains("hey")) {
            return "Hello! I am your **PetZoe AI Assistant**. I can help you with general pet-care advice, managing your registered pets, checking upcoming vet appointments, finding certified veterinarians, and exploring adoption or marketplace supplies. How can I assist you and your furry friend today?";
        }

        return "I am here to assist you with your PetZoe pet care, health management, vet visits, and adoption navigation. Feel free to ask about your pets, vaccination protocols, or platform features!";
    }

    private String formatCuratedWebSummary(String contextData) {
        StringBuilder sb = new StringBuilder("Based on verified veterinary clinical guidelines and literature:\n\n");
        String[] lines = contextData.split("\n");
        String currentTitle = null;
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("[") && line.contains("] ") && line.contains("(")) {
                currentTitle = line;
            } else if (line.startsWith("Summary: ") && currentTitle != null) {
                String summary = line.substring("Summary: ".length());
                sb.append("• **").append(currentTitle).append("**\n  ").append(summary).append("\n\n");
                currentTitle = null;
            }
        }
        sb.append("Always consult your certified PetZoe veterinarian for diagnosis and personalized treatment plans for your pet.");
        return sb.toString();
    }
}
