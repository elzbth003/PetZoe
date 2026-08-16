package com.petzoe.api.dto;

import com.petzoe.api.entity.SterilizationStatus;
import java.time.LocalDate;

public record MedicalRecordRequestDTO(
    LocalDate examinationDate,
    Double weightKg,
    String healthStatus,
    String diagnosis,
    String treatment,
    String medication,
    String labInvestigations,
    String dewormingInfo,
    String parasiteControlInfo,
    SterilizationStatus sterilizationStatus,
    String veterinaryNotes,
    boolean followUpRequired,
    LocalDate followUpDate,
    String followUpNotes
) {}
