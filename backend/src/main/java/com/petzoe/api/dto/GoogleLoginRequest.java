package com.petzoe.api.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
    @NotBlank(message = "Google credential token is required")
    String token
) {}
