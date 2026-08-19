package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A Pet Owner's reusable adopter profile (spec section 12), completed once
 * and referenced by every adoption application they submit. Deliberately
 * avoids duplicating User's name/email/phone, and avoids collecting
 * unnecessary sensitive information beyond what's listed in the spec.
 */
@Entity
@Table(name = "adopter_profiles")
public class AdopterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    private HousingType housingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "living_arrangement")
    private LivingArrangement livingArrangement;

    @Column(name = "existing_pets", columnDefinition = "TEXT")
    private String existingPets;

    @Column(name = "previous_pet_experience", columnDefinition = "TEXT")
    private String previousPetExperience;

    @Column(name = "household_members", columnDefinition = "TEXT")
    private String householdMembers;

    @Column(name = "pet_care_experience", columnDefinition = "TEXT")
    private String petCareExperience;

    @Column(name = "veterinary_care_plan", columnDefinition = "TEXT")
    private String veterinaryCarePlan;

    @Column(name = "can_provide_food_and_housing")
    private Boolean canProvideFoodAndHousing;

    @Column(name = "government_id_base64", columnDefinition = "TEXT")
    private String governmentIdBase64;

    @Column(name = "address_proof_base64", columnDefinition = "TEXT")
    private String addressProofBase64;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AdopterProfile() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public HousingType getHousingType() { return housingType; }
    public void setHousingType(HousingType housingType) { this.housingType = housingType; }

    public LivingArrangement getLivingArrangement() { return livingArrangement; }
    public void setLivingArrangement(LivingArrangement livingArrangement) { this.livingArrangement = livingArrangement; }

    public String getExistingPets() { return existingPets; }
    public void setExistingPets(String existingPets) { this.existingPets = existingPets; }

    public String getPreviousPetExperience() { return previousPetExperience; }
    public void setPreviousPetExperience(String previousPetExperience) { this.previousPetExperience = previousPetExperience; }

    public String getHouseholdMembers() { return householdMembers; }
    public void setHouseholdMembers(String householdMembers) { this.householdMembers = householdMembers; }

    public String getPetCareExperience() { return petCareExperience; }
    public void setPetCareExperience(String petCareExperience) { this.petCareExperience = petCareExperience; }

    public String getVeterinaryCarePlan() { return veterinaryCarePlan; }
    public void setVeterinaryCarePlan(String veterinaryCarePlan) { this.veterinaryCarePlan = veterinaryCarePlan; }

    public Boolean getCanProvideFoodAndHousing() { return canProvideFoodAndHousing; }
    public void setCanProvideFoodAndHousing(Boolean canProvideFoodAndHousing) { this.canProvideFoodAndHousing = canProvideFoodAndHousing; }

    public String getGovernmentIdBase64() { return governmentIdBase64; }
    public void setGovernmentIdBase64(String governmentIdBase64) { this.governmentIdBase64 = governmentIdBase64; }

    public String getAddressProofBase64() { return addressProofBase64; }
    public void setAddressProofBase64(String addressProofBase64) { this.addressProofBase64 = addressProofBase64; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
