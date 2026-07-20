import React from "react";
import ProjectCardSkeleton from "@/components/skeletons/ProjectCardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 animate-pulse">
          <div className="w-36 h-8 rounded-xl bg-slate-700/50" />
          <div className="w-24 h-9 rounded-xl bg-slate-700/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
