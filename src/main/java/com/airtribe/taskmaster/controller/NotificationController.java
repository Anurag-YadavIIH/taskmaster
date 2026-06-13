package com.airtribe.taskmaster.controller;

import com.airtribe.taskmaster.dto.response.NotificationResponse;
import com.airtribe.taskmaster.security.UserPrincipal;
import com.airtribe.taskmaster.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * Notifications. Clients can poll {@code GET /api/notifications} or open a
 * live stream at {@code GET /api/notifications/stream} (Server-Sent Events) to
 * receive pushes the instant a task is assigned, completed or commented on.
 */
@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app and real-time (SSE) notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "List your notifications (newest first)")
    public ResponseEntity<List<NotificationResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.list(principal.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Count of your unread notifications")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("unread", notificationService.unreadCount(principal.getId())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<NotificationResponse> markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(principal.getId(), id));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Open a real-time Server-Sent Events stream of notifications")
    public SseEmitter stream(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.subscribe(principal.getId());
    }
}
