package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.entity.Task;
import com.airtribe.taskmaster.entity.enums.TaskPriority;
import com.airtribe.taskmaster.entity.enums.TaskStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

/**
 * Reusable, composable JPA {@link Specification}s for querying tasks. Each
 * method returns a fragment of a WHERE clause; the service ANDs together only
 * the ones that apply, so any combination of filters works without bespoke
 * queries.
 */
public final class TaskSpecifications {

    private TaskSpecifications() {}

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasPriority(TaskPriority priority) {
        return (root, query, cb) ->
                priority == null ? null : cb.equal(root.get("priority"), priority);
    }

    public static Specification<Task> hasAssignee(Long assigneeId) {
        return (root, query, cb) ->
                assigneeId == null ? null : cb.equal(root.get("assignee").get("id"), assigneeId);
    }

    public static Specification<Task> hasTeam(Long teamId) {
        return (root, query, cb) ->
                teamId == null ? null : cb.equal(root.get("team").get("id"), teamId);
    }

    public static Specification<Task> dueBefore(LocalDate date) {
        return (root, query, cb) ->
                date == null ? null : cb.lessThanOrEqualTo(root.get("dueDate"), date);
    }

    /** Case-insensitive match against title OR description. */
    public static Specification<Task> matchesText(String text) {
        return (root, query, cb) -> {
            if (text == null || text.isBlank()) return null;
            String like = "%" + text.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };
    }

    /**
     * Restricts results to tasks the user is allowed to see: ones they created,
     * ones assigned to them, or ones belonging to a team they're in.
     *
     * IMPORTANT: assignee and team are nullable, so we must use LEFT joins.
     * Navigating them with root.get(...) would create INNER joins and silently
     * drop personal/unassigned tasks even when the user is the creator. We also
     * mark the query distinct to avoid duplicate rows from the joins.
     */
    public static Specification<Task> accessibleBy(Long userId, List<Long> teamIds) {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            Join<Object, Object> assigneeJoin = root.join("assignee", JoinType.LEFT);
            Join<Object, Object> teamJoin = root.join("team", JoinType.LEFT);

            Predicate creator = cb.equal(root.get("creator").get("id"), userId);
            Predicate assignee = cb.equal(assigneeJoin.get("id"), userId);
            if (teamIds == null || teamIds.isEmpty()) {
                return cb.or(creator, assignee);
            }
            Predicate team = teamJoin.get("id").in(teamIds);
            return cb.or(creator, assignee, team);
        };
    }
}
