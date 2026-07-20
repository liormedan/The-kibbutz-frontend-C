// הקיבוץ – Store Exports

export { useAuthStore, selectUser, selectToken, selectIsAuth, selectIsAdmin, selectIsEntrepreneur, selectNeedsOnboard, selectEmailVerified } from "./useAuthStore";
export type { AuthUser, UserRole } from "./useAuthStore";

export { useUserStore, selectProfile, selectSkills, selectBadges, selectProjects, selectOwnedProjects, selectJoinedProjects, selectSuccessCount } from "./useUserStore";
export type { UserProfile, Skill, SuccessBadge, UserProject, ExpLevel } from "./useUserStore";

export { useProjectStore, selectAllProjects, selectSelectedProject, selectFilteredProjects, selectAllTags, selectSearchTerm, selectSelectedTag } from "./useProjectStore";
export type { Project, Comment, Application, ProjectFilter } from "./useProjectStore";

export { useNotifStore, selectNotifications, selectUnreadCount, selectUnread, selectHasUnread } from "./useNotifStore";
export type { Notification, NotifType } from "./useNotifStore";

export { useTeamStore, selectActiveTeam, selectTeamByProjectId } from "./useTeamStore";
export type { Team, TeamStatus } from "./useTeamStore";

export { useConversationStore, selectActiveConversation, selectMessagesByConversation, selectUnreadConversations } from "./useConversationStore";
export type { Conversation, ConversationType, Message } from "./useConversationStore";
