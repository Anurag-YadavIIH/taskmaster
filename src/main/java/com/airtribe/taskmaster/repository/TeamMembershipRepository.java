package com.airtribe.taskmaster.repository;

import com.airtribe.taskmaster.entity.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {
    List<TeamMembership> findByTeamId(Long teamId);
    List<TeamMembership> findByUserId(Long userId);
    Optional<TeamMembership> findByTeamIdAndUserId(Long teamId, Long userId);
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
}
