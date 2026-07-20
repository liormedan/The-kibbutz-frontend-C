import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 animate-pulse" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="w-16 h-4 rounded-full bg-slate-700/50 mb-6" />
        <div className="glass-panel rounded-2xl p-6 border border-border mb-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-700/50" />
              <div className="space-y-2">
                <div className="w-32 h-5 rounded-full bg-slate-700/50" />
                <div className="w-24 h-3 rounded-full bg-slate-700/50" />
              </div>
            </div>
            <div className="w-20 h-9 rounded-xl bg-slate-700/50" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="w-full h-3 rounded-full bg-slate-700/50" />
            <div className="w-4/5 h-3 rounded-full bg-slate-700/50" />
          </div>
          <div className="w-40 h-3 rounded-full bg-slate-700/50 mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl p-3 bg-slate-700/30 flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-slate-700/50" />
                <div className="w-8 h-4 rounded-full bg-slate-700/50" />
                <div className="w-12 h-2 rounded-full bg-slate-700/50" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-20 h-9 rounded-xl bg-slate-700/50" />
          ))}
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-border space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="w-24 h-7 rounded-xl bg-slate-700/50" />
              <div className="w-16 h-5 rounded-full bg-slate-700/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
