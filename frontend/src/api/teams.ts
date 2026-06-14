import { api } from "../lib/api";
import type { CreateTeamRequest, TeamMemberResponse, TeamResponse } from "../lib/types";

export function listMyTeams(): Promise<TeamResponse[]> {
  return api.get<TeamResponse[]>("/teams");
}

export function getTeam(id: number): Promise<TeamResponse> {
  return api.get<TeamResponse>(`/teams/${id}`);
}

export function createTeam(payload: CreateTeamRequest): Promise<TeamResponse> {
  return api.post<TeamResponse>("/teams", payload);
}

export function listTeamMembers(id: number): Promise<TeamMemberResponse[]> {
  return api.get<TeamMemberResponse[]>(`/teams/${id}/members`);
}

export function addTeamMember(id: number, userId: number): Promise<TeamMemberResponse> {
  return api.post<TeamMemberResponse>(`/teams/${id}/members`, { userId });
}
