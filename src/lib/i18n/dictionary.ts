// הקיבוץ – i18n dictionary (he / en)
// Hebrew is the default. Seeded from the original bilingual app (v2) and
// extended for the new route structure. Add a key to BOTH maps.
// Per-area keys live in ./keys/*.ts fragments and are merged in below.

import { social } from "./keys/social";
import { profile } from "./keys/profile";
import { messages } from "./keys/messages";
import { projectsNda } from "./keys/projectsNda";
import { misc } from "./keys/misc";
import { auth } from "./keys/auth";

export type Lang = "he" | "en";

const core = {
  he: {
    // ── Sidebar / navigation ──
    sidebarTitle: "הקיבוץ",
    sidebarSub: "שיתוף פעולה קהילתי",
    navGroupCommunity: "קהילה",
    navGroupManage: "איזור ניהול",
    explore: "גלה פרויקטים",
    feed: "פיד",
    portfolios: "תיקי עבודות",
    myPortfolio: "תיק העבודות שלי",
    myProjects: "הפרויקטים שלי",
    applicationsReceived: "בקשות לפרויקטים שלי",
    myApplications: "המועמדויות שלי",
    teams: "צוותים",
    messages: "הודעות",
    friends: "חברים",
    profile: "פרופיל אישי",
    settings: "הגדרות",
    createNewProject: "פרויקט חדש",
    guest: "אורח",
    communityMember: "חבר קהילה",
    admin: "מנהל",

    // ── Explore / home ──
    exploreTitle: "גלה פרויקטים",
    exploreSub: "מצא פרויקטים קהילתיים שמחפשים חברים, ותרום את הכישורים שלך.",
    searchProjects: "חפש לפי שם, תיאור או טכנולוגיה...",
    domainAll: "הכל",
    domainEco: "אקולוגיה",
    domainAI: "בינה מלאכותית",
    domainData: "נתונים",
    domainWeb3: "Web3 / גלובלי",
    projectsCount: "{count} פרויקטים",
    noProjectsFound: "לא נמצאו פרויקטים תואמים",
    noProjectsFoundSub: "נסה מילת חיפוש אחרת או בחר תחום אחר.",
    leadBy: "מוביל: {name}",
    joinProject: "הצטרף",
    fullTeam: "מלא",

    // ── My projects ──
    myPortfolioSub: "פריטי תיק העבודות שפרסמת.",
    browseAllPortfolios: "כל התיקים",
    myPortfolioEmpty: "עדיין אין לך פריטים בתיק",
    myPortfolioEmptySub: "צור פריט חדש כדי להציג את העבודות שלך לקהילה.",
    hubSubtitle: "ניהול כל תהליכי הפרויקטים שלך.",
    hubTabProjects: "הפרויקטים שלי",
    hubTabRequests: "בקשות הצטרפות",
    hubTabApplications: "מועמדויות פתוחות",
    hubTabTeams: "הצוותים שלי",
    myTeamsEmpty: "עדיין אינך חבר באף צוות",
    myTeamsEmptySub: "הצטרף לפרויקט או צור אחד — הצוות שלו יופיע כאן.",
    myTeamsRole: "התפקיד שלך: {role}",
    myProjectsSub: "הפרויקטים שיצרת ואלה שהצטרפת אליהם.",
    myProjectsCreated: "יצרתי ({count})",
    myProjectsJoined: "הצטרפתי ({count})",
    myProjectsEmpty: "עדיין אין פרויקטים",
    myProjectsEmptySub: "צור פרויקט חדש או הצטרף לאחד מדף גילוי הפרויקטים.",
    membersCount: "חברים: {current}/{max}",
    loadError: "שגיאה בטעינת הפרויקטים",

    // ── Teams ──
    teamsSub: "הצטרפו לצוותי קהילה לפי תחומי עניין.",
    teamMembers: "{count} חברים",

    // ── Friends ──
    friendsSub: "קשרים מפרויקטים, עוקבים ובקשות חברות.",
    friendsConnections: "קשרים מפרויקטים",
    friendsFollowing: "עוקב אחרי",
    friendsFollowers: "עוקבים",
    followBtn: "עקוב",
    followingBtn: "עוקב",

    // ── Settings ──
    settingsAppearance: "מראה",
    settingsNotifications: "התראות",
    settingsPrivacy: "פרטיות",
    settingsAbout: "אודות",
    settingsLang: "שפה",
    settingsLangSub: "שפת ממשק המשתמש",
    settingsTheme: "תבנית צבע",
    settingsThemeSub: "בחר מצב תצוגה",
    settingsThemeLight: "בהיר",
    settingsThemeDark: "כהה",
    settingsNotifMessages: "הודעות חדשות",
    settingsNotifMessagesSub: "התראה על צ'אט נכנס",
    settingsNotifProjects: "עדכוני פרויקט",
    settingsNotifProjectsSub: "הצטרפות / עזיבה של חברים",
    settingsNotifCommunity: "פרויקטים חדשים בקהילה",
    settingsPrivacyProfile: "נראות פרופיל",
    settingsPrivacyProfileSub: "מי יכול לראות את הפרופיל שלך",
    settingsPrivacyPublic: "ציבורי",
    settingsPrivacyMembers: "חברים בלבד",
    settingsAboutVersion: "גרסה",
    settingsAboutTerms: "תנאי שימוש",
    settingsAboutContact: "צור קשר",
    settingsLogout: "התנתקות",
  },
  en: {
    // ── Sidebar / navigation ──
    sidebarTitle: "The Kibbutz",
    sidebarSub: "COMMUNITY COLLABORATION",
    navGroupCommunity: "Community",
    navGroupManage: "Manage",
    explore: "Explore Projects",
    feed: "Feed",
    portfolios: "Portfolios",
    myPortfolio: "My Portfolio",
    myProjects: "My Projects",
    applicationsReceived: "Requests to my projects",
    myApplications: "My Applications",
    teams: "Teams",
    messages: "Messages",
    friends: "Friends",
    profile: "Profile",
    settings: "Settings",
    createNewProject: "New Project",
    guest: "Guest",
    communityMember: "Community member",
    admin: "Admin",

    // ── Explore / home ──
    exploreTitle: "Explore Projects",
    exploreSub: "Find community projects looking for members, and contribute your skills.",
    searchProjects: "Search by name, description or technology...",
    domainAll: "All",
    domainEco: "Eco",
    domainAI: "AI",
    domainData: "Data",
    domainWeb3: "Web3 / Global",
    projectsCount: "{count} projects",
    noProjectsFound: "No matching projects",
    noProjectsFoundSub: "Try a different search term or another domain.",
    leadBy: "Lead: {name}",
    joinProject: "Join",
    fullTeam: "Full",

    // ── My projects ──
    myPortfolioSub: "The portfolio items you published.",
    browseAllPortfolios: "Browse all",
    myPortfolioEmpty: "No portfolio items yet",
    myPortfolioEmptySub: "Create one to show your work to the community.",
    hubSubtitle: "Manage all your project workflows.",
    hubTabProjects: "My Projects",
    hubTabRequests: "Join Requests",
    hubTabApplications: "Open Applications",
    hubTabTeams: "My Teams",
    myTeamsEmpty: "You are not part of any team yet",
    myTeamsEmptySub: "Join or create a project — its team will show up here.",
    myTeamsRole: "Your role: {role}",
    myProjectsSub: "Projects you created and ones you joined.",
    myProjectsCreated: "Created ({count})",
    myProjectsJoined: "Joined ({count})",
    myProjectsEmpty: "No projects yet",
    myProjectsEmptySub: "Create a new project or join one from the discover page.",
    membersCount: "Members: {current}/{max}",
    loadError: "Failed to load projects",

    // ── Teams ──
    teamsSub: "Join community teams by area of interest.",
    teamMembers: "{count} members",

    // ── Friends ──
    friendsSub: "Project connections, followers and friend requests.",
    friendsConnections: "Project Connections",
    friendsFollowing: "Following",
    friendsFollowers: "Followers",
    followBtn: "Follow",
    followingBtn: "Following",

    // ── Settings ──
    settingsAppearance: "Appearance",
    settingsNotifications: "Notifications",
    settingsPrivacy: "Privacy",
    settingsAbout: "About",
    settingsLang: "Language",
    settingsLangSub: "Interface language",
    settingsTheme: "Color theme",
    settingsThemeSub: "Choose display mode",
    settingsThemeLight: "Light",
    settingsThemeDark: "Dark",
    settingsNotifMessages: "New messages",
    settingsNotifMessagesSub: "Notify on incoming chat",
    settingsNotifProjects: "Project updates",
    settingsNotifProjectsSub: "Members joining or leaving",
    settingsNotifCommunity: "New community projects",
    settingsPrivacyProfile: "Profile visibility",
    settingsPrivacyProfileSub: "Who can see your profile",
    settingsPrivacyPublic: "Public",
    settingsPrivacyMembers: "Members only",
    settingsAboutVersion: "Version",
    settingsAboutTerms: "Terms of use",
    settingsAboutContact: "Contact us",
    settingsLogout: "Log out",
  },
} as const;

// Merge the core strings with every per-area fragment.
export const dictionary = {
  he: { ...core.he, ...social.he, ...profile.he, ...messages.he, ...projectsNda.he, ...misc.he, ...auth.he },
  en: { ...core.en, ...social.en, ...profile.en, ...messages.en, ...projectsNda.en, ...misc.en, ...auth.en },
};

export type TranslationKey = keyof typeof core.he;
