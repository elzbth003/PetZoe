package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pet_rehome_applications")
public class PetRehomeApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "listing_id", nullable = false)
    private PetRehomeListing listing;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(name = "applicant_message", nullable = false, columnDefinition = "TEXT")
    private String applicantMessage;

    @Column(name = "living_situation", nullable = false, columnDefinition = "TEXT")
    private String livingSituation;

    @Column(name = "experience_notes", columnDefinition = "TEXT")
    private String experienceNotes;

    @Column(name = "contact_phone", nullable = false, length = 30)
    private String contactPhone;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    public PetRehomeApplication() {}

    public PetRehomeApplication(PetRehomeListing listing, Pet pet, User applicant, 
                                String applicantMessage, String livingSituation, 
                                String experienceNotes, String contactPhone) {
        this.listing = listing;
        this.pet = pet;
        this.applicant = applicant;
        this.applicantMessage = applicantMessage;
        this.livingSituation = livingSituation;
        this.experienceNotes = experienceNotes;
        this.contactPhone = contactPhone;
        this.status = "PENDING";
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PetRehomeListing getListing() { return listing; }
    public void setListing(PetRehomeListing listing) { this.listing = listing; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public User getApplicant() { return applicant; }
    public void setApplicant(User applicant) { this.applicant = applicant; }

    public String getApplicantMessage() { return applicantMessage; }
    public void setApplicantMessage(String applicantMessage) { this.applicantMessage = applicantMessage; }

    public String getLivingSituation() { return livingSituation; }
    public void setLivingSituation(String livingSituation) { this.livingSituation = livingSituation; }

    public String getExperienceNotes() { return experienceNotes; }
    public void setExperienceNotes(String experienceNotes) { this.experienceNotes = experienceNotes; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
