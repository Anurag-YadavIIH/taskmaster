package com.airtribe.taskmaster.dto.request;

import jakarta.validation.constraints.NotBlank;

/** Login accepts either username or email in the {@code usernameOrEmail} field. */
public record LoginRequest(
        @NotBlank String usernameOrEmail,
        @NotBlank String password
) {}
