package com.petzoe.api.dto;

import com.petzoe.api.entity.ShelterOrganizationType;

public record ShelterProfileRequestDTO(
    String shelterName,
    String description,
    ShelterOrganizationType organizationType,
    String registrationNumber,
    String addressLine,
    String city,
    String state,
    String pincode,
    Integer capacity,
    String veterinaryCareArrangements,
    String primaryImageBase64
) {}
