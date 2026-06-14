import { api } from "../lib/api";
import type {
  CreateTaskRequest,
  Page,
  TaskListParams,
  TaskResponse,
  TaskStatus,
  UpdateTaskRequest,
} from "../lib/types";

export function listTasks(params: TaskListParams, signal?: AbortSignal): Promise<Page<TaskResponse>> {
  return api.get<Page<TaskResponse>>("/tasks", { ...params }, signal);
}

export function getTask(id: number, signal?: AbortSignal): Promise<TaskResponse> {
  return api.get<TaskResponse>(`/tasks/${id}`, undefined, signal);
}

export function createTask(payload: CreateTaskRequest): Promise<TaskResponse> {
  return api.post<TaskResponse>("/tasks", payload);
}

export function updateTask(id: number, payload: UpdateTaskRequest): Promise<TaskResponse> {
  return api.put<TaskResponse>(`/tasks/${id}`, payload);
}

export function updateTaskStatus(id: number, status: TaskStatus): Promise<TaskResponse> {
  return api.patch<TaskResponse>(`/tasks/${id}/status`, { status });
}

export function assignTask(id: number, assigneeId: number): Promise<TaskResponse> {
  return api.patch<TaskResponse>(`/tasks/${id}/assign`, { assigneeId });
}

export function deleteTask(id: number): Promise<void> {
  return api.delete<void>(`/tasks/${id}`);
}
