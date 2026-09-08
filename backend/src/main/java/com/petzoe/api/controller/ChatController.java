package com.petzoe.api.controller;

import com.petzoe.api.dto.ChatMessageDTO;
import com.petzoe.api.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'VETERINARIAN')")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @PathVariable Long appointmentId, 
            @RequestBody Map<String, String> payload, 
            Authentication auth) {
        return ResponseEntity.ok(chatService.sendMessage(appointmentId, payload.get("content"), auth.getName()));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'VETERINARIAN', 'ADMIN')")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Long appointmentId, 
            Authentication auth) {
        return ResponseEntity.ok(chatService.getMessagesByAppointment(appointmentId, auth.getName()));
    }

    @PutMapping("/appointment/{appointmentId}/read")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'VETERINARIAN')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long appointmentId, 
            Authentication auth) {
        chatService.markMessagesAsRead(appointmentId, auth.getName());
        return ResponseEntity.ok().build();
    }
}
