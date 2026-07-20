/**
 * הקיבוץ – Notification Store
 * מנהל: התראות, unread count, SignalR events
 *
 * TODO backend:
 *   fetchNotifs()  → query GetNotifications
 *   markRead(id)   → mutation MarkNotificationRead($id)
 *   markAllRead()  → mutation MarkAllNotificationsRead
 *
 * TODO SignalR:
 *   hub.on("NewNotification", (notif) => addNotification(notif))
 *   יש לקשר ב-layout.tsx עם useEffect
 */

import { create } from "zustand";
import type { Notification, NotifType } from "@/types/api.types";

export type { Notification, NotifType };

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  setLoading: (v: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useNotifStore = create<NotifState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  }),

  addNotification: (notif) => set((state) => ({
    notifications: [notif, ...state.notifications],
    unreadCount: notif.isRead ? state.unreadCount : state.unreadCount + 1,
  })),

  markRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length };
  }),

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),

  removeNotification: (id) => set((state) => {
    const updated = state.notifications.filter(n => n.id !== id);
    return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length };
  }),

  setLoading: (isLoading) => set({ isLoading }),
}));

// ─── Selectors ────────────────────────────────────────────────

export const selectNotifications = (s: NotifState) => s.notifications;
export const selectUnreadCount   = (s: NotifState) => s.unreadCount;
// Returns a fresh array — don't subscribe directly; read `.length` or use `useShallow`.
export const selectUnread        = (s: NotifState) => s.notifications.filter(n => !n.isRead);
export const selectHasUnread     = (s: NotifState) => s.unreadCount > 0;
