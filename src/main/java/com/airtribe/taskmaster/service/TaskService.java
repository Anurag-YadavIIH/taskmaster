package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.request.AssignTaskRequest;
import com.airtribe.taskmaster.dto.request.CreateTaskRequest;
import com.airtribe.taskmaster.dto.request.UpdateStatusRequest;
import com.airtribe.taskmaster.dto.request.UpdateTaskRequest;
import com.airtribe.taskmaster.dto.response.TaskResponse;
import com.airtribe.taskmaster.entity.Task;
import com.airtribe.taskmaster.entity.Team;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.entity.enums.TaskPriority;
import com.airtribe.taskmaster.entity.enums.TaskStatus;
import com.airtribe.taskmaster.exception.ForbiddenException;
import com.airtribe.taskmaster.exception.ResourceNotFoundException;
import com.airtribe.taskmaster.repository.TaskRepository;
import com.airtribe.taskmaster.repository.TeamMembershipRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Core task operations: CRUD plus filtering, sorting, searching, status
 * changes and assignment. Notifications are emitted on assignment and on
 * meaningful updates.
 *
 * Authorization model:
 *  - A task is visible to its creator, its assignee, and members of its team.
 *  - Only the creator or assignee may edit/delete a task.
 *  - A task can only be placed in a team the creator belongs to, and can only
 *    be assigned to a member of that team (or to anyone if it's a personal task).
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TeamMembershipRepository membershipRepository;
    private final UserService userService;
    private final TeamService teamService;
    private final NotificationService notificationService;

    public TaskService(TaskRepository taskRepository,
                       TeamMembershipRepository membershipRepository,
                       UserService userService,
                       TeamService teamService,
                       NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.membershipRepository = membershipRepository;
        this.userService = userService;
        this.teamService = teamService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TaskResponse createTask(Long userId, CreateTaskRequest req) {
        User creator = userService.findUser(userId);

        Task task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        task.setDueDate(req.dueDate());
        task.setPriority(req.priority() != null ? req.priority() : TaskPriority.MEDIUM);
        task.setCreator(creator);

        if (req.teamId() != null) {
            Team team = teamService.findTeam(req.teamId());
            teamService.requireMember(team.getId(), userId);
            task.setTeam(team);
        }

        if (req.assigneeId() != null) {
            User assignee = resolveAssignee(req.assigneeId(), req.teamId());
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);

        // Notify the assignee (unless they assigned it to themselves).
        if (saved.getAssignee() != null && !saved.getAssignee().getId().equals(userId)) {
            notificationService.notify(saved.getAssignee(),
                    creator.getUsername() + " assigned you the task \"" + saved.getTitle() + "\"",
                    saved.getId());
        }
        return TaskResponse.from(saved);
    }

    /**
     * List tasks visible to the user, applying optional filters and paging/
     * sorting. {@code sort} is handled by the {@link Pageable} passed in by the
     * controller (e.g. ?sort=dueDate,asc).
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> listTasks(Long userId, TaskStatus status, TaskPriority priority,
                                        Long assigneeId, Long teamId, String search,
                                        LocalDate dueBefore, Pageable pageable) {
        List<Long> teamIds = membershipRepository.findByUserId(userId).stream()
                .map(m -> m.getTeam().getId())
                .toList();

        Specification<Task> spec = Specification
                .where(TaskSpecifications.accessibleBy(userId, teamIds))
                .and(TaskSpecifications.hasStatus(status))
                .and(TaskSpecifications.hasPriority(priority))
                .and(TaskSpecifications.hasAssignee(assigneeId))
                .and(TaskSpecifications.hasTeam(teamId))
                .and(TaskSpecifications.matchesText(search))
                .and(TaskSpecifications.dueBefore(dueBefore));

        return taskRepository.findAll(spec, pageable).map(TaskResponse::from);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long userId, Long taskId) {
        Task task = findTask(taskId);
        requireViewAccess(task, userId);
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateTask(Long userId, Long taskId, UpdateTaskRequest req) {
        Task task = findTask(taskId);
        requireEditAccess(task, userId);

        if (req.title() != null) task.setTitle(req.title());
        if (req.description() != null) task.setDescription(req.description());
        if (req.dueDate() != null) task.setDueDate(req.dueDate());
        if (req.status() != null) task.setStatus(req.status());
        if (req.priority() != null) task.setPriority(req.priority());

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long userId, Long taskId, UpdateStatusRequest req) {
        Task task = findTask(taskId);
        requireEditAccess(task, userId);
        task.setStatus(req.status());
        Task saved = taskRepository.save(task);

        // Let the creator know when someone completes their task.
        if (req.status() == TaskStatus.COMPLETED
                && !saved.getCreator().getId().equals(userId)) {
            notificationService.notify(saved.getCreator(),
                    "Task \"" + saved.getTitle() + "\" was marked completed", saved.getId());
        }
        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse assignTask(Long userId, Long taskId, AssignTaskRequest req) {
        Task task = findTask(taskId);
        requireEditAccess(task, userId);

        Long teamId = task.getTeam() != null ? task.getTeam().getId() : null;
        User assignee = resolveAssignee(req.assigneeId(), teamId);
        task.setAssignee(assignee);
        Task saved = taskRepository.save(task);

        if (!assignee.getId().equals(userId)) {
            notificationService.notify(assignee,
                    "You were assigned the task \"" + saved.getTitle() + "\"", saved.getId());
        }
        return TaskResponse.from(saved);
    }

    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        Task task = findTask(taskId);
        requireEditAccess(task, userId);
        taskRepository.delete(task);
    }

    // --- Helpers ---

    public Task findTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> ResourceNotFoundException.of("Task", taskId));
    }

    /** If the task belongs to a team, the assignee must be a team member. */
    private User resolveAssignee(Long assigneeId, Long teamId) {
        User assignee = userService.findUser(assigneeId);
        if (teamId != null && !teamService.isMember(teamId, assigneeId)) {
            throw new ForbiddenException("Assignee must be a member of the task's team");
        }
        return assignee;
    }

    private boolean canView(Task task, Long userId) {
        if (task.getCreator().getId().equals(userId)) return true;
        if (task.getAssignee() != null && task.getAssignee().getId().equals(userId)) return true;
        return task.getTeam() != null && teamService.isMember(task.getTeam().getId(), userId);
    }

    private void requireViewAccess(Task task, Long userId) {
        if (!canView(task, userId)) {
            // Hide existence from unauthorized users with a 404 rather than 403.
            throw ResourceNotFoundException.of("Task", task.getId());
        }
    }

    private void requireEditAccess(Task task, Long userId) {
        boolean isCreator = task.getCreator().getId().equals(userId);
        boolean isAssignee = task.getAssignee() != null
                && task.getAssignee().getId().equals(userId);
        if (!isCreator && !isAssignee) {
            throw new ForbiddenException("You don't have permission to modify this task");
        }
    }
}
