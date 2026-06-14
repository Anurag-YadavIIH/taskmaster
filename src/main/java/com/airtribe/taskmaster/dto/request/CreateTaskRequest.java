package com.airtribe.taskmaster.dto.request;

import com.airtribe.taskmaster.entity.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String description,
        LocalDate dueDate,
        TaskPriority priority,
        Long assigneeId,
        Long teamId
) {}
