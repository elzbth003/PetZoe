package com.petzoe.api.service;

import com.petzoe.api.dto.AdminAnalyticsDTO;
import com.petzoe.api.dto.AdminAnalyticsDTO.DailyRegistration;
import com.petzoe.api.dto.AdminAnalyticsDTO.DailyTimeSeries;
import com.petzoe.api.dto.AdminAnalyticsDTO.DailyRevenueSeries;
import com.petzoe.api.dto.AdminAnalyticsDTO.Distribution;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AdoptionApplicationRepository adoptionApplicationRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final AiChatMessageRepository aiChatMessageRepository;

    public AdminAnalyticsService(UserRepository userRepository,
                                 AppointmentRepository appointmentRepository,
                                 AdoptionApplicationRepository adoptionApplicationRepository,
                                 OrderRepository orderRepository,
                                 PaymentRepository paymentRepository,
                                 AiChatMessageRepository aiChatMessageRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.adoptionApplicationRepository = adoptionApplicationRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.aiChatMessageRepository = aiChatMessageRepository;
    }

    public AdminAnalyticsDTO getAnalytics() {
        return getAnalytics(30);
    }

    public AdminAnalyticsDTO getAnalytics(int days) {
        int boundedDays = Math.max(1, Math.min(days, 365));
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(boundedDays - 1L);
        LocalDateTime since = startDate.atStartOfDay();

        return new AdminAnalyticsDTO(
                boundedDays,
                getDailyRegistrations(startDate, today, since),
                getRoleDistribution(),
                getVerificationStatusDistribution(),
                getAppointmentStatusDistribution(),
                getDailyAppointments(startDate, today),
                getAdoptionApplicationStatusDistribution(),
                getOrderStatusDistribution(),
                getDailyOrders(startDate, today, since),
                getPaymentStatusDistribution(),
                getAiIntentDistribution(),
                getAiSourceDistribution(),
                getDailyAiMessages(startDate, today, since)
        );
    }

    private List<DailyRegistration> getDailyRegistrations(LocalDate startDate, LocalDate today, LocalDateTime since) {
        List<Object[]> dbRows = userRepository.countDailyRegistrations(since);
        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        for (Object[] row : dbRows) {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            countsByDate.put(date, count);
        }

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
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "Unknown", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<Distribution> getVerificationStatusDistribution() {
        List<Object[]> dbRows = userRepository.countByVerificationStatusGrouped();
        return dbRows.stream()
                .map(row -> {
                    String label = row[0] != null ? row[0].toString() : "UNVERIFIED";
                    return new Distribution(label, ((Number) row[1]).longValue());
                })
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<Distribution> getAppointmentStatusDistribution() {
        List<Object[]> dbRows = appointmentRepository.countAppointmentsByStatusGrouped();
        return dbRows.stream()
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "UNKNOWN", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<DailyTimeSeries> getDailyAppointments(LocalDate startDate, LocalDate today) {
        List<Object[]> dbRows = appointmentRepository.countDailyAppointments(startDate);
        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        for (Object[] row : dbRows) {
            LocalDate date = (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            countsByDate.put(date, count);
        }

        List<DailyTimeSeries> result = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            long count = countsByDate.getOrDefault(date, 0L);
            result.add(new DailyTimeSeries(date, count));
        }
        return result;
    }

    private List<Distribution> getAdoptionApplicationStatusDistribution() {
        List<Object[]> dbRows = adoptionApplicationRepository.countByStatusGrouped();
        return dbRows.stream()
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "DRAFT", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<Distribution> getOrderStatusDistribution() {
        List<Object[]> dbRows = orderRepository.countOrdersByStatusGrouped();
        return dbRows.stream()
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "Pending", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<DailyRevenueSeries> getDailyOrders(LocalDate startDate, LocalDate today, LocalDateTime since) {
        List<Object[]> dbRows = orderRepository.countDailyOrdersAndRevenue(since);
        Map<LocalDate, DailyRevenueSeries> dataByDate = new LinkedHashMap<>();
        for (Object[] row : dbRows) {
            LocalDate date = (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            Double rev = ((Number) row[2]).doubleValue();
            dataByDate.put(date, new DailyRevenueSeries(date, count, rev));
        }

        List<DailyRevenueSeries> result = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            DailyRevenueSeries entry = dataByDate.get(date);
            if (entry != null) {
                result.add(entry);
            } else {
                result.add(new DailyRevenueSeries(date, 0L, 0.0));
            }
        }
        return result;
    }

    private List<Distribution> getPaymentStatusDistribution() {
        List<Object[]> dbRows = paymentRepository.countPaymentsByStatusGrouped();
        return dbRows.stream()
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "UNKNOWN", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<Distribution> getAiIntentDistribution() {
        List<Object[]> dbRows = aiChatMessageRepository.countAiMessagesByIntentGrouped();
        return dbRows.stream()
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "GENERAL", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<Distribution> getAiSourceDistribution() {
        List<Object[]> dbRows = aiChatMessageRepository.countAiMessagesBySourceTypeGrouped();
        return dbRows.stream()
                .map(row -> new Distribution(row[0] != null ? row[0].toString() : "AI_GENERATED", ((Number) row[1]).longValue()))
                .sorted(Comparator.comparingLong(Distribution::count).reversed())
                .collect(Collectors.toList());
    }

    private List<DailyTimeSeries> getDailyAiMessages(LocalDate startDate, LocalDate today, LocalDateTime since) {
        List<Object[]> dbRows = aiChatMessageRepository.countDailyAiMessages(since);
        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        for (Object[] row : dbRows) {
            LocalDate date = (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            countsByDate.put(date, count);
        }

        List<DailyTimeSeries> result = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            long count = countsByDate.getOrDefault(date, 0L);
            result.add(new DailyTimeSeries(date, count));
        }
        return result;
    }
}
