package com.airtribe.taskmaster.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignTaskRequest(@NotNull Long assigneeId) {}
