package com.petzoe.api.dto;

import com.petzoe.api.entity.AnimalSize;

public record AdoptionListingRequestDTO(
    AnimalSize size,
    String personality,
    String specialCareRequirements,
    Double adoptionFee,
    String listingDescription
) {}
