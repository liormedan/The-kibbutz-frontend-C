import React from "react";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-background p-6 animate-pulse" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="w-16 h-4 rounded-full bg-slate-700/50 mb-6" />
        <div className="glass-panel rounded-2xl p-6 border border-border mb-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-48 h-6 rounded-full bg-slate-700/50" />
              <div className="w-full h-3 rounded-full bg-slate-700/50" />
              <div className="w-4/5 h-3 rounded-full bg-slate-700/50" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-16 h-6 rounded-xl bg-slate-700/50" />
            ))}
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-700/50 border-2 border-background" />
              ))}
            </div>
            <div className="w-24 h-3 rounded-full bg-slate-700/50" />
            <div className="w-24 h-9 rounded-xl bg-slate-700/50 mr-auto" />
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-border">
          <div className="w-20 h-5 rounded-full bg-slate-700/50 mb-4" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="w-24 h-3 rounded-full bg-slate-700/50" />
                <div className="w-full h-3 rounded-full bg-slate-700/50" />
                <div className="w-3/4 h-3 rounded-full bg-slate-700/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
