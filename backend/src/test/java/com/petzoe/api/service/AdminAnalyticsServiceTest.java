package com.petzoe.api.service;

import com.petzoe.api.dto.AdminAnalyticsDTO;
import com.petzoe.api.dto.AdminStatsDTO;
import com.petzoe.api.entity.AnimalStatus;
import com.petzoe.api.entity.ProductStatus;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminAnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private AdoptionApplicationRepository adoptionApplicationRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private AiChatMessageRepository aiChatMessageRepository;

    @Mock
    private ProductRepository productRepository;
    @Mock
    private AnimalRepository animalRepository;
    @Mock
    private VerificationRequestRepository verificationRequestRepository;
    @Mock
    private ShelterRepository shelterRepository;
    @Mock
    private AdopterProfileRepository adopterProfileRepository;
    @Mock
    private AdoptionListingRepository adoptionListingRepository;
    @Mock
    private PetRepository petRepository;
    @Mock
    private AiChatConversationRepository aiChatConversationRepository;

    private AdminAnalyticsService adminAnalyticsService;
    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminAnalyticsService = new AdminAnalyticsService(
                userRepository,
                appointmentRepository,
                adoptionApplicationRepository,
                orderRepository,
                paymentRepository,
                aiChatMessageRepository
        );

        adminService = new AdminService(
                userRepository,
                productRepository,
                animalRepository,
                verificationRequestRepository,
                shelterRepository,
                adopterProfileRepository,
                adoptionApplicationRepository,
                adoptionListingRepository,
                petRepository,
                appointmentRepository,
                orderRepository,
                aiChatConversationRepository,
                aiChatMessageRepository
        );
    }

    @Test
    @DisplayName("Analytics with empty database returns zero-filled buckets and non-null empty distributions")
    void testAnalytics_EmptyDatabase() {
        when(userRepository.countDailyRegistrations(any(LocalDateTime.class))).thenReturn(Collections.emptyList());
        when(userRepository.countByRoleGrouped()).thenReturn(Collections.emptyList());
        when(userRepository.countByVerificationStatusGrouped()).thenReturn(Collections.emptyList());
        when(appointmentRepository.countAppointmentsByStatusGrouped()).thenReturn(Collections.emptyList());
        when(appointmentRepository.countDailyAppointments(any(LocalDate.class))).thenReturn(Collections.emptyList());
        when(adoptionApplicationRepository.countByStatusGrouped()).thenReturn(Collections.emptyList());
        when(orderRepository.countOrdersByStatusGrouped()).thenReturn(Collections.emptyList());
        when(orderRepository.countDailyOrdersAndRevenue(any(LocalDateTime.class))).thenReturn(Collections.emptyList());
        when(paymentRepository.countPaymentsByStatusGrouped()).thenReturn(Collections.emptyList());
        when(aiChatMessageRepository.countAiMessagesByIntentGrouped()).thenReturn(Collections.emptyList());
        when(aiChatMessageRepository.countAiMessagesBySourceTypeGrouped()).thenReturn(Collections.emptyList());
        when(aiChatMessageRepository.countDailyAiMessages(any(LocalDateTime.class))).thenReturn(Collections.emptyList());

        AdminAnalyticsDTO analytics = adminAnalyticsService.getAnalytics(7);

        assertNotNull(analytics);
        assertEquals(7, analytics.reportingPeriodDays());
        assertEquals(7, analytics.userRegistrations().size(), "7-day period should contain 7 daily buckets");
        assertTrue(analytics.userRegistrations().stream().allMatch(d -> d.count() == 0L));
        assertEquals(7, analytics.appointmentTrends().size());
        assertEquals(7, analytics.orderTrends().size());
        assertEquals(7, analytics.aiMessageTrends().size());

        assertTrue(analytics.roleDistribution().isEmpty());
        assertTrue(analytics.verificationStatusDistribution().isEmpty());
        assertTrue(analytics.appointmentStatusDistribution().isEmpty());
        assertTrue(analytics.orderStatusDistribution().isEmpty());
    }

    @Test
    @DisplayName("Analytics with 30-day reporting period correctly fills registration and order buckets")
    void testAnalytics_PopulatedData_30Days() {
        LocalDate today = LocalDate.now();
        List<Object[]> regRows = Collections.singletonList(new Object[]{today, 5L});
        when(userRepository.countDailyRegistrations(any(LocalDateTime.class))).thenReturn(regRows);
        when(userRepository.countByRoleGrouped()).thenReturn(java.util.Arrays.asList(
                new Object[]{"Pet Owner", 20L},
                new Object[]{"Veterinarian", 5L}
        ));
        when(userRepository.countByVerificationStatusGrouped()).thenReturn(Collections.singletonList(
                new Object[]{VerificationStatus.APPROVED, 5L}
        ));
        when(appointmentRepository.countAppointmentsByStatusGrouped()).thenReturn(java.util.Arrays.asList(
                new Object[]{"COMPLETED", 12L},
                new Object[]{"UPCOMING", 3L}
        ));
        when(appointmentRepository.countDailyAppointments(any(LocalDate.class))).thenReturn(Collections.singletonList(
                new Object[]{today, 4L}
        ));
        when(adoptionApplicationRepository.countByStatusGrouped()).thenReturn(Collections.singletonList(
                new Object[]{"SUBMITTED", 8L}
        ));
        when(orderRepository.countOrdersByStatusGrouped()).thenReturn(Collections.singletonList(
                new Object[]{"Delivered", 15L}
        ));
        when(orderRepository.countDailyOrdersAndRevenue(any(LocalDateTime.class))).thenReturn(Collections.singletonList(
                new Object[]{today, 3L, 4500.0}
        ));
        when(paymentRepository.countPaymentsByStatusGrouped()).thenReturn(Collections.singletonList(
                new Object[]{"SUCCESS", 15L}
        ));
        when(aiChatMessageRepository.countAiMessagesByIntentGrouped()).thenReturn(Collections.singletonList(
                new Object[]{"PREVENTIVE_CARE", 25L}
        ));
        when(aiChatMessageRepository.countAiMessagesBySourceTypeGrouped()).thenReturn(Collections.singletonList(
                new Object[]{"VECTOR_KNOWLEDGE_BASE", 18L}
        ));
        when(aiChatMessageRepository.countDailyAiMessages(any(LocalDateTime.class))).thenReturn(Collections.singletonList(
                new Object[]{today, 10L}
        ));

        AdminAnalyticsDTO analytics = adminAnalyticsService.getAnalytics(30);

        assertNotNull(analytics);
        assertEquals(30, analytics.reportingPeriodDays());
        assertEquals(30, analytics.userRegistrations().size());

        // Check that today's registration count is 5
        var todayReg = analytics.userRegistrations().stream()
                .filter(d -> d.date().equals(today))
                .findFirst();
        assertTrue(todayReg.isPresent());
        assertEquals(5L, todayReg.get().count());

        // Check role distribution
        assertEquals(2, analytics.roleDistribution().size());
        assertEquals("Pet Owner", analytics.roleDistribution().get(0).label());
        assertEquals(20L, analytics.roleDistribution().get(0).count());

        // Check appointment status
        assertEquals(2, analytics.appointmentStatusDistribution().size());

        // Check order trends
        var todayOrders = analytics.orderTrends().stream()
                .filter(o -> o.date().equals(today))
                .findFirst();
        assertTrue(todayOrders.isPresent());
        assertEquals(3L, todayOrders.get().count());
        assertEquals(4500.0, todayOrders.get().revenue(), 0.001);
    }

    @Test
    @DisplayName("AdminService.getDashboardStats populates genuine database counts with zero fallbacks")
    void testGetDashboardStats_GenuineCounts() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByRoleIgnoreCase("Pet Owner")).thenReturn(60L);
        when(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Veterinarian", VerificationStatus.PENDING)).thenReturn(2L);
        when(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Veterinarian", VerificationStatus.APPROVED)).thenReturn(8L);
        when(shelterRepository.countByVerificationStatus(VerificationStatus.PENDING)).thenReturn(1L);
        when(userRepository.countPendingSellers(VerificationStatus.PENDING)).thenReturn(3L);
        when(productRepository.countByStatus(ProductStatus.PENDING_REVIEW)).thenReturn(4L);
        when(animalRepository.countByStatus(AnimalStatus.READY_FOR_ADOPTION)).thenReturn(14L);
        when(shelterRepository.count()).thenReturn(5L);
        when(adopterProfileRepository.count()).thenReturn(18L);
        when(adoptionApplicationRepository.count()).thenReturn(22L);
        when(adoptionListingRepository.countByStatus(VerificationStatus.PENDING)).thenReturn(2L);
        when(petRepository.count()).thenReturn(45L);
        when(appointmentRepository.count()).thenReturn(35L);
        when(appointmentRepository.countByStatusIgnoreCase("COMPLETED")).thenReturn(20L);
        when(appointmentRepository.countByStatusIgnoreCase("UPCOMING")).thenReturn(10L);
        when(appointmentRepository.countByStatusIgnoreCase("PENDING")).thenReturn(2L);
        when(appointmentRepository.countByStatusIgnoreCase("CANCELLED")).thenReturn(3L);
        when(orderRepository.count()).thenReturn(50L);
        when(orderRepository.calculateGrossDeliveredRevenue()).thenReturn(125000.0);
        when(aiChatConversationRepository.count()).thenReturn(40L);
        when(aiChatMessageRepository.count()).thenReturn(180L);

        AdminStatsDTO stats = adminService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(100L, stats.getTotalUsers());
        assertEquals(60L, stats.getTotalPetOwners());
        assertEquals(2L, stats.getPendingVets());
        assertEquals(8L, stats.getVerifiedVets());
        assertEquals(1L, stats.getPendingShelters());
        assertEquals(3L, stats.getPendingSellers());
        assertEquals(4L, stats.getPendingProducts());
        assertEquals(14L, stats.getActiveAdoptionPets());
        assertEquals(5L, stats.getTotalShelters());
        assertEquals(18L, stats.getTotalAdopters());
        assertEquals(22L, stats.getTotalAdoptionApplications());
        assertEquals(2L, stats.getPendingAdoptionListings());
        assertEquals(45L, stats.getTotalPets());
        assertEquals(35L, stats.getTotalAppointments());
        assertEquals(20L, stats.getCompletedAppointments());
        assertEquals(12L, stats.getPendingAppointments());
        assertEquals(3L, stats.getCancelledAppointments());
        assertEquals(50L, stats.getTotalOrders());
        assertEquals(125000.0, stats.getGrossOrderRevenue(), 0.001);
        assertEquals(40L, stats.getTotalAiConversations());
        assertEquals(180L, stats.getTotalAiMessages());
    }
}