package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.Team;
import java.time.Instant;

public record TeamResponse(
        Long id,
        String name,
        String description,
        Long ownerId,
        String ownerUsername,
        Instant createdAt
) {
    public static TeamResponse from(Team t) {
        return new TeamResponse(
                t.getId(), t.getName(), t.getDescription(),
                t.getOwner().getId(), t.getOwner().getUsername(),
                t.getCreatedAt());
    }
}
