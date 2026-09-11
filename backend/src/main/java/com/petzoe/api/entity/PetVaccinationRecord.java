package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Vaccination event for privately owned pets (Pet).
 */
@Entity
@Table(name = "pet_vaccinations")
public class PetVaccinationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private User veterinarian;

    @Column(name = "vaccine_name", nullable = false)
    private String vaccineName;

    @Column(name = "date_administered", nullable = false)
    private LocalDate dateAdministered;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "batch_lot_number")
    private String batchLotNumber;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public PetVaccinationRecord() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public User getVeterinarian() { return veterinarian; }
    public void setVeterinarian(User veterinarian) { this.veterinarian = veterinarian; }

    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }

    public LocalDate getDateAdministered() { return dateAdministered; }
    public void setDateAdministered(LocalDate dateAdministered) { this.dateAdministered = dateAdministered; }

    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }

    public String getBatchLotNumber() { return batchLotNumber; }
    public void setBatchLotNumber(String batchLotNumber) { this.batchLotNumber = batchLotNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
