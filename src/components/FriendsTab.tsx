'use client';

/**
 * הקיבוץ – FriendsTab
 * משולב ב-dashboard בטאב "חברים"
 * שלוש לשוניות: קשרים מפרויקטים | עוקב אחרי / עוקבים
 * + חיפוש שם + בקשת חברות + אישור בקשות נכנסות
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Check, UserPlus, Award, Users, Search, X, Send, Loader2 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import {
  fetchMyConnections,
  fetchMyFollowing,
  fetchMyFollowers,
  fetchConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  followUser,
  unfollowUser,
} from '@/services/connection.service';
import { searchUsers } from '@/services/user.service';
import type { UserSummary, ConnectionRequest } from '@/types/user.types';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DEMO_CONNECTIONS,
  DEMO_FOLLOWERS,
  DEMO_FOLLOWING,
  demoConnectionRequests,
} from '@/lib/dev/fixtures';
import { useI18n } from '@/lib/i18n/LanguageProvider';

type FriendsSubTab = 'connections' | 'following' | 'followers';

interface Props {
  t: Record<string, string>;
  onStartChat: (userId: string) => void;
  /** Dev-only: render sample lists while the real ones come back empty. */
  demo?: boolean;
  /** Called with true when every list is empty, so the page can show its toggle. */
  onEmptyChange?: (isEmpty: boolean) => void;
}

export default function FriendsTab({ t, onStartChat, demo = false, onEmptyChange }: Props) {
  const { t: tr, dir } = useI18n();
  const router = useRouter();
  const currentUser = useAuthStore(s => s.user);

  const [subTab, setSubTab] = useState<FriendsSubTab>('connections');
  const [connections, setConnections] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSearch, setRequestSearch] = useState('');
  const [platformUsers, setPlatformUsers] = useState<UserSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  // Load friends tab data
  const loadData = async () => {
    setLoading(true);
    try {
      const [connList, followingList, followersList, requestList] = await Promise.all([
        fetchMyConnections(),
        fetchMyFollowing(),
        fetchMyFollowers(),
        fetchConnectionRequests(),
      ]);
      setConnections(connList);
      setFollowing(followingList);
      setFollowers(followersList);
      setRequests(requestList);
    } catch (err) {
      console.error('Error loading friends tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  // Search users for modal connection requests
  useEffect(() => {
    if (!showRequestModal) return;
    
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUsers(requestSearch.trim());
        // Filter out current user from search results
        const filteredResults = results.filter(u => u.id !== currentUser?.id);
        setPlatformUsers(filteredResults);
      } catch (err) {
        console.error('Error searching platform users:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [requestSearch, showRequestModal, currentUser]);

  const handleToggleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      // Reload lists to update states
      const [followingList, followersList] = await Promise.all([
        fetchMyFollowing(),
        fetchMyFollowers(),
      ]);
      setFollowing(followingList);
      setFollowers(followersList);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      setRequestedIds(prev => new Set(prev).add(userId));
    } catch (err) {
      console.error('Error sending connection request:', err);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptConnectionRequest(requestId);
      await loadData(); // Reload all lists
    } catch (err) {
      console.error('Error accepting connection request:', err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineConnectionRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error declining connection request:', err);
    }
  };

  // Nothing came back from any list — the page offers demo data in that case.
  const isEmpty = !loading
    && connections.length === 0 && following.length === 0
    && followers.length === 0 && requests.length === 0;

  useEffect(() => { onEmptyChange?.(isEmpty); }, [isEmpty, onEmptyChange]);

  const useDemo = demo && isEmpty;
  const shownConnections = useDemo ? DEMO_CONNECTIONS : connections;
  const shownFollowing   = useDemo ? DEMO_FOLLOWING   : following;
  const shownFollowers   = useDemo ? DEMO_FOLLOWERS   : followers;
  const shownRequests    = useDemo
    ? demoConnectionRequests(currentUser?.id ?? '', currentUser?.name ?? '')
    : requests;

  const currentList = subTab === 'connections' ? shownConnections
    : subTab === 'following' ? shownFollowing
    : shownFollowers;

  const filteredList = useMemo(() =>
    searchQuery.trim()
      ? currentList.filter(u => u.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) || u.role?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      : currentList,
    [currentList, searchQuery]
  );

  // Incoming pending requests directed to the current user
  const pendingRequests = useMemo(() =>
    shownRequests.filter(req => req.status === "PENDING" && req.to.id === currentUser?.id),
    [shownRequests, currentUser]
  );

  const subTabs: { id: FriendsSubTab; label: string; count: number }[] = [
    { id: 'connections', label: t.friendsConnections || 'קשרים מפרויקטים', count: shownConnections.length },
    { id: 'following',   label: t.friendsFollowing   || 'עוקב אחרי',        count: shownFollowing.length  },
    { id: 'followers',   label: t.friendsFollowers   || 'עוקבים',           count: shownFollowers.length  },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">{tr('miscLoadingFriends')}</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" dir={dir}>

      {/* ── Top bar: sub-tabs + search + request button ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Sub-tabs */}
        <div className="flex gap-2 flex-wrap">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setSubTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-[var(--card)] border border-[var(--border)] text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                subTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Request connection button */}
        <button
          onClick={() => {
            setShowRequestModal(true);
            setRequestSearch('');
            setPlatformUsers([]);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          {tr('miscFriendsRequest')}
        </button>
      </div>

      {/* ── Pending incoming connection requests ── */}
      {subTab === 'connections' && pendingRequests.length > 0 && (
        <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            {tr('miscPendingRequestsCount', { count: pendingRequests.length })}
          </h3>
          <div className="space-y-3">
            {pendingRequests.map(req => {
              const sender = req.from;
              const initials = sender.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
              return (
                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-primary/3 border border-primary/10">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${sender.id}`)}>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground hover:underline">{sender.name}</p>
                      <p className="text-xs text-muted-foreground">{sender.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-4 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
                    >
                      {tr('miscApprove')}
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-4 py-1.5 rounded-lg border border-[var(--border)] text-muted-foreground hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      {tr('miscReject')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={tr('miscSearchNamePlaceholder')}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          dir={dir}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── User cards ── */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-[var(--primary)]" />}
          title={searchQuery ? tr('miscNoResults') : subTab === 'connections' ? tr('miscNoConnectionsTitle') : subTab === 'following' ? tr('miscNotFollowingAnyone') : tr('miscNoFollowersYet')}
          description={searchQuery ? tr('miscTryOtherSearch') : subTab === 'connections' ? tr('miscJoinProjectsHint') : tr('miscDiscoverMatchingHint')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map(user => {
            const isUserFollowing = following.some(f => f.id === user.id);
            return (
              <UserCard
                key={user.id}
                user={user}
                t={t}
                isFollowing={isUserFollowing}
                onFollow={() => handleToggleFollow(user.id, isUserFollowing)}
                onChat={() => onStartChat(user.id)}
                onClickProfile={() => router.push(`/profile/${user.id}`)}
              />
            );
          })}
        </div>
      )}

      {/* ── Request connection modal ── */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowRequestModal(false); }}
        >
          <div className="glass-panel rounded-2xl border border-[var(--border)] w-full max-w-md p-6 shadow-2xl" dir={dir}>
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">{tr('miscFriendsRequest')}</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal search */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={requestSearch}
                onChange={e => setRequestSearch(e.target.value)}
                placeholder={tr('miscSearchPlatformPlaceholder')}
                autoFocus
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                dir={dir}
              />
            </div>

            {/* User results */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : platformUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{tr('miscNoUsersFound')}</p>
              ) : (
                platformUsers.map(user => {
                  const sent = requestedIds.has(user.id);
                  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
                  return (
                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => { setShowRequestModal(false); router.push(`/profile/${user.id}`); }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setShowRequestModal(false); router.push(`/profile/${user.id}`); }}>
                        <p className="text-sm font-semibold text-foreground truncate hover:underline">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={sent}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          sent
                            ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                            : 'bg-primary text-white hover:opacity-90'
                        }`}
                      >
                        {sent
                          ? <><Check className="w-3 h-3" />{tr('miscRequestSent')}</>
                          : <><Send className="w-3 h-3" />{tr('miscSendRequest')}</>
                        }
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── UserCard ─── */
function UserCard({
  user, t, isFollowing, onFollow, onChat, onClickProfile,
}: {
  user: UserSummary;
  t: Record<string, string>;
  isFollowing: boolean;
  onFollow: () => void;
  onChat: () => void;
  onClickProfile: () => void;
}) {
  const { t: tr } = useI18n();
  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 text-right">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary text-base font-bold flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={onClickProfile}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--foreground)] truncate cursor-pointer hover:underline" onClick={onClickProfile}>{user.name}</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">{user.role || tr('miscPlatformUser')}</p>
          {user.successCount > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3 text-[var(--accent)]" />
              <span className="text-xs text-[var(--accent)] font-medium">{tr('miscSuccesses', { count: user.successCount })}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={onFollow}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isFollowing
              ? 'bg-primary/10 text-primary border border-primary/25 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
              : 'bg-primary text-white hover:opacity-90'
          }`}
        >
          {isFollowing
            ? <><Check className="w-3.5 h-3.5" />{t.followingBtn || 'עוקב'}</>
            : <><UserPlus className="w-3.5 h-3.5" />{t.followBtn || 'עקוב'}</>
          }
        </button>
        <button
          onClick={onChat}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-primary/40 transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {tr('miscChat')}
        </button>
      </div>
    </div>
  );
}
