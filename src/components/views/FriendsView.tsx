"use client";
// הקיבוץ – Friends view (own route: /friends)
// Thin wrapper around the existing, backend-wired FriendsTab component.

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import FriendsTab from "@/components/FriendsTab";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function FriendsView() {
  const router = useRouter();
  const { t, dir } = useI18n();
  // Labels FriendsTab reads off its `t` prop.
  const friendsT: Record<string, string> = {
    friendsConnections: t("friendsConnections"),
    friendsFollowing: t("friendsFollowing"),
    friendsFollowers: t("friendsFollowers"),
    followBtn: t("followBtn"),
    followingBtn: t("followingBtn"),
  };
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6" dir={dir}>
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("friends")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("friendsSub")}</p>
        </div>
      </div>
      <FriendsTab
        t={friendsT}
        onStartChat={(userId) => router.push(`/messages?userId=${encodeURIComponent(userId)}`)}
      />
    </div>
  );
}
