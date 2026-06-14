package com.airtribe.taskmaster.controller;

import com.airtribe.taskmaster.dto.request.CreateCommentRequest;
import com.airtribe.taskmaster.dto.response.CommentResponse;
import com.airtribe.taskmaster.security.UserPrincipal;
import com.airtribe.taskmaster.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Comments are nested under a task: /api/tasks/{taskId}/comments */
@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@Tag(name = "Comments", description = "Discuss tasks with collaborators")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<CommentResponse> add(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(principal.getId(), taskId, request));
    }

    @GetMapping
    @Operation(summary = "List comments on a task (oldest first)")
    public ResponseEntity<List<CommentResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.listComments(principal.getId(), taskId));
    }
}
