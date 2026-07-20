import React from "react";

type MatchCardVariant = "user" | "project";
interface Props { variant?: MatchCardVariant; }

export default function MatchCardSkeleton({ variant = "user" }: Props) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 bg-slate-700/50 ${variant === "user" ? "w-12 h-12 rounded-2xl" : "w-10 h-10 rounded-xl"}`} />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="w-32 h-4 rounded-full bg-slate-700/50" />
          <div className="w-24 h-3 rounded-full bg-slate-700/50" />
          {variant === "user" && (
            <div className="w-20 h-3 rounded-full bg-slate-700/50" />
          )}
        </div>
      </div>
      {variant === "project" && (
        <div className="space-y-1">
          <div className="w-full h-3 rounded-full bg-slate-700/50" />
          <div className="w-4/5 h-3 rounded-full bg-slate-700/50" />
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-16 h-5 rounded-full bg-slate-700/50" />
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-auto pt-1">
        <div className="w-full h-10 rounded-xl bg-slate-700/50" />
        <div className="w-20 h-3 rounded-full bg-slate-700/50 mx-auto" />
      </div>
    </div>
  );
}
