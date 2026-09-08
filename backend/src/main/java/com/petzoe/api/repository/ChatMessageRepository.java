package com.petzoe.api.repository;

import com.petzoe.api.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByAppointmentIdOrderByCreatedAtAsc(Long appointmentId);
    List<ChatMessage> findByReceiverIdAndIsReadFalse(Long receiverId);
}
