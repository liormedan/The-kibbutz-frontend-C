// הקיבוץ – Backend REST contract (mirrors KibbutzBackend DTOs 1:1)
// The ASP.NET backend serializes JSON as camelCase and enums as INTEGERS
// (no JsonStringEnumConverter is registered). Keep these in sync with
// KibbutzBackend/Models/DTOs.cs + Entities.cs.

// ─── Common envelopes ──────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  errors?: string[] | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PageParams {
  pageNumber?: number;
  pageSize?: number;
}

// ─── Enums (integer values — order matters!) ───────────────────

export enum UserRole {
  Guest = 0,
  Member = 1,
  Resident = 2,
  KibbutzMember = 3,
  Volunteer = 4,
  Administrator = 5,
}

export enum PostType {
  Text = 0,
  Image = 1,
  Video = 2,
  Link = 3,
  Poll = 4,
}

export enum ReactionType {
  Like = 0,
  Love = 1,
  Support = 2,
  Celebrate = 3,
}

export enum FriendshipStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Blocked = 3,
}

export enum ConversationType {
  Direct = 0,
  Group = 1,
}

export enum MessageType {
  Text = 0,
  Image = 1,
  Video = 2,
  Audio = 3,
  File = 4,
  Emoji = 5,
}

export enum NotificationType {
  PostLike = 0,
  PostComment = 1,
  CommentReply = 2,
  FriendRequest = 3,
  FriendRequestAccepted = 4,
  NewFollower = 5,
  PortfolioLike = 6,
  NewMessage = 7,
  Mention = 8,
  SystemAnnouncement = 9,
  EventReminder = 10,
}

// ─── Auth DTOs ─────────────────────────────────────────────────

export interface LoginRequestDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface UserProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  profilePictureUrl?: string | null;
  coverImageUrl?: string | null;
  bio?: string | null;
  role: UserRole;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  createdAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfileDto;
}

// ─── Post DTOs ─────────────────────────────────────────────────

export interface CreatePostDto {
  content: string;
  type?: PostType;
  mediaUrls?: string[];
  tags?: string[];
}

export interface PostDto {
  postId: string;
  author: UserProfileDto;
  content: string;
  type: PostType;
  mediaUrls?: string[] | null;
  tags?: string[] | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

// ─── Comment DTOs ──────────────────────────────────────────────

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string | null;
}

export interface CommentDto {
  commentId: string;
  postId: string;
  author: UserProfileDto;
  content: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  replies?: CommentDto[] | null;
}

// ─── Portfolio DTOs ────────────────────────────────────────────

export interface CreatePortfolioDto {
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  tags?: string[];
}

export interface PortfolioDto {
  portfolioId: string;
  owner: UserProfileDto;
  title: string;
  description?: string | null;
  category: string;
  imageUrl?: string | null;
  tags?: string[] | null;
  likesCount: number;
  viewsCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

// ─── Message DTOs ──────────────────────────────────────────────

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: MessageType;
  mediaUrl?: string;
}

export interface MessageDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  mediaUrl?: string | null;
  sentAt: string;
  isRead: boolean;
  isMine: boolean;
}

export interface ConversationDto {
  conversationId: string;
  type: ConversationType;
  name?: string | null;
  imageUrl?: string | null;
  lastMessage?: MessageDto | null;
  unreadCount: number;
  participants?: UserProfileDto[] | null;
  lastMessageAt?: string | null;
}

export interface CreateConversationDto {
  participantIds: string[];
  type?: ConversationType;
  name?: string;
}

// ─── Notification DTOs ─────────────────────────────────────────

export interface NotificationDto {
  notificationId: string;
  type: NotificationType;
  text: string;
  iconType?: string | null;
  iconColor?: string | null;
  createdAt: string;
  timeAgo: string;
  isRead: boolean;
  actorId?: string | null;
  actorName?: string | null;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
}

// ─── Friendship DTOs ───────────────────────────────────────────

export interface SendFriendRequestDto {
  addresseeId: string;
}

export interface FriendshipDto {
  friendshipId: string;
  requester: UserProfileDto;
  addressee: UserProfileDto;
  status: FriendshipStatus;
  requestedAt: string;
  acceptedAt?: string | null;
  mutualFriendsCount: number;
}
