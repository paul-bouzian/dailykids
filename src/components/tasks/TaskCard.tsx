"use client";

import { Check, GripVertical } from "lucide-react";
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
  draggable = false,
  onStartDrag,
}: {
  task: Task;
  childId: number;
  period: Period;
  done: boolean;
  starsPerTask: number;
  childColor: string;
  draggable?: boolean;
  onStartDrag?: (event: PointerEvent) => void;
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
          c.stars = c.stars + starsPerTask;
        });
      celebrate(x, y);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle(e.currentTarget.getBoundingClientRect());
  };

  const handleHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onStartDrag) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      if ("vibrate" in navigator) navigator.vibrate(10);
    } catch {}
    onStartDrag(e.nativeEvent);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden ${
        done
          ? "bg-slate-100 text-slate-400"
          : "bg-white text-slate-800 shadow-sm"
      }`}
      style={{
        borderLeft: done ? undefined : `4px solid ${childColor}`,
      }}
    >
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 p-3 min-h-[64px] text-left transition active:scale-[0.97]"
      >
        <div className={`text-3xl ${done ? "opacity-40" : ""}`}>{task.emoji}</div>
        <div
          className={`flex-1 font-semibold text-[15px] leading-snug ${
            done ? "line-through" : ""
          }`}
        >
          {task.label}
        </div>
        {/* spacer for the handle / check */}
        <div className="size-9 shrink-0" />
      </button>

      {done ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full flex items-center justify-center bg-emerald-400 text-white pointer-events-none">
          <Check className="size-5" strokeWidth={3} />
        </div>
      ) : (
        draggable && (
          <div
            role="button"
            tabIndex={-1}
            aria-label="Réordonner la tâche"
            onPointerDown={handleHandlePointerDown}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute right-1 top-0 bottom-0 w-12 flex items-center justify-center text-slate-300 active:text-slate-500 select-none"
            style={{
              touchAction: "none",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          >
            <GripVertical className="size-5 pointer-events-none" />
          </div>
        )
      )}
    </div>
  );
}
