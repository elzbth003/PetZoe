package com.petzoe.api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AiConversationDTO {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AiChatResponseDTO> messages = new ArrayList<>();

    public AiConversationDTO() {}

    public AiConversationDTO(Long id, String title, LocalDateTime createdAt, LocalDateTime updatedAt, List<AiChatResponseDTO> messages) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (messages != null) {
            this.messages = messages;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<AiChatResponseDTO> getMessages() { return messages; }
    public void setMessages(List<AiChatResponseDTO> messages) { this.messages = messages; }
}
