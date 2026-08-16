package com.petzoe.api.repository;

import com.petzoe.api.entity.AdoptionAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionAuditLogRepository extends JpaRepository<AdoptionAuditLog, Long> {
    List<AdoptionAuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}
