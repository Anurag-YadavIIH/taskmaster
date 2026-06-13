package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.response.AttachmentResponse;
import com.airtribe.taskmaster.entity.Attachment;
import com.airtribe.taskmaster.entity.Task;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.exception.BadRequestException;
import com.airtribe.taskmaster.exception.ResourceNotFoundException;
import com.airtribe.taskmaster.repository.AttachmentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Stores task attachments. Binary content is written to a configurable upload
 * directory on disk; only metadata is kept in the database. Files are saved
 * under a random UUID name to avoid collisions and path-traversal issues.
 */
@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final Path uploadDir;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             TaskService taskService,
                             UserService userService,
                             @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.attachmentRepository = attachmentRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory", e);
        }
    }

    @Transactional
    public AttachmentResponse upload(Long userId, Long taskId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }
        taskService.getTask(userId, taskId); // access check
        Task task = taskService.findTask(taskId);
        User uploader = userService.findUser(userId);

        String original = file.getOriginalFilename() != null
                ? Paths.get(file.getOriginalFilename()).getFileName().toString()
                : "file";
        String stored = UUID.randomUUID() + "_" + original;

        try {
            Path target = uploadDir.resolve(stored);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }

        Attachment attachment = new Attachment();
        attachment.setTask(task);
        attachment.setUploadedBy(uploader);
        attachment.setFileName(original);
        attachment.setStoredName(stored);
        attachment.setContentType(file.getContentType() != null
                ? file.getContentType() : "application/octet-stream");
        attachment.setSizeBytes(file.getSize());

        return AttachmentResponse.from(attachmentRepository.save(attachment));
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(Long userId, Long taskId) {
        taskService.getTask(userId, taskId); // access check
        return attachmentRepository.findByTaskId(taskId).stream()
                .map(AttachmentResponse::from)
                .toList();
    }

    /** Returns the attachment entity plus a readable Resource for download. */
    @Transactional(readOnly = true)
    public Downloadable download(Long userId, Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Attachment", attachmentId));
        taskService.getTask(userId, attachment.getTask().getId()); // access check

        try {
            Path path = uploadDir.resolve(attachment.getStoredName()).normalize();
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw ResourceNotFoundException.of("Attachment file", attachmentId);
            }
            return new Downloadable(attachment, resource);
        } catch (MalformedURLException e) {
            throw ResourceNotFoundException.of("Attachment file", attachmentId);
        }
    }

    /** Simple carrier for the controller to build a file response. */
    public record Downloadable(Attachment attachment, Resource resource) {}
}
