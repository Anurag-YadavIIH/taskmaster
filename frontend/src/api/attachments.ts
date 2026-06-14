import { api, downloadFile } from "../lib/api";
import type { AttachmentResponse } from "../lib/types";

export function listAttachments(taskId: number): Promise<AttachmentResponse[]> {
  return api.get<AttachmentResponse[]>(`/tasks/${taskId}/attachments`);
}

export function uploadAttachment(taskId: number, file: File): Promise<AttachmentResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<AttachmentResponse>(`/tasks/${taskId}/attachments`, formData);
}

export function downloadAttachment(id: number): Promise<{ blob: Blob; fileName: string | null }> {
  return downloadFile(`/attachments/${id}/download`);
}
