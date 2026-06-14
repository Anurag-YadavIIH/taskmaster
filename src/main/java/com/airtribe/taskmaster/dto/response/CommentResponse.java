package com.airtribe.taskmaster.dto.response;

import com.airtribe.taskmaster.entity.Comment;
import java.time.Instant;

public record CommentResponse(
        Long id,
        Long taskId,
        Long authorId,
        String authorUsername,
        String content,
        Instant createdAt
) {
    public static CommentResponse from(Comment c) {
        return new CommentResponse(
                c.getId(), c.getTask().getId(),
                c.getAuthor().getId(), c.getAuthor().getUsername(),
                c.getContent(), c.getCreatedAt());
    }
}
