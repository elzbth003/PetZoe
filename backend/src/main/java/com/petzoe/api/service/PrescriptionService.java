package com.petzoe.api.service;

import com.petzoe.api.dto.PrescriptionDTO;
import com.petzoe.api.entity.Appointment;
import com.petzoe.api.entity.Prescription;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AppointmentRepository;
import com.petzoe.api.repository.PrescriptionRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               AppointmentRepository appointmentRepository,
                               UserRepository userRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto, String vetEmail) {
        User vet = userRepository.findByEmail(vetEmail)
                .orElseThrow(() -> new IllegalArgumentException("Veterinarian not found"));

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getVeterinarian().getId().equals(vet.getId())) {
            throw new AccessDeniedException("You are not authorized to issue a prescription for this appointment");
        }

        Prescription prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setPet(appointment.getPet());
        prescription.setVeterinarian(vet);
        prescription.setMedicineName(dto.getMedicineName());
        prescription.setDosage(dto.getDosage());
        prescription.setFrequency(dto.getFrequency());
        prescription.setDuration(dto.getDuration());
        prescription.setInstructions(dto.getInstructions());

        Prescription saved = prescriptionRepository.save(prescription);
        return mapToDTO(saved);
    }

    public List<PrescriptionDTO> getPrescriptionsByPet(Long petId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<Prescription> prescriptions = prescriptionRepository.findByPetIdOrderByCreatedAtDesc(petId);
        
        // Authorization check: User must be either the pet owner or a vet who has an appointment with the pet
        if (!prescriptions.isEmpty()) {
            boolean isOwner = prescriptions.get(0).getPet().getOwner().getId().equals(user.getId());
            boolean isVetWithAccess = appointmentRepository.findByPetId(petId).stream()
                    .anyMatch(app -> app.getVeterinarian().getId().equals(user.getId()));
            
            if (!isOwner && !isVetWithAccess && !user.getRole().equalsIgnoreCase("ADMIN")) {
                throw new AccessDeniedException("You are not authorized to view prescriptions for this pet");
            }
        }
        
        return prescriptions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getPrescriptionsByAppointment(Long appointmentId, String userEmail) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
                
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        if (!appointment.getOwner().getId().equals(user.getId()) &&
            !appointment.getVeterinarian().getId().equals(user.getId()) &&
            !user.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("You are not authorized to view prescriptions for this appointment");
        }
        
        return prescriptionRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private PrescriptionDTO mapToDTO(Prescription prescription) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(prescription.getId());
        dto.setAppointmentId(prescription.getAppointment().getId());
        dto.setPetId(prescription.getPet().getId());
        dto.setVeterinarianId(prescription.getVeterinarian().getId());
        dto.setVeterinarianName(prescription.getVeterinarian().getName());
        dto.setMedicineName(prescription.getMedicineName());
        dto.setDosage(prescription.getDosage());
        dto.setFrequency(prescription.getFrequency());
        dto.setDuration(prescription.getDuration());
        dto.setInstructions(prescription.getInstructions());
        dto.setCreatedAt(prescription.getCreatedAt());
        return dto;
    }
}
