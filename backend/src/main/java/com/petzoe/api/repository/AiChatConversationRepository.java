package com.petzoe.api.repository;

import com.petzoe.api.entity.AiChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiChatConversationRepository extends JpaRepository<AiChatConversation, Long> {
    List<AiChatConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<AiChatConversation> findByIdAndUserId(Long id, Long userId);
}
