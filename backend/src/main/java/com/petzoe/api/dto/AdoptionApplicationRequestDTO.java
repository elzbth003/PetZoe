package com.petzoe.api.dto;

public record AdoptionApplicationRequestDTO(
    String reasonForAdoption,
    String petCarePlan,
    String veterinaryCarePlanNotes
) {}
