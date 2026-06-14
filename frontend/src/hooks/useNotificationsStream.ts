import { useEffect } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UNREAD_COUNT_KEY } from "./useUnreadCount";
import type { NotificationResponse } from "../lib/types";

/** Opens a live SSE connection to /api/notifications/stream and reacts to "notification" events. */
export function useNotificationsStream() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();

    fetchEventSource(`${API_BASE_URL}/api/notifications/stream`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      signal: controller.signal,
      openWhenHidden: true,
      async onopen() {
        // connection established; nothing to do
      },
      onmessage(event) {
        if (event.event === "notification") {
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
          try {
            const payload = JSON.parse(event.data) as NotificationResponse;
            showToast(payload.message, "info");
          } catch {
            // ignore malformed payloads
          }
        }
      },
      onerror(err) {
        console.error("Notification stream error", err);
        // returning undefined lets fetchEventSource retry with backoff
      },
    }).catch(() => {
      // aborted on unmount/logout; nothing to do
    });

    return () => controller.abort();
  }, [isAuthenticated, queryClient, showToast]);
}
