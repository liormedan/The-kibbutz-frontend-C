// הקיבוץ – Notifications Service (REST)
// Backend NotificationsController: /api/notifications/*
// The backend has no realtime hub, so connectSignalR() is replaced with polling.

import { api } from "@/lib/api/client";
import { mapNotification } from "@/lib/api/mappers";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotifStore } from "@/store/useNotifStore";
import type { PaginatedResponse, NotificationDto } from "@/lib/api/types";

const POLL_MS = 30_000;

export async function fetchNotifications(unreadOnly = false): Promise<void> {
  const { setNotifications, setLoading } = useNotifStore.getState();
  setLoading(true);
  try {
    const page = await api.get<PaginatedResponse<NotificationDto>>(
      "/api/notifications",
      { pageNumber: 1, pageSize: 30 },
    );
    let items = (page?.items ?? []).map(mapNotification);
    // backend has no unreadOnly filter — apply client-side
    if (unreadOnly) items = items.filter((n) => !n.isRead);
    setNotifications(items);
  } catch {
    // leave existing notifications intact on failure
  } finally {
    setLoading(false);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  useNotifStore.getState().markRead(id);
  try {
    await api.put<boolean>(`/api/notifications/${id}/read`);
  } catch {
    /* optimistic — ignore */
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  useNotifStore.getState().markAllRead();
  try {
    await api.put<boolean>("/api/notifications/mark-all-read");
  } catch {
    /* optimistic — ignore */
  }
}

/**
 * Polling replacement for the old SignalR hub.
 * Returns a cleanup function (same contract as before).
 */
export function connectSignalR(): () => void {
  if (
    process.env.NEXT_PUBLIC_DEV_BYPASS === "true" ||
    !useAuthStore.getState().token
  ) {
    return () => undefined;
  }

  void fetchNotifications();
  const timer = setInterval(() => {
    if (useAuthStore.getState().token) void fetchNotifications();
  }, POLL_MS);

  return () => clearInterval(timer);
}
