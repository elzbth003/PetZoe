package com.petzoe.api.dto;

import com.petzoe.api.entity.PreventiveCareRecord;
import com.petzoe.api.entity.PreventiveCareType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PreventiveCareDTO {
    private Long id;
    private String veterinarianName;
    private PreventiveCareType careType;
    private LocalDate dateAdministered;
    private LocalDate nextDueDate;
    private String product;
    private String notes;
    private LocalDateTime createdAt;

    public PreventiveCareDTO() {}

    public PreventiveCareDTO(PreventiveCareRecord r) {
        this.id = r.getId();
        this.veterinarianName = r.getVeterinarian().getName();
        this.careType = r.getCareType();
        this.dateAdministered = r.getDateAdministered();
        this.nextDueDate = r.getNextDueDate();
        this.product = r.getProduct();
        this.notes = r.getNotes();
        this.createdAt = r.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVeterinarianName() { return veterinarianName; }
    public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }

    public PreventiveCareType getCareType() { return careType; }
    public void setCareType(PreventiveCareType careType) { this.careType = careType; }

    public LocalDate getDateAdministered() { return dateAdministered; }
    public void setDateAdministered(LocalDate dateAdministered) { this.dateAdministered = dateAdministered; }

    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
