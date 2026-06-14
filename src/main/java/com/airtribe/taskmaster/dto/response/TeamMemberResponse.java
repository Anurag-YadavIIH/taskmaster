package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.TeamMembership;
import com.airtribe.taskmaster.entity.enums.TeamRole;

public record TeamMemberResponse(
        Long userId,
        String username,
        String fullName,
        TeamRole role
) {
    public static TeamMemberResponse from(TeamMembership m) {
        return new TeamMemberResponse(
                m.getUser().getId(), m.getUser().getUsername(),
                m.getUser().getFullName(), m.getRole());
    }
}
