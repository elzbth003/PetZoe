package com.petzoe.api.repository;

import com.petzoe.api.entity.Appointment;
import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByOwner(User owner);
    List<Appointment> findByVeterinarian(User veterinarian);
}
