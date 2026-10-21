package com.petzoe.api.repository;

import com.petzoe.api.entity.Notification;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);
    List<Notification> findByTypeInAndReferenceId(List<String> types, Long referenceId);
    void deleteByTypeInAndReferenceId(List<String> types, Long referenceId);
}
