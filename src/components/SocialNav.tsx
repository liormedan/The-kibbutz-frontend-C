"use client";
// הקיבוץ – Social section top nav (Feed / Portfolios)
// Standalone header for the NEW backend-powered pages, styled with the brand
// design tokens so it fits the existing look.

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Newspaper, LogOut, Compass } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { logoutUser } from "@/services/auth.service";

const LINKS = [
  { href: "/dashboard", label: "לוח בקרה", icon: Compass },
  { href: "/feed", label: "פיד", icon: Newspaper },
  { href: "/portfolios", label: "תיקי עבודות", icon: LayoutGrid },
];

export default function SocialNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-40 glass-panel border-b border-[var(--border)]"
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
        <Link href="/feed" className="flex items-center gap-2">
          <Image
            src="/logo_clean.png"
            alt="The Kibbutz"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mr-auto flex items-center gap-1">
          <NotificationCenter />
          <button
            onClick={() => logoutUser().then(() => router.push("/login"))}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/8 hover:text-foreground"
            aria-label="התנתקות"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
