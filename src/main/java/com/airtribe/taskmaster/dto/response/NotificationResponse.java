package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.Notification;
import java.time.Instant;

public record NotificationResponse(
        Long id,
        String message,
        Long taskId,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getMessage(), n.getTaskId(),
                n.isRead(), n.getCreatedAt());
    }
}
