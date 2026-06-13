package com.airtribe.taskmaster.repository;

import com.airtribe.taskmaster.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Extends {@link JpaSpecificationExecutor} so the service layer can compose
 * dynamic filters (status, priority, assignee, team, free-text search) at
 * runtime without hand-writing a query for every combination.
 */
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
}
