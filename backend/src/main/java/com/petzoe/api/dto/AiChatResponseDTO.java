package com.petzoe.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AiChatResponseDTO {

    private Long id;
    private Long conversationId;
    private String sender;
    private String message;
    private String intent;
    private String sourceType;
    private String toolUsed;
    private LocalDateTime createdAt;
    private List<AiQuickActionDTO> quickActions;
    private List<AiCitationDTO> citations;
    private String searchStatus;

    public AiChatResponseDTO() {}

    public AiChatResponseDTO(Long id, Long conversationId, String sender, String message, 
                             String intent, String sourceType, String toolUsed, 
                             LocalDateTime createdAt, List<AiQuickActionDTO> quickActions) {
        this(id, conversationId, sender, message, intent, sourceType, toolUsed, createdAt, quickActions, null, null);
    }

    public AiChatResponseDTO(Long id, Long conversationId, String sender, String message, 
                             String intent, String sourceType, String toolUsed, 
                             LocalDateTime createdAt, List<AiQuickActionDTO> quickActions,
                             List<AiCitationDTO> citations, String searchStatus) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.message = message;
        this.intent = intent;
        this.sourceType = sourceType;
        this.toolUsed = toolUsed;
        this.createdAt = createdAt;
        this.quickActions = quickActions;
        this.citations = citations;
        this.searchStatus = searchStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getToolUsed() { return toolUsed; }
    public void setToolUsed(String toolUsed) { this.toolUsed = toolUsed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<AiQuickActionDTO> getQuickActions() { return quickActions; }
    public void setQuickActions(List<AiQuickActionDTO> quickActions) { this.quickActions = quickActions; }

    public List<AiCitationDTO> getCitations() { return citations; }
    public void setCitations(List<AiCitationDTO> citations) { this.citations = citations; }

    public String getSearchStatus() { return searchStatus; }
    public void setSearchStatus(String searchStatus) { this.searchStatus = searchStatus; }
}
