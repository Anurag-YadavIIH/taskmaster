package com.airtribe.taskmaster.controller;

import com.airtribe.taskmaster.dto.request.AssignTaskRequest;
import com.airtribe.taskmaster.dto.request.CreateTaskRequest;
import com.airtribe.taskmaster.dto.request.UpdateStatusRequest;
import com.airtribe.taskmaster.dto.request.UpdateTaskRequest;
import com.airtribe.taskmaster.dto.response.TaskResponse;
import com.airtribe.taskmaster.entity.enums.TaskPriority;
import com.airtribe.taskmaster.entity.enums.TaskStatus;
import com.airtribe.taskmaster.security.UserPrincipal;
import com.airtribe.taskmaster.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Task CRUD plus listing with filtering, sorting and search.
 *
 * Listing supports query params, e.g.:
 *   GET /api/tasks?status=OPEN&priority=HIGH&search=login&sort=dueDate,asc&page=0&size=20
 */
@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Create, read, update, delete, filter and search tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "List tasks visible to you, with optional filters, search and sorting")
    public ResponseEntity<Page<TaskResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Filter by status") @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Filter by priority") @RequestParam(required = false) TaskPriority priority,
            @Parameter(description = "Filter by assignee id") @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "Filter by team id") @RequestParam(required = false) Long teamId,
            @Parameter(description = "Free-text search in title/description") @RequestParam(required = false) String search,
            @Parameter(description = "Only tasks due on/before this date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueBefore,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<TaskResponse> result = taskService.listTasks(
                principal.getId(), status, priority, assigneeId, teamId, search, dueBefore, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single task by id")
    public ResponseEntity<TaskResponse> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task (partial; null fields are unchanged)")
    public ResponseEntity<TaskResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change a task's status (e.g. mark completed)")
    public ResponseEntity<TaskResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(taskService.updateStatus(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign a task to a team member")
    public ResponseEntity<TaskResponse> assign(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AssignTaskRequest request) {
        return ResponseEntity.ok(taskService.assignTask(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        taskService.deleteTask(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
