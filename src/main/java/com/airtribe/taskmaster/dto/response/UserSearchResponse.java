package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.User;

/** Minimal user info for pickers (team invites, task assignment) — never the password hash. */
public record UserSearchResponse(
        Long id,
        String username,
        String fullName,
        String email
) {
    public static UserSearchResponse from(User u) {
        return new UserSearchResponse(u.getId(), u.getUsername(), u.getFullName(), u.getEmail());
    }
}
