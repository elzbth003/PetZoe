package com.petzoe.api.dto;

import com.petzoe.api.entity.HousingType;
import com.petzoe.api.entity.LivingArrangement;

public record AdopterProfileRequestDTO(
    String address,
    HousingType housingType,
    LivingArrangement livingArrangement,
    String existingPets,
    String previousPetExperience,
    String householdMembers,
    String petCareExperience,
    String veterinaryCarePlan,
    Boolean canProvideFoodAndHousing,
    String governmentIdBase64,
    String addressProofBase64
) {}
