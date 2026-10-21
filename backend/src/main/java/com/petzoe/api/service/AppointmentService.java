package com.petzoe.api.service;

import com.petzoe.api.dto.AppointmentDTO;
import com.petzoe.api.dto.AppointmentPaymentInitDTO;
import com.petzoe.api.dto.AppointmentPaymentVerifyDTO;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import java.math.BigDecimal;
import com.petzoe.api.dto.ConsultationSubmissionDTO;
import com.petzoe.api.dto.DoctorDayScheduleDTO;
import com.petzoe.api.dto.SlotAvailabilityDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PetMedicalRecordRepository petMedicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);

    private final VeterinarianProfileRepository veterinarianProfileRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${petzoe.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${petzoe.razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${petzoe.razorpay.mode:auto}")
    private String razorpayMode;

    @Value("${petzoe.razorpay.currency:INR}")
    private String currency;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PetRepository petRepository,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              PetMedicalRecordRepository petMedicalRecordRepository,
                              PrescriptionRepository prescriptionRepository,
                              VeterinarianProfileRepository veterinarianProfileRepository,
                              PaymentRepository paymentRepository,
                              RazorpayClient razorpayClient) {
        this.paymentRepository = paymentRepository;
        this.razorpayClient = razorpayClient;
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.petMedicalRecordRepository = petMedicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.veterinarianProfileRepository = veterinarianProfileRepository;
    }

    public List<AppointmentDTO> getAppointmentsByOwner(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return appointmentRepository.findByOwner(owner).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByVeterinarian(String email) {
        User veterinarian = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (!"Veterinarian".equalsIgnoreCase(veterinarian.getRole())) {
            throw new AccessDeniedException("Unauthorized: User is not a veterinarian.");
        }

        return appointmentRepository.findByVeterinarian(veterinarian).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDTO acceptAppointment(Long id, String vetEmail) {
        User vet = getVet(vetEmail);
        Appointment appointment = getAppointmentForVet(id, vet);

        if (!"PENDING".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalStateException("Only PENDING appointments can be accepted.");
        }

        appointment.setStatus("CONFIRMED");
        Appointment saved = appointmentRepository.save(appointment);

        // Notify Pet Owner
        notificationService.createNotification(
                appointment.getOwner(),
                "Appointment Confirmed 📅",
                "Dr. " + vet.getName() + " confirmed your appointment for " + appointment.getPet().getName() +
                        " on " + appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime() + ".",
                "APPOINTMENT"
        );

        return convertToDTO(saved);
    }

    @Transactional
    public AppointmentDTO rejectAppointment(Long id, String reason, String vetEmail) {
        User vet = getVet(vetEmail);
        Appointment appointment = getAppointmentForVet(id, vet);

        if (!"PENDING".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalStateException("Only PENDING appointments can be rejected.");
        }

        appointment.setStatus("REJECTED");
        if (reason != null && !reason.isBlank()) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "[Rejection Reason]: " + reason);
        }
        Appointment saved = appointmentRepository.save(appointment);

        // Notify Pet Owner
        notificationService.createNotification(
                appointment.getOwner(),
                "Appointment Declined ❌",
                "Your appointment request for " + appointment.getPet().getName() + " was declined by Dr. " + vet.getName() +
                        (reason != null ? ". Reason: " + reason : "."),
                "APPOINTMENT",
                reason,
                appointment.getId()
        );

        return convertToDTO(saved);
    }

    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, LocalDate newDate, String newTime, String reason, String actorEmail) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + actorEmail));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        boolean isVet = appointment.getVeterinarian().getId().equals(actor.getId());
        boolean isOwner = appointment.getOwner().getId().equals(actor.getId());

        if (!isVet && !isOwner && !actor.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("Unauthorized to reschedule this appointment.");
        }

        if (newDate != null) {
            appointment.setAppointmentDate(newDate);
        }
        if (newTime != null && !newTime.isBlank()) {
            appointment.setAppointmentTime(newTime);
        }
        appointment.setStatus("CONFIRMED");

        if (reason != null && !reason.isBlank()) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "[Rescheduled]: " + reason);
        }

        Appointment saved = appointmentRepository.save(appointment);

        // Notify the other party
        User recipient = isVet ? appointment.getOwner() : appointment.getVeterinarian();
        notificationService.createNotification(
                recipient,
                "Appointment Rescheduled 📅",
                "Appointment for " + appointment.getPet().getName() + " has been rescheduled to " +
                        appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime() + ".",
                "APPOINTMENT"
        );

        return convertToDTO(saved);
    }

    @Transactional
    public AppointmentDTO startConsultation(Long id, String vetEmail) {
        User vet = getVet(vetEmail);
        Appointment appointment = getAppointmentForVet(id, vet);

        appointment.setStatus("IN_CONSULTATION");
        return convertToDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDTO completeConsultation(Long id, ConsultationSubmissionDTO dto, String vetEmail) {
        User vet = getVet(vetEmail);
        Appointment appointment = getAppointmentForVet(id, vet);
        Pet pet = appointment.getPet();

        // 1. Create and persist structured medical record
        PetMedicalRecord record = new PetMedicalRecord();
        record.setPet(pet);
        record.setVeterinarian(vet);
        record.setAppointment(appointment);
        record.setExaminationDate(LocalDate.now());
        record.setWeightKg(dto.weightKg());
        record.setHealthStatus(dto.healthStatus() != null && !dto.healthStatus().isBlank() ? dto.healthStatus() : "Completed");
        record.setSymptoms(dto.symptoms());
        record.setDiagnosis(dto.diagnosis());
        record.setTreatment(dto.treatment());
        record.setMedication(dto.medication());
        record.setLabInvestigations(dto.labInvestigations());
        record.setVeterinaryNotes(dto.veterinaryNotes());
        record.setFollowUpRequired(dto.followUpRequired());
        record.setFollowUpDate(dto.followUpDate());
        record.setFollowUpNotes(dto.followUpNotes());
        petMedicalRecordRepository.save(record);

        // 2. Persist prescriptions if provided
        if (dto.prescriptions() != null && !dto.prescriptions().isEmpty()) {
            for (ConsultationSubmissionDTO.PrescriptionItemDTO pItem : dto.prescriptions()) {
                if (pItem.medicineName() != null && !pItem.medicineName().isBlank()) {
                    Prescription p = new Prescription();
                    p.setAppointment(appointment);
                    p.setPet(pet);
                    p.setVeterinarian(vet);
                    p.setMedicineName(pItem.medicineName());
                    p.setDosage(pItem.dosage() != null ? pItem.dosage() : "");
                    p.setFrequency(pItem.frequency() != null ? pItem.frequency() : "");
                    p.setDuration(pItem.duration() != null ? pItem.duration() : "");
                    p.setInstructions(pItem.instructions() != null ? pItem.instructions() : "");
                    prescriptionRepository.save(p);
                }
            }
        }

        // 3. Update pet weight if provided
        if (dto.weightKg() != null && dto.weightKg() > 0) {
            pet.setWeight(dto.weightKg());
            petRepository.save(pet);
        }

        // 4. Update appointment status to COMPLETED
        appointment.setStatus("COMPLETED");
        if (dto.veterinaryNotes() != null && !dto.veterinaryNotes().isBlank()) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "[Consultation Summary]: " + dto.diagnosis());
        }
        Appointment saved = appointmentRepository.save(appointment);

        // 5. Notify Pet Owner
        notificationService.createNotification(
                appointment.getOwner(),
                "Consultation Completed ✅",
                "Dr. " + vet.getName() + " has completed the consultation for " + pet.getName() +
                        ". Prescriptions and clinical records are now available in your dashboard.",
                "APPOINTMENT"
        );

        return convertToDTO(saved);
    }

    public AppointmentDTO updateAppointmentStatus(Long id, String status, String notes, String email) {
        User veterinarian = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        if (!appointment.getVeterinarian().getId().equals(veterinarian.getId())) {
            throw new AccessDeniedException("Unauthorized: You are not the veterinarian for this appointment.");
        }

        String currentStatus = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "PENDING";
        if ("COMPLETED".equals(currentStatus) || "CANCELLED".equals(currentStatus) || "REJECTED".equals(currentStatus)) {
            throw new IllegalStateException("Cannot change the status of an appointment that is already " + currentStatus + ".");
        }

        if (status != null && !status.isEmpty()) {
            String newStatus = status.toUpperCase();
            boolean validTransition = false;
            if ("PENDING".equals(currentStatus)) {
                validTransition = List.of("CONFIRMED", "REJECTED", "CANCELLED").contains(newStatus);
            } else if ("CONFIRMED".equals(currentStatus) || "UPCOMING".equals(currentStatus)) {
                validTransition = List.of("IN_CONSULTATION", "COMPLETED", "CANCELLED").contains(newStatus);
            } else if ("IN_CONSULTATION".equals(currentStatus)) {
                validTransition = List.of("COMPLETED", "CANCELLED").contains(newStatus);
            }
            if (!validTransition) {
                throw new IllegalStateException("Invalid status transition from " + currentStatus + " to " + newStatus + ".");
            }
            appointment.setStatus(newStatus);
        }

        if (notes != null) {
            if (appointment.getNotes() == null || appointment.getNotes().isEmpty()) {
                appointment.setNotes(notes);
            } else {
                appointment.setNotes(appointment.getNotes() + "\n[Vet Notes]: " + notes);
            }
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Notify owner if completed or cancelled
        if ("COMPLETED".equalsIgnoreCase(status)) {
            notificationService.createNotification(appointment.getOwner(),
                    "Appointment Completed ✅",
                    "Your appointment for " + appointment.getPet().getName() + " with Dr. " + veterinarian.getName() + " is completed. Check the notes in your dashboard.",
                    "APPOINTMENT");
        } else if ("CANCELLED".equalsIgnoreCase(status)) {
            notificationService.createNotification(appointment.getOwner(),
                    "Appointment Cancelled ❌",
                    "Your appointment for " + appointment.getPet().getName() + " with Dr. " + veterinarian.getName() + " was cancelled by the veterinarian.",
                    "APPOINTMENT");
        }

        return convertToDTO(updatedAppointment);
    }

    public static final List<String> ALL_TIME_SLOTS = List.of(
            "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
            "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
            "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    );

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private LocalTime parseSlotTime(String slotStr) {
        if (slotStr == null || slotStr.isBlank()) return null;
        try {
            return LocalTime.parse(slotStr.trim(), TIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    public DoctorDayScheduleDTO getDoctorSlotAvailability(Long veterinarianId, LocalDate date) {
        User vet = userRepository.findById(veterinarianId)
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found with ID: " + veterinarianId));

        if (!"Veterinarian".equalsIgnoreCase(vet.getRole())) {
            throw new IllegalArgumentException("User is not a veterinarian.");
        }

        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(vet.getId()).orElse(null);
        String workingDaysStr = profile != null ? profile.getWorkingDays() : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";
        String workStartTime = profile != null ? profile.getWorkStartTime() : "09:00 AM";
        String workEndTime = profile != null ? profile.getWorkEndTime() : "05:00 PM";
        String workingHours = workStartTime + " - " + workEndTime;

        List<String> workingDaysList = java.util.Arrays.stream(workingDaysStr.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        String dayOfWeek = date.getDayOfWeek().name();
        boolean isWorkingDay = workingDaysList.contains(dayOfWeek);

        if (!isWorkingDay) {
            List<SlotAvailabilityDTO> offDutySlots = ALL_TIME_SLOTS.stream()
                    .map(slot -> new SlotAvailabilityDTO(slot, "OFF_DUTY", false))
                    .collect(Collectors.toList());
            return new DoctorDayScheduleDTO(
                    vet.getId(),
                    vet.getName(),
                    date,
                    false,
                    dayOfWeek,
                    workingHours,
                    "Dr. " + vet.getName() + " does not hold clinic hours on " + dayOfWeek + "s. Please select another date.",
                    offDutySlots
            );
        }

        List<Appointment> bookedAppts = appointmentRepository.findByVeterinarianIdAndAppointmentDateAndStatusIn(
                vet.getId(),
                date,
                List.of("PENDING", "CONFIRMED", "UPCOMING", "IN_CONSULTATION")
        );

        java.util.Set<String> bookedTimes = bookedAppts.stream()
                .map(Appointment::getAppointmentTime)
                .map(String::trim)
                .collect(Collectors.toSet());

        boolean isToday = date.equals(LocalDate.now());
        LocalTime nowTime = LocalTime.now();

        List<SlotAvailabilityDTO> slots = ALL_TIME_SLOTS.stream()
                .map(slot -> {
                    if (bookedTimes.contains(slot)) {
                        return new SlotAvailabilityDTO(slot, "BOOKED", false);
                    }
                    if (isToday) {
                        LocalTime slotTime = parseSlotTime(slot);
                        if (slotTime != null && slotTime.isBefore(nowTime)) {
                            return new SlotAvailabilityDTO(slot, "EXPIRED", false);
                        }
                    }
                    return new SlotAvailabilityDTO(slot, "AVAILABLE", true);
                })
                .collect(Collectors.toList());

        return new DoctorDayScheduleDTO(
                vet.getId(),
                vet.getName(),
                date,
                true,
                dayOfWeek,
                workingHours,
                "Consultation hours available",
                slots
        );
    }

    public AppointmentDTO bookAppointment(AppointmentDTO dto, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (dto.appointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date is required.");
        }
        LocalDate today = LocalDate.now();
        if (dto.appointmentDate().isBefore(today)) {
            throw new IllegalArgumentException("Cannot book an appointment in the past.");
        }
        if (dto.appointmentTime() == null || dto.appointmentTime().isBlank()) {
            throw new IllegalArgumentException("Time slot is required.");
        }

        // Validate that time slot has not passed if booking for today
        if (dto.appointmentDate().equals(today)) {
            LocalTime slotTime = parseSlotTime(dto.appointmentTime());
            if (slotTime != null && slotTime.isBefore(LocalTime.now())) {
                throw new IllegalArgumentException("The selected time slot (" + dto.appointmentTime() + ") has already passed today. Please select an upcoming slot.");
            }
        }

        Pet pet = petRepository.findById(dto.petId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + dto.petId()));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("Unauthorized: You do not own this pet.");
        }

        User veterinarian = userRepository.findById(dto.veterinarianId())
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found with ID: " + dto.veterinarianId()));

        if (!"Veterinarian".equalsIgnoreCase(veterinarian.getRole())) {
            throw new IllegalArgumentException("Selected user is not a veterinarian.");
        }

        if (!veterinarian.isEnabled() || veterinarian.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new IllegalStateException("Dr. " + veterinarian.getName() + " is currently unavailable or pending verification.");
        }

        // Validate doctor working day
        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(veterinarian.getId()).orElse(null);
        String workingDaysStr = profile != null ? profile.getWorkingDays() : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";
        List<String> workingDaysList = java.util.Arrays.stream(workingDaysStr.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .toList();

        if (!workingDaysList.contains(dto.appointmentDate().getDayOfWeek().name())) {
            throw new IllegalStateException("Dr. " + veterinarian.getName() + " does not hold clinic hours on " + dto.appointmentDate().getDayOfWeek() + "s. Please select an available consultation date.");
        }

        // Validate double-booking collision
        boolean isSlotTaken = appointmentRepository.existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                veterinarian.getId(),
                dto.appointmentDate(),
                dto.appointmentTime().trim(),
                List.of("PENDING", "CONFIRMED", "UPCOMING", "IN_CONSULTATION")
        );
        if (isSlotTaken) {
            throw new IllegalStateException("The selected time slot (" + dto.appointmentTime() + ") on " + dto.appointmentDate() + " is already booked for Dr. " + veterinarian.getName() + ". Please select another slot.");
        }

        // Default new bookings to PENDING (or preserve status if supplied and valid)
        String initialStatus = "PENDING";
        if (dto.status() != null && (dto.status().equalsIgnoreCase("UPCOMING") || dto.status().equalsIgnoreCase("CONFIRMED"))) {
            initialStatus = dto.status().toUpperCase();
        }

        Appointment appointment = new Appointment(
                pet, owner, veterinarian,
                dto.appointmentDate(), dto.appointmentTime().trim(),
                initialStatus, dto.notes()
        );

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 1. Notify Owner
        notificationService.createNotification(owner,
                "Appointment Requested 📅",
                "Your appointment for " + pet.getName() + " with Dr. " + veterinarian.getName() +
                        " on " + dto.appointmentDate() + " at " + dto.appointmentTime() + " is submitted for review.",
                "APPOINTMENT");

        // 2. Notify Veterinarian
        notificationService.createNotification(veterinarian,
                "New Appointment Request 📅",
                owner.getName() + " requested a consultation for " + pet.getName() +
                        " on " + dto.appointmentDate() + " at " + dto.appointmentTime() + ".",
                "APPOINTMENT");

        return convertToDTO(savedAppointment);
    }

    public AppointmentDTO cancelAppointment(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        boolean isOwner = appointment.getOwner().getId().equals(user.getId());
        boolean isVet = appointment.getVeterinarian().getId().equals(user.getId());

        if (!isOwner && !isVet && !user.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("Unauthorized: You cannot cancel this appointment.");
        }

        if ("COMPLETED".equalsIgnoreCase(appointment.getStatus()) ||
            "CANCELLED".equalsIgnoreCase(appointment.getStatus()) ||
            "REJECTED".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalStateException("Cannot cancel an appointment that is already " + appointment.getStatus() + ".");
        }

        appointment.setStatus("CANCELLED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Notify both parties appropriately
        if (isOwner) {
            notificationService.createNotification(appointment.getOwner(),
                    "Appointment Cancelled",
                    "Your appointment for " + appointment.getPet().getName() +
                            " with Dr. " + appointment.getVeterinarian().getName() + " has been cancelled.",
                    "APPOINTMENT");

            notificationService.createNotification(appointment.getVeterinarian(),
                    "Appointment Cancelled by Owner ❌",
                    appointment.getOwner().getName() + " cancelled the appointment for " +
                            appointment.getPet().getName() + " on " + appointment.getAppointmentDate() + ".",
                    "APPOINTMENT");
        } else {
            notificationService.createNotification(appointment.getOwner(),
                    "Appointment Cancelled by Veterinarian ❌",
                    "Dr. " + appointment.getVeterinarian().getName() + " cancelled the appointment for " +
                            appointment.getPet().getName() + ".",
                    "APPOINTMENT");
        }

        return convertToDTO(updatedAppointment);
    }

    private User getVet(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        if (!"Veterinarian".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Unauthorized: User is not a veterinarian.");
        }
        return user;
    }

    private Appointment getAppointmentForVet(Long id, User vet) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));
        if (!appointment.getVeterinarian().getId().equals(vet.getId()) && !vet.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("Unauthorized: This appointment is not assigned to you.");
        }
        return appointment;
    }

    private AppointmentDTO convertToDTO(Appointment appt) {
        return new AppointmentDTO(
                appt.getId(),
                appt.getPet().getId(),
                appt.getPet().getPetCode(),
                appt.getPet().getName(),
                appt.getOwner().getId(),
                appt.getOwner().getName(),
                appt.getVeterinarian().getId(),
                appt.getVeterinarian().getName(),
                appt.getAppointmentDate(),
                appt.getAppointmentTime(),
                appt.getStatus(),
                appt.getNotes(),
                appt.getFee() != null ? appt.getFee() : 10.0,
                appt.getPaymentStatus() != null ? appt.getPaymentStatus() : "PAID",
                appt.getRazorpayPaymentId()
        );
    }

    @Transactional
    public AppointmentPaymentInitDTO initiateAppointmentPayment(AppointmentDTO dto, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (dto.appointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date is required.");
        }
        LocalDate today = LocalDate.now();
        if (dto.appointmentDate().isBefore(today)) {
            throw new IllegalArgumentException("Cannot book an appointment in the past.");
        }
        if (dto.appointmentTime() == null || dto.appointmentTime().isBlank()) {
            throw new IllegalArgumentException("Time slot is required.");
        }

        if (dto.appointmentDate().equals(today)) {
            LocalTime slotTime = parseSlotTime(dto.appointmentTime());
            if (slotTime != null && slotTime.isBefore(LocalTime.now())) {
                throw new IllegalArgumentException("The selected time slot (" + dto.appointmentTime() + ") has already passed today. Please select an upcoming slot.");
            }
        }

        Pet pet = petRepository.findById(dto.petId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + dto.petId()));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("Unauthorized: You do not own this pet.");
        }

        User veterinarian = userRepository.findById(dto.veterinarianId())
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found with ID: " + dto.veterinarianId()));

        if (!"Veterinarian".equalsIgnoreCase(veterinarian.getRole())) {
            throw new IllegalArgumentException("Selected user is not a veterinarian.");
        }

        if (!veterinarian.isEnabled() || veterinarian.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new IllegalStateException("Dr. " + veterinarian.getName() + " is currently unavailable or pending verification.");
        }

        VeterinarianProfile profile = veterinarianProfileRepository.findByUserId(veterinarian.getId()).orElse(null);
        String workingDaysStr = profile != null ? profile.getWorkingDays() : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";
        List<String> workingDaysList = java.util.Arrays.stream(workingDaysStr.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .toList();

        if (!workingDaysList.contains(dto.appointmentDate().getDayOfWeek().name())) {
            throw new IllegalStateException("Dr. " + veterinarian.getName() + " does not hold clinic hours on " + dto.appointmentDate().getDayOfWeek() + "s. Please select an available consultation date.");
        }

        boolean isSlotTaken = appointmentRepository.existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                veterinarian.getId(),
                dto.appointmentDate(),
                dto.appointmentTime().trim(),
                List.of("PENDING", "CONFIRMED", "UPCOMING", "IN_CONSULTATION")
        );
        if (isSlotTaken) {
            throw new IllegalStateException("The selected time slot (" + dto.appointmentTime() + ") on " + dto.appointmentDate() + " is already booked for Dr. " + veterinarian.getName() + ". Please select another slot.");
        }

        Appointment appointment = new Appointment(
                pet, owner, veterinarian,
                dto.appointmentDate(), dto.appointmentTime().trim(),
                "PENDING_PAYMENT", dto.notes(), 10.0, "PENDING"
        );
        Appointment savedAppt = appointmentRepository.save(appointment);

        String razorpayOrderId;
        boolean isPlaceholderKey = razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeyId.contains("placeholder")
                || razorpayKeySecret == null || razorpayKeySecret.contains("placeholder");

        if ("mock".equalsIgnoreCase(razorpayMode) || (("auto".equalsIgnoreCase(razorpayMode) || razorpayMode == null) && isPlaceholderKey)) {
            razorpayOrderId = "order_mock_appt_" + savedAppt.getId() + "_" + System.currentTimeMillis();
            log.info("Using simulated Razorpay Order ID {} for consultation appointment {}", razorpayOrderId, savedAppt.getId());
        } else {
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", 1000L); // 1000 paise = ₹10.00
                orderRequest.put("currency", currency != null ? currency : "INR");
                orderRequest.put("receipt", "appt_rcpt_" + savedAppt.getId() + "_" + System.currentTimeMillis());
                JSONObject notes = new JSONObject();
                notes.put("appointment_id", savedAppt.getId().toString());
                notes.put("customer_email", owner.getEmail());
                notes.put("type", "CONSULTATION");
                orderRequest.put("notes", notes);

                Order rzpOrder = razorpayClient.orders.create(orderRequest);
                razorpayOrderId = rzpOrder.get("id");
                log.info("Created Razorpay Order {} for Appointment {}", razorpayOrderId, savedAppt.getId());
            } catch (RazorpayException e) {
                log.error("Failed to create Razorpay Order for appointment {}: {}", savedAppt.getId(), e.getMessage());
                if ("auto".equalsIgnoreCase(razorpayMode) || "mock".equalsIgnoreCase(razorpayMode)) {
                    razorpayOrderId = "order_mock_appt_" + savedAppt.getId() + "_" + System.currentTimeMillis();
                } else {
                    throw new RuntimeException("Payment gateway initialization failed: " + e.getMessage(), e);
                }
            }
        }

        Payment payment = new Payment();
        payment.setUser(owner);
        payment.setAppointment(savedAppt);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(BigDecimal.valueOf(10.00));
        payment.setAmountInPaise(1000L);
        payment.setCurrency(currency != null ? currency : "INR");
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentType(PaymentType.CONSULTATION);
        paymentRepository.save(payment);

        savedAppt.setRazorpayOrderId(razorpayOrderId);
        appointmentRepository.save(savedAppt);

        return new AppointmentPaymentInitDTO(
                savedAppt.getId(),
                razorpayOrderId,
                1000L,
                10.0,
                currency != null ? currency : "INR",
                razorpayKeyId,
                owner.getName(),
                owner.getEmail(),
                owner.getPhone() != null ? owner.getPhone() : "",
                veterinarian.getName(),
                pet.getName()
        );
    }

    @Transactional
    public AppointmentDTO verifyAppointmentPayment(AppointmentPaymentVerifyDTO request, String email) {
        if (request.appointmentId() == null || request.razorpayOrderId() == null) {
            throw new IllegalArgumentException("Missing required appointment payment verification parameters");
        }

        Appointment appt = appointmentRepository.findById(request.appointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + request.appointmentId()));

        if (!appt.getOwner().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("Not authorized for this appointment");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for order: " + request.razorpayOrderId()));

        boolean isValidSignature = false;
        boolean isPlaceholderKey = razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeyId.contains("placeholder")
                || razorpayKeySecret == null || razorpayKeySecret.contains("placeholder");
        boolean isMockOrder = request.razorpayOrderId().startsWith("order_mock_");
        boolean isSimulatedSig = "simulated_valid_test_signature".equals(request.razorpaySignature());

        if ((isMockOrder || "mock".equalsIgnoreCase(razorpayMode) || (("auto".equalsIgnoreCase(razorpayMode) || razorpayMode == null) && isPlaceholderKey)) && isSimulatedSig) {
            isValidSignature = true;
            log.info("Simulated signature verification passed for appointment order {}", request.razorpayOrderId());
        } else {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.razorpayOrderId());
                options.put("razorpay_payment_id", request.razorpayPaymentId());
                options.put("razorpay_signature", request.razorpaySignature());
                isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            } catch (Exception e) {
                log.error("Signature verification exception for appointment: {}", e.getMessage());
                isValidSignature = false;
            }
        }

        if (!isValidSignature) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Cryptographic signature mismatch");
            paymentRepository.save(payment);

            appt.setStatus("CANCELLED");
            appt.setPaymentStatus("FAILED");
            appointmentRepository.save(appt);

            throw new IllegalArgumentException("Invalid payment signature verification failed");
        }

        payment.setRazorpayPaymentId(request.razorpayPaymentId());
        payment.setRazorpaySignature(request.razorpaySignature());
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        appt.setStatus("CONFIRMED");
        appt.setPaymentStatus("PAID");
        appt.setRazorpayPaymentId(request.razorpayPaymentId());
        Appointment savedAppt = appointmentRepository.save(appt);

        // Notify Pet Owner
        try {
            notificationService.createNotification(
                    appt.getOwner(),
                    "Consultation Confirmed 📅",
                    "Payment of ₹10 was successful! Your consultation with Dr. " + appt.getVeterinarian().getName() +
                            " for " + appt.getPet().getName() + " on " + appt.getAppointmentDate() + " at " +
                            appt.getAppointmentTime() + " is confirmed.",
                    "APPOINTMENT"
            );
        } catch (Exception notifEx) {
            log.warn("Failed to notify owner: {}", notifEx.getMessage());
        }

        // Notify Veterinarian
        try {
            notificationService.createNotification(
                    appt.getVeterinarian(),
                    "New Paid Consultation Booked 🩺",
                    appt.getOwner().getName() + " has booked and paid ₹10 for " + appt.getPet().getName() +
                            " on " + appt.getAppointmentDate() + " at " + appt.getAppointmentTime() + ".",
                    "APPOINTMENT"
            );
        } catch (Exception notifEx) {
            log.warn("Failed to notify veterinarian: {}", notifEx.getMessage());
        }

        return convertToDTO(savedAppt);
    }

}