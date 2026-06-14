import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../api/notifications";
import { useAuth } from "../context/AuthContext";

export const UNREAD_COUNT_KEY = ["notifications", "unread-count"];

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: getUnreadCount,
    select: (data) => data.unread,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}
