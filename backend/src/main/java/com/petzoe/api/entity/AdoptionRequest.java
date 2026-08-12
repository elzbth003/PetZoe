package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_requests")
public class AdoptionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_owner_id", nullable = false)
    private User petOwner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_pet_id", nullable = false)
    private AdoptionPet adoptionPet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "application_details", length = 2000)
    private String applicationDetails;

    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AdoptionRequest() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getPetOwner() { return petOwner; }
    public void setPetOwner(User petOwner) { this.petOwner = petOwner; }

    public AdoptionPet getAdoptionPet() { return adoptionPet; }
    public void setAdoptionPet(AdoptionPet adoptionPet) { this.adoptionPet = adoptionPet; }

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

    public String getApplicationDetails() { return applicationDetails; }
    public void setApplicationDetails(String applicationDetails) { this.applicationDetails = applicationDetails; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
