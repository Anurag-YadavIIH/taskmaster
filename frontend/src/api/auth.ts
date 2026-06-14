import { api } from "../lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../lib/types";

export function register(payload: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", payload);
}

export function login(payload: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", payload);
}

export function logout(): Promise<{ message: string }> {
  return api.post<{ message: string }>("/auth/logout");
}
