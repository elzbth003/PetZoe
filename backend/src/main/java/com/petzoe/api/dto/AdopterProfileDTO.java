package com.petzoe.api.dto;

import com.petzoe.api.entity.AdopterProfile;
import com.petzoe.api.entity.HousingType;
import com.petzoe.api.entity.LivingArrangement;
import java.time.LocalDateTime;

public class AdopterProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private HousingType housingType;
    private LivingArrangement livingArrangement;
    private String existingPets;
    private String previousPetExperience;
    private String householdMembers;
    private String petCareExperience;
    private String veterinaryCarePlan;
    private Boolean canProvideFoodAndHousing;
    private boolean hasGovernmentId;
    private boolean hasAddressProof;
    private String governmentIdBase64;
    private String addressProofBase64;
    private boolean complete;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdopterProfileDTO() {}

    public AdopterProfileDTO(AdopterProfile profile, boolean includeDocuments) {
        this.id = profile.getId();
        this.name = profile.getUser().getName();
        this.email = profile.getUser().getEmail();
        this.phone = profile.getUser().getPhone();
        this.address = profile.getAddress();
        this.housingType = profile.getHousingType();
        this.livingArrangement = profile.getLivingArrangement();
        this.existingPets = profile.getExistingPets();
        this.previousPetExperience = profile.getPreviousPetExperience();
        this.householdMembers = profile.getHouseholdMembers();
        this.petCareExperience = profile.getPetCareExperience();
        this.veterinaryCarePlan = profile.getVeterinaryCarePlan();
        this.canProvideFoodAndHousing = profile.getCanProvideFoodAndHousing();
        this.hasGovernmentId = profile.getGovernmentIdBase64() != null;
        this.hasAddressProof = profile.getAddressProofBase64() != null;
        if (includeDocuments) {
            this.governmentIdBase64 = profile.getGovernmentIdBase64();
            this.addressProofBase64 = profile.getAddressProofBase64();
        }
        this.complete = profile.getAddress() != null && !profile.getAddress().isBlank()
                && profile.getHousingType() != null
                && profile.getLivingArrangement() != null
                && Boolean.TRUE.equals(profile.getCanProvideFoodAndHousing());
        this.createdAt = profile.getCreatedAt();
        this.updatedAt = profile.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

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

    public boolean isHasGovernmentId() { return hasGovernmentId; }
    public void setHasGovernmentId(boolean hasGovernmentId) { this.hasGovernmentId = hasGovernmentId; }

    public boolean isHasAddressProof() { return hasAddressProof; }
    public void setHasAddressProof(boolean hasAddressProof) { this.hasAddressProof = hasAddressProof; }

    public String getGovernmentIdBase64() { return governmentIdBase64; }
    public void setGovernmentIdBase64(String governmentIdBase64) { this.governmentIdBase64 = governmentIdBase64; }

    public String getAddressProofBase64() { return addressProofBase64; }
    public void setAddressProofBase64(String addressProofBase64) { this.addressProofBase64 = addressProofBase64; }

    public boolean isComplete() { return complete; }
    public void setComplete(boolean complete) { this.complete = complete; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
