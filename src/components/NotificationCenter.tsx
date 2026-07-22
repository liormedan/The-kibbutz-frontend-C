'use client';
/**
 * הקיבוץ – Notification Center
 * פעמון התראות עם dropdown — מחובר ל-useNotifStore + notification.service (REST).
 */

import { Bell, Check, FileText, MessageSquare, UserPlus, AlertTriangle, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import { useNotifStore } from '@/store/useNotifStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notification.service';
import type { Notification } from '@/types/api.types';
import { useI18n } from '@/lib/i18n/LanguageProvider';

function getNotifIcon(type: string): React.ReactNode {
  switch (type) {
    case 'friend_request':
    case 'new_follower':
      return <UserPlus className="w-4 h-4" />;
    case 'friend_request_accepted':
      return <Check className="w-4 h-4" />;
    case 'post_like':
    case 'portfolio_like':
      return <Heart className="w-4 h-4" />;
    case 'post_comment':
    case 'comment_reply':
    case 'mention':
    case 'new_message':
      return <MessageSquare className="w-4 h-4" />;
    case 'system_announcement':
      return <AlertTriangle className="w-4 h-4" />;
    case 'event_reminder':
      return <FileText className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function getNotifColor(type: string): string {
  switch (type) {
    case 'friend_request':
    case 'friend_request_accepted':
    case 'new_follower':
      return 'bg-secondary/10 text-secondary';
    case 'post_like':
    case 'portfolio_like':
      return 'bg-accent/10 text-accent';
    case 'post_comment':
    case 'comment_reply':
    case 'mention':
    case 'new_message':
      return 'bg-primary/10 text-primary';
    case 'system_announcement':
      return 'bg-red-50 text-red-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

function formatTime(iso: string, t: Translate): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return t('notifNow');
  if (mins < 60) return t('notifMinsAgo', { n: mins });
  if (hours < 24) return t('notifHoursAgo', { n: hours });
  return t('notifDaysAgo', { n: days });
}

export default function NotificationCenter() {
  const notifs = useNotifStore((s) => s.notifications);
  const unreadCount = useNotifStore((s) => s.unreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, dir } = useI18n();
  const token = useAuthStore((s) => s.token);

  // Only ask for notifications once there is a token. AppTopBar mounts this on
  // every page, so an unauthenticated fetch would 401 on every route — and a
  // 401 ends the session and bounces the user to "/".
  useEffect(() => {
    if (!token) return;
    void fetchNotifications();
  }, [token]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleNotifClick = (notif: Notification) => {
    void markNotificationRead(notif.id);
    if (notif.link) {
      router.push(notif.link);
    }
    setIsOpen(false);
  };

  const markAllRead = () => {
    void markAllNotificationsRead();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl hover:bg-primary/8 flex items-center justify-center text-foreground transition-colors"
        aria-label={t('notifTitle')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown. end-0: the bell sits at the inline END of the top bar (left
          in RTL, right in LTR), so anchoring there keeps the panel on screen. */}
      {isOpen && (
        <div
          className="absolute end-0 top-full mt-2 w-80 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden"
          dir={dir}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{t('notifTitle')}</span>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-primary hover:text-primary-dark transition-colors"
              >
                {t('notifMarkAll')}
              </button>
            )}
          </div>

          {/* Notif list */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">{t('notifEmpty')}</p>
              </div>
            ) : (
              notifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-primary/3 transition-colors border-b border-[var(--border)]/50 last:border-0 ${
                    !notif.isRead ? 'border-s-2 border-s-primary bg-primary/3' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${getNotifColor(notif.type)}`}
                  >
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !notif.isRead
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-foreground/80'
                      }`}
                    >
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {notif.timeAgo || formatTime(notif.createdAt, t)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
