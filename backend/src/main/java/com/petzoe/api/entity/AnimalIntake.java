package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Record of a single intake event for an animal (how/when/why it entered
 * shelter care). An animal normally has one intake record, but the model
 * allows multiple to support re-intake (e.g. a returned adoption).
 */
@Entity
@Table(name = "animal_intakes")
public class AnimalIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "intake_date", nullable = false)
    private LocalDate intakeDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "intake_type", nullable = false)
    private IntakeType intakeType;

    @Column(name = "source_info", columnDefinition = "TEXT")
    private String sourceInfo;

    @Column(name = "previous_ownership_info", columnDefinition = "TEXT")
    private String previousOwnershipInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AnimalIntake() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public LocalDate getIntakeDate() { return intakeDate; }
    public void setIntakeDate(LocalDate intakeDate) { this.intakeDate = intakeDate; }

    public IntakeType getIntakeType() { return intakeType; }
    public void setIntakeType(IntakeType intakeType) { this.intakeType = intakeType; }

    public String getSourceInfo() { return sourceInfo; }
    public void setSourceInfo(String sourceInfo) { this.sourceInfo = sourceInfo; }

    public String getPreviousOwnershipInfo() { return previousOwnershipInfo; }
    public void setPreviousOwnershipInfo(String previousOwnershipInfo) { this.previousOwnershipInfo = previousOwnershipInfo; }

    public User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(User recordedBy) { this.recordedBy = recordedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
