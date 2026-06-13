package com.airtribe.taskmaster.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Input for the AI description generator: a short title or a few keywords. */
public record GenerateDescriptionRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 500) String keywords
) {}
