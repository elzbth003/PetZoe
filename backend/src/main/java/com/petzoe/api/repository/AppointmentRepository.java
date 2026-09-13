package com.petzoe.api.repository;

import com.petzoe.api.entity.Appointment;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByOwner(User owner);
    List<Appointment> findByVeterinarian(User veterinarian);
    List<Appointment> findByVeterinarianOrderByAppointmentDateAsc(User veterinarian);
    List<Appointment> findByPetId(Long petId);
    List<Appointment> findByPetIdAndVeterinarianId(Long petId, Long veterinarianId);
    boolean existsByPetIdAndVeterinarianId(Long petId, Long veterinarianId);

    List<Appointment> findByVeterinarianAndStatus(User veterinarian, String status);
    long countByVeterinarianAndStatus(User veterinarian, String status);
    long countByVeterinarianAndAppointmentDate(User veterinarian, LocalDate appointmentDate);

    @Query("SELECT COUNT(DISTINCT a.pet.id) FROM Appointment a WHERE a.veterinarian.id = :vetId")
    long countDistinctPetsByVeterinarianId(@Param("vetId") Long vetId);

    List<Appointment> findByVeterinarianIdAndAppointmentDateAndStatusIn(Long veterinarianId, LocalDate appointmentDate, List<String> statuses);

    boolean existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusIn(Long veterinarianId, LocalDate appointmentDate, String appointmentTime, List<String> statuses);
}

