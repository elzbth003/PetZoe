package com.petzoe.api.dto;

import com.petzoe.api.entity.MedicalRecord;
import com.petzoe.api.entity.SterilizationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicalRecordDTO {
    private Long id;
    private String veterinarianName;
    private LocalDate examinationDate;
    private Double weightKg;
    private String healthStatus;
    private String diagnosis;
    private String treatment;
    private String medication;
    private String labInvestigations;
    private String dewormingInfo;
    private String parasiteControlInfo;
    private SterilizationStatus sterilizationStatus;
    private String veterinaryNotes;
    private boolean followUpRequired;
    private LocalDate followUpDate;
    private String followUpNotes;
    private LocalDateTime createdAt;

    public MedicalRecordDTO() {}

    public MedicalRecordDTO(MedicalRecord r) {
        this.id = r.getId();
        this.veterinarianName = r.getVeterinarian().getName();
        this.examinationDate = r.getExaminationDate();
        this.weightKg = r.getWeightKg();
        this.healthStatus = r.getHealthStatus();
        this.diagnosis = r.getDiagnosis();
        this.treatment = r.getTreatment();
        this.medication = r.getMedication();
        this.labInvestigations = r.getLabInvestigations();
        this.dewormingInfo = r.getDewormingInfo();
        this.parasiteControlInfo = r.getParasiteControlInfo();
        this.sterilizationStatus = r.getSterilizationStatus();
        this.veterinaryNotes = r.getVeterinaryNotes();
        this.followUpRequired = r.isFollowUpRequired();
        this.followUpDate = r.getFollowUpDate();
        this.followUpNotes = r.getFollowUpNotes();
        this.createdAt = r.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVeterinarianName() { return veterinarianName; }
    public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }

    public LocalDate getExaminationDate() { return examinationDate; }
    public void setExaminationDate(LocalDate examinationDate) { this.examinationDate = examinationDate; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public String getMedication() { return medication; }
    public void setMedication(String medication) { this.medication = medication; }

    public String getLabInvestigations() { return labInvestigations; }
    public void setLabInvestigations(String labInvestigations) { this.labInvestigations = labInvestigations; }

    public String getDewormingInfo() { return dewormingInfo; }
    public void setDewormingInfo(String dewormingInfo) { this.dewormingInfo = dewormingInfo; }

    public String getParasiteControlInfo() { return parasiteControlInfo; }
    public void setParasiteControlInfo(String parasiteControlInfo) { this.parasiteControlInfo = parasiteControlInfo; }

    public SterilizationStatus getSterilizationStatus() { return sterilizationStatus; }
    public void setSterilizationStatus(SterilizationStatus sterilizationStatus) { this.sterilizationStatus = sterilizationStatus; }

    public String getVeterinaryNotes() { return veterinaryNotes; }
    public void setVeterinaryNotes(String veterinaryNotes) { this.veterinaryNotes = veterinaryNotes; }

    public boolean isFollowUpRequired() { return followUpRequired; }
    public void setFollowUpRequired(boolean followUpRequired) { this.followUpRequired = followUpRequired; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
