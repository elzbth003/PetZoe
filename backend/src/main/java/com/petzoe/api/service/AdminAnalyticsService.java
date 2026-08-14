package com.petzoe.api.service;

import com.petzoe.api.dto.AdminAnalyticsDTO;
import com.petzoe.api.dto.AdminAnalyticsDTO.DailyRegistration;
import com.petzoe.api.dto.AdminAnalyticsDTO.Distribution;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    private final UserRepository userRepository;

    public AdminAnalyticsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AdminAnalyticsDTO getAnalytics() {
        return new AdminAnalyticsDTO(
                getDailyRegistrations(),
                getRoleDistribution(),
                getVerificationStatusDistribution()
        );
    }

    private List<DailyRegistration> getDailyRegistrations() {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(29); // 30 days including today
        LocalDateTime since = startDate.atStartOfDay();

        // Query the DB for days that have registrations
        List<Object[]> dbRows = userRepository.countDailyRegistrations(since);
        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        for (Object[] row : dbRows) {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            countsByDate.put(date, count);
        }

        // Fill zero-count days in the service layer
        List<DailyRegistration> result = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            long count = countsByDate.getOrDefault(date, 0L);
            result.add(new DailyRegistration(date, count));
        }
        return result;
    }

    private List<Distribution> getRoleDistribution() {
        List<Object[]> dbRows = userRepository.countByRoleGrouped();
        return dbRows.stream()
                .map(row -> new Distribution((String) row[0], (Long) row[1]))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<Distribution> getVerificationStatusDistribution() {
        List<Object[]> dbRows = userRepository.countByVerificationStatusGrouped();
        return dbRows.stream()
                .map(row -> {
                    VerificationStatus status = (VerificationStatus) row[0];
                    return new Distribution(status.name(), (Long) row[1]);
                })
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }
}
