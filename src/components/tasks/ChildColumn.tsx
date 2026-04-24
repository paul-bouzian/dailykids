"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Child, Period, Task, TaskCompletion } from "@/lib/db";
import { TaskCard } from "./TaskCard";

export function ChildColumn({
  child,
  tasks,
  completions,
  period,
  night,
  starsPerTask,
}: {
  child: Child;
  tasks: Task[];
  completions: TaskCompletion[];
  period: Period;
  night: boolean;
  starsPerTask: number;
}) {
  const doneIds = useMemo(
    () => new Set(completions.map((c) => c.taskId)),
    [completions]
  );

  const sorted = useMemo(() => {
    const todo = tasks.filter((t) => !doneIds.has(t.id!));
    const done = tasks.filter((t) => doneIds.has(t.id!));
    return [...todo, ...done];
  }, [tasks, doneIds]);

  return (
    <div
      className="flex flex-col rounded-3xl shadow-xl w-[280px] min-w-[280px] h-full overflow-hidden"
      style={{
        backgroundColor: night ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.9)",
        boxShadow: `0 10px 30px ${child.color}33`,
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${child.color}, ${child.color}DD)` }}
      >
        <div className="text-4xl drop-shadow-sm">{child.mascot}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-lg leading-tight truncate">
            {child.name}
          </div>
          <div className="flex items-center gap-1 text-white/95 text-sm font-semibold">
            <Star className="size-4 fill-yellow-300 text-yellow-300" strokeWidth={2.5} />
            {child.stars}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <AnimatePresence initial={false}>
          {sorted.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-10">
              Aucune tâche pour cette période
            </div>
          )}
          {sorted.map((task) => (
            <motion.div
              key={task.id}
              layout
              layoutId={`task-${child.id}-${task.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            >
              <TaskCard
                task={task}
                childId={child.id!}
                period={period}
                done={doneIds.has(task.id!)}
                starsPerTask={starsPerTask}
                childColor={child.color}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
