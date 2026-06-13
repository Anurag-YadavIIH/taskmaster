package com.airtribe.taskmaster.dto.request;

import jakarta.validation.constraints.NotNull;

/** Add an existing user to a team by their id. */
public record AddMemberRequest(@NotNull Long userId) {}
