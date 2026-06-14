import { api } from "../lib/api";
import type { UpdateProfileRequest, UserResponse, UserSearchResult } from "../lib/types";

export function getMe(): Promise<UserResponse> {
  return api.get<UserResponse>("/users/me");
}

export function updateMe(payload: UpdateProfileRequest): Promise<UserResponse> {
  return api.put<UserResponse>("/users/me", payload);
}

export function searchUsers(q: string, signal?: AbortSignal): Promise<UserSearchResult[]> {
  if (!q.trim()) return Promise.resolve([]);
  return api.get<UserSearchResult[]>("/users/search", { q }, signal);
}
