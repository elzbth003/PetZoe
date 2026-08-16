package com.petzoe.api.dto;

import com.petzoe.api.entity.Shelter;
import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;

public class ShelterSummaryDTO {
    private Long id;
    private String shelterName;
    private String city;
    private String state;
    private String managerName;
    private String managerEmail;
    private VerificationStatus verificationStatus;
    private LocalDateTime submittedAt;

    public ShelterSummaryDTO() {}

    public ShelterSummaryDTO(Shelter shelter) {
        this.id = shelter.getId();
        this.shelterName = shelter.getShelterName();
        this.city = shelter.getCity();
        this.state = shelter.getState();
        this.managerName = shelter.getManager().getName();
        this.managerEmail = shelter.getManager().getEmail();
        this.verificationStatus = shelter.getVerificationStatus();
        this.submittedAt = shelter.getSubmittedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
