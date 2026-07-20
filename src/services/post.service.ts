// הקיבוץ – Posts & Comments Service (REST)
// Backend PostsController (/api/posts) + CommentsController (/api/comments).
// These power the NEW social feed pages (the backend's real core feature).

import { api } from "@/lib/api/client";
import type {
  PaginatedResponse,
  PostDto,
  CommentDto,
  CreatePostDto,
  CreateCommentDto,
} from "@/lib/api/types";

// ─── Posts ─────────────────────────────────────────────────────

export function fetchFeed(pageNumber = 1, pageSize = 10) {
  return api.get<PaginatedResponse<PostDto>>("/api/posts/feed", {
    pageNumber,
    pageSize,
  });
}

export function fetchPost(postId: string) {
  return api.get<PostDto>(`/api/posts/${postId}`);
}

export function createPost(input: CreatePostDto) {
  return api.post<PostDto>("/api/posts", input);
}

export function likePost(postId: string) {
  return api.post<boolean>(`/api/posts/${postId}/like`);
}

export function unlikePost(postId: string) {
  return api.del<boolean>(`/api/posts/${postId}/like`);
}

export function deletePost(postId: string) {
  return api.del<boolean>(`/api/posts/${postId}`);
}

// ─── Comments ──────────────────────────────────────────────────

export function fetchComments(postId: string, pageNumber = 1, pageSize = 20) {
  return api.get<PaginatedResponse<CommentDto>>(
    `/api/comments/posts/${postId}`,
    { pageNumber, pageSize },
  );
}

export function createComment(postId: string, input: CreateCommentDto) {
  return api.post<CommentDto>(`/api/comments/posts/${postId}`, input);
}

export function likeComment(commentId: string) {
  return api.post<boolean>(`/api/comments/${commentId}/like`);
}

export function unlikeComment(commentId: string) {
  return api.del<boolean>(`/api/comments/${commentId}/like`);
}

export function deleteComment(commentId: string) {
  return api.del<boolean>(`/api/comments/${commentId}`);
}
