"use client";

import "./globals.css";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { connectSignalR } from "@/services/notification.service";
import PendingBackendToast from "@/components/PendingBackendToast";
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
    <html lang="he" className="h-full antialiased">
      <head>
        {/* Apply the saved theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('new-kibbutz-theme')==='dark')document.documentElement.classList.add('dark-theme')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
          <PendingBackendToast />
        </LanguageProvider>
      </body>
    </html>
  );
}
