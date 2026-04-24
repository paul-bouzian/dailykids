"use client";

import { ChevronLeft } from "lucide-react";

export function StackHeader({
  title,
  back,
  right,
}: {
  title: string;
  back: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
      <button
        onClick={back}
        className="size-10 rounded-full bg-white shadow flex items-center justify-center active:scale-95"
        aria-label="Retour"
      >
        <ChevronLeft className="size-5 text-slate-700" />
      </button>
      <h1 className="flex-1 text-lg font-bold text-slate-800 truncate">{title}</h1>
      {right}
    </div>
  );
}
