// הקיבוץ – Demo fixtures for "מצב פיתוח"
//
// Typed against the real domain types on purpose: if a DTO changes, these stop
// compiling instead of quietly drifting from what the pages actually render.
// Only reachable behind useDemoMode(), which is development-only.

import type { PostDto, PortfolioDto, UserProfileDto } from "@/lib/api/types";
import { PostType, UserRole } from "@/lib/api/types";
import type { Project } from "@/types/project.types";
import type { ConnectionRequest, UserSummary } from "@/types/user.types";
// The profile page reads these off the store, whose UserProfile is a narrower
// shape than the one in user.types — match what the page actually renders.
import type { SuccessBadge, UserProfile, UserProject } from "@/store/useUserStore";

// Fixed timestamps — Date.now() here would make every render a new "now" and
// the relative-time labels would jitter between renders.
const DAY = 86_400_000;
const BASE = Date.parse("2026-07-20T09:00:00Z");
const ago = (days: number) => new Date(BASE - days * DAY).toISOString();

function person(
  id: string,
  first: string,
  last: string,
  username: string,
  bio: string,
): UserProfileDto {
  return {
    userId: id,
    firstName: first,
    lastName: last,
    fullName: `${first} ${last}`,
    username,
    email: `${username}@kibbutz.local`,
    profilePictureUrl: null,
    coverImageUrl: null,
    bio,
    role: UserRole.Member,
    followersCount: 42,
    followingCount: 31,
    friendsCount: 18,
    createdAt: ago(400),
  };
}

const GUY = person("u-1", "גיא", "לוי", "guyl", "יזם סביבתי, מוביל פרויקטים ירוקים");
const MICHAL = person("u-2", "מיכל", "רז", "michalr", "מעצבת מוצר ו-UX");
const DANIEL = person("u-3", "דניאל", "כהן", "danielc", "מפתח פולסטאק");
const SHIRA = person("u-4", "שירה", "מנדל", "shiram", "מנהלת קהילה ומורה");

// ── Feed ────────────────────────────────────────────────────────────────────
const OTHERS_POSTS: PostDto[] = [
  {
    postId: "p-1", author: GUY, type: PostType.Text,
    content: "סיימנו את אב הטיפוס הראשון של מערכת ניטור המים! מחפשים עוד מפתח/ת שרת שיצטרף לצוות. מי בעניין?",
    mediaUrls: null, tags: ["אקולוגיה", "IoT"],
    likesCount: 24, commentsCount: 6, sharesCount: 2,
    isLikedByCurrentUser: true, createdAt: ago(0.1), updatedAt: null,
  },
  {
    postId: "p-2", author: MICHAL, type: PostType.Text,
    content: "העליתי לתיק העבודות שלי את מסך הבית החדש של אפליקציית הקהילה. אשמח לפידבק לפני שאני מעבירה לפיתוח.",
    mediaUrls: null, tags: ["עיצוב", "UX"],
    likesCount: 41, commentsCount: 12, sharesCount: 5,
    isLikedByCurrentUser: false, createdAt: ago(0.8), updatedAt: null,
  },
  {
    postId: "p-3", author: SHIRA, type: PostType.Text,
    content: "מפגש קהילה ביום חמישי בערב — נדבר על איך מרכיבים צוות לפרויקט ראשון. כולם מוזמנים.",
    mediaUrls: null, tags: ["קהילה"],
    likesCount: 17, commentsCount: 3, sharesCount: 1,
    isLikedByCurrentUser: false, createdAt: ago(2), updatedAt: null,
  },
];

/** The first post is authored by the viewer, so the "my post" card — and its
 *  delete option in the ⋯ menu — is visible too, not only other people's. */
export const demoPosts = (meId: string, meName: string): PostDto[] => [
  {
    postId: "p-me",
    author: {
      ...GUY,
      userId: meId || "me",
      firstName: meName || "אני",
      lastName: "",
      fullName: meName || "אני",
      username: "me",
    },
    type: PostType.Text,
    content: "מחפש שותפים לפרויקט חדש של לוח מידע קהילתי. מי שרוצה להצטרף — שיכתוב לי.",
    mediaUrls: null, tags: ["קהילה"],
    likesCount: 8, commentsCount: 2, sharesCount: 0,
    isLikedByCurrentUser: false, createdAt: ago(0.4), updatedAt: null,
  },
  ...OTHERS_POSTS,
];

// ── Portfolios ──────────────────────────────────────────────────────────────
function portfolio(
  id: string, owner: UserProfileDto, title: string, description: string,
  category: string, likes: number, views: number, liked: boolean, days: number,
): PortfolioDto {
  return {
    portfolioId: id, owner, title, description, category,
    imageUrl: null, tags: null,
    likesCount: likes, viewsCount: views,
    isLikedByCurrentUser: liked, createdAt: ago(days),
  };
}

export const DEMO_PORTFOLIOS: PortfolioDto[] = [
  portfolio("pf-1", MICHAL, "מערכת עיצוב לאפליקציית קהילה",
    "ספריית רכיבים מלאה — צבעים, טיפוגרפיה ומצבי כהה/בהיר.", "עיצוב", 58, 640, true, 6),
  portfolio("pf-2", DANIEL, "לוח בקרה לניטור חיישנים",
    "ויזואליזציה בזמן אמת של חיישני לחות וטמפרטורה בשטח.", "פיתוח", 33, 410, false, 14),
  portfolio("pf-3", GUY, "סדרת צילומים — חקלאות עירונית",
    "תיעוד של שישה גגות ירוקים בתל אביב לאורך עונה שלמה.", "צילום", 21, 288, false, 25),
];

/** The "my portfolio" page filters by owner, so these carry the viewer's id. */
export const demoMyPortfolios = (ownerId: string, ownerName: string): PortfolioDto[] => {
  const me: UserProfileDto = {
    ...MICHAL,
    userId: ownerId || "me",
    fullName: ownerName || MICHAL.fullName,
  };
  return [
    portfolio("pf-me-1", me, "אב טיפוס לאפליקציית הקיבוץ",
      "מסכי הצטרפות, גילוי פרויקטים ופרופיל אישי.", "עיצוב", 12, 96, false, 3),
    portfolio("pf-me-2", me, "רכיבי ממשק בעברית (RTL)",
      "ערכת רכיבים שנבנתה מהיסוד לכיוון ימין-לשמאל.", "פיתוח", 7, 54, true, 18),
  ];
};

// ── Projects ────────────────────────────────────────────────────────────────
function project(
  id: string, title: string, description: string, tags: string[],
  ownerId: string, ownerName: string, members: string[], max: number,
  icon: Project["iconType"], days: number, roles: Record<string, string> = {},
): Project {
  return {
    id, title, description, tags,
    maxMembers: max, members, memberRoles: roles, projectMembers: [],
    owner: { id: ownerId, name: ownerName, avatar: "" },
    iconType: icon, statusText: "פעיל", status: "open",
    isPromoted: false, comments: [], media: [], createdAt: ago(days),
  };
}

export const demoOwnedProjects = (meId: string, meName: string): Project[] => [
  project("pr-1", "ניטור מים חכם",
    "מערכת חיישנים שמזהה דליפות מים בזמן אמת ומתריעה לוועד.",
    ["IoT", "אקולוגיה", "Python"], meId, meName, [meId, "u-3"], 6, "leaf", 40,
    { [meId]: "מוביל פרויקט", "u-3": "מפתח שרת" }),
  project("pr-2", "לוח קהילה דיגיטלי",
    "מסך מידע לחדר האוכל — הודעות, תורנויות ואירועים.",
    ["React", "עיצוב"], meId, meName, [meId], 4, "globe", 12,
    { [meId]: "מוביל פרויקט" }),
];

export const demoJoinedProjects = (meId: string): Project[] => [
  project("pr-3", "ארכיון תמונות הקיבוץ",
    "דיגיטציה וקטלוג של אלבומי התמונות ההיסטוריים.",
    ["ארכיון", "Database"], "u-4", SHIRA.fullName, ["u-4", meId, "u-2"], 5, "database", 60,
    { "u-4": "מובילה", [meId]: "מפתח/ת", "u-2": "מעצבת" }),
  project("pr-4", "גינה קהילתית",
    "תכנון וניהול חלקות הגינה המשותפת, כולל תורנויות השקיה.",
    ["קהילה", "חקלאות"], "u-1", GUY.fullName, ["u-1", meId], 8, "leaf", 90,
    { "u-1": "מוביל", [meId]: "חבר צוות" }),
];

// ── Friends ─────────────────────────────────────────────────────────────────
const summary = (id: string, name: string, role: string, success: number): UserSummary => ({
  id, name, role, successCount: success, skills: [],
});

export const DEMO_CONNECTIONS: UserSummary[] = [
  summary("u-1", GUY.fullName, "יזם סביבתי", 4),
  summary("u-2", MICHAL.fullName, "מעצבת מוצר", 6),
  summary("u-3", DANIEL.fullName, "מפתח פולסטאק", 3),
];
export const DEMO_FOLLOWING: UserSummary[] = [
  summary("u-4", SHIRA.fullName, "מנהלת קהילה", 8),
  summary("u-2", MICHAL.fullName, "מעצבת מוצר", 6),
];
export const DEMO_FOLLOWERS: UserSummary[] = [
  summary("u-1", GUY.fullName, "יזם סביבתי", 4),
  summary("u-5", "אורן ברק", "מנהל מוצר", 2),
];
export const demoConnectionRequests = (meId: string, meName: string): ConnectionRequest[] => [
  {
    id: "cr-1",
    from: summary("u-5", "אורן ברק", "מנהל מוצר", 2),
    to: summary(meId || "me", meName || "אני", "", 0),
    status: "PENDING", createdAt: ago(1),
  },
];

// ── Matches ─────────────────────────────────────────────────────────────────
// Skills matter here: the cards render a chip per skill and the page filters
// by experience level, so an empty skills array would hide half the design.
export const DEMO_MATCHED_USERS: UserSummary[] = [
  { ...summary("u-3", DANIEL.fullName, "מפתח פולסטאק", 3),
    skills: [{ name: "React", level: "3-5" }, { name: "Node.js", level: "3-5" }] },
  { ...summary("u-2", MICHAL.fullName, "מעצבת מוצר", 6),
    skills: [{ name: "Figma", level: "5+" }, { name: "מחקר משתמשים", level: "3-5" }] },
  { ...summary("u-6", "ניב גבע", "מהנדס חומרה", 5),
    skills: [{ name: "IoT", level: "5+" }, { name: "C++", level: "1-2" }] },
];

export const demoMatchedProjects = (): Project[] => [
  ...demoOwnedProjects("u-1", GUY.fullName),
  ...demoJoinedProjects("u-4"),
];

// ── Profile ─────────────────────────────────────────────────────────────────
export const demoProfile = (base: UserProfile): UserProfile => ({
  ...base,
  name: base.name?.trim() || "ליאור מדן",
  role: "מפתח פולסטאק",
  bio: "בונה כלים לקהילות. אוהב פרויקטים שמתחילים קטן ומשנים משהו אמיתי.",
  links: "github.com/example",
  profileLinks: [
    { url: "https://liormedan.dev", label: "אתר אישי" },
    { url: "https://github.com/example", label: "GitHub" },
    { url: "https://linkedin.com/in/example", label: "LinkedIn" },
  ],
  preferredPayment: "bit",
  successCount: 3,
  skills: [
    { name: "React", level: "3-5" },
    { name: "TypeScript", level: "3-5" },
    { name: "Node.js", level: "1-2" },
    { name: "עיצוב ממשק", level: "5+" },
  ],
});

export const DEMO_BADGES: SuccessBadge[] = [
  {
    id: "b-1", projectId: "pr-1", projectName: "ניטור מים חכם",
    entrepreneurId: "u-1", entrepreneurName: GUY.fullName, approvedAt: ago(30),
  },
  {
    id: "b-2", projectId: "pr-3", projectName: "ארכיון תמונות הקיבוץ",
    entrepreneurId: "u-4", entrepreneurName: SHIRA.fullName, approvedAt: ago(120),
  },
];

export const DEMO_USER_PROJECTS: UserProject[] = [
  { id: "pr-1", title: "ניטור מים חכם", role: "owner", status: "open", tags: ["IoT", "אקולוגיה"], createdAt: ago(40) },
  { id: "pr-3", title: "ארכיון תמונות הקיבוץ", role: "member", status: "open", tags: ["ארכיון"], createdAt: ago(60) },
  { id: "pr-5", title: "אתר התנדבויות", role: "member", status: "closed", tags: ["קהילה"], createdAt: ago(210) },
];
