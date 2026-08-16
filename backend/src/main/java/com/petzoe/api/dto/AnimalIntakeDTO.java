package com.petzoe.api.dto;

import com.petzoe.api.entity.AnimalIntake;
import com.petzoe.api.entity.IntakeType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AnimalIntakeDTO {
    private Long id;
    private LocalDate intakeDate;
    private IntakeType intakeType;
    private String sourceInfo;
    private String previousOwnershipInfo;
    private String recordedByName;
    private LocalDateTime createdAt;

    public AnimalIntakeDTO() {}

    public AnimalIntakeDTO(AnimalIntake intake) {
        this.id = intake.getId();
        this.intakeDate = intake.getIntakeDate();
        this.intakeType = intake.getIntakeType();
        this.sourceInfo = intake.getSourceInfo();
        this.previousOwnershipInfo = intake.getPreviousOwnershipInfo();
        this.recordedByName = intake.getRecordedBy().getName();
        this.createdAt = intake.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getIntakeDate() { return intakeDate; }
    public void setIntakeDate(LocalDate intakeDate) { this.intakeDate = intakeDate; }

    public IntakeType getIntakeType() { return intakeType; }
    public void setIntakeType(IntakeType intakeType) { this.intakeType = intakeType; }

    public String getSourceInfo() { return sourceInfo; }
    public void setSourceInfo(String sourceInfo) { this.sourceInfo = sourceInfo; }

    public String getPreviousOwnershipInfo() { return previousOwnershipInfo; }
    public void setPreviousOwnershipInfo(String previousOwnershipInfo) { this.previousOwnershipInfo = previousOwnershipInfo; }

    public String getRecordedByName() { return recordedByName; }
    public void setRecordedByName(String recordedByName) { this.recordedByName = recordedByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
