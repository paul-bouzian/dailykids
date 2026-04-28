"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { db, type Child, type Period, type Task, type TaskCompletion } from "@/lib/db";
import { TaskCard } from "./TaskCard";

function wiggleClass(reorderMode: boolean, alt: boolean): string {
  if (!reorderMode) return "";
  return alt ? "wiggle-alt" : "wiggle";
}

export function ChildColumn({
  child,
  tasks,
  completions,
  period,
  night,
  starsPerTask,
  reorderMode,
  index,
}: {
  child: Child;
  tasks: Task[];
  completions: TaskCompletion[];
  period: Period;
  night: boolean;
  starsPerTask: number;
  reorderMode: boolean;
  index: number;
}) {
  const doneIds = useMemo(
    () => new Set(completions.map((c) => c.taskId)),
    [completions]
  );

  const todo = useMemo(() => {
    const filtered = tasks.filter((t) => !doneIds.has(t.id!));
    const order = child.taskOrder ?? [];
    const indexOf = (id: number) => {
      const i = order.indexOf(id);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return filtered.slice().sort((a, b) => {
      const ai = indexOf(a.id!);
      const bi = indexOf(b.id!);
      if (ai !== bi) return ai - bi;
      return a.order - b.order;
    });
  }, [tasks, doneIds, child.taskOrder]);

  const done = useMemo(() => {
    return tasks.filter((t) => doneIds.has(t.id!));
  }, [tasks, doneIds]);

  const onReorder = async (newTodo: Task[]) => {
    const visibleIds = new Set<number>([
      ...newTodo.map((t) => t.id!),
      ...done.map((t) => t.id!),
    ]);
    const previousOrder = child.taskOrder ?? [];
    const hiddenInOrder = previousOrder.filter((id) => !visibleIds.has(id));
    const newOrder = [
      ...newTodo.map((t) => t.id!),
      ...done.map((t) => t.id!),
      ...hiddenInOrder,
    ];
    await db.children.update(child.id!, { taskOrder: newOrder });
  };

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

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {todo.length === 0 && done.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-10">
            Aucune tâche pour cette période
          </div>
        )}

        {todo.length > 0 && (
          <Reorder.Group
            axis="y"
            values={todo}
            onReorder={onReorder}
            className="space-y-2"
            as="div"
          >
            {todo.map((task, i) => (
              <ReorderableTask
                key={task.id}
                task={task}
                childId={child.id!}
                period={period}
                starsPerTask={starsPerTask}
                childColor={child.color}
                iconOnly={!!child.iconOnly}
                reorderMode={reorderMode}
                wiggleAlt={(index + i) % 2 === 1}
              />
            ))}
          </Reorder.Group>
        )}

        {done.length > 0 && todo.length > 0 && <div className="h-2" />}

        {done.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {done.map((task, i) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                >
                  <div
                    className={wiggleClass(
                      reorderMode,
                      (index + todo.length + i) % 2 === 1
                    )}
                  >
                    <TaskCard
                      task={task}
                      childId={child.id!}
                      period={period}
                      done
                      starsPerTask={starsPerTask}
                      childColor={child.color}
                      iconOnly={!!child.iconOnly}
                      reorderMode={reorderMode}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ReorderableTask({
  task,
  childId,
  period,
  starsPerTask,
  childColor,
  iconOnly,
  reorderMode,
  wiggleAlt,
}: {
  task: Task;
  childId: number;
  period: Period;
  starsPerTask: number;
  childColor: string;
  iconOnly: boolean;
  reorderMode: boolean;
  wiggleAlt: boolean;
}) {
  return (
    <Reorder.Item
      value={task}
      dragListener={reorderMode}
      whileDrag={{
        scale: 1.04,
        zIndex: 50,
        boxShadow: "0 14px 36px rgba(15, 23, 42, 0.18)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      layout
      as="div"
      className="list-none"
    >
      <div className={wiggleClass(reorderMode, wiggleAlt)}>
        <TaskCard
          task={task}
          childId={childId}
          period={period}
          done={false}
          starsPerTask={starsPerTask}
          childColor={childColor}
          iconOnly={iconOnly}
          reorderMode={reorderMode}
        />
      </div>
    </Reorder.Item>
  );
}
