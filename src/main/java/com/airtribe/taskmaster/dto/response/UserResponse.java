package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.User;
import java.time.Instant;

/** Public view of a user — note the password hash is never exposed. */
public record UserResponse(
        Long id,
        String username,
        String email,
        String fullName,
        String bio,
        Instant createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                u.getFullName(), u.getBio(), u.getCreatedAt());
    }
}
