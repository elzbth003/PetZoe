package com.petzoe.api.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminAnalyticsDTO(
    int reportingPeriodDays,
    List<DailyRegistration> userRegistrations,
    List<Distribution> roleDistribution,
    List<Distribution> verificationStatusDistribution,
    List<Distribution> appointmentStatusDistribution,
    List<DailyTimeSeries> appointmentTrends,
    List<Distribution> adoptionApplicationStatusDistribution,
    List<Distribution> orderStatusDistribution,
    List<DailyRevenueSeries> orderTrends,
    List<Distribution> paymentStatusDistribution,
    List<Distribution> aiIntentDistribution,
    List<Distribution> aiSourceDistribution,
    List<DailyTimeSeries> aiMessageTrends
) {
    public record DailyRegistration(LocalDate date, long count) {}
    public record DailyTimeSeries(LocalDate date, long count) {}
    public record DailyRevenueSeries(LocalDate date, long count, double revenue) {}
    public record Distribution(String label, long count) {}
}
