package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "veterinarian_profiles")
public class VeterinarianProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 255)
    private String qualification;

    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Column
    private Integer experience;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "working_days", length = 255)
    private String workingDays = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";

    @Column(name = "work_start_time", length = 20)
    private String workStartTime = "09:00 AM";

    @Column(name = "work_end_time", length = 20)
    private String workEndTime = "05:00 PM";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    public VeterinarianProfile() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getWorkingDays() {
        return workingDays != null && !workingDays.isBlank() ? workingDays : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";
    }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }

    public String getWorkStartTime() {
        return workStartTime != null && !workStartTime.isBlank() ? workStartTime : "09:00 AM";
    }
    public void setWorkStartTime(String workStartTime) { this.workStartTime = workStartTime; }

    public String getWorkEndTime() {
        return workEndTime != null && !workEndTime.isBlank() ? workEndTime : "05:00 PM";
    }
    public void setWorkEndTime(String workEndTime) { this.workEndTime = workEndTime; }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }
}
