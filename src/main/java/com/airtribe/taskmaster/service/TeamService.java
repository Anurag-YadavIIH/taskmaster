package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.request.AddMemberRequest;
import com.airtribe.taskmaster.dto.request.CreateTeamRequest;
import com.airtribe.taskmaster.dto.response.TeamMemberResponse;
import com.airtribe.taskmaster.dto.response.TeamResponse;
import com.airtribe.taskmaster.entity.Team;
import com.airtribe.taskmaster.entity.TeamMembership;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.entity.enums.TeamRole;
import com.airtribe.taskmaster.exception.ConflictException;
import com.airtribe.taskmaster.exception.ForbiddenException;
import com.airtribe.taskmaster.exception.ResourceNotFoundException;
import com.airtribe.taskmaster.repository.TeamMembershipRepository;
import com.airtribe.taskmaster.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Team/project lifecycle: create teams, list the teams a user belongs to, and
 * manage membership. The creator becomes the OWNER and is the only role allowed
 * to add members.
 */
@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMembershipRepository membershipRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public TeamService(TeamRepository teamRepository,
                       TeamMembershipRepository membershipRepository,
                       UserService userService,
                       NotificationService notificationService) {
        this.teamRepository = teamRepository;
        this.membershipRepository = membershipRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TeamResponse createTeam(Long ownerId, CreateTeamRequest req) {
        User owner = userService.findUser(ownerId);

        Team team = new Team();
        team.setName(req.name());
        team.setDescription(req.description());
        team.setOwner(owner);
        team = teamRepository.save(team);

        // The owner is automatically a member with the OWNER role.
        TeamMembership ownerMembership = new TeamMembership();
        ownerMembership.setTeam(team);
        ownerMembership.setUser(owner);
        ownerMembership.setRole(TeamRole.OWNER);
        membershipRepository.save(ownerMembership);

        return TeamResponse.from(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listMyTeams(Long userId) {
        return membershipRepository.findByUserId(userId).stream()
                .map(m -> TeamResponse.from(m.getTeam()))
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeam(Long userId, Long teamId) {
        requireMember(teamId, userId);
        return TeamResponse.from(findTeam(teamId));
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> listMembers(Long userId, Long teamId) {
        requireMember(teamId, userId);
        return membershipRepository.findByTeamId(teamId).stream()
                .map(TeamMemberResponse::from)
                .toList();
    }

    @Transactional
    public TeamMemberResponse addMember(Long actingUserId, Long teamId, AddMemberRequest req) {
        Team team = findTeam(teamId);

        // Only the owner may invite/add members.
        if (!team.getOwner().getId().equals(actingUserId)) {
            throw new ForbiddenException("Only the team owner can add members");
        }
        if (membershipRepository.existsByTeamIdAndUserId(teamId, req.userId())) {
            throw new ConflictException("User is already a member of this team");
        }

        User newMember = userService.findUser(req.userId());
        TeamMembership membership = new TeamMembership();
        membership.setTeam(team);
        membership.setUser(newMember);
        membership.setRole(TeamRole.MEMBER);
        membership = membershipRepository.save(membership);

        notificationService.notify(newMember,
                "You were added to the team \"" + team.getName() + "\"", null);

        return TeamMemberResponse.from(membership);
    }

    // --- Helpers shared with TaskService ---

    public Team findTeam(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> ResourceNotFoundException.of("Team", teamId));
    }

    public boolean isMember(Long teamId, Long userId) {
        return membershipRepository.existsByTeamIdAndUserId(teamId, userId);
    }

    public void requireMember(Long teamId, Long userId) {
        if (!isMember(teamId, userId)) {
            throw new ForbiddenException("You are not a member of this team");
        }
    }
}
