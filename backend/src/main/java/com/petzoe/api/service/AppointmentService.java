package com.petzoe.api.service;

import com.petzoe.api.dto.AppointmentDTO;
import com.petzoe.api.dto.ConsultationSubmissionDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PetRepository petRepository,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              PetMedicalRecordRepository petMedicalRecordRepository,
                              PrescriptionRepository prescriptionRepository) {
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.petMedicalRecordRepository = petMedicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
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

        if (status != null && !status.isEmpty()) {
            appointment.setStatus(status);
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

    public AppointmentDTO bookAppointment(AppointmentDTO dto, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

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

        // Default new bookings to PENDING (or preserve status if supplied and valid)
        String initialStatus = "PENDING";
        if (dto.status() != null && (dto.status().equalsIgnoreCase("UPCOMING") || dto.status().equalsIgnoreCase("CONFIRMED"))) {
            initialStatus = dto.status().toUpperCase();
        }

        Appointment appointment = new Appointment(
                pet, owner, veterinarian,
                dto.appointmentDate(), dto.appointmentTime(),
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
                appt.getPet().getName(),
                appt.getOwner().getId(),
                appt.getOwner().getName(),
                appt.getVeterinarian().getId(),
                appt.getVeterinarian().getName(),
                appt.getAppointmentDate(),
                appt.getAppointmentTime(),
                appt.getStatus(),
                appt.getNotes()
        );
    }
}
