"use client";
// הקיבוץ – "Coming soon" banner
// Shown on pages whose feature has no backend endpoint yet (projects, matching,
// NDA, applications, teams, ...). Keeps the existing UI visible while making it
// clear the data is not live. See BACKEND_GAPS.md.

import { Construction } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface ComingSoonBannerProps {
  feature?: string;
  className?: string;
}

export default function ComingSoonBanner({
  feature,
  className = "",
}: ComingSoonBannerProps) {
  const { t, dir } = useI18n();
  // The message needs a feature name; fall back to a generic noun if none given.
  const featureName = feature ?? (dir === "rtl" ? "התוכן" : "This");
  return (
    <div
      dir={dir}
      className={`flex items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-amber-800 ${className}`}
    >
      <Construction className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm leading-snug">
        {t("comingSoonBanner", { feature: featureName })}
      </p>
    </div>
  );
}
