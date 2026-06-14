import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import clsx from "clsx";
import { listNotifications, markNotificationRead } from "../../api/notifications";
import { UNREAD_COUNT_KEY } from "../../hooks/useUnreadCount";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatRelativeTime } from "../../lib/format";
import type { NotificationResponse } from "../../lib/types";

const NOTIFICATIONS_KEY = ["notifications", "list"];

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: listNotifications,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
  }

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: invalidate,
  });

  const unreadIds = notifications?.filter((n) => !n.read).map((n) => n.id) ?? [];

  const markAllMutation = useMutation({
    mutationFn: () => Promise.all(unreadIds.map((id) => markNotificationRead(id))),
    onSuccess: invalidate,
  });

  function handleClick(notification: NotificationResponse) {
    if (!notification.read) markReadMutation.mutate(notification.id);
    if (notification.taskId) navigate(`/tasks/${notification.taskId}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay up to date with activity on your tasks</p>
        </div>
        {unreadIds.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCheck className="h-4 w-4" />}
            isLoading={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <EmptyState icon={Bell} title="Failed to load notifications" description="Please try again later." />
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You're all caught up." />
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                onClick={() => handleClick(notification)}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:shadow-sm",
                  notification.read ? "border-gray-200 bg-white" : "border-indigo-100 bg-indigo-50/60"
                )}
              >
                <span
                  className={clsx(
                    "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                    !notification.read && "bg-indigo-500"
                  )}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(notification.createdAt)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
