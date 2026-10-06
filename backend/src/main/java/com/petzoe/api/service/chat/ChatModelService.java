package com.petzoe.api.service.chat;

import java.util.List;

public interface ChatModelService {

    /**
     * Generates a conversational response given system context, tool outputs, and user query.
     *
     * @param systemInstruction Medical/platform safety boundaries and persona
     * @param contextData Data retrieved from authorized PetZoe tools or knowledge base
     * @param userMessage Untrusted incoming user query
     * @param recentHistory Recent conversation messages for contextual memory
     * @return Natural language response
     */
    String generateResponse(String systemInstruction, String contextData, String userMessage, List<String> recentHistory);

    /**
     * Returns the name of the active provider (e.g. GEMINI, LOCAL_MOCK).
     */
    String getProviderName();
}
