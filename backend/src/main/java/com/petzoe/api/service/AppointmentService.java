package com.petzoe.api.service;

import com.petzoe.api.dto.AppointmentDTO;
import com.petzoe.api.entity.Appointment;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AppointmentRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AppointmentService(AppointmentRepository appointmentRepository, PetRepository petRepository,
                               UserRepository userRepository, NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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
        
        if (!"Veterinarian".equals(veterinarian.getRole())) {
            throw new SecurityException("Unauthorized: User is not a veterinarian.");
        }

        return appointmentRepository.findByVeterinarian(veterinarian).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO updateAppointmentStatus(Long id, String status, String notes, String email) {
        User veterinarian = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        if (!appointment.getVeterinarian().getId().equals(veterinarian.getId())) {
            throw new SecurityException("Unauthorized: You are not the veterinarian for this appointment.");
        }

        if (status != null && !status.isEmpty()) {
            appointment.setStatus(status);
        }
        
        if (notes != null) {
            // Append notes if they exist, or set them
            if (appointment.getNotes() == null || appointment.getNotes().isEmpty()) {
                appointment.setNotes(notes);
            } else {
                appointment.setNotes(appointment.getNotes() + "\n[Vet Notes]: " + notes);
            }
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Notify owner if completed
        if ("COMPLETED".equals(status)) {
             notificationService.createNotification(appointment.getOwner(),
                     "Appointment Completed ✅",
                     "Your appointment for " + appointment.getPet().getName() + " with Dr. " + veterinarian.getName() + " is completed. Check the notes in your dashboard.",
                     "APPOINTMENT");
        } else if ("CANCELLED".equals(status)) {
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
            throw new SecurityException("Unauthorized: You do not own this pet.");
        }

        User veterinarian = userRepository.findById(dto.veterinarianId())
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found with ID: " + dto.veterinarianId()));

        if (!"Veterinarian".equals(veterinarian.getRole())) {
            throw new IllegalArgumentException("Selected user is not a veterinarian.");
        }

        Appointment appointment = new Appointment(
                pet, owner, veterinarian,
                dto.appointmentDate(), dto.appointmentTime(),
                "UPCOMING", dto.notes()
        );

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send appointment confirmation notification
        notificationService.createNotification(owner,
                "Appointment Confirmed 📅",
                "Your appointment for " + pet.getName() + " with Dr. " + veterinarian.getName() +
                        " on " + dto.appointmentDate() + " at " + dto.appointmentTime() + " is confirmed.",
                "APPOINTMENT");

        return convertToDTO(savedAppointment);
    }

    public AppointmentDTO cancelAppointment(Long id, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        if (!appointment.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You cannot cancel this appointment.");
        }

        appointment.setStatus("CANCELLED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Send cancellation notification
        notificationService.createNotification(owner,
                "Appointment Cancelled",
                "Your appointment for " + appointment.getPet().getName() +
                        " with Dr. " + appointment.getVeterinarian().getName() + " has been cancelled.",
                "APPOINTMENT");

        return convertToDTO(updatedAppointment);
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
