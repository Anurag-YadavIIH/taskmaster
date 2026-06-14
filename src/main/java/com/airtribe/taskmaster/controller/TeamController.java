package com.airtribe.taskmaster.controller;

import com.airtribe.taskmaster.dto.request.AddMemberRequest;
import com.airtribe.taskmaster.dto.request.CreateTeamRequest;
import com.airtribe.taskmaster.dto.response.TeamMemberResponse;
import com.airtribe.taskmaster.dto.response.TeamResponse;
import com.airtribe.taskmaster.security.UserPrincipal;
import com.airtribe.taskmaster.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Team/project creation and membership management. */
@RestController
@RequestMapping("/api/teams")
@Tag(name = "Teams", description = "Create teams/projects and manage members")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @Operation(summary = "Create a new team/project (you become the owner)")
    public ResponseEntity<TeamResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.createTeam(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "List teams you belong to")
    public ResponseEntity<List<TeamResponse>> myTeams(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(teamService.listMyTeams(principal.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a team by id")
    public ResponseEntity<TeamResponse> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeam(principal.getId(), id));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "List a team's members")
    public ResponseEntity<List<TeamMemberResponse>> members(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(teamService.listMembers(principal.getId(), id));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Add a member to a team (owner only)")
    public ResponseEntity<TeamMemberResponse> addMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.addMember(principal.getId(), id, request));
    }
}
