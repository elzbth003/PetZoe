package com.petzoe.api.service;

import com.petzoe.api.dto.ChatMessageDTO;
import com.petzoe.api.entity.Appointment;
import com.petzoe.api.entity.ChatMessage;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AppointmentRepository;
import com.petzoe.api.repository.ChatMessageRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final UserPresenceService userPresenceService;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       AppointmentRepository appointmentRepository,
                       UserRepository userRepository,
                       NotificationService notificationService,
                       UserPresenceService userPresenceService) {
        this.chatMessageRepository = chatMessageRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.userPresenceService = userPresenceService;
    }

    @Transactional
    public ChatMessageDTO sendMessage(Long appointmentId, String content, String senderEmail) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        User receiver;
        if (appointment.getOwner().getId().equals(sender.getId())) {
            receiver = appointment.getVeterinarian();
        } else if (appointment.getVeterinarian().getId().equals(sender.getId())) {
            receiver = appointment.getOwner();
        } else {
            throw new AccessDeniedException("You are not authorized to send messages for this appointment");
        }

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setAppointment(appointment);
        message.setContent(content.trim());
        
        ChatMessage saved = chatMessageRepository.save(message);

        // Notify receiver of new chat message
        String preview = content.length() > 60 ? content.substring(0, 57) + "..." : content;
        notificationService.createNotification(
                receiver,
                "New message from " + sender.getName(),
                preview,
                "CHAT",
                null,
                appointment.getId()
        );

        return mapToDTO(saved);
    }

    public List<ChatMessageDTO> getMessagesByAppointment(Long appointmentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getOwner().getId().equals(user.getId()) &&
            !appointment.getVeterinarian().getId().equals(user.getId()) &&
            !user.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("You are not authorized to view messages for this appointment");
        }

        return chatMessageRepository.findByAppointmentIdOrderByCreatedAtAsc(appointmentId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markMessagesAsRead(Long appointmentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        List<ChatMessage> messages = chatMessageRepository.findByAppointmentIdOrderByCreatedAtAsc(appointmentId);
        for (ChatMessage message : messages) {
            if (message.getReceiver().getId().equals(user.getId()) && !message.isRead()) {
                message.setRead(true);
                chatMessageRepository.save(message);
            }
        }
    }


    public java.util.Map<String, Object> getAppointmentPartnerStatus(Long appointmentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        boolean isOwner = appointment.getOwner().getId().equals(user.getId());
        boolean isVet = appointment.getVeterinarian().getId().equals(user.getId());

        if (!isOwner && !isVet && !user.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("You are not authorized to view this appointment status");
        }

        User partner = isOwner ? appointment.getVeterinarian() : appointment.getOwner();
        boolean online = userPresenceService.isUserOnline(partner.getId(), partner.getEmail());
        java.time.Instant lastSeen = userPresenceService.getLastSeen(partner.getId(), partner.getEmail());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("appointmentId", appointmentId);
        response.put("partnerId", partner.getId());
        response.put("partnerName", partner.getName());
        response.put("partnerRole", partner.getRole());
        response.put("isOnline", online);
        response.put("isDoctor", partner.getRole() != null && partner.getRole().toLowerCase().contains("vet"));
        response.put("lastSeen", lastSeen != null ? lastSeen.toString() : null);
        return response;
    }

    private ChatMessageDTO mapToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getName());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getName());
        dto.setAppointmentId(message.getAppointment().getId());
        dto.setContent(message.getContent());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
