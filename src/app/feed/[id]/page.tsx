"use client";
// הקיבוץ – Post detail page (NEW — backed by /api/posts/:id + /api/comments)

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Heart, MessageCircle, Loader2, Send } from "lucide-react";
import {
  fetchPost,
  likePost,
  unlikePost,
  fetchComments,
  createComment,
  likeComment,
  unlikeComment,
} from "@/services/post.service";
import type { PostDto, CommentDto } from "@/lib/api/types";

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע'`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
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

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [post, setPost] = useState<PostDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([fetchPost(id), fetchComments(id)]);
      setPost(p);
      setComments(c?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "טעינת הפוסט נכשלה");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePostLike = async () => {
    if (!post) return;
    const liked = post.isLikedByCurrentUser;
    // optimistic
    setPost((prev) =>
      prev
        ? {
            ...prev,
            isLikedByCurrentUser: !liked,
            likesCount: prev.likesCount + (liked ? -1 : 1),
          }
        : prev,
    );
    try {
      if (liked) await unlikePost(post.postId);
      else await likePost(post.postId);
    } catch {
      void load(); // revert to server truth
    }
  };

  const toggleCommentLike = async (comment: CommentDto) => {
    const liked = comment.isLikedByCurrentUser;
    // optimistic
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === comment.commentId
          ? {
              ...c,
              isLikedByCurrentUser: !liked,
              likesCount: c.likesCount + (liked ? -1 : 1),
            }
          : c,
      ),
    );
    try {
      if (liked) await unlikeComment(comment.commentId);
      else await likeComment(comment.commentId);
    } catch {
      void load(); // revert to server truth
    }
  };

  const handleComment = async () => {
    const content = draft.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const comment = await createComment(id, { content });
      setComments((prev) => [comment, ...prev]);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "פרסום התגובה נכשל");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Back */}
        <Link
          href="/feed"
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה לפיד
        </Link>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !post ? (
          <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground border border-[var(--border)]">
            הפוסט לא נמצא.
          </div>
        ) : (
          <>
            {/* Post */}
            <div className="rounded-2xl bg-card p-4 shadow-sm border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <Avatar url={post.author.profilePictureUrl} name={post.author.fullName} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {post.author.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {post.content}
              </p>

              <div className="mt-3 flex items-center gap-5 text-muted-foreground">
                <button
                  onClick={togglePostLike}
                  className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${
                    post.isLikedByCurrentUser ? "text-primary" : ""
                  }`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={post.isLikedByCurrentUser ? "currentColor" : "none"}
                  />
                  {post.likesCount}
                </button>
                <span className="flex items-center gap-1.5 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentsCount}
                </span>
              </div>
            </div>

            {/* Comment composer */}
            <div className="mt-6 rounded-2xl bg-card p-4 shadow-sm border border-[var(--border)]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="הוסיפו תגובה..."
                rows={3}
                maxLength={5000}
                className="w-full resize-none rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{draft.length}/5000</span>
                <button
                  onClick={handleComment}
                  disabled={!draft.trim() || posting}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                >
                  {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  שליחה
                </button>
              </div>
            </div>

            {/* Comments */}
            {comments.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-card p-10 text-center text-muted-foreground border border-[var(--border)]">
                אין עדיין תגובות. היו הראשונים להגיב!
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {comments.map((comment) => (
                  <li
                    key={comment.commentId}
                    className="rounded-2xl bg-card p-4 shadow-sm border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        url={comment.author.profilePictureUrl}
                        name={comment.author.fullName}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {comment.author.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(comment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {comment.content}
                    </p>

                    <div className="mt-3 flex items-center gap-5 text-muted-foreground">
                      <button
                        onClick={() => toggleCommentLike(comment)}
                        className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${
                          comment.isLikedByCurrentUser ? "text-primary" : ""
                        }`}
                      >
                        <Heart
                          className="h-4 w-4"
                          fill={comment.isLikedByCurrentUser ? "currentColor" : "none"}
                        />
                        {comment.likesCount}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
