// הקיבוץ – i18n dictionary (he / en)
// Hebrew is the default. Seeded from the original bilingual app (v2) and
// extended for the new route structure. Add a key to BOTH maps.

export type Lang = "he" | "en";

export const dictionary = {
  he: {
    // ── Sidebar / navigation ──
    sidebarTitle: "הקיבוץ",
    sidebarSub: "שיתוף פעולה קהילתי",
    explore: "גלה פרויקטים",
    feed: "פיד",
    portfolios: "תיקי עבודות",
    myProjects: "הפרויקטים שלי",
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
    comingSoon: "בקרוב",

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

    // ── Coming-soon banner ──
    comingSoonBanner: "{feature} — הפיצ'ר הזה עדיין לא מחובר לשרת. התצוגה להמחשה בלבד.",
  },
  en: {
    // ── Sidebar / navigation ──
    sidebarTitle: "The Kibbutz",
    sidebarSub: "COMMUNITY COLLABORATION",
    explore: "Explore Projects",
    feed: "Feed",
    portfolios: "Portfolios",
    myProjects: "My Projects",
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
    comingSoon: "Soon",

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

    // ── Coming-soon banner ──
    comingSoonBanner: "{feature} — this feature isn't connected to the server yet. Preview only.",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["he"];
