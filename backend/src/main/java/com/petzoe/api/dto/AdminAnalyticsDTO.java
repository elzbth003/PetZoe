package com.petzoe.api.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminAnalyticsDTO(
    List<DailyRegistration> userRegistrations,
    List<Distribution> roleDistribution,
    List<Distribution> verificationStatusDistribution
) {
    public record DailyRegistration(LocalDate date, long count) {}
    public record Distribution(String label, long count) {}
}
