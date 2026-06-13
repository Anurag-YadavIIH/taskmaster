package com.airtribe.taskmaster.controller;

import com.airtribe.taskmaster.dto.response.AttachmentResponse;
import com.airtribe.taskmaster.security.UserPrincipal;
import com.airtribe.taskmaster.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * File attachments. Upload/list are nested under a task; download is a
 * top-level resource so the binary can be linked directly.
 */
@RestController
@Tag(name = "Attachments", description = "Attach and download files on tasks")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(value = "/api/tasks/{taskId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file attachment to a task")
    public ResponseEntity<AttachmentResponse> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attachmentService.upload(principal.getId(), taskId, file));
    }

    @GetMapping("/api/tasks/{taskId}/attachments")
    @Operation(summary = "List attachments on a task")
    public ResponseEntity<List<AttachmentResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(attachmentService.list(principal.getId(), taskId));
    }

    @GetMapping("/api/attachments/{id}/download")
    @Operation(summary = "Download an attachment's file")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        AttachmentService.Downloadable d = attachmentService.download(principal.getId(), id);
        Resource resource = d.resource();
        String fileName = d.attachment().getFileName();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.attachment().getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
