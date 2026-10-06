package com.petzoe.api.controller;

import com.petzoe.api.dto.AiChatRequestDTO;
import com.petzoe.api.dto.AiChatResponseDTO;
import com.petzoe.api.dto.AiConversationDTO;
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

    public ChatController(AiChatService chatService) {
        this.chatService = chatService;
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
