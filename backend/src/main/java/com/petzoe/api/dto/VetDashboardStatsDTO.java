package com.petzoe.api.dto;

public record VetDashboardStatsDTO(
        long todaysAppointments,
        long pendingRequests,
        long confirmedAppointments,
        long completedConsultations,
        long activePatients,
        long followUpsDue,
        long shelterAnimalsCount,
        long overdueShelterCareCount
) {}
