"use client";

import "./globals.css";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { connectSignalR } from "@/services/notification.service";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isAuthenticated) return;
    const disconnect = connectSignalR();
    return disconnect;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user || process.env.NEXT_PUBLIC_DEV_BYPASS === "true") return;

    const isBypassPath = pathname === "/verify-email" || pathname === "/onboarding" || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");

    // Redirect to verify-email if email is not verified
    if (!user.emailVerified && pathname !== "/verify-email" && pathname !== "/") {
      router.push("/verify-email");
      return;
    }

    // Redirect to onboarding if profile is not complete
    if (user.emailVerified && !user.isProfileComplete && pathname !== "/onboarding" && pathname !== "/") {
      router.push("/onboarding");
      return;
    }
  }, [isAuthenticated, user, pathname, router]);

  return (
    // suppressHydrationWarning: the inline script below intentionally mutates
    // <html> (class + dir/lang) before React hydrates, so the server markup
    // won't match. Suppression applies to this element's own attributes only.
    <html lang="he" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme + language before first paint (no flash). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var e=document.documentElement;" +
              "if(localStorage.getItem('new-kibbutz-theme')==='dark')e.classList.add('dark-theme');" +
              "var l=localStorage.getItem('new-kibbutz-lang');" +
              "if(l==='en'||l==='he'){e.lang=l;e.dir=l==='he'?'rtl':'ltr'}" +
              "}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
