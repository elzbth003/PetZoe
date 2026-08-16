package com.petzoe.api.dto;

import com.petzoe.api.entity.Vaccination;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VaccinationDTO {
    private Long id;
    private String veterinarianName;
    private String vaccineName;
    private LocalDate dateAdministered;
    private LocalDate nextDueDate;
    private String batchLotNumber;
    private String notes;
    private LocalDateTime createdAt;

    public VaccinationDTO() {}

    public VaccinationDTO(Vaccination v) {
        this.id = v.getId();
        this.veterinarianName = v.getVeterinarian().getName();
        this.vaccineName = v.getVaccineName();
        this.dateAdministered = v.getDateAdministered();
        this.nextDueDate = v.getNextDueDate();
        this.batchLotNumber = v.getBatchLotNumber();
        this.notes = v.getNotes();
        this.createdAt = v.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVeterinarianName() { return veterinarianName; }
    public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }

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
