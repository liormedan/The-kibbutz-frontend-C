"use client";
// הקיבוץ – "Coming soon" banner
// Shown on pages whose feature has no backend endpoint yet (projects, matching,
// NDA, applications, teams, ...). Keeps the existing UI visible while making it
// clear the data is not live. See BACKEND_GAPS.md.

import { Construction } from "lucide-react";

interface ComingSoonBannerProps {
  feature?: string;
  className?: string;
}

export default function ComingSoonBanner({
  feature,
  className = "",
}: ComingSoonBannerProps) {
  return (
    <div
      dir="rtl"
      className={`flex items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-amber-800 ${className}`}
    >
      <Construction className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm leading-snug">
        {feature ? (
          <>
            <span className="font-semibold">{feature}</span> — הפיצ'ר הזה עדיין לא
            מחובר לשרת. התצוגה להמחשה בלבד.
          </>
        ) : (
          <>הפיצ'ר הזה עדיין לא מחובר לשרת. התצוגה להמחשה בלבד.</>
        )}
      </p>
    </div>
  );
}
