"use client";

import { useEffect } from "react";

/**
 * הקיבוץ – Admin Redirection
 * מנתב את מנהלי המערכת לאפליקציית הניהול המבודדת (Admin Panel)
 */
export default function AdminRedirectPage() {
  useEffect(() => {
    // Redirect to the separate admin application port/host
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";
    window.location.href = adminUrl;
  }, []);

  return (
    <div className="min-h-screen bg-[#f4eee1] flex items-center justify-center font-sans" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-muted-foreground font-medium">מעביר אותך למערכת הניהול המאובטחת...</p>
      </div>
    </div>
  );
}
