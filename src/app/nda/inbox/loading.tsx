import React from "react";

export default function NdaInboxLoading() {
  return (
    <div className="min-h-screen bg-background p-6 animate-pulse" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="w-16 h-4 rounded-full bg-[var(--muted)] mb-6" />
        <div className="w-40 h-7 rounded-full bg-[var(--muted)] mb-1" />
        <div className="w-56 h-4 rounded-full bg-[var(--muted)] mb-6" />
        <div className="flex gap-2 mb-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-20 h-8 rounded-xl bg-[var(--muted)]" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-xl p-4 border border-border flex items-center justify-between gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="w-36 h-4 rounded-full bg-[var(--muted)]" />
                <div className="w-24 h-3 rounded-full bg-[var(--muted)]" />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="w-16 h-8 rounded-xl bg-[var(--muted)]" />
                <div className="w-16 h-8 rounded-xl bg-[var(--muted)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
