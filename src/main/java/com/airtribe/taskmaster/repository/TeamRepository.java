package com.airtribe.taskmaster.repository;

import com.airtribe.taskmaster.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
