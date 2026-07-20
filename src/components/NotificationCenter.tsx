'use client';
/**
 * הקיבוץ – Notification Center
 * פעמון התראות עם dropdown
 * TODO backend: query notifications, mutation markNotificationRead
 * TODO SignalR: connectSignalR from notification.service
 */

import { Bell, Check, X, Award, FileText, Users, MessageSquare, UserPlus, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';

type NotifType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'nda_received'
  | 'nda_signed'
  | 'nda_rejected'
  | 'badge_received'
  | 'project_closed'
  | 'new_message'
  | 'member_joined'
  | 'member_left'
  | 'report_created'
  | 'connection_request_received'
  | 'connection_request_accepted';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const MOCK_NOTIFS: Notif[] = [
  {
    id: '1',
    type: 'application_received',
    title: 'מועמדות חדשה',
    body: 'מישהו הגיש מועמדות לפרויקט EcoTech Platform',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/dashboard/applications',
  },
  {
    id: '2',
    type: 'nda_received',
    title: 'NDA חדש התקבל',
    body: 'קיבלת חוזה סודיות לחתימה מ-גיא לוי',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/nda/inbox',
  },
  {
    id: '3',
    type: 'badge_received',
    title: '🏆 תג הצלחה!',
    body: 'קיבלת תג הצלחה על פרויקט Green Tech App',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function getNotifIcon(type: NotifType): React.ReactNode {
  switch (type) {
    case 'application_received':
      return <UserPlus className="w-4 h-4" />;
    case 'application_accepted':
      return <Check className="w-4 h-4" />;
    case 'application_rejected':
      return <X className="w-4 h-4" />;
    case 'nda_received':
    case 'nda_signed':
    case 'nda_rejected':
      return <FileText className="w-4 h-4" />;
    case 'badge_received':
      return <Award className="w-4 h-4" />;
    case 'new_message':
      return <MessageSquare className="w-4 h-4" />;
    case 'member_joined':
    case 'member_left':
      return <Users className="w-4 h-4" />;
    case 'report_created':
      return <AlertTriangle className="w-4 h-4" />;
    case 'connection_request_received':
      return <UserPlus className="w-4 h-4" />;
    case 'connection_request_accepted':
      return <Check className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function getNotifColor(type: NotifType): string {
  switch (type) {
    case 'application_received':
    case 'application_accepted':
    case 'member_joined':
      return 'bg-secondary/10 text-secondary';
    case 'application_rejected':
    case 'member_left':
      return 'bg-red-50 text-red-500';
    case 'nda_received':
    case 'nda_signed':
    case 'nda_rejected':
      return 'bg-primary/10 text-primary';
    case 'badge_received':
      return 'bg-accent/10 text-accent';
    case 'report_created':
      return 'bg-red-50 text-red-500';
    case 'connection_request_received':
    case 'connection_request_accepted':
      return 'bg-secondary/10 text-secondary';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function formatTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק'`;
  if (hours < 24) return `לפני ${hours} שע'`;
  return `לפני ${days} ימים`;
}

export default function NotificationCenter() {
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleNotifClick = (notif: Notif) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    console.warn('TODO: markNotificationRead', notif.id);
    if (notif.link) {
      router.push(notif.link);
    }
    setIsOpen(false);
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    console.warn('TODO: markAllNotificationsRead');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl hover:bg-primary/8 flex items-center justify-center text-foreground transition-colors"
        aria-label="התראות"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-80 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">התראות</span>
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
                סמן הכל כנקרא
              </button>
            )}
          </div>

          {/* Notif list */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">אין התראות חדשות</p>
              </div>
            ) : (
              notifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-primary/3 transition-colors border-b border-[var(--border)]/50 last:border-0 ${
                    !notif.isRead ? 'border-r-2 border-r-primary bg-primary/3' : ''
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
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatTime(notif.createdAt)}
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
