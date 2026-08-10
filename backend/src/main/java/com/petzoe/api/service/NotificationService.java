package com.petzoe.api.service;

import com.petzoe.api.dto.NotificationDTO;
import com.petzoe.api.entity.Notification;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.NotificationRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Internal method to create a notification for a given user.
     */
    public void createNotification(User user, String title, String message, String type) {
        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user, ordered newest first.
     */
    public List<NotificationDTO> getNotifications(String email) {
        User user = getUser(email);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark a notification as read.
     */
    public NotificationDTO markAsRead(Long id, String email) {
        User user = getUser(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: You cannot access this notification.");
        }

        notification.setRead(true);
        return toDTO(notificationRepository.save(notification));
    }

    /**
     * Delete a notification.
     */
    public void deleteNotification(Long id, String email) {
        User user = getUser(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: You cannot delete this notification.");
        }

        notificationRepository.delete(notification);
    }

    /**
     * Get unread count for a user.
     */
    public long getUnreadCount(String email) {
        User user = getUser(email);
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private NotificationDTO toDTO(Notification n) {
        return new NotificationDTO(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
