import React from "react";

export default function ProjectCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col justify-between relative overflow-hidden animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--muted)]" />
        <div className="flex items-center gap-2">
          <div className="w-14 h-3 rounded-full bg-[var(--muted)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--muted)]" />
          <div className="w-10 h-3 rounded-full bg-[var(--muted)]" />
        </div>
      </div>
      <div className="w-3/4 h-5 rounded-full bg-[var(--muted)] mb-2" />
      <div className="space-y-2 mb-3">
        <div className="w-full h-3 rounded-full bg-[var(--muted)]" />
        <div className="w-5/6 h-3 rounded-full bg-[var(--muted)]" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="w-16 h-6 rounded-xl bg-[var(--muted)]" />
        <div className="w-20 h-6 rounded-xl bg-[var(--muted)]" />
        <div className="w-14 h-6 rounded-xl bg-[var(--muted)]" />
      </div>
      <div className="pt-3 border-t border-white/5 flex flex-col gap-3 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-[var(--muted)] border-2 border-background" />
            ))}
          </div>
          <div className="w-16 h-3 rounded-full bg-[var(--muted)]" />
        </div>
        <div className="w-full h-9 rounded-xl bg-[var(--muted)]" />
      </div>
    </div>
  );
}
