package com.petzoe.api.repository;

import com.petzoe.api.entity.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    void deleteByConversationId(Long conversationId);

    @org.springframework.data.jpa.repository.Query("SELECT m.intent, COUNT(m) FROM AiChatMessage m WHERE m.intent IS NOT NULL AND m.intent <> '' GROUP BY m.intent")
    List<Object[]> countAiMessagesByIntentGrouped();

    @org.springframework.data.jpa.repository.Query("SELECT m.sourceType, COUNT(m) FROM AiChatMessage m WHERE m.sourceType IS NOT NULL AND m.sourceType <> '' GROUP BY m.sourceType")
    List<Object[]> countAiMessagesBySourceTypeGrouped();

    @org.springframework.data.jpa.repository.Query("SELECT CAST(m.createdAt AS java.time.LocalDate), COUNT(m) FROM AiChatMessage m WHERE m.createdAt >= :since GROUP BY CAST(m.createdAt AS java.time.LocalDate) ORDER BY CAST(m.createdAt AS java.time.LocalDate)")
    List<Object[]> countDailyAiMessages(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}
