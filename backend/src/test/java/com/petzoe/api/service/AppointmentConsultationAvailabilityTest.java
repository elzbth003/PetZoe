package com.petzoe.api.service;

import com.petzoe.api.dto.AppointmentDTO;
import com.petzoe.api.dto.ConsultationSubmissionDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentConsultationAvailabilityTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private PetMedicalRecordRepository petMedicalRecordRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private VeterinarianProfileRepository veterinarianProfileRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RazorpayClient razorpayClient;

    @Mock
    private UserPresenceService userPresenceService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User vet;
    private User unauthorizedVet;
    private User owner;
    private Pet pet;
    private Appointment confirmedAppointment;
    private Appointment completedAppointment;
    private Appointment cancelledAppointment;

    @BeforeEach
    void setUp() {
        vet = new User();
        vet.setId(10L);
        vet.setName("Dr. Sarah Jenkins");
        vet.setEmail("dr.jenkins@petzoe.com");
        vet.setRole("Veterinarian");

        unauthorizedVet = new User();
        unauthorizedVet.setId(20L);
        unauthorizedVet.setName("Dr. Marcus Thorne");
        unauthorizedVet.setEmail("dr.thorne@petzoe.com");
        unauthorizedVet.setRole("Veterinarian");

        owner = new User();
        owner.setId(100L);
        owner.setName("Alex Carter");
        owner.setEmail("alex@example.com");
        owner.setRole("PetOwner");

        pet = new Pet();
        pet.setId(50L);
        pet.setName("Bella");
        pet.setPetCode("PZ-BEL-001");
        pet.setOwner(owner);
        pet.setWeight(24.5);

        confirmedAppointment = new Appointment(
                pet, owner, vet,
                LocalDate.now().plusDays(1), "11:00 AM",
                "CONFIRMED", "Routine health checkup"
        );
        confirmedAppointment.setId(201L);

        completedAppointment = new Appointment(
                pet, owner, vet,
                LocalDate.now().minusDays(2), "10:00 AM",
                "COMPLETED", "Completed dental exam"
        );
        completedAppointment.setId(202L);

        cancelledAppointment = new Appointment(
                pet, owner, vet,
                LocalDate.now().plusDays(2), "02:00 PM",
                "CANCELLED", "Cancelled appointment"
        );
        cancelledAppointment.setId(203L);
    }

    @Test
    @DisplayName("Offline veterinarian cannot start a live consultation (fails with offline error)")
    void testStartConsultation_WhenVetIsOffline_ThrowsIllegalStateException() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(201L)).thenReturn(Optional.of(confirmedAppointment));
        when(userPresenceService.isUserOnline(vet.getId(), vet.getEmail())).thenReturn(false);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                appointmentService.startConsultation(201L, vet.getEmail())
        );

        assertTrue(exception.getMessage().contains("currently offline"),
                "Exception message should clearly indicate that the veterinarian is offline");
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Online veterinarian attempting real-time consultation receives unsupported operation error")
    void testStartConsultation_WhenVetIsOnline_ThrowsUnsupportedOperationException() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(201L)).thenReturn(Optional.of(confirmedAppointment));
        when(userPresenceService.isUserOnline(vet.getId(), vet.getEmail())).thenReturn(true);

        UnsupportedOperationException exception = assertThrows(UnsupportedOperationException.class, () ->
                appointmentService.startConsultation(201L, vet.getEmail())
        );

        assertTrue(exception.getMessage().contains("future enhancement") || exception.getMessage().contains("not supported"),
                "Exception message must clarify that real-time video/audio consultation is an unsupported future enhancement");
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Unauthorized veterinarian cannot access another doctor's appointment")
    void testStartConsultation_UnauthorizedVeterinarian_ThrowsAccessDeniedException() {
        when(userRepository.findByEmail(unauthorizedVet.getEmail())).thenReturn(Optional.of(unauthorizedVet));
        when(appointmentRepository.findById(201L)).thenReturn(Optional.of(confirmedAppointment));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () ->
                appointmentService.startConsultation(201L, unauthorizedVet.getEmail())
        );

        assertTrue(exception.getMessage().contains("not assigned to you"),
                "Should deny access when veterinarian does not own the appointment");
        verify(userPresenceService, never()).isUserOnline(any(), any());
    }

    @Test
    @DisplayName("Cannot start consultation for an already COMPLETED appointment")
    void testStartConsultation_WhenAlreadyCompleted_ThrowsIllegalStateException() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(202L)).thenReturn(Optional.of(completedAppointment));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                appointmentService.startConsultation(202L, vet.getEmail())
        );

        assertTrue(exception.getMessage().contains("Only CONFIRMED or UPCOMING appointments can enter consultation"),
                "Should forbid transitioning COMPLETED appointment into consultation");
    }

    @Test
    @DisplayName("Cannot start consultation for a CANCELLED appointment")
    void testStartConsultation_WhenCancelled_ThrowsIllegalStateException() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(203L)).thenReturn(Optional.of(cancelledAppointment));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                appointmentService.startConsultation(203L, vet.getEmail())
        );

        assertTrue(exception.getMessage().contains("Only CONFIRMED or UPCOMING appointments can enter consultation"),
                "Should forbid transitioning CANCELLED appointment into consultation");
    }

    @Test
    @DisplayName("Offline veterinarian can manage confirmed appointments: list, review, and reschedule")
    void testOfflineVeterinarian_ConfirmedAppointmentRemainsManageable() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findByVeterinarian(vet)).thenReturn(List.of(confirmedAppointment));

        List<AppointmentDTO> list = appointmentService.getAppointmentsByVeterinarian(vet.getEmail());
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("CONFIRMED", list.get(0).status());
        assertEquals("Bella", list.get(0).petName());

        // Appointment is NOT cancelled or rejected because doctor is offline
        assertEquals("CONFIRMED", confirmedAppointment.getStatus());
    }

    @Test
    @DisplayName("Offline veterinarian can reschedule confirmed appointment")
    void testOfflineVeterinarian_RescheduleAppointment_Success() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(201L)).thenReturn(Optional.of(confirmedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDate newDate = LocalDate.now().plusDays(3);
        String newTime = "03:30 PM";
        String reason = "Emergency clinic procedure at scheduled slot";

        AppointmentDTO result = appointmentService.rescheduleAppointment(201L, newDate, newTime, reason, vet.getEmail());

        assertNotNull(result);
        assertEquals("CONFIRMED", result.status());
        assertEquals(newDate, confirmedAppointment.getAppointmentDate());
        assertEquals(newTime, confirmedAppointment.getAppointmentTime());
        assertTrue(confirmedAppointment.getNotes().contains("[Rescheduled]"));
        verify(notificationService).createNotification(eq(owner), any(), any(), eq("APPOINTMENT"));
    }

    @Test
    @DisplayName("Complete consultation directly persists medical record, e-prescriptions, and marks COMPLETED")
    void testCompleteConsultation_Success() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(201L)).thenReturn(Optional.of(confirmedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(petRepository.save(any(Pet.class))).thenAnswer(inv -> inv.getArgument(0));

        ConsultationSubmissionDTO dto = new ConsultationSubmissionDTO(
                "Ear redness and persistent scratching",
                "Under Treatment",
                25.2,
                "Otitis Externa (Bilateral)",
                "Gentle cleaning of external ear canal, topical otic drops prescribed",
                "Otomax Otic Ointment",
                "Cytology swab examination confirmed yeast",
                "Keep ear dry during baths",
                true,
                LocalDate.now().plusDays(10),
                "Check ear canal response",
                List.of(
                        new ConsultationSubmissionDTO.PrescriptionItemDTO(
                                "Otomax Otic Suspension",
                                "4 drops",
                                "Twice daily",
                                "7 days",
                                "Clean ear canal prior to administration"
                        )
                )
        );

        AppointmentDTO result = appointmentService.completeConsultation(201L, dto, vet.getEmail());

        assertNotNull(result);
        assertEquals("COMPLETED", result.status());
        assertEquals("COMPLETED", confirmedAppointment.getStatus());
        assertEquals(25.2, pet.getWeight());

        verify(petMedicalRecordRepository, times(1)).save(any(PetMedicalRecord.class));
        verify(prescriptionRepository, times(1)).save(any(Prescription.class));
        verify(notificationService).createNotification(eq(owner), any(), any(), eq("APPOINTMENT"));
    }

    @Test
    @DisplayName("Cannot complete consultation for an appointment that is already COMPLETED")
    void testCompleteConsultation_WhenAlreadyCompleted_ThrowsIllegalStateException() {
        when(userRepository.findByEmail(vet.getEmail())).thenReturn(Optional.of(vet));
        when(appointmentRepository.findById(202L)).thenReturn(Optional.of(completedAppointment));

        ConsultationSubmissionDTO dto = new ConsultationSubmissionDTO(
                "None", "Healthy", 24.5, "Normal check", "None", null, null, null, false, null, null, Collections.emptyList()
        );

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                appointmentService.completeConsultation(202L, dto, vet.getEmail())
        );

        assertTrue(exception.getMessage().contains("already COMPLETED"));
        verify(petMedicalRecordRepository, never()).save(any());
    }
}
