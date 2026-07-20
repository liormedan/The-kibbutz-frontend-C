import React from "react";
import MatchCardSkeleton from "@/components/skeletons/MatchCardSkeleton";

export default function MatchesLoading() {
  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse mb-6">
          <div className="w-40 h-7 rounded-full bg-slate-700/50 mb-2" />
          <div className="w-56 h-4 rounded-full bg-slate-700/50" />
        </div>
        <div className="flex gap-3 mb-6 animate-pulse">
          <div className="w-32 h-9 rounded-xl bg-slate-700/50" />
          <div className="w-32 h-9 rounded-xl bg-slate-700/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <MatchCardSkeleton key={i} variant="user" />
          ))}
        </div>
      </div>
    </div>
  );
}
