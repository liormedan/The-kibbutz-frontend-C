"use client";
// הקיבוץ – AppTopBar
// The fixed action cluster that AppShell renders above every hosted page:
// "new project" · notifications · account menu (the avatar).
//
// Placement: the bar inherits the document direction and pins the cluster to
// the flex END, so it lands top-LEFT in Hebrew (sidebar on the right) and
// mirrors to top-right in English. DOM order is button → bell → avatar, which
// in RTL renders as avatar · bell · button from the left edge inward.

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import AccountMenu from "@/components/AccountMenu";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AppTopBar() {
  const router = useRouter();
  const { t, dir } = useI18n();

  return (
    <header
      dir={dir}
      className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-[var(--border)] bg-background/85 px-4 backdrop-blur-md md:px-6"
    >
      <button
        type="button"
        data-testid="topbar-create"
        onClick={() => router.push("/projects/create")}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-gold px-4 py-2 text-sm font-semibold text-foreground shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
      >
        <Plus className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{t("createNewProject")}</span>
      </button>

      <NotificationCenter />

      <AccountMenu />
    </header>
  );
}
