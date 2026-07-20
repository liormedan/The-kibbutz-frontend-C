// הקיבוץ – Connections Service (REST → Friendships)
// Maps the frontend "connections" concept onto the backend FriendshipsController.
// NOTE: the backend has friendships (bidirectional), NOT follow/followers.
// follow/unfollow + followers/following have no endpoint — see BACKEND_GAPS.md.

import { api } from "@/lib/api/client";
import { mapUserSummary, mapConnectionRequest } from "@/lib/api/mappers";
import { notImplemented, pendingRead } from "@/lib/api/pending";
import type {
  PaginatedResponse,
  UserProfileDto,
  FriendshipDto,
  SendFriendRequestDto,
} from "@/lib/api/types";
import type { UserSummary, ConnectionRequest } from "@/types/user.types";

const PAGE = { pageNumber: 1, pageSize: 50 };
const emptySummary: UserSummary = { id: "", name: "", skills: [], successCount: 0 };

export async function fetchMyConnections(): Promise<UserSummary[]> {
  const page = await api.get<PaginatedResponse<UserProfileDto>>(
    "/api/friendships",
    PAGE,
  );
  return (page?.items ?? []).map(mapUserSummary);
}

export async function fetchConnectionRequests(): Promise<ConnectionRequest[]> {
  const page = await api.get<PaginatedResponse<FriendshipDto>>(
    "/api/friendships/requests",
    PAGE,
  );
  return (page?.items ?? []).map(mapConnectionRequest);
}

export async function sendConnectionRequest(
  userId: string,
): Promise<ConnectionRequest> {
  const body: SendFriendRequestDto = { addresseeId: userId };
  const dto = await api.post<FriendshipDto>("/api/friendships/requests", body);
  return mapConnectionRequest(dto);
}

export async function acceptConnectionRequest(
  requestId: string,
): Promise<ConnectionRequest> {
  await api.put<boolean>(`/api/friendships/requests/${requestId}/accept`);
  return { ...emptyRequest(requestId), status: "ACCEPTED" };
}

export async function declineConnectionRequest(
  requestId: string,
): Promise<ConnectionRequest> {
  await api.put<boolean>(`/api/friendships/requests/${requestId}/reject`);
  return { ...emptyRequest(requestId), status: "DECLINED" };
}

function emptyRequest(id: string): ConnectionRequest {
  return {
    id,
    from: emptySummary,
    to: emptySummary,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
}

// ─── Follow / followers — no backend endpoint yet ──────────────

export async function fetchMyFollowing(): Promise<UserSummary[]> {
  return pendingRead("עוקבים אחריי", []);
}

export async function fetchMyFollowers(): Promise<UserSummary[]> {
  return pendingRead("העוקבים שלי", []);
}

export async function followUser(_userId: string): Promise<boolean> {
  return notImplemented("מעקב אחרי משתמש");
}

export async function unfollowUser(_userId: string): Promise<boolean> {
  return notImplemented("הפסקת מעקב");
}
