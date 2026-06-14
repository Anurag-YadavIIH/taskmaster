package com.airtribe.taskmaster.dto.response;

/** Returned on successful register/login: the JWT plus basic user info. */
public record AuthResponse(String token, String tokenType, UserResponse user) {
    public AuthResponse(String token, UserResponse user) {
        this(token, "Bearer", user);
    }
}
