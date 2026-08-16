package com.petzoe.api.service;

import com.petzoe.api.entity.AdoptionAuditLog;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AdoptionAuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AdoptionAuditService {

    private final AdoptionAuditLogRepository adoptionAuditLogRepository;

    public AdoptionAuditService(AdoptionAuditLogRepository adoptionAuditLogRepository) {
        this.adoptionAuditLogRepository = adoptionAuditLogRepository;
    }

    public void log(User actor, String action, String entityType, Long entityId,
                     String previousStatus, String newStatus, String notes) {
        adoptionAuditLogRepository.save(
                new AdoptionAuditLog(actor, action, entityType, entityId, previousStatus, newStatus, notes));
    }
}
