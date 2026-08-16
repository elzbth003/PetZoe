package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A shelter organization profile, owned by a single Shelter Manager user.
 * A shelter must reach VerificationStatus.APPROVED before it can place
 * animals into the adoption workflow.
 */
@Entity
@Table(name = "shelters")
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false, unique = true)
    private User manager;

    @Column(name = "shelter_name", nullable = false)
    private String shelterName;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "organization_type")
    private ShelterOrganizationType organizationType;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "address_line")
    private String addressLine;

    private String city;

    private String state;

    private String pincode;

    private Integer capacity;

    @Column(name = "veterinary_care_arrangements", columnDefinition = "TEXT")
    private String veterinaryCareArrangements;

    @Column(name = "primary_image_base64", columnDefinition = "TEXT")
    private String primaryImageBase64;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.NOT_SUBMITTED;

    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShelterDocument> documents = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    public Shelter() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }

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

    public List<ShelterDocument> getDocuments() { return documents; }
    public void setDocuments(List<ShelterDocument> documents) { this.documents = documents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
