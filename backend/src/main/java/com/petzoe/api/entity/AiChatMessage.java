package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chat_messages")
public class AiChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AiChatConversation conversation;

    @Column(nullable = false, length = 20)
    private String sender; // "USER" or "ASSISTANT"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 50)
    private String intent;

    @Column(name = "source_type", length = 50)
    private String sourceType; // "AI_GENERATED", "PETZOE_DATA", "EMERGENCY_OVERRIDE", "FALLBACK"

    @Column(name = "tool_used", length = 100)
    private String toolUsed;

    @Column(name = "citations_json", columnDefinition = "TEXT")
    private String citationsJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AiChatMessage() {
        this.createdAt = LocalDateTime.now();
    }

    public AiChatMessage(AiChatConversation conversation, String sender, String message, String intent, String sourceType, String toolUsed) {
        this(conversation, sender, message, intent, sourceType, toolUsed, null);
    }

    public AiChatMessage(AiChatConversation conversation, String sender, String message, String intent, String sourceType, String toolUsed, String citationsJson) {
        this();
        this.conversation = conversation;
        this.sender = sender;
        this.message = message;
        this.intent = intent;
        this.sourceType = sourceType;
        this.toolUsed = toolUsed;
        this.citationsJson = citationsJson;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AiChatConversation getConversation() {
        return conversation;
    }

    public void setConversation(AiChatConversation conversation) {
        this.conversation = conversation;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getToolUsed() {
        return toolUsed;
    }

    public void setToolUsed(String toolUsed) {
        this.toolUsed = toolUsed;
    }

    public String getCitationsJson() {
        return citationsJson;
    }

    public void setCitationsJson(String citationsJson) {
        this.citationsJson = citationsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
