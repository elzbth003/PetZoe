package com.petzoe.api.dto;

import com.petzoe.api.entity.HousingType;
import com.petzoe.api.entity.LivingArrangement;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdopterProfileRequestDTO(
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    @Pattern(regexp = "^$|^[^<>]+$", message = "Address must not contain HTML tags (< or >)")
    String address,
    
    HousingType housingType,
    LivingArrangement livingArrangement,
    
    @Size(max = 1000, message = "Input cannot exceed 1000 characters")
    @Pattern(regexp = "^$|^[^<>]+$", message = "Must not contain HTML tags (< or >)")
    String existingPets,
    
    @Size(max = 1000, message = "Input cannot exceed 1000 characters")
    @Pattern(regexp = "^$|^[^<>]+$", message = "Must not contain HTML tags (< or >)")
    String previousPetExperience,
    
    @Size(max = 1000, message = "Input cannot exceed 1000 characters")
    @Pattern(regexp = "^$|^[^<>]+$", message = "Must not contain HTML tags (< or >)")
    String householdMembers,
    
    @Size(max = 1000, message = "Input cannot exceed 1000 characters")
    @Pattern(regexp = "^$|^[^<>]+$", message = "Must not contain HTML tags (< or >)")
    String petCareExperience,
    
    @Size(max = 1000, message = "Input cannot exceed 1000 characters")
    @Pattern(regexp = "^$|^[^<>]+$", message = "Must not contain HTML tags (< or >)")
    String veterinaryCarePlan,
    
    Boolean canProvideFoodAndHousing,
    String governmentIdBase64,
    String addressProofBase64
) {}
