"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Search,
  Plus,
  Users,
  LogOut,
  Compass,
  Check,
  UserPlus,
  X,
  Sparkles,
  Info,
  Bell,
  SlidersHorizontal,
  MessageSquare,
  User,
  Leaf,
  Cpu,
  Database,
  Globe,
  ChevronDown,
  Send,
  Camera,
  ImagePlus,
  Paperclip,
  FileText,
  Trash2,
  Upload,
  AlertTriangle,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import FriendsTab from "@/components/FriendsTab";
import DashboardSidebar, { type DashboardTab } from "@/components/DashboardSidebar";
import FeedView from "@/components/views/FeedView";
import PortfoliosView from "@/components/views/PortfoliosView";
import ComingSoonBanner from "@/components/ComingSoonBanner";

// Types
interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  members: string[];
  memberRoles: Record<string, string>;
  owner: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  iconType: "leaf" | "cpu" | "database" | "globe";
  statusText: string;
  comments: Comment[];
  coverImage?: string;
}

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: "join" | "comment" | "invite" | "update";
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  lastMessage: string;
  unread: boolean;
  messages: ChatMessage[];
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  tags: string[];
  membersCount: number;
  membersAvatars: string[];
  projectsCount: number;
  members: TeamMember[];
}

type ActiveTab = DashboardTab;
type SettingsTab = "profile" | "appearance" | "notifications" | "privacy" | "about";
type ProjectIconType = "leaf" | "cpu" | "database" | "globe";

// English and Hebrew User profiles
const CURRENT_USER_DATA = {
  en: {
    id: "user-1",
    name: "Ariel Zohar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    role: "Fullstack Developer",
    skills: "Next.js, React, Node.js, Tailwind"
  },
  he: {
    id: "user-1",
    name: "אריאל זוהר",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    role: "מפתח פולסטאק",
    skills: "Next.js, React, Node.js, Tailwind"
  }
};

// Initial English Mock Data
const PROJECTS_EN: Project[] = [
  {
    id: "1",
    title: "Green Tech App",
    description: "Sustainable solutions for smart cities. Develop eco-friendly platforms to optimize community energy consumption.",
    tags: ["Next.js", "React", "Eco-Tech"],
    maxMembers: 5,
    members: ["user-1", "user-2", "user-3"],
    memberRoles: {
      "user-1": "Fullstack Developer",
      "user-2": "UI/UX Designer",
      "user-3": "Product Manager"
    },
    owner: { name: "Guy Levi", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Online",
    iconType: "leaf",
    statusText: "Online",
    comments: [
      {
        id: "c1",
        userId: "user-2",
        userName: "Shira Mendel",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "Hey team, finished designing the homepages in Figma! Will upload the link soon.",
        createdAt: "1 hour ago"
      },
      {
        id: "c2",
        userId: "user-3",
        userName: "Amit Shalom",
        userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
        text: "Great Shira. Ariel (user-1) - can you start building the Layout in Next.js?",
        createdAt: "30 mins ago"
      }
    ]
  },
  {
    id: "2",
    title: "Creative AI Helper",
    description: "AI-powered tools for content creators. Generate customized assets and texts on the fly using LLM models.",
    tags: ["AI", "ML", "Figma"],
    maxMembers: 4,
    members: ["user-2"],
    memberRoles: { "user-2": "AI Researcher" },
    owner: { name: "Daniel Cohen", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Online",
    iconType: "cpu",
    statusText: "Online",
    comments: [
      {
        id: "c3",
        userId: "user-2",
        userName: "Shira Mendel",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "Sounds like an awesome idea, happy to design the creator interface.",
        createdAt: "Yesterday"
      }
    ]
  },
  {
    id: "3",
    title: "DataFlow Dashboard",
    description: "Real-time analytics visualization. A platform to showcase advanced datasets and live metrics reporting.",
    tags: ["Python", "Vue.js", "Data Science"],
    maxMembers: 6,
    members: ["user-3", "user-4"],
    memberRoles: {
      "user-3": "Data Analyst",
      "user-4": "Frontend Engineer"
    },
    owner: { name: "Michal Raz", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Project Updates",
    iconType: "database",
    statusText: "Online",
    comments: []
  },
  {
    id: "4",
    title: "ArtSphere Platform",
    description: "Decentralized marketplace for digital art. Showcase and trade unique digital designs on the chain.",
    tags: ["Web3", "Blockchain", "Design"],
    maxMembers: 5,
    members: ["user-1", "user-3", "user-4", "user-5"],
    memberRoles: {
      "user-1": "Fullstack Lead",
      "user-3": "Smart Contract Dev",
      "user-4": "Frontend Dev",
      "user-5": "Community Specialist"
    },
    owner: { name: "Oren Barak", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Online",
    iconType: "globe",
    statusText: "Online",
    comments: [
      {
        id: "c4",
        userId: "user-5",
        userName: "Niv Geva",
        userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        text: "We started drafting the Whitepaper for this project. Check it out.",
        createdAt: "3 days ago"
      }
    ]
  }
];

// Initial Hebrew Mock Data
const PROJECTS_HE: Project[] = [
  {
    id: "1",
    title: "Green Tech App",
    description: "Sustainable solutions for smart cities. פיתוח פתרונות ירוקים ואקולוגיים לייעול צריכת אנרגיה עירונית.",
    tags: ["Next.js", "React", "Eco-Tech"],
    maxMembers: 5,
    members: ["user-1", "user-2", "user-3"],
    memberRoles: {
      "user-1": "מפתח פולסטאק",
      "user-2": "מעצבת ממשק UI/UX",
      "user-3": "מנהל מוצר"
    },
    owner: { name: "גיא לוי", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Online",
    iconType: "leaf",
    statusText: "Online",
    comments: [
      {
        id: "c1",
        userId: "user-2",
        userName: "שירה מנדל",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "היי צוות, סיימתי לעצב את דפי הבית בפיגמה! אעלה קישור בקרוב.",
        createdAt: "לפני שעה"
      },
      {
        id: "c2",
        userId: "user-3",
        userName: "עמית שלום",
        userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
        text: "מעולה שירה. אריאל (user-1) - תוכל להתחיל להרים את ה-Layout ב-Next.js?",
        createdAt: "לפני חצי שעה"
      }
    ]
  },
  {
    id: "2",
    title: "Creative AI Helper",
    description: "AI-powered tools for content creators. מערכת בינה מלאכותית ליצירת תכנים מותאמים אישית במהירות.",
    tags: ["AI", "ML", "Figma"],
    maxMembers: 4,
    members: ["user-2"],
    memberRoles: { "user-2": "חוקרת בינה מלאכותית" },
    owner: { name: "דניאל כהן", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Online",
    iconType: "cpu",
    statusText: "Online",
    comments: [
      {
        id: "c3",
        userId: "user-2",
        userName: "שירה מנדל",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "נשמע רעיון אדיר, אשמח לעזור בעיצוב הממשק ליוצרים.",
        createdAt: "אתמול"
      }
    ]
  },
  {
    id: "3",
    title: "DataFlow Dashboard",
    description: "Real-time analytics visualization. פלטפורמה להצגת נתונים ואנליטיקות מתקדמות בזמן אמת.",
    tags: ["Python", "Vue.js", "Data Science"],
    maxMembers: 6,
    members: ["user-3", "user-4"],
    memberRoles: {
      "user-3": "אנליסט נתונים",
      "user-4": "מפתח קצה"
    },
    owner: { name: "מיכל רז", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Project Updates",
    iconType: "database",
    statusText: "Online",
    comments: []
  },
  {
    id: "4",
    title: "ArtSphere Platform",
    description: "Decentralized marketplace for digital art. פלטפורמת מסחר מבוזרת ליצירות אמנות דיגיטליות.",
    tags: ["Web3", "Blockchain", "Design"],
    maxMembers: 5,
    members: ["user-1", "user-3", "user-4", "user-5"],
    memberRoles: {
      "user-1": "מוביל פולסטאק",
      "user-3": "מפתח חוזים חכמים",
      "user-4": "מפתח קצה",
      "user-5": "מנהל קהילה"
    },
    owner: { name: "אורן ברק", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    createdAt: "Online",
    iconType: "globe",
    statusText: "Online",
    comments: [
      {
        id: "c4",
        userId: "user-5",
        userName: "ניב גבע",
        userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        text: "התחלנו לגבש את ה-Whitepaper לפרויקט. כולם מוזמנים לעבור עליו.",
        createdAt: "לפני 3 ימים"
      }
    ]
  }
];

// Initial Chats Mock Data (EN & HE)
const CHATS_EN: ChatSession[] = [
  {
    id: "chat-1",
    userId: "user-2",
    userName: "Shira Mendel",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    userRole: "Product Designer",
    lastMessage: "Hey Ariel, can you look at the homepage design?",
    unread: true,
    messages: [
      { id: "m1", senderId: "user-2", text: "Hey Ariel! How is it going?", time: "18:30" },
      { id: "m2", senderId: "user-1", text: "Great Shira, how about you? How are the layouts?", time: "18:32" },
      { id: "m3", senderId: "user-2", text: "Going well. Finished card layouts in Figma.", time: "18:35" },
      { id: "m4", senderId: "user-2", text: "Hey Ariel, can you look at the homepage design?", time: "18:36" }
    ]
  },
  {
    id: "chat-2",
    userId: "user-3",
    userName: "Amit Shalom",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    userRole: "Product Manager",
    lastMessage: "Sure, sounds good. Let's sync tomorrow morning.",
    unread: false,
    messages: [
      { id: "m5", senderId: "user-3", text: "Hi Ariel, saw that you joined Green Tech App.", time: "14:15" },
      { id: "m6", senderId: "user-1", text: "Yes Amit! Looks like an essential project for our kibbutz. Happy to code this.", time: "14:20" },
      { id: "m7", senderId: "user-3", text: "Sure, sounds good. Let's sync tomorrow morning.", time: "14:22" }
    ]
  }
];

const CHATS_HE: ChatSession[] = [
  {
    id: "chat-1",
    userId: "user-2",
    userName: "שירה מנדל",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    userRole: "מעצבת מוצר",
    lastMessage: "היי אריאל, תוכל להציץ בעיצוב של דף הבית?",
    unread: true,
    messages: [
      { id: "m1", senderId: "user-2", text: "היי אריאל! מה נשמע?", time: "18:30" },
      { id: "m2", senderId: "user-1", text: "מעולה שירה, מה איתך? איך הולך עם העיצובים?", time: "18:32" },
      { id: "m3", senderId: "user-2", text: "מתקדם מצוין. סיימתי לעבוד על כרטיסיות הפרויקטים בפיגמה.", time: "18:35" },
      { id: "m4", senderId: "user-2", text: "היי אריאל, תוכל להציץ בעיצוב של דף הבית?", time: "18:36" }
    ]
  },
  {
    id: "chat-2",
    userId: "user-3",
    userName: "עמית שלום",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    userRole: "מנהל מוצר",
    lastMessage: "סגור, נשמע מעולה. נתאם פגישה למחר בבוקר.",
    unread: false,
    messages: [
      { id: "m5", senderId: "user-3", text: "אהלן אריאל, ראיתי שהצטרפת ל-Green Tech App.", time: "14:15" },
      { id: "m6", senderId: "user-1", text: "כן עמית! נראה פרויקט סופר חשוב לקיבוץ. אשמח להוביל את פיתוח הקוד.", time: "14:20" },
      { id: "m7", senderId: "user-3", text: "סגור, נשמע מעולה. נתאם פגישה למחר בבוקר.", time: "14:22" }
    ]
  }
];

// Initial Teams Mock Data (EN & HE)
const TEAMS_EN: Team[] = [
  {
    id: "team-1",
    name: "Software Dev Hub",
    description: "The technological incubation team. Developing community platforms, internal apps, and open-source stacks.",
    tags: ["Next.js", "React", "Python", "Docker"],
    membersCount: 12,
    membersAvatars: [
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80"
    ],
    projectsCount: 3,
    members: [
      { id: "user-1", name: "Ariel Zohar", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=80", role: "Fullstack Developer" },
      { id: "user-3", name: "Amit Shalom", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80", role: "Backend Lead" },
      { id: "user-5", name: "Niv Geva", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80", role: "Frontend Dev" },
      { id: "user-2", name: "Shira Mendel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: "Product Designer" }
    ]
  },
  {
    id: "team-2",
    name: "Eco Initiative Circle",
    description: "Thinking and acting green. Focused on transition to solar energy, community farming, and water recycling.",
    tags: ["Eco-Tech", "Smart Grid", "Permaculture"],
    membersCount: 8,
    membersAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    ],
    projectsCount: 1,
    members: [
      { id: "user-2", name: "Shira Mendel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: "Initiative Lead" },
      { id: "user-4", name: "Yael Gazit", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", role: "Eco Consultant" },
      { id: "user-6", name: "Roni Sela", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", role: "Community Farmer" }
    ]
  },
  {
    id: "team-3",
    name: "UX/UI Creators",
    description: "Aligning creative designs, Figma mockups, and neat interfaces for all community digital products.",
    tags: ["Figma", "Design Systems", "UX Research"],
    membersCount: 6,
    membersAvatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
    ],
    projectsCount: 2,
    members: [
      { id: "user-2", name: "Shira Mendel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: "Lead Designer" },
      { id: "user-4", name: "Yael Gazit", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", role: "UX Designer" }
    ]
  }
];

const TEAMS_HE: Team[] = [
  {
    id: "team-1",
    name: "צוות פיתוח תוכנה (Software Dev)",
    description: "חממת הפיתוח הטכנולוגי של הקיבוץ. מפתחים פלטפורמות קהילתיות, אפליקציות שירות פנימיות ומערכות קוד פתוח.",
    tags: ["Next.js", "React", "Python", "Docker"],
    membersCount: 12,
    membersAvatars: [
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80"
    ],
    projectsCount: 3,
    members: [
      { id: "user-1", name: "אריאל זוהר", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=80", role: "מפתח פולסטאק" },
      { id: "user-3", name: "עמית שלום", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80", role: "ראש צוות בקאנד" },
      { id: "user-5", name: "ניב גבע", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80", role: "מפתח קצה" },
      { id: "user-2", name: "שירה מנדל", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: "מעצבת מוצר" }
    ]
  },
  {
    id: "team-2",
    name: "יוזמת אקולוגיה וקיימות (Eco Initiative)",
    description: "קבוצת חשיבה ועשייה אקולוגית. מתמקדים במעבר לאנרגיה סולארית, ניהול גינות קהילתיות ומיחזור מים.",
    tags: ["Eco-Tech", "Smart Grid", "Permaculture"],
    membersCount: 8,
    membersAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    ],
    projectsCount: 1,
    members: [
      { id: "user-2", name: "שירה מנדל", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: "מובילת יוזמה" },
      { id: "user-4", name: "יעל גזית", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", role: "יועצת אנרגיה ירוקה" },
      { id: "user-6", name: "רוני סלע", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", role: "חקלאי קהילתי" }
    ]
  },
  {
    id: "team-3",
    name: "קהילת מעצבי מוצר (UX/UI Creators)",
    description: "מאחדים כוחות כדי ליצור ממשקים מרהיבים, מוקאפים בפיגמה וסגנונות עיצוב נקיים עבור כל מוצרי הקהילה.",
    tags: ["Figma", "Design Systems", "UX Research"],
    membersCount: 6,
    membersAvatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
    ],
    projectsCount: 2,
    members: [
      { id: "user-2", name: "שירה מנדל", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: "מעצבת מוצר ראשית" },
      { id: "user-4", name: "יעל גזית", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", role: "מעצבת ממשק" }
    ]
  }
];

const MOCK_USERS_DATA = {
  en: {
    "user-1": { name: "Ariel Zohar", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    "user-2": { name: "Shira Mendel", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" },
    "user-3": { name: "Amit Shalom", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
    "user-4": { name: "Yael Gazit", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80" },
    "user-5": { name: "Niv Geva", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" }
  },
  he: {
    "user-1": { name: "אריאל זוהר", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    "user-2": { name: "שירה מנדל", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" },
    "user-3": { name: "עמית שלום", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
    "user-4": { name: "יעל גזית", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80" },
    "user-5": { name: "ניב גבע", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" }
  }
};

// UI Dictionaries
const TRANSLATIONS = {
  en: {
    sidebarTitle: "The Kibbutz",
    sidebarSub: "PROJECT HUB",
    explore: "Explore",
    myProjects: "My Projects",
    teams: "Teams",
    messages: "Messages",
    profile: "Profile",
    exploreProjects: "Explore Projects",
    exploreSub: "Join new initiatives or launch your own project",
    myProjectsSub: "Track initiatives you started or joined",
    teamsSub: "Connect with specialized working groups",
    messagesSub: "Direct messaging workspace",
    profileSub: "Configure your personal information",
    searchPlaceholder: "Search projects, members...",
    createNewProject: "Create New Project",
    all: "All",
    joinProject: "Join Project",
    leaveProject: "Leave Project",
    fullTeam: "Full Team",
    members: "members",
    close: "Close",
    cancel: "Cancel",
    create: "Create",
    aboutProject: "About Project",
    teamMembers: "Team Members",
    discussionBoard: "Discussion & Updates",
    commentPlaceholder: "Write an update or comment...",
    projectLead: "Project Lead",
    noComments: "No updates in this group yet. Be the first!",
    comingSoon: "Coming Soon!",
    comingSoonDesc: "This tab is currently under development.",
    noProjectsFound: "No projects found",
    searchAlternative: "Try modifying your search or create a new project.",
    fullName: "Full Name",
    jobTitle: "Job Title / Role",
    avatarUrl: "Avatar Image URL",
    techSkills: "Technical Skills (comma separated)",
    saveChanges: "Save Changes",
    projectName: "Project Name *",
    projectDesc: "Project Description *",
    projectTags: "Tags (comma separated)",
    maxMembers: "Max Members Limit",
    projectIcon: "Project Icon",
    leafLabel: "Leaf (Eco)",
    cpuLabel: "CPU (AI)",
    databaseLabel: "Data",
    globeLabel: "Network",
    toastProfileSaved: "Profile updated successfully!",
    toastJoined: 'Joined project "{title}" successfully!',
    toastLeft: 'Left project "{title}"',
    toastFull: "Project is full!",
    toastCreated: 'Project "{title}" created successfully!',
    toastMissingFields: "Please fill in all required fields",
    toastJoinedTeam: 'Joined team "{name}"',
    typeMessage: "Type a message...",
    conversations: "Conversations",
    selectChat: "Select a conversation from the list",
    me: "Me",
    active: "Active",
    friends: "Friends",
    friendsSub: "People you've connected with and follow",
    friendsConnections: "Project Connections",
    friendsFollowing: "Following",
    friendsFollowers: "Followers",
    followBtn: "Follow",
    followingBtn: "Following",
    settings: "Settings",
    settingsProfile: "Profile",
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
  he: {
    sidebarTitle: "הקיבוץ",
    sidebarSub: "שיתוף פעולה קהילתי",
    explore: "גלה פרויקטים",
    myProjects: "הפרויקטים שלי",
    teams: "צוותים",
    messages: "הודעות",
    profile: "פרופיל אישי",
    exploreProjects: "גלה פרויקטים משותפים",
    exploreSub: "הצטרף ליוזמות חדשות בקיבוץ או פתח פרויקט משלך",
    myProjectsSub: "עקוב אחר יוזמות שהקמת או הצטרפת אליהן",
    teamsSub: "חיבור עם צוותי עבודה מתמחים בקהילה",
    messagesSub: "אזור שיחות והודעות ישירות",
    profileSub: "הגדר את המידע האישי והכישורים המקצועיים שלך",
    searchPlaceholder: "חפש פרויקטים, חברי צוות...",
    createNewProject: "פרויקט חדש",
    all: "הכל",
    joinProject: "הצטרף לפרויקט",
    leaveProject: "עזוב פרויקט",
    fullTeam: "מלא",
    members: "חברים",
    close: "סגור",
    cancel: "ביטול",
    create: "צור",
    aboutProject: "אודות הפרויקט",
    teamMembers: "חברי הצוות",
    discussionBoard: "דיונים ועדכונים קבוצתיים",
    commentPlaceholder: "כתוב עדכון או תגובה...",
    projectLead: "מוביל הפרויקט",
    noComments: "אין עדכונים בקבוצה עדיין. היה הראשון לכתוב!",
    comingSoon: "בקרוב!",
    comingSoonDesc: "מסך זה נמצא כרגע בפיתוח במסגרת האפיון.",
    noProjectsFound: "לא נמצאו פרויקטים",
    searchAlternative: "נסה לשנות את מונחי החיפוש או ליצור פרויקט חדש בעצמך.",
    fullName: "שם מלא",
    jobTitle: "תפקיד / כותרת מקצועית",
    avatarUrl: "תמונת פרופיל (קישור לתמונה)",
    techSkills: "כישורים טכנולוגיים (מופרדים בפסיק)",
    saveChanges: "שמור שינויים בפרופיל",
    projectName: "שם הפרויקט *",
    projectDesc: "תיאור הפרויקט *",
    projectTags: "תגיות (מופרדות בפסיק)",
    maxMembers: "מגבלת חברים (מקסימום)",
    projectIcon: "סמל פרויקט (אייקון)",
    leafLabel: "עלה (Eco)",
    cpuLabel: "מעבד (AI)",
    databaseLabel: "נתונים",
    globeLabel: "רשת/גלובל",
    toastProfileSaved: "הפרופיל עודכן בהצלחה!",
    toastJoined: 'הצטרפת לפרויקט "{title}" בהצלחה!',
    toastLeft: 'עזבת את הפרויקט "{title}"',
    toastFull: "הפרויקט מלא!",
    toastCreated: 'הפרויקט "{title}" נוצר בהצלחה!',
    toastMissingFields: "אנא מלא את כל שדות החובה",
    toastJoinedTeam: 'הצטרפת לצוות "{name}"',
    typeMessage: "כתוב הודעה...",
    conversations: "Conversations",
    selectChat: "בחר שיחה מהרשימה",
    me: "אני",
    active: "פעיל",
    friends: "חברים",
    friendsSub: "אנשים שעבדת איתם ואנשים שאתה עוקב אחריהם",
    friendsConnections: "קשרים מפרויקטים",
    friendsFollowing: "עוקב אחרי",
    friendsFollowers: "עוקבים",
    followBtn: "עקוב",
    followingBtn: "עוקב",
    settings: "הגדרות",
    settingsProfile: "פרופיל",
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
  }
};

export default function Home() {
  const router = useRouter();
  // ── Store wiring ──────────────────────────────────────────────
  const authUser    = useAuthStore(s => s.user);
  const authLogout  = useAuthStore(s => s.logout);
  const storeProjects    = useProjectStore(s => s.projects);
  const storeSetProjects = useProjectStore(s => s.setProjects);
  // TODO: replace mock seed + localStorage with fetchProjects() when backend is ready
  // ─────────────────────────────────────────────────────────────

  const [lang, setLang] = useState<"en" | "he">(() => {
    if (typeof window === "undefined") return "he";
    return (localStorage.getItem("new-kibbutz-lang") as "en" | "he") ?? "he";
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("new-kibbutz-theme") === "dark";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("new-kibbutz-sidebar-collapsed") === "true";
  });
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("appearance");
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifProjects, setNotifProjects] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [privacyPublic, setPrivacyPublic] = useState(true);

  // Dynamic mock states
  const [projects, setProjects] = useState<Project[]>(PROJECTS_EN);
  const [chats, setChats] = useState<ChatSession[]>(CHATS_EN);
  const [teams, setTeams] = useState<Team[]>(TEAMS_EN);

  // App states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [activeTab, setActiveTab] = useState<ActiveTab>("explore");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // item 23 – advanced filter panel
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");
  const [filterTeamSize, setFilterTeamSize] = useState<"all" | "small" | "medium" | "large">("all");
  // item 22 – multi-select tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // item 28 – feed error state (set true to simulate / will be set by real fetch failure)
  const [feedError, setFeedError] = useState(false);
  // domain filter – maps to project iconType
  const [filterDomain, setFilterDomain] = useState<"all" | "leaf" | "cpu" | "database" | "globe">("all");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  // notifications dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", text: "גיא לוי הצטרף לפרויקט Green Tech App", time: "לפני 5 דקות", read: false, type: "join" },
    { id: "n2", text: "שירה מנדל הגיבה בקבוצת ArtSphere Platform", time: "לפני שעה", read: false, type: "comment" },
    { id: "n3", text: "הוזמנת להצטרף לפרויקט DataFlow Dashboard", time: "לפני 3 שעות", read: false, type: "invite" },
    { id: "n4", text: "עדכון חדש בפרויקט Creative AI Helper", time: "אתמול", read: true, type: "update" },
  ]);

  // Active sub-panels
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activeChatId, setActiveChatId] = useState<string>("chat-1");
  const [chatInput, setChatInput] = useState("");
  const [projectCommentInput, setProjectCommentInput] = useState("");

  // Current User settings (editable) — prefer auth store values when available
  const [profileName, setProfileName] = useState(authUser?.name ?? CURRENT_USER_DATA.en.name);
  const [profileRole, setProfileRole] = useState(CURRENT_USER_DATA.en.role);
  const [profileAvatar, setProfileAvatar] = useState(authUser?.avatar || CURRENT_USER_DATA.en.avatar);
  const [profileSkills, setProfileSkills] = useState(CURRENT_USER_DATA.en.skills);

  // New Project State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newLimit, setNewLimit] = useState(5);
  const [newIcon, setNewIcon] = useState<ProjectIconType>("leaf");
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string>("");
  const [newDocs, setNewDocs] = useState<File[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keep selectedProject reference up-to-date with projects state changes
  useEffect(() => {
    if (selectedProject) {
      const found = projects.find((p) => p.id === selectedProject.id);
      if (found) {
        if (JSON.stringify(found) !== JSON.stringify(selectedProject)) {
          setSelectedProject(found);
        }
      }
    }
  }, [projects, selectedProject?.id]);

  // Load configuration from local storage
  useEffect(() => {
    const savedLang = localStorage.getItem("new-kibbutz-lang") as "en" | "he" | null;
    if (savedLang) {
      setLang(savedLang);
    }
    const savedTheme = localStorage.getItem("new-kibbutz-theme");
    if (savedTheme === "light") {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem("new-kibbutz-theme", nextTheme ? "dark" : "light");
  };

  const loadLocalData = () => {
    const localProjects = localStorage.getItem(`new-kibbutz-projects-v4-${lang}`);
    const localChats = localStorage.getItem(`new-kibbutz-chats-v4-${lang}`);
    const nextProjects = localProjects ? JSON.parse(localProjects) : (lang === "en" ? PROJECTS_EN : PROJECTS_HE);

    setProjects(nextProjects);
    setChats(localChats ? JSON.parse(localChats) : (lang === "en" ? CHATS_EN : CHATS_HE));

    if (selectedProject) {
      const found = nextProjects.find((p: Project) => p.id === selectedProject.id);
      if (found) setSelectedProject(found);
    }
  };

  // Update dynamic mock states based on selected language
  useEffect(() => {
    const localUser = localStorage.getItem(`new-kibbutz-user-v4-${lang}`);

    if (localUser) {
      const u = JSON.parse(localUser);
      setProfileName(u.name);
      setProfileRole(u.role);
      setProfileAvatar(u.avatar);
      setProfileSkills(u.skills);
    } else {
      const defaultUser = CURRENT_USER_DATA[lang];
      setProfileName(defaultUser.name);
      setProfileRole(defaultUser.role);
      setProfileAvatar(defaultUser.avatar);
      setProfileSkills(defaultUser.skills);
    }

    setTeams(lang === "en" ? TEAMS_EN : TEAMS_HE);
    setSelectedTag(lang === "en" ? "All" : "הכל");

    loadLocalData();
  }, [lang]);

  // Seed project store with displayed projects (mock until backend is wired)
  useEffect(() => {
    if (storeProjects.length === 0 && projects.length > 0) {
      storeSetProjects(projects as import("@/store/useProjectStore").Project[]);
    }
  }, [projects]);

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeChatId, activeTab]);

  // reset pagination when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedTags, filterTeamSize, filterDomain, activeTab]);

  // open a specific tab from ?tab= (used by /feed and /portfolios redirects)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "feed" || tab === "portfolios") setActiveTab(tab);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "he" : "en";
    setLang(nextLang);
    localStorage.setItem("new-kibbutz-lang", nextLang);
  };

  const t = TRANSLATIONS[lang];
  const mockUsers = MOCK_USERS_DATA[lang] as Record<string, { name: string; avatar: string }>;

  const saveProjects = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem(`new-kibbutz-projects-v4-${lang}`, JSON.stringify(updated));
    // TODO: remove localStorage sync when backend is wired; store will be populated by fetchProjects()
    storeSetProjects(updated as import("@/store/useProjectStore").Project[]);
  };

  const saveChats = (updated: ChatSession[]) => {
    setChats(updated);
    localStorage.setItem(`new-kibbutz-chats-v4-${lang}`, JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleJoinLeave = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = projects.map(proj => {
      if (proj.id === projectId) {
        const isMember = proj.members.includes("user-1");
        if (isMember) {
          triggerToast(t.toastLeft.replace("{title}", proj.title));
          const newMembers = proj.members.filter(m => m !== "user-1");
          const newRoles = { ...proj.memberRoles };
          delete newRoles["user-1"];
          return { ...proj, members: newMembers, memberRoles: newRoles };
        } else {
          if (proj.members.length >= proj.maxMembers) {
            triggerToast(t.toastFull);
            return proj;
          }
          triggerToast(t.toastJoined.replace("{title}", proj.title));
          return {
            ...proj,
            members: [...proj.members, "user-1"],
            memberRoles: { ...proj.memberRoles, "user-1": profileRole }
          };
        }
      }
      return proj;
    });
    saveProjects(updated);
    if (selectedProject?.id === projectId) {
      const found = updated.find(p => p.id === projectId);
      if (found) setSelectedProject(found);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCommentInput.trim() || !selectedProject) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: "user-1",
      userName: profileName,
      userAvatar: profileAvatar,
      text: projectCommentInput,
      createdAt: lang === "en" ? "Just now" : "כרגע"
    };
    const updated = projects.map(proj => {
      if (proj.id === selectedProject.id) {
        return { ...proj, comments: [...proj.comments, newComment] };
      }
      return proj;
    });
    saveProjects(updated);
    const found = updated.find(p => p.id === selectedProject.id);
    if (found) setSelectedProject(found);
    setProjectCommentInput("");
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: "user-1",
      text: chatInput,
      time: new Date().toLocaleTimeString(lang === "en" ? "en-US" : "he-IL", { hour: "2-digit", minute: "2-digit" })
    };
    const updated = chats.map(session => {
      if (session.id === activeChatId) {
        return {
          ...session,
          lastMessage: chatInput,
          messages: [...session.messages, newMsg]
        };
      }
      return session;
    });
    saveChats(updated);
    setChatInput("");
  };
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const u = { name: profileName, role: profileRole, avatar: profileAvatar, skills: profileSkills };
    localStorage.setItem(`new-kibbutz-user-v4-${lang}`, JSON.stringify(u));
    triggerToast(t.toastProfileSaved);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      triggerToast(t.toastMissingFields);
      return;
    }

    const tagsArray = newTags.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const newProj: Project = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      tags: tagsArray.length > 0 ? tagsArray : ["General"],
      maxMembers: Number(newLimit) || 5,
      members: ["user-1"],
      memberRoles: { "user-1": profileRole },
      owner: { name: profileName, avatar: profileAvatar },
      createdAt: "Online",
      iconType: newIcon,
      statusText: "Online",
      comments: []
    };
    saveProjects([newProj, ...projects]);
    setIsModalOpen(false);
    triggerToast(t.toastCreated.replace("{title}", newTitle));
    setNewTitle("");
    setNewDesc("");
    setNewTags("");
    setNewLimit(5);
    setNewIcon("leaf");
    setNewCoverImage(null);
    setNewCoverPreview("");
    setNewDocs([]);
    // TODO: upload newCoverImage + newDocs to Firebase Storage / backend
    // then attach URLs to the project document
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewCoverImage(file);
    setNewCoverPreview(URL.createObjectURL(file));
  };

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewDocs(prev => [...prev, ...files].slice(0, 5)); // max 5 docs
  };

  const removeDoc = (index: number) => setNewDocs(prev => prev.filter((_, i) => i !== index));
  const allTags = [lang === "en" ? "All" : "הכל", ...Array.from(new Set(projects.flatMap(p => p.tags)))];
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const filteredProjects = projects.filter(proj => {
    const matchesSearch =
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // item 22 – multi-select tags
    const matchesTag = selectedTags.length === 0 || selectedTags.every(t => proj.tags.includes(t));

    const matchesTab =
      activeTab === "explore" ||
      (activeTab === "my-projects" && proj.members.includes("user-1"));

    // item 23 – advanced filters
    const memberCount = proj.members.length;
    const matchesTeamSize =
      filterTeamSize === "all" ||
      (filterTeamSize === "small" && memberCount <= 2) ||
      (filterTeamSize === "medium" && memberCount >= 3 && memberCount <= 5) ||
      (filterTeamSize === "large" && memberCount > 5);

    const matchesDomain = filterDomain === "all" || proj.iconType === filterDomain;

    return matchesSearch && matchesTag && matchesTab && matchesTeamSize && matchesDomain;
  });

  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
  const pagedProjects = filteredProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const renderProjectIcon = (type: "leaf" | "cpu" | "database" | "globe") => {
    const baseClass = "w-5 h-5";
    switch (type) {
      case "leaf": return <Leaf className={`${baseClass} text-secondary`} />;
      case "cpu": return <Cpu className={`${baseClass} text-primary`} />;
      case "database": return <Database className={`${baseClass} text-accent`} />;
      case "globe": return <Globe className={`${baseClass} text-secondary`} />;
    }
  };

  const activeChatSession = chats.find(c => c.id === activeChatId);

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans ${isDark ? "dark-theme bg-[#1a0f08] text-[#f5ede0]" : "bg-background text-foreground"}`}
      dir={lang === "he" ? "rtl" : "ltr"}
    >

      {/* Sidebar navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        lang={lang}
        profileAvatar={profileAvatar}
        profileName={profileName}
        profileRole={profileRole}
        sidebarCollapsed={sidebarCollapsed}
        t={t}
        onCreateProject={() => setIsModalOpen(true)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedTag(t.all);
        }}
        onToggleCollapsed={() => {
          const next = !sidebarCollapsed;
          setSidebarCollapsed(next);
          localStorage.setItem("new-kibbutz-sidebar-collapsed", String(next));
        }}
      />
      {/* Main Panel */}
      <main className={`min-w-0 flex-1 h-full flex flex-col overflow-y-auto relative ${activeTab === "settings" ? "p-0" : "p-4 md:p-6 w-full"} pb-20 md:pb-0`}>

        {/* Feed & Portfolios — real backend data, rendered inside the shell */}
        {activeTab === "feed" && <FeedView />}
        {activeTab === "portfolios" && <PortfoliosView />}

        {/* Top Header — hidden on settings / feed / portfolios */}
        <header className={`flex justify-between items-center mb-4 shrink-0 ${activeTab === "settings" || activeTab === "feed" || activeTab === "portfolios" ? "hidden" : ""}`}>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              {activeTab === "explore" && t.exploreProjects}
              {activeTab === "my-projects" && t.myProjects}
              {activeTab === "teams" && t.teams}
              {activeTab === "messages" && t.messages}
              {activeTab === "profile" && t.profile}
              {activeTab === "settings" && t.settings}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTab === "explore" && t.exploreSub}
              {activeTab === "my-projects" && t.myProjectsSub}
              {activeTab === "teams" && t.teamsSub}
              {activeTab === "messages" && t.messagesSub}
              {activeTab === "profile" && t.profileSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-secondary to-gold text-foreground font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.createNewProject}</span>
            </button>

            <div className="relative">
              <button
                data-testid="bell-btn"
                onClick={() => setShowNotifications(v => !v)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 bg-primary rounded-full text-[9px] text-white flex items-center justify-center px-1">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div
                  className={`absolute top-11 z-50 w-80 rounded-2xl bg-slate-900 border border-white/10 shadow-xl overflow-hidden ${lang === "he" ? "left-0" : "right-0"}`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-sm font-bold text-foreground">התראות</span>
                    <button onClick={markAllRead} className="text-[10px] text-primary hover:underline cursor-pointer">
                      סמן הכל כנקרא
                    </button>
                  </div>
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 text-right ${n.read ? "opacity-60" : ""}`}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.read ? "bg-transparent" : "bg-primary"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-white/10 text-center">
                    <button onClick={() => setShowNotifications(false)} className="text-[11px] text-slate-400 hover:text-primary transition-colors cursor-pointer">
                      סגור
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
            >
              <img src={profileAvatar} alt={profileName} className="w-7 h-7 rounded-lg object-cover" />
            </div>
          </div>
        </header>

        {/* View explore / my-projects */}
        {(activeTab === "explore" || activeTab === "my-projects") && (
          <>
            <ComingSoonBanner feature="פרויקטים" className="mb-4" />
            {/* Search and creation button */}
            <section className="mb-2 flex gap-4 items-center shrink-0">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 ${
                  lang === "he" ? "right-4" : "left-4"
                }`} />
                <input
                  type="text"
                  placeholder={lang === "he" ? "חפש לפי שם פרויקט, תיאור או טכנולוגיה..." : "Search by project name, description or tech..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-3 rounded-xl bg-slate-900/60 border border-white/10 focus:border-primary focus:outline-none text-sm transition-colors text-foreground placeholder-muted-foreground ${
                    lang === "he" ? "pl-12 pr-12" : "pl-12 pr-12"
                  }`}
                />
                {/* item 23 – toggle advanced filters */}
                <button
                  onClick={() => setShowAdvancedFilters(v => !v)}
                  title="פילטרים מתקדמים"
                  className={`absolute top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                    lang === "he" ? "left-4" : "right-4"
                  } ${showAdvancedFilters ? "text-primary" : "text-slate-400 hover:text-foreground"}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* item 23 – Advanced filter panel */}
            {showAdvancedFilters && (
              <section className="mb-3 rounded-xl border border-white/10 bg-slate-900/50 p-4 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">פילטרים מתקדמים</span>
                  <button
                    onClick={() => { setFilterTeamSize("all"); }}
                    className="text-[10px] text-slate-400 hover:text-primary transition-colors"
                  >
                    אפס הכל
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Team size filter */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">גודל צוות</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["all", "small", "medium", "large"] as const).map(size => {
                        const labels = { all: "הכל", small: "קטן (1-2)", medium: "בינוני (3-5)", large: "גדול (6+)" };
                        return (
                          <button
                            key={size}
                            onClick={() => setFilterTeamSize(size)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              filterTeamSize === size
                                ? "bg-primary text-white"
                                : "bg-slate-800 text-slate-300 border border-white/5 hover:border-white/20"
                            }`}
                          >
                            {labels[size]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Domain filter */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">תחום</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {([
                        { value: "all",      label: "הכל",           icon: null },
                        { value: "leaf",     label: "אקולוגיה",      icon: <Leaf className="w-3 h-3" /> },
                        { value: "cpu",      label: "בינה מלאכותית", icon: <Cpu className="w-3 h-3" /> },
                        { value: "database", label: "נתונים",         icon: <Database className="w-3 h-3" /> },
                        { value: "globe",    label: "Web3 / גלובל",  icon: <Globe className="w-3 h-3" /> },
                      ] as const).map(({ value, label, icon }) => (
                        <button
                          key={value}
                          onClick={() => setFilterDomain(value)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            filterDomain === value
                              ? "bg-primary text-white"
                              : "bg-slate-800 text-slate-300 border border-white/5 hover:border-white/20"
                          }`}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* item 22 + 24 – multi-select tags + active filter indicator */}
            <section className="mb-1 shrink-0">
              <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                {/* Reset all button — item 24 */}
                {(selectedTags.length > 0 || filterTeamSize !== "all" || filterDomain !== "all" || searchTerm) && (
                  <button
                    onClick={() => { setSelectedTags([]); setFilterTeamSize("all"); setFilterDomain("all"); setSearchTerm(""); }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all cursor-pointer flex-shrink-0"
                  >
                    ✕ אפס סינון
                  </button>
                )}
                {allTags.filter(t => t !== (lang === "en" ? "All" : "הכל")).map(tag => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev =>
                        isActive ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-foreground shadow-md shadow-indigo-500/20"
                          : "bg-slate-900/50 text-slate-400 border border-white/5 hover:border-white/15"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {/* item 24 – active filter summary badge */}
              {(selectedTags.length > 0 || filterTeamSize !== "all" || filterDomain !== "all") && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400">פילטרים פעילים:</span>
                  {selectedTags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-[10px] bg-primary/15 text-primary border border-primary/20 rounded-lg px-2 py-0.5">
                      {t}
                      <button onClick={() => setSelectedTags(prev => prev.filter(x => x !== t))} className="hover:text-red-400">×</button>
                    </span>
                  ))}
                  {filterTeamSize !== "all" && (
                    <span className="flex items-center gap-1 text-[10px] bg-primary/15 text-primary border border-primary/20 rounded-lg px-2 py-0.5">
                      {filterTeamSize === "small" ? "צוות קטן" : filterTeamSize === "medium" ? "צוות בינוני" : "צוות גדול"}
                      <button onClick={() => setFilterTeamSize("all")} className="hover:text-red-400">×</button>
                    </span>
                  )}
                  {filterDomain !== "all" && (
                    <span className="flex items-center gap-1 text-[10px] bg-primary/15 text-primary border border-primary/20 rounded-lg px-2 py-0.5">
                      {filterDomain === "leaf" ? "אקולוגיה" : filterDomain === "cpu" ? "בינה מלאכותית" : filterDomain === "database" ? "נתונים" : "Web3 / גלובל"}
                      <button onClick={() => setFilterDomain("all")} className="hover:text-red-400">×</button>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">· {filteredProjects.length} תוצאות</span>
                </div>
              )}
            </section>

            {/* Projects Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* item 28 – designed error state */}
              {feedError ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-base">שגיאה בטעינת הפרויקטים</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">לא הצלחנו לטעון את הפרויקטים. בדקו את החיבור לאינטרנט ונסו שנית.</p>
                  </div>
                  <button
                    onClick={() => { setFeedError(false); loadLocalData(); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    נסה שנית
                  </button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="col-span-2">
                  <EmptyState
                    icon={<Sparkles className="w-8 h-8 text-[var(--primary)]" />}
                    title={t.noProjectsFound}
                    description={t.searchAlternative}
                  />
                </div>
              ) : (
                pagedProjects.map(proj => {
                  const isMember = proj.members.includes("user-1");
                  const isFull = proj.members.length >= proj.maxMembers;

                  return (
                    <article
                      key={proj.id}
                      onClick={() => router.push(`/projects/${proj.id}`)}
                      className="glass-card rounded-xl flex flex-col justify-between relative overflow-hidden cursor-pointer text-right"
                      dir={lang === "he" ? "rtl" : "ltr"}
                    >
                      {/* Cover image */}
                      {proj.coverImage ? (
                        <div className="w-full h-32 overflow-hidden">
                          <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-full h-16 flex items-center justify-center opacity-20 ${
                          proj.iconType === "leaf" ? "bg-green-600" :
                          proj.iconType === "cpu" ? "bg-indigo-600" :
                          proj.iconType === "database" ? "bg-amber-600" : "bg-blue-600"
                        }`}>
                          {renderProjectIcon(proj.iconType)}
                        </div>
                      )}
                      <div className="p-4">
                        {/* Card Header */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="p-2 rounded-xl bg-slate-950/40 border border-white/10 flex items-center justify-center">
                            {renderProjectIcon(proj.iconType)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-semibold">{proj.createdAt}</span>
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                            <span className="text-[10px] text-secondary font-semibold">{proj.statusText}</span>
                          </div>
                        </div>

                        {/* Title and details */}
                        <h3 className="text-lg font-bold text-foreground mb-1 text-right truncate">{proj.title}</h3>
                        <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-3 text-right line-clamp-2 h-10 md:h-12 overflow-hidden">{proj.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3 justify-start">
                          {proj.tags.map(tag => (
                            <span key={tag} className="text-xs bg-slate-900/80 text-slate-300 px-3 py-1 rounded-xl border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-white/5 flex flex-col gap-3 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {proj.members.map(mid => {
                                const u = mockUsers[mid] || { name: profileName, avatar: profileAvatar };
                                return (
                                  <img
                                    key={mid}
                                    src={u.avatar}
                                    alt={u.name}
                                    className="w-7 h-7 rounded-full border-2 border-[var(--background)] object-cover"
                                  />
                                );
                              })}
                            </div>
                            <span className="text-xs text-slate-400 font-medium">
                              {proj.members.length} / {proj.maxMembers} {t.members}
                            </span>
                          </div>

                          {/* item 20 – single primary CTA per card */}
                          {isMember ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); router.push(`/projects/${proj.id}`); }}
                              className="w-full py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-secondary" />
                              כניסה לפרויקט
                            </button>
                          ) : isFull ? (
                            <button disabled className="w-full py-2 rounded-xl text-sm bg-slate-900 text-muted-foreground border border-white/5 cursor-not-allowed">
                              {t.fullTeam}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); router.push(`/projects/${proj.id}`); }}
                              className="w-full py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-foreground shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-90 cursor-pointer"
                            >
                              <UserPlus className="w-4 h-4" />
                              {t.joinProject}
                            </button>
                          )}
                        </div>
                      </div>{/* end p-4 */}
                    </article>
                  );
                })
              )}
            </section>

            {/* Pagination */}
            {!feedError && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 shrink-0">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {lang === "he" ? "הקודם" : "Prev"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-primary text-white shadow-md"
                        : "bg-slate-900 border border-white/10 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {lang === "he" ? "הבא" : "Next"}
                </button>
              </div>
            )}
          </>
        )}

        {/* View teams */}
        {activeTab === "teams" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="glass-card rounded-xl p-4 flex flex-col justify-between border border-white/10 cursor-pointer text-right"
                >
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1 text-right truncate">{team.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2 text-right line-clamp-2 h-8 overflow-hidden">{team.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-3 justify-start">
                      {team.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-lg border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {team.membersAvatars.map((av, i) => (
                          <img key={i} src={av} alt="member" className="w-6 h-6 rounded-full border border-[var(--background)]" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">+{team.membersCount - 3} {t.members}</span>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); triggerToast(t.toastJoinedTeam.replace("{name}", team.name)); }}
                      className="px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-foreground border border-primary/30 text-xs font-semibold cursor-pointer transition-all"
                    >
                      {t.joinProject}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* View messages (Chat) */}
        {activeTab === "messages" && (
          <section className="flex flex-1 glass-panel rounded-xl overflow-hidden border border-white/10 h-[calc(100vh-170px)]">
            {/* Chats List Panel */}
            <div className={`w-80 flex flex-col bg-slate-950/20 ${
              lang === "he" ? "border-l border-white/10" : "border-r border-white/10"
            }`}>
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider text-right">{t.conversations}</h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      const updated = chats.map(c => c.id === chat.id ? { ...c, unread: false } : c);
                      setChats(updated);
                    }}
                    className={`w-full p-4 flex items-center gap-3 transition-colors cursor-pointer text-right ${
                      activeChatId === chat.id ? "bg-primary/10" : "hover:bg-white/5"
                    }`}
                  >
                    <img src={chat.userAvatar} alt={chat.userName} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-semibold text-sm text-foreground">{chat.userName}</span>
                        {chat.unread && <span className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="flex-1 flex flex-col bg-slate-950/10">
              {activeChatSession ? (
                <>
                  {/* Chat header */}
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/30">
                    <div className="flex items-center gap-3">
                      <img src={activeChatSession.userAvatar} alt={activeChatSession.userName} className="w-9 h-9 rounded-xl object-cover" />
                      <div className="text-right">
                        <h4 className="font-bold text-sm text-foreground">{activeChatSession.userName}</h4>
                        <span className="text-[10px] text-secondary">{activeChatSession.userRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {activeChatSession.messages.map(msg => {
                      const isMe = msg.senderId === "user-1";
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? "bg-primary text-foreground rounded-br-none"
                              : "bg-slate-800 text-slate-200 rounded-bl-none border border-white/5"
                          }`}>
                            <p className="text-right">{msg.text}</p>
                            <span className="block text-[9px] mt-1 text-left opacity-60">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input box */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-white/10 bg-slate-950/20 flex gap-2">
                    <input
                      type="text"
                      placeholder={t.typeMessage}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground text-right"
                    />
                    <button type="submit" className="p-2.5 bg-primary hover:bg-primary rounded-xl transition-colors cursor-pointer text-foreground">
                      <Send className={`w-4 h-4 ${lang === "he" ? "transform rotate-180" : ""}`} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <span>{t.selectChat}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ──────────── FRIENDS TAB ──────────── */}
        {activeTab === "friends" && (
          <FriendsTab t={t} onStartChat={(userId) => {
            setActiveTab("messages");
            setActiveChatId(userId);
          }} />
        )}

        {/* View Profile Settings */}
        {activeTab === "profile" && (
          <section className="max-w-xl mx-auto w-full">
            <div className="glass-panel border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-r from-primary/20 to-secondary/20" />

              <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-6 text-right" dir={lang === "he" ? "rtl" : "ltr"}>

                {/* Photo settings */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer">
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/40"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mt-3 text-foreground">{profileName}</h4>
                  <span className="text-xs text-slate-400">{profileRole}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.fullName}</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-primary focus:outline-none text-sm transition-colors text-foreground text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.jobTitle}</label>
                    <input
                      type="text"
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-primary focus:outline-none text-sm transition-colors text-foreground text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.avatarUrl}</label>
                    <input
                      type="text"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-primary focus:outline-none text-sm transition-colors text-foreground text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.techSkills}</label>
                    <input
                      type="text"
                      value={profileSkills}
                      onChange={(e) => setProfileSkills(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-primary focus:outline-none text-sm transition-colors text-foreground text-right"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary text-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t.saveChanges}
                  </button>
                </div>

              </form>
            </div>
          </section>
        )}

      </main>

      {/* Slide-over Drawer / Panel for Project details */}
      {selectedProject && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end">

          <div className="flex-1" onClick={() => setSelectedProject(null)} />

          <div
            className="w-full max-w-xl bg-[var(--background)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col p-6 md:p-8 animate-slide-in relative text-right"
            dir={lang === "he" ? "rtl" : "ltr"}
          >

            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-white/10">
                  {renderProjectIcon(selectedProject.iconType)}
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-foreground">{selectedProject.title}</h3>
                  <span className="text-[10px] text-secondary font-semibold">{selectedProject.statusText} • {t.active}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-foreground transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Description */}
            <section className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">{t.aboutProject}</h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5 text-right">
                {selectedProject.description}
              </p>
            </section>

            {/* Members section */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{t.teamMembers} ({selectedProject.members.length})</h4>

                <button
                  onClick={() => handleJoinLeave(selectedProject.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    selectedProject.members.includes("user-1")
                      ? "bg-slate-800 text-slate-300 hover:bg-muted"
                      : "bg-primary text-foreground hover:bg-primary"
                  }`}
                >
                  {selectedProject.members.includes("user-1") ? t.leaveProject : t.joinProject}
                </button>
              </div>

              <div className="space-y-2.5">
                {selectedProject.members.map(mid => {
                  const u = mockUsers[mid] || { name: profileName, avatar: profileAvatar };
                  const role = selectedProject.memberRoles[mid] || "Member";
                  return (
                    <div key={mid} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{role}</p>
                        </div>
                      </div>
                      {selectedProject.owner.name === u.name && (
                        <span className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20 font-medium">{t.projectLead}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Discussion comments wall */}
            <section className="mt-4 pt-6 border-t border-white/10 flex-1 flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-right">{t.discussionBoard}</h4>

              {/* Feed of comments */}
              <div className="flex-1 space-y-4 mb-4">
                {selectedProject.comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    {t.noComments}
                  </div>
                ) : (
                  selectedProject.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-3 text-right">
                      <img src={c.userAvatar} alt={c.userName} className="w-8 h-8 rounded-lg object-cover mt-0.5" />
                      <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl p-3.5">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-semibold text-foreground">{c.userName}</span>
                          <span className="text-[9px] text-slate-500">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed text-right">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Post comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-white/5 mt-auto">
                <input
                  type="text"
                  placeholder={t.commentPlaceholder}
                  value={projectCommentInput}
                  onChange={(e) => setProjectCommentInput(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none text-right"
                />
                <button type="submit" className="p-2 bg-primary hover:bg-primary rounded-lg transition-colors cursor-pointer text-foreground">
                  <Send className={`w-3.5 h-3.5 ${lang === "he" ? "" : "transform rotate-180"}`} />
                </button>
              </form>
            </section>

          </div>
        </div>
      )}

      {/* Team Members Dialog */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl overflow-hidden border border-white/10 glow-indigo animate-scale-in text-right" dir={lang === "he" ? "rtl" : "ltr"}>

            {/* Dialog Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>{selectedTeam.name}</span>
              </h3>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-slate-400 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <p className="text-xs text-slate-400 leading-relaxed mb-2 text-right">
                {selectedTeam.description}
              </p>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 text-right">
                  {t.teamMembers} ({selectedTeam.members.length})
                </h4>

                <div className="space-y-2.5">
                  {selectedTeam.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-lg object-cover border border-white/10"
                        />
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          <p className="text-[10px] text-slate-400">{member.role}</p>
                        </div>
                      </div>

                      {member.id === "user-1" && (
                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-medium">{t.me}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end bg-slate-950/20" dir={lang === "he" ? "rtl" : "ltr"}>
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary text-foreground text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Page */}
      {activeTab === "settings" && (
        <div
          className="w-full rounded-2xl border border-[var(--border)] overflow-hidden"
          style={{
            display: "grid",
            gridTemplateColumns: "12rem 1fr",
            height: "100%",
            background: "rgba(247,244,237,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* ── Nav ── */}
          <nav
            className="flex flex-col py-4 bg-[var(--background-subtle)]"
            style={{ borderInlineEnd: "1px solid var(--border)" }}
          >
            {[
              { id: "appearance",    label: t.settingsAppearance,    icon: <SlidersHorizontal className="w-4 h-4" /> },
              { id: "notifications", label: t.settingsNotifications, icon: <Bell className="w-4 h-4" /> },
              { id: "privacy",       label: t.settingsPrivacy,       icon: <Info className="w-4 h-4" /> },
              { id: "about",         label: t.settingsAbout,         icon: <Sparkles className="w-4 h-4" /> },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSettingsTab(s.id as SettingsTab)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all cursor-pointer border-s-2 ${
                  settingsTab === s.id
                    ? "text-primary font-semibold bg-primary/8 border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:bg-primary/5"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
            <div className="mt-auto px-3 pt-4 pb-2">
              <button
                onClick={() => { authLogout(); window.location.href = "/"; }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/8 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t.settingsLogout}
              </button>
            </div>
          </nav>

          {/* ── Content ── */}
          <div className="overflow-y-auto p-8">

            {/* Appearance */}
            {settingsTab === "appearance" && (
              <div className="max-w-xl space-y-6">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t.settingsAppearance}</p>

                {/* Language */}
                <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)]">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.settingsLang}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.settingsLangSub}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => { if (lang !== "he") toggleLanguage(); }}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lang === "he" ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"}`}
                    >עברית</button>
                    <button onClick={() => { if (lang !== "en") toggleLanguage(); }}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lang === "en" ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"}`}
                    >English</button>
                  </div>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.settingsTheme}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.settingsThemeSub}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button onClick={() => { if (isDark) toggleTheme(); }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${!isDark ? "border-primary" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
                    >
                      <div className="w-14 h-9 rounded-lg overflow-hidden flex">
                        <div className="flex-1 bg-[#f4eee1]" /><div className="w-4 bg-[#e4ddcd]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t.settingsThemeLight}</span>
                    </button>
                    <button onClick={() => { if (!isDark) toggleTheme(); }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${isDark ? "border-primary" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
                    >
                      <div className="w-14 h-9 rounded-lg overflow-hidden flex">
                        <div className="flex-1 bg-[#1a0f08]" /><div className="w-4 bg-[#2a1a0e]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t.settingsThemeDark}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {settingsTab === "notifications" && (
              <div className="max-w-xl space-y-2">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">{t.settingsNotifications}</p>
                {[
                  { label: t.settingsNotifMessages,  sub: t.settingsNotifMessagesSub,  val: notifMessages,  set: setNotifMessages },
                  { label: t.settingsNotifProjects,  sub: t.settingsNotifProjectsSub,  val: notifProjects,  set: setNotifProjects },
                  { label: t.settingsNotifCommunity, sub: "",                           val: notifCommunity, set: setNotifCommunity },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
                    </div>
                    <button
                      onClick={() => item.set(!item.val)}
                      className={`relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0 ${item.val ? "bg-primary" : "bg-[var(--border)]"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${item.val ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Privacy */}
            {settingsTab === "privacy" && (
              <div className="max-w-xl">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">{t.settingsPrivacy}</p>
                <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)]">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.settingsPrivacyProfile}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.settingsPrivacyProfileSub}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setPrivacyPublic(true)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${privacyPublic ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground"}`}
                    >{t.settingsPrivacyPublic}</button>
                    <button onClick={() => setPrivacyPublic(false)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${!privacyPublic ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground"}`}
                    >{t.settingsPrivacyMembers}</button>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {settingsTab === "about" && (
              <div className="max-w-xl">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">{t.settingsAbout}</p>
                <div className="flex items-center gap-4 mb-6">
                  <img src="/logo.jpg" alt="הקיבוץ" className="w-12 h-12 rounded-xl object-contain" />
                  <div>
                    <p className="font-bold text-foreground text-lg">הקיבוץ</p>
                    <p className="text-xs text-muted-foreground">{t.settingsAboutVersion} 2.0.0</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {[t.settingsAboutTerms, t.settingsAboutContact].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between py-3 border-b border-[var(--border)] text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
                      {item}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground ${lang === "he" ? "rotate-90" : "-rotate-90"}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-xl px-5 py-3 shadow-2xl border-l-4 border-primary animate-slide-in flex items-center gap-3">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-slate-200">{toastMessage}</span>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: "rgba(210,100,45,0.15)" }}>
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden animate-scale-in"
            dir={lang === "he" ? "rtl" : "ltr"}
            style={{
              background: "rgba(255,245,238,0.55)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(210,100,45,0.25)",
              boxShadow: "0 24px 60px -12px rgba(210,100,45,0.25), 0 0 0 1px rgba(255,255,255,0.4) inset"
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex justify-between items-center"
              style={{ background: "linear-gradient(135deg, rgba(210,100,45,0.9), rgba(232,117,61,0.85))", backdropFilter: "blur(8px)" }}
            >
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{t.createNewProject}</span>
                <Compass className="w-5 h-5 text-white/70" />
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 text-center">{t.projectName}</label>
                <input type="text" required
                  placeholder="e.g. Green Tech App"
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-center text-[#47331f] placeholder:text-center focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(210,100,45,0.2)", backdropFilter: "blur(8px)" }}
                  onFocus={e => e.target.style.border="1px solid rgba(210,100,45,0.6)"}
                  onBlur={e => e.target.style.border="1px solid rgba(210,100,45,0.2)"}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 text-center">{t.projectDesc}</label>
                <textarea required rows={3}
                  placeholder="Describe your project goals..."
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-center text-[#47331f] placeholder:text-center resize-none focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(210,100,45,0.2)", backdropFilter: "blur(8px)" }}
                  onFocus={e => e.target.style.border="1px solid rgba(210,100,45,0.6)"}
                  onBlur={e => e.target.style.border="1px solid rgba(210,100,45,0.2)"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5 text-center">{t.projectTags}</label>
                  <input type="text"
                    placeholder="Next.js, React, Design"
                    value={newTags} onChange={e => setNewTags(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-center text-[#47331f] placeholder:text-center focus:outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(210,100,45,0.2)", backdropFilter: "blur(8px)" }}
                    onFocus={e => e.target.style.border="1px solid rgba(210,100,45,0.6)"}
                    onBlur={e => e.target.style.border="1px solid rgba(210,100,45,0.2)"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5 text-center">{t.maxMembers}</label>
                  <input type="number" min={2} max={20}
                    value={newLimit} onChange={e => setNewLimit(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-center text-[#47331f] focus:outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(210,100,45,0.2)", backdropFilter: "blur(8px)" }}
                    onFocus={e => e.target.style.border="1px solid rgba(210,100,45,0.6)"}
                    onBlur={e => e.target.style.border="1px solid rgba(210,100,45,0.2)"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-2 text-center">{t.projectIcon}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "leaf",     label: t.leafLabel,     icon: <Leaf     className="w-5 h-5" /> },
                    { id: "cpu",      label: t.cpuLabel,      icon: <Cpu      className="w-5 h-5" /> },
                    { id: "database", label: t.databaseLabel, icon: <Database className="w-5 h-5" /> },
                    { id: "globe",    label: t.globeLabel,    icon: <Globe    className="w-5 h-5" /> }
                  ].map(item => (
                    <button key={item.id} type="button"
                      onClick={() => setNewIcon(item.id as ProjectIconType)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium cursor-pointer transition-all"
                      style={newIcon === item.id
                        ? { background: "rgba(210,100,45,0.18)", border: "1.5px solid rgba(210,100,45,0.7)", color: "#d2642d", boxShadow: "0 4px 14px -4px rgba(210,100,45,0.3)" }
                        : { background: "rgba(255,255,255,0.35)", border: "1px solid rgba(210,100,45,0.15)", color: "#80664d" }
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-2 text-center">
                  {lang === "he" ? "תמונת כריכה לפרויקט" : "Project Cover Image"}
                </label>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                {newCoverPreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ height: "100px" }}>
                    <img src={newCoverPreview} alt="cover" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setNewCoverImage(null); setNewCoverPreview(""); }}
                      className="absolute top-2 left-2 p-1 rounded-lg text-white cursor-pointer"
                      style={{ background: "rgba(210,100,45,0.8)" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => coverInputRef.current?.click()}
                    className="w-full py-5 rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer"
                    style={{ background: "rgba(210,100,45,0.06)", border: "1.5px dashed rgba(210,100,45,0.35)" }}>
                    <ImagePlus className="w-6 h-6 text-primary opacity-70" />
                    <span className="text-xs text-primary/70 font-medium">
                      {lang === "he" ? "לחץ להעלאת תמונה" : "Click to upload image"}
                    </span>
                    <span className="text-[10px] text-primary/40">JPG, PNG, WEBP · מקסימום 5MB</span>
                  </button>
                )}
              </div>

              {/* Documents Upload */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-2 text-center">
                  {lang === "he" ? "מסמכים נלווים" : "Attachments"}{" "}
                  <span className="font-normal text-primary/60">({newDocs.length}/5)</span>
                </label>
                <input ref={docsInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleDocsChange} className="hidden" />

                {newDocs.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {newDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(210,100,45,0.07)", border: "1px solid rgba(210,100,45,0.2)" }}>
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="flex-1 text-xs text-[#47331f] truncate">{doc.name}</span>
                        <span className="text-[10px] text-primary/50 shrink-0">{(doc.size / 1024).toFixed(0)}KB</span>
                        <button type="button" onClick={() => removeDoc(i)} className="text-primary/50 hover:text-primary cursor-pointer shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newDocs.length < 5 && (
                  <button type="button" onClick={() => docsInputRef.current?.click()}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{ background: "rgba(210,100,45,0.06)", border: "1.5px dashed rgba(210,100,45,0.3)" }}>
                    <Paperclip className="w-4 h-4 text-primary opacity-70" />
                    <span className="text-xs text-primary/70 font-medium">
                      {lang === "he" ? "הוסף מסמכים (PDF, Word, PPT...)" : "Attach documents (PDF, Word, PPT...)"}
                    </span>
                  </button>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(210,100,45,0.15)" }} dir={lang === "he" ? "rtl" : "ltr"}>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #d2642d, #e8753d)", boxShadow: "0 6px 20px -6px rgba(210,100,45,0.5)" }}
                >
                  {t.create}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: "rgba(210,100,45,0.08)", border: "1px solid rgba(210,100,45,0.2)", color: "#80664d" }}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
