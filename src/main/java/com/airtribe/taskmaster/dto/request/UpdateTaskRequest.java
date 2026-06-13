package com.airtribe.taskmaster.dto.request;

import com.airtribe.taskmaster.entity.enums.TaskPriority;
import com.airtribe.taskmaster.entity.enums.TaskStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Partial update — null fields are left unchanged. */
public record UpdateTaskRequest(
        @Size(max = 200) String title,
        @Size(max = 2000) String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority
) {}
