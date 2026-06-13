package com.airtribe.taskmaster.dto.request;

import jakarta.validation.constraints.Size;

/** All fields optional — only non-null values are applied to the profile. */
public record UpdateProfileRequest(
        @Size(max = 100) String fullName,
        @Size(max = 500) String bio
) {}
