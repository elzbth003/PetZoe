package com.petzoe.api.dto;

public record UserDTO(
    Long id,
    String name,
    String email,
    String phone,
    String bio,
    String address,
    String profileImage,
    String role,
    String specialization
) {}
