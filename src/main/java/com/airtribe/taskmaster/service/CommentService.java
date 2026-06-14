package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.request.CreateCommentRequest;
import com.airtribe.taskmaster.dto.response.CommentResponse;
import com.airtribe.taskmaster.entity.Comment;
import com.airtribe.taskmaster.entity.Task;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Comments on tasks. Anyone who can view a task may comment on it; we reuse
 * {@link TaskService} to load the task and enforce that view check.
 */
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, TaskService taskService,
                          UserService userService, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Transactional
    public CommentResponse addComment(Long userId, Long taskId, CreateCommentRequest req) {
        // getTask performs the view-access check and 404s if not allowed.
        taskService.getTask(userId, taskId);
        Task task = taskService.findTask(taskId);
        User author = userService.findUser(userId);

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setContent(req.content());
        Comment saved = commentRepository.save(comment);

        // Notify the assignee that there's new discussion (unless they wrote it).
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(userId)) {
            notificationService.notify(task.getAssignee(),
                    author.getUsername() + " commented on \"" + task.getTitle() + "\"",
                    task.getId());
        }
        return CommentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long userId, Long taskId) {
        taskService.getTask(userId, taskId); // access check
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(CommentResponse::from)
                .toList();
    }
}
