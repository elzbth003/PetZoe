package com.petzoe.api.controller;

import com.petzoe.api.dto.AiChatRequestDTO;
import com.petzoe.api.dto.AiChatResponseDTO;
import com.petzoe.api.dto.AiConversationDTO;
import com.petzoe.api.dto.ChatMessageDTO;
import com.petzoe.api.service.ChatService;
import com.petzoe.api.service.chat.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiChatService chatService;
    private final ChatService consultationChatService;

    public ChatController(AiChatService chatService, ChatService consultationChatService) {
        this.chatService = chatService;
        this.consultationChatService = consultationChatService;
    }

    /**
     * Send message in appointment consultation chat (Doctor <-> Pet Owner).
     */
    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<ChatMessageDTO> sendAppointmentMessage(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String content = payload.get("content");
        String email = authentication.getName();
        ChatMessageDTO dto = consultationChatService.sendMessage(appointmentId, content, email);
        return ResponseEntity.ok(dto);
    }

    /**
     * Get all messages for an appointment consultation chat.
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<ChatMessageDTO>> getAppointmentMessages(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        String email = authentication.getName();
        List<ChatMessageDTO> messages = consultationChatService.getMessagesByAppointment(appointmentId, email);
        return ResponseEntity.ok(messages);
    }

    /**
     * Mark all unread messages for this appointment as read.
     */
    @PutMapping("/appointment/{appointmentId}/read")
    public ResponseEntity<Map<String, String>> markAppointmentMessagesAsRead(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        String email = authentication.getName();
        consultationChatService.markMessagesAsRead(appointmentId, email);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read."));
    }


    /**
     * Get real-time online presence status of the corresponding consultation partner.
     */
    @GetMapping("/appointment/{appointmentId}/partner-status")
    public ResponseEntity<Map<String, Object>> getAppointmentPartnerStatus(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> status = consultationChatService.getAppointmentPartnerStatus(appointmentId, email);
        return ResponseEntity.ok(status);
    }

    /**
     * Public Guest Chat Endpoint.
     * Permitted to all visitors for general pet care, emergency triage, adoption, and platform guidance.
     * Strictly disallows access to personal data.
     */
    @PostMapping("/public/message")
    public ResponseEntity<AiChatResponseDTO> processPublicMessage(@Valid @RequestBody AiChatRequestDTO request) {
        AiChatResponseDTO response = chatService.processMessage(request, null, true);
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticated Chat Endpoint.
     * Accesses personalized pet profiles, appointments, vaccines, and prescriptions.
     * Identity is derived strictly from Spring Security SecurityContext.
     */
    @PostMapping("/message")
    public ResponseEntity<AiChatResponseDTO> processAuthenticatedMessage(
            @Valid @RequestBody AiChatRequestDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        AiChatResponseDTO response = chatService.processMessage(request, email, false);
        return ResponseEntity.ok(response);
    }

    /**
     * List authenticated user's conversations.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<AiConversationDTO>> getConversations(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getUserConversations(email));
    }

    /**
     * Get specific conversation with messages.
     * Backend strictly verifies conversation belongs to authenticated user.
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<AiConversationDTO> getConversation(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getConversation(id, email));
    }

    /**
     * Delete a conversation.
     * Backend strictly verifies conversation belongs to authenticated user.
     */
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<?> deleteConversation(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        chatService.deleteConversation(id, email);
        return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully."));
    }
}
