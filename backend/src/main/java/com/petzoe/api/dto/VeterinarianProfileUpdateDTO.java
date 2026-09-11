package com.petzoe.api.dto;

public record VeterinarianProfileUpdateDTO(
        String qualification,
        String registrationNumber,
        Integer experience,
        String specialization,
        String bio,
        String address,
        String phone
) {}
