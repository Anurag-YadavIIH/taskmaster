import { api } from "../lib/api";
import type { CommentResponse } from "../lib/types";

export function listComments(taskId: number): Promise<CommentResponse[]> {
  return api.get<CommentResponse[]>(`/tasks/${taskId}/comments`);
}

export function addComment(taskId: number, content: string): Promise<CommentResponse> {
  return api.post<CommentResponse>(`/tasks/${taskId}/comments`, { content });
}
