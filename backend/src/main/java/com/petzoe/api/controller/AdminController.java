package com.petzoe.api.controller;

import com.petzoe.api.dto.AdminStatsDTO;
import com.petzoe.api.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final com.petzoe.api.repository.AuditLogRepository auditLogRepository;
    private final com.petzoe.api.service.AdminAnalyticsService adminAnalyticsService;

    public AdminController(AdminService adminService,
                           com.petzoe.api.repository.AuditLogRepository auditLogRepository,
                           com.petzoe.api.service.AdminAnalyticsService adminAnalyticsService) {
        this.adminService = adminService;
        this.auditLogRepository = auditLogRepository;
        this.adminAnalyticsService = adminAnalyticsService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/dashboard/activity")
    public ResponseEntity<java.util.List<com.petzoe.api.entity.AuditLog>> getRecentActivity() {
        return ResponseEntity.ok(auditLogRepository.findTop50ByOrderByTimestampDesc());
    }

    @GetMapping("/dashboard/analytics")
    public ResponseEntity<com.petzoe.api.dto.AdminAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(adminAnalyticsService.getAnalytics());
    }
}
