package com.airtribe.taskmaster.dto.request;

import com.airtribe.taskmaster.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull TaskStatus status) {}
