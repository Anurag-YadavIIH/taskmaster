package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.Task;
import com.airtribe.taskmaster.entity.enums.TaskPriority;
import com.airtribe.taskmaster.entity.enums.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority,
        Long creatorId,
        String creatorUsername,
        Long assigneeId,
        String assigneeUsername,
        Long teamId,
        String teamName,
        Instant createdAt,
        Instant updatedAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(
                t.getId(), t.getTitle(), t.getDescription(), t.getDueDate(),
                t.getStatus(), t.getPriority(),
                t.getCreator().getId(), t.getCreator().getUsername(),
                t.getAssignee() != null ? t.getAssignee().getId() : null,
                t.getAssignee() != null ? t.getAssignee().getUsername() : null,
                t.getTeam() != null ? t.getTeam().getId() : null,
                t.getTeam() != null ? t.getTeam().getName() : null,
                t.getCreatedAt(), t.getUpdatedAt()
        );
    }
}
