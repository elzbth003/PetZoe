package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_history")
public class VerificationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_profile_id", nullable = false)
    private VeterinarianProfile veterinarianProfile;

    @Column(nullable = false)
    private String action; // e.g. SUBMITTED, APPROVED, REJECTED, REQUEST_RESUBMISSION

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private VerificationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private VerificationStatus newStatus;

    @Column(length = 1000)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin; // nullable because 'SUBMITTED' is done by the user

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public VerificationHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public VerificationHistory(VeterinarianProfile veterinarianProfile, String action, VerificationStatus previousStatus, VerificationStatus newStatus, String reason, User admin) {
        this.veterinarianProfile = veterinarianProfile;
        this.action = action;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.admin = admin;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    // Intentionally no setId to emphasize immutability if possible, though JPA usually needs it.
    public void setId(Long id) { this.id = id; }

    public VeterinarianProfile getVeterinarianProfile() { return veterinarianProfile; }
    public void setVeterinarianProfile(VeterinarianProfile veterinarianProfile) { this.veterinarianProfile = veterinarianProfile; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public VerificationStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(VerificationStatus previousStatus) { this.previousStatus = previousStatus; }

    public VerificationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(VerificationStatus newStatus) { this.newStatus = newStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
