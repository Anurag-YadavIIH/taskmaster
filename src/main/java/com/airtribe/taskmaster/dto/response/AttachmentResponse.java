package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.Attachment;
import java.time.Instant;

public record AttachmentResponse(
        Long id,
        Long taskId,
        String fileName,
        String contentType,
        long sizeBytes,
        Long uploadedById,
        String uploadedByUsername,
        Instant createdAt
) {
    public static AttachmentResponse from(Attachment a) {
        return new AttachmentResponse(
                a.getId(), a.getTask().getId(), a.getFileName(),
                a.getContentType(), a.getSizeBytes(),
                a.getUploadedBy().getId(), a.getUploadedBy().getUsername(),
                a.getCreatedAt());
    }
}
