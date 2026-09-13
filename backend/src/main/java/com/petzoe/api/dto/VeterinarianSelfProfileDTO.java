package com.petzoe.api.dto;

import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;
import java.util.List;

public record VeterinarianSelfProfileDTO(
        Long userId,
        String name,
        String email,
        String phone,
        String specialization,
        String bio,
        String address,
        VerificationStatus verificationStatus,
        Long profileId,
        String qualification,
        String registrationNumber,
        Integer experience,
        LocalDateTime submittedAt,
        LocalDateTime verifiedAt,
        List<VerificationDocumentDTO> documents,
        List<VerificationHistoryDTO> history,
        String workingDays,
        String workStartTime,
        String workEndTime
) {}
