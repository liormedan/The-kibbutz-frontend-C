"use client";
// הקיבוץ – Friends view (own route: /friends)
// Thin wrapper around the existing, backend-wired FriendsTab component.

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import FriendsTab from "@/components/FriendsTab";

export default function FriendsView() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6" dir="rtl">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">חברים</h1>
          <p className="mt-1 text-sm text-muted-foreground">קשרים מפרויקטים, עוקבים ובקשות חברות.</p>
        </div>
      </div>
      <FriendsTab
        t={{}}
        onStartChat={(userId) => router.push(`/messages?userId=${encodeURIComponent(userId)}`)}
      />
    </div>
  );
}
