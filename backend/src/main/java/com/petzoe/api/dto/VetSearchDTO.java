package com.petzoe.api.dto;

public record VetSearchDTO(
    Long id,
    String name,
    String email,
    String phone,
    String bio,
    String address,
    String profileImage,
    String specialization
) {}
