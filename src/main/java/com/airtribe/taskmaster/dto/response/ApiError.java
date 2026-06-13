package com.airtribe.taskmaster.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error envelope returned by the global exception handler so every
 * error response across the API has the same predictable shape.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
    public ApiError(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, null);
    }

    public ApiError(int status, String error, String message, String path,
                    Map<String, String> fieldErrors) {
        this(Instant.now(), status, error, message, path, fieldErrors);
    }
}
