"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { db, type Period, type Task } from "@/lib/db";
import { celebrate } from "@/lib/confetti";
import { ymd } from "@/lib/utils";

const LONG_PRESS_MS = 1000;
const MOVE_CANCEL_PX = 8;

export function TaskCard({
  task,
  childId,
  period,
  done,
  starsPerTask,
  childColor,
  draggable = false,
  iconOnly = false,
  onStartDrag,
}: {
  task: Task;
  childId: number;
  period: Period;
  done: boolean;
  starsPerTask: number;
  childColor: string;
  draggable?: boolean;
  iconOnly?: boolean;
  onStartDrag?: (event: PointerEvent) => void;
}) {
  const longPressRef = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const dragInitiated = useRef(false);

  const clearLongPress = () => {
    if (longPressRef.current !== null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

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

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragInitiated.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    if (!draggable || !onStartDrag) return;
    const native = e.nativeEvent;
    longPressRef.current = window.setTimeout(() => {
      dragInitiated.current = true;
      try {
        if ("vibrate" in navigator) navigator.vibrate(15);
      } catch {}
      onStartDrag(native);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!startPos.current || dragInitiated.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clearLongPress();
  };

  const handlePointerCancel = () => {
    clearLongPress();
    startPos.current = null;
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clearLongPress();
    if (dragInitiated.current) {
      dragInitiated.current = false;
      return;
    }
    toggle(e.currentTarget.getBoundingClientRect());
  };

  const noSelect: React.CSSProperties = {
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
    touchAction: "manipulation",
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          ...noSelect,
          borderLeft: done ? undefined : `5px solid ${childColor}`,
        }}
        className={`relative w-full rounded-3xl min-h-[120px] flex items-center justify-center transition active:scale-[0.97] ${
          done
            ? "bg-slate-100"
            : "bg-white shadow-md"
        }`}
      >
        <div
          className={`text-7xl ${done ? "opacity-30" : ""}`}
          style={{ filter: done ? "grayscale(0.6)" : undefined }}
        >
          {task.emoji}
        </div>
        {done && (
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        ...noSelect,
        borderLeft: done ? undefined : `4px solid ${childColor}`,
      }}
      className={`relative w-full flex items-center gap-3 rounded-2xl p-3 min-h-[64px] text-left transition active:scale-[0.97] ${
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
          done
            ? "bg-emerald-400 text-white"
            : "bg-slate-100 text-transparent"
        }`}
      >
        <Check className="size-5" strokeWidth={3} />
      </div>
    </button>
  );
}
