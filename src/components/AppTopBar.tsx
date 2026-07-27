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
      {/* Below md this collapses to a round icon button — the full label button
          ate most of the bar width on a phone. See MOBILE_SPEC.md §6 [D3]. */}
      <button
        type="button"
        data-testid="topbar-create"
        onClick={() => router.push("/projects/create")}
        title={t("createNewProject")}
        aria-label={t("createNewProject")}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-gold text-foreground shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer md:h-auto md:w-auto md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm md:font-semibold"
      >
        <Plus className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden whitespace-nowrap md:inline">{t("createNewProject")}</span>
      </button>

      <NotificationCenter />

      <AccountMenu />
    </header>
  );
}
