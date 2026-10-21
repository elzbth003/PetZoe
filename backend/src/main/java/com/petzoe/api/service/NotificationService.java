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
    private final com.petzoe.api.repository.AppointmentRepository appointmentRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository,
                                com.petzoe.api.repository.AppointmentRepository appointmentRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Internal method to create a notification for a given user.
     */
    public void createNotification(User user, String title, String message, String type) {
        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }

    /**
     * Internal method to create a notification with a reason and reference ID.
     */
    public void createNotification(User user, String title, String message, String type, String reason, Long referenceId) {
        Notification notification = new Notification(user, title, message, type, reason, referenceId);
        notificationRepository.save(notification);
    }

    /**
     * Delete notifications associated with an appointment.
     */
    public void deleteNotificationsForAppointment(Long appointmentId) {
        if (appointmentId == null) return;
        List<Notification> notifs = notificationRepository.findByTypeInAndReferenceId(
                List.of("APPOINTMENT", "CHAT"), appointmentId);
        if (!notifs.isEmpty()) {
            notificationRepository.deleteAll(notifs);
        }
    }

    /**
     * Get all notifications for a user, ordered newest first.
     * Automatically filters and purges orphaned CHAT notifications for non-existent appointments.
     */
    public List<NotificationDTO> getNotifications(String email) {
        User user = getUser(email);
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

        List<Notification> validNotifications = new java.util.ArrayList<>();
        List<Notification> orphanedNotifications = new java.util.ArrayList<>();

        for (Notification n : notifications) {
            if ("CHAT".equalsIgnoreCase(n.getType()) && n.getReferenceId() != null) {
                if (!appointmentRepository.existsById(n.getReferenceId())) {
                    orphanedNotifications.add(n);
                    continue;
                }
            }
            validNotifications.add(n);
        }

        if (!orphanedNotifications.isEmpty()) {
            notificationRepository.deleteAll(orphanedNotifications);
        }

        return validNotifications
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
                n.getReason(),
                n.getReferenceId(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
