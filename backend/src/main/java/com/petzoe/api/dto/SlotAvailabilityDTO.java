package com.petzoe.api.dto;

public record SlotAvailabilityDTO(
    String slot,
    String status,
    boolean available
) {}