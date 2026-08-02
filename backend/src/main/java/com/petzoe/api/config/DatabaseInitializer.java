package com.petzoe.api.config;

import com.petzoe.api.entity.Appointment;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.AppointmentRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository, PetRepository petRepository, AppointmentRepository appointmentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Database already seeded
        }

        // Seed Users
        User owner = new User(
                "Alex Carter",
                "owner@petverse.com",
                passwordEncoder.encode("Password123!"),
                "9876543211",
                "Pet Owner"
        );
        userRepository.save(owner);

        User vet = new User(
                "Dr. Sarah Jenkins",
                "vet@petverse.com",
                passwordEncoder.encode("Password123!"),
                "9876543210",
                "Veterinarian"
        );
        userRepository.save(vet);

        User shelterManager = new User(
                "Emma Watson",
                "shelter@petverse.com",
                passwordEncoder.encode("Password123!"),
                "9876543212",
                "Shelter Manager"
        );
        userRepository.save(shelterManager);

        User admin = new User(
                "System Administrator",
                "admin@petverse.com",
                passwordEncoder.encode("Password123!"),
                "9876543213",
                "Admin"
        );
        userRepository.save(admin);

        // Seed Pets for Alex Carter
        Pet pet1 = new Pet(
                "Milo",
                "Dog",
                "Golden Retriever",
                2,
                "Male",
                28.5,
                "Up-to-date",
                "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400",
                owner
        );
        petRepository.save(pet1);

        Pet pet2 = new Pet(
                "Luna",
                "Cat",
                "Siamese",
                1,
                "Female",
                4.2,
                "Needs Vaccination",
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
                owner
        );
        petRepository.save(pet2);

        // Seed Appointment
        Appointment appointment = new Appointment(
                pet1,
                owner,
                vet,
                LocalDate.now().plusDays(3),
                "10:00 AM",
                "UPCOMING",
                "Routine checkup and rabies shot booster."
        );
        appointmentRepository.save(appointment);
    }
}
