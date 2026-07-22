"use client";
// הקיבוץ – Feed view (backed by /api/posts/feed)
// Rendered inside the dashboard shell as the "feed" tab, and on the /feed route.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Loader2, Send } from "lucide-react";
import {
  fetchFeed,
  createPost,
  likePost,
  unlikePost,
} from "@/services/post.service";
import type { PostDto } from "@/lib/api/types";
import DevDataToggle from "@/components/DevDataToggle";
import { useDemoMode } from "@/lib/dev/demoMode";
import { DEMO_POSTS } from "@/lib/dev/fixtures";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
}

function timeAgo(iso: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return t("socialTimeNow");
  if (mins < 60) return t("socialTimeMinutesAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("socialTimeHoursAgo", { count: hours });
  return t("socialTimeDaysAgo", { count: Math.floor(hours / 24) });
}

function Avatar({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="h-10 w-10 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
      {initials(name)}
    </div>
  );
}

export default function FeedView() {
  const { t, dir } = useI18n();
  const [demo, toggleDemo] = useDemoMode("feed");
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchFeed(1, 20);
      setPosts(page?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("socialFeedLoadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePost = async () => {
    const content = draft.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const post = await createPost({ content });
      setPosts((prev) => [post, ...prev]);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("socialPostCreateError"));
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (post: PostDto) => {
    const liked = post.isLikedByCurrentUser;
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === post.postId
          ? { ...p, isLikedByCurrentUser: !liked, likesCount: p.likesCount + (liked ? -1 : 1) }
          : p,
      ),
    );
    try {
      if (liked) await unlikePost(post.postId);
      else await likePost(post.postId);
    } catch {
      void load();
    }
  };

  // Demo data replaces the list only while the real feed has nothing to show.
  const shownPosts = demo && posts.length === 0 ? DEMO_POSTS : posts;

  return (
    <div dir={dir} className="mx-auto w-full max-w-3xl">
      {/* Header — every other page has one; the feed was the odd one out. */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("socialFeedTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("socialFeedSub")}</p>
        </div>
        <DevDataToggle enabled={demo} onToggle={toggleDemo} hasRealData={posts.length > 0} />
      </div>

      {/* Composer */}
      <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm border border-[var(--border)]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("socialComposerPlaceholder")}
          rows={3}
          maxLength={5000}
          className="w-full resize-none rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{draft.length}/5000</span>
          <button
            onClick={handlePost}
            disabled={!draft.trim() || posting}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("socialPublish")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : shownPosts.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground border border-[var(--border)]">
          {t("socialFeedEmpty")}
        </div>
      ) : (
        <ul className="space-y-4">
          {shownPosts.map((post) => (
            <li key={post.postId} className="rounded-2xl bg-card p-4 shadow-sm border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <Avatar url={post.author.profilePictureUrl} name={post.author.fullName} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{post.author.fullName}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt, t)}</p>
                </div>
              </div>

              <Link href={`/feed/${post.postId}`} className="mt-3 block">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.content}</p>
              </Link>

              <div className="mt-3 flex items-center gap-5 text-muted-foreground">
                <button
                  onClick={() => toggleLike(post)}
                  className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${post.isLikedByCurrentUser ? "text-primary" : ""}`}
                >
                  <Heart className="h-4 w-4" fill={post.isLikedByCurrentUser ? "currentColor" : "none"} />
                  {post.likesCount}
                </button>
                <Link href={`/feed/${post.postId}`} className="flex items-center gap-1.5 text-sm transition-colors hover:text-primary">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentsCount}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
