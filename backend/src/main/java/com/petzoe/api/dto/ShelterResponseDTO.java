package com.petzoe.api.dto;

import com.petzoe.api.entity.Shelter;
import com.petzoe.api.entity.ShelterOrganizationType;
import com.petzoe.api.entity.VerificationStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ShelterResponseDTO {
    private Long id;
    private AdminUserDTO manager;
    private String shelterName;
    private String description;
    private ShelterOrganizationType organizationType;
    private String registrationNumber;
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private Integer capacity;
    private String veterinaryCareArrangements;
    private String primaryImageBase64;
    private VerificationStatus verificationStatus;
    private List<ShelterDocumentDTO> documents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
    private String rejectionReason;

    public ShelterResponseDTO() {}

    public ShelterResponseDTO(Shelter shelter, String rejectionReason) {
        this.id = shelter.getId();
        this.manager = new AdminUserDTO(shelter.getManager());
        this.shelterName = shelter.getShelterName();
        this.description = shelter.getDescription();
        this.organizationType = shelter.getOrganizationType();
        this.registrationNumber = shelter.getRegistrationNumber();
        this.addressLine = shelter.getAddressLine();
        this.city = shelter.getCity();
        this.state = shelter.getState();
        this.pincode = shelter.getPincode();
        this.capacity = shelter.getCapacity();
        this.veterinaryCareArrangements = shelter.getVeterinaryCareArrangements();
        this.primaryImageBase64 = shelter.getPrimaryImageBase64();
        this.verificationStatus = shelter.getVerificationStatus();
        this.documents = shelter.getDocuments().stream().map(ShelterDocumentDTO::new).collect(Collectors.toList());
        this.createdAt = shelter.getCreatedAt();
        this.updatedAt = shelter.getUpdatedAt();
        this.submittedAt = shelter.getSubmittedAt();
        this.rejectionReason = rejectionReason;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AdminUserDTO getManager() { return manager; }
    public void setManager(AdminUserDTO manager) { this.manager = manager; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ShelterOrganizationType getOrganizationType() { return organizationType; }
    public void setOrganizationType(ShelterOrganizationType organizationType) { this.organizationType = organizationType; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getVeterinaryCareArrangements() { return veterinaryCareArrangements; }
    public void setVeterinaryCareArrangements(String veterinaryCareArrangements) { this.veterinaryCareArrangements = veterinaryCareArrangements; }

    public String getPrimaryImageBase64() { return primaryImageBase64; }
    public void setPrimaryImageBase64(String primaryImageBase64) { this.primaryImageBase64 = primaryImageBase64; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public List<ShelterDocumentDTO> getDocuments() { return documents; }
    public void setDocuments(List<ShelterDocumentDTO> documents) { this.documents = documents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
