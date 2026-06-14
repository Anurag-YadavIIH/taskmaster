import { api } from "../lib/api";
import type { NotificationResponse } from "../lib/types";

export function listNotifications(): Promise<NotificationResponse[]> {
  return api.get<NotificationResponse[]>("/notifications");
}

export function getUnreadCount(): Promise<{ unread: number }> {
  return api.get<{ unread: number }>("/notifications/unread-count");
}

export function markNotificationRead(id: number): Promise<NotificationResponse> {
  return api.patch<NotificationResponse>(`/notifications/${id}/read`);
}
