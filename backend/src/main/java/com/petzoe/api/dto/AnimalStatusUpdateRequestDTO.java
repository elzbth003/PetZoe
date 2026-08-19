package com.petzoe.api.dto;

import com.petzoe.api.entity.AnimalStatus;

public record AnimalStatusUpdateRequestDTO(
    AnimalStatus status,
    String notes
) {}
