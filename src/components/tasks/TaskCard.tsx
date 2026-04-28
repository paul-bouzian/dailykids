"use client";

import { Check } from "lucide-react";
import { db, type Period, type Task } from "@/lib/db";
import { celebrate } from "@/lib/confetti";
import { ymd } from "@/lib/utils";

export function TaskCard({
  task,
  childId,
  period,
  done,
  starsPerTask,
  childColor,
  iconOnly = false,
  reorderMode = false,
}: {
  task: Task;
  childId: number;
  period: Period;
  done: boolean;
  starsPerTask: number;
  childColor: string;
  iconOnly?: boolean;
  reorderMode?: boolean;
}) {
  const toggle = async (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    const today = ymd();
    if (done) {
      await db.completions
        .where({ taskId: task.id!, childId, date: today, period })
        .delete();
      await db.children
        .where("id")
        .equals(childId)
        .modify((c) => {
          c.stars = Math.max(0, c.stars - starsPerTask);
        });
    } else {
      await db.completions.add({
        taskId: task.id!,
        childId,
        date: today,
        period,
        completedAt: Date.now(),
      });
      await db.children
        .where("id")
        .equals(childId)
        .modify((c) => {
          c.stars += starsPerTask;
        });
      celebrate(x, y);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reorderMode) return;
    toggle(e.currentTarget.getBoundingClientRect());
  };

  const noSelect: React.CSSProperties = {
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
    touchAction: reorderMode ? "none" : "manipulation",
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          ...noSelect,
          borderLeft: done ? undefined : `5px solid ${childColor}`,
        }}
        className={`relative w-full rounded-3xl min-h-[120px] flex items-center justify-center transition ${
          reorderMode ? "" : "active:scale-[0.97]"
        } ${done ? "bg-slate-100" : "bg-white shadow-md"}`}
      >
        <div
          className={`text-7xl ${done ? "opacity-30" : ""}`}
          style={{ filter: done ? "grayscale(0.6)" : undefined }}
        >
          {task.emoji}
        </div>
        {done && !reorderMode && (
          <div className="absolute right-3 top-3 size-9 rounded-full flex items-center justify-center bg-emerald-400 text-white pointer-events-none">
            <Check className="size-5" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        ...noSelect,
        borderLeft: done ? undefined : `4px solid ${childColor}`,
      }}
      className={`relative w-full flex items-center gap-3 rounded-2xl p-3 min-h-[64px] text-left transition ${
        reorderMode ? "" : "active:scale-[0.97]"
      } ${
        done
          ? "bg-slate-100 text-slate-400"
          : "bg-white text-slate-800 shadow-sm"
      }`}
    >
      <div className={`text-3xl ${done ? "opacity-40" : ""}`}>{task.emoji}</div>
      <div
        className={`flex-1 font-semibold text-[15px] leading-snug ${
          done ? "line-through" : ""
        }`}
      >
        {task.label}
      </div>
      <div
        className={`size-8 shrink-0 rounded-full flex items-center justify-center ${
          done && !reorderMode
            ? "bg-emerald-400 text-white"
            : "bg-slate-100 text-transparent"
        }`}
      >
        <Check className="size-5" strokeWidth={3} />
      </div>
    </button>
  );
}
