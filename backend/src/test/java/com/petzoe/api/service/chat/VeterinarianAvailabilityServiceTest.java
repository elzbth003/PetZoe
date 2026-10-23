package com.petzoe.api.service.chat;

import com.petzoe.api.dto.DoctorDayScheduleDTO;
import com.petzoe.api.dto.SlotAvailabilityDTO;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class VeterinarianAvailabilityServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentService appointmentService;

    private VeterinarianAvailabilityService availabilityService;

    @BeforeEach
    void setUp() {
        availabilityService = new VeterinarianAvailabilityService(userRepository, appointmentService);
    }

    @Test
    @DisplayName("isAvailabilityQuery recognizes various booking and schedule prompts")
    void testIsAvailabilityQuery() {
        assertTrue(availabilityService.isAvailabilityQuery("Is any veterinarian available tomorrow?"));
        assertTrue(availabilityService.isAvailabilityQuery("Can I book an appointment with Dr. Sarah?"));
        assertTrue(availabilityService.isAvailabilityQuery("What are the clinic hours today?"));
        assertTrue(availabilityService.isAvailabilityQuery("Are there open slots for consultation?"));
        assertTrue(availabilityService.isAvailabilityQuery("Can I see a doctor today?"));

        assertFalse(availabilityService.isAvailabilityQuery("What is the WSAVA vaccine guideline?"));
        assertFalse(availabilityService.isAvailabilityQuery("Show my registered pets"));
    }

    @Test
    @DisplayName("resolveAvailability returns open slots and actions for verified doctors")
    void testResolveAvailabilityWithOpenSlots() {
        User vet = new User();
        vet.setId(101L);
        vet.setName("Dr. Sarah Jenkins");
        vet.setRole("Veterinarian");
        vet.setVerificationStatus(VerificationStatus.APPROVED);
        vet.setEnabled(true);
        vet.setSpecialization("General Practice & Surgery");

        when(userRepository.findByRole("Veterinarian")).thenReturn(List.of(vet));

        DoctorDayScheduleDTO schedule = new DoctorDayScheduleDTO(
                101L, "Dr. Sarah Jenkins", LocalDate.now().plusDays(1), true, "Weekday", "09:00 - 17:00", null,
                List.of(
                        new SlotAvailabilityDTO("09:00 - 09:30", "AVAILABLE", true),
                        new SlotAvailabilityDTO("09:30 - 10:00", "BOOKED", false),
                        new SlotAvailabilityDTO("10:00 - 10:30", "AVAILABLE", true)
                )
        );

        when(appointmentService.getDoctorSlotAvailability(eq(101L), any(LocalDate.class)))
                .thenReturn(schedule);

        VeterinarianAvailabilityService.AvailabilityResult result =
                availabilityService.resolveAvailability("Is Dr. Sarah available tomorrow morning?");

        assertNotNull(result);
        assertEquals("Sarah", result.doctorQuery());
        assertEquals("MORNING", result.timePreference());
        assertEquals(2, result.totalOpenSlots());
        assertTrue(result.directResponse().contains("Dr. Sarah Jenkins"));
        assertTrue(result.directResponse().contains("09:00"));
        assertFalse(result.quickActions().isEmpty());
    }

    @Test
    @DisplayName("resolveAvailability handles doctors marked off-duty or on leave")
    void testResolveAvailabilityOffDuty() {
        User vet = new User();
        vet.setId(102L);
        vet.setName("Dr. Priya Sharma");
        vet.setRole("Veterinarian");
        vet.setVerificationStatus(VerificationStatus.APPROVED);
        vet.setEnabled(true);

        when(userRepository.findByRole("Veterinarian")).thenReturn(List.of(vet));

        DoctorDayScheduleDTO offDutySchedule = new DoctorDayScheduleDTO(
                102L, "Dr. Priya Sharma", LocalDate.now(), false, "Sunday", "Closed", "Weekly Off (Sunday)",
                List.of()
        );

        when(appointmentService.getDoctorSlotAvailability(eq(102L), any(LocalDate.class)))
                .thenReturn(offDutySchedule);

        VeterinarianAvailabilityService.AvailabilityResult result =
                availabilityService.resolveAvailability("Is Dr. Priya available on Sunday?");

        assertNotNull(result);
        assertEquals(0, result.totalOpenSlots());
        assertTrue(result.directResponse().contains("does not hold clinic hours") || result.formattedContext().contains("Off Duty"));
    }

    @Test
    @DisplayName("resolveAvailability handles queries when no approved doctors match")
    void testResolveAvailabilityNoDoctorFound() {
        when(userRepository.findByRole("Veterinarian")).thenReturn(List.of());

        VeterinarianAvailabilityService.AvailabilityResult result =
                availabilityService.resolveAvailability("Is Dr. Strange available?");

        assertNotNull(result);
        assertEquals(0, result.totalOpenSlots());
        assertTrue(result.directResponse().contains("was not found among verified veterinarians") ||
                   result.directResponse().contains("No verified veterinarians"));
    }
}
