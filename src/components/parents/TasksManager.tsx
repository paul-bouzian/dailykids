"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db, type Period, type Task } from "@/lib/db";
import { TASK_EMOJIS } from "@/lib/utils";
import { StackHeader } from "./StackHeader";
import { BottomSheet, useBottomSheetDismiss } from "@/components/ui/BottomSheet";

export function TasksManager({ back }: { back: () => void }) {
  const tasks = useLiveQuery(() => db.tasks.orderBy("order").toArray());
  const children = useLiveQuery(() =>
    db.children.orderBy("order").toArray()
  );
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  if (!tasks || !children) return null;

  const childMap = Object.fromEntries(children.map((c) => [c.id!, c]));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StackHeader
        title="Tâches"
        back={back}
        right={
          <button
            onClick={() => setEditing("new")}
            className="size-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 text-white shadow-lg flex items-center justify-center active:scale-95"
            aria-label="Ajouter"
          >
            <Plus className="size-5" strokeWidth={3} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-3 pb-28">
        {children.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-3">👶</div>
            <p>Ajoute d&apos;abord des enfants.</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-3">📋</div>
            <p>Aucune tâche. Appuie sur + pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="text-3xl">{t.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {t.label}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {t.periods.includes("day") && "☀️"}
                      {t.periods.includes("night") && "🌙"}
                    </span>
                    <span>·</span>
                    <div className="flex -space-x-1.5">
                      {t.childIds.slice(0, 4).map((id) => {
                        const c = childMap[id];
                        if (!c) return null;
                        return (
                          <div
                            key={id}
                            className="size-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.mascot}
                          </div>
                        );
                      })}
                      {t.childIds.length > 4 && (
                        <span className="text-[10px] ml-1">+{t.childIds.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(t)}
                  className="size-9 rounded-full bg-slate-100 flex items-center justify-center"
                  aria-label="Modifier"
                >
                  <Pencil className="size-4 text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {editing && (
        <TaskEditor
          task={editing === "new" ? null : editing}
          tasksCount={tasks.length}
          children={children}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TaskEditor({
  task,
  tasksCount,
  children,
  onClose,
}: {
  task: Task | null;
  tasksCount: number;
  children: { id?: number; name: string; mascot: string; color: string }[];
  onClose: () => void;
}) {
  return (
    <BottomSheet onClose={onClose} title={task ? "Modifier la tâche" : "Nouvelle tâche"}>
      <TaskForm task={task} tasksCount={tasksCount} children={children} />
    </BottomSheet>
  );
}

function TaskForm({
  task,
  tasksCount,
  children,
}: {
  task: Task | null;
  tasksCount: number;
  children: { id?: number; name: string; mascot: string; color: string }[];
}) {
  const dismiss = useBottomSheetDismiss();
  const [label, setLabel] = useState(task?.label ?? "");
  const [emoji, setEmoji] = useState(task?.emoji ?? TASK_EMOJIS[0]);
  const [periods, setPeriods] = useState<Set<Period>>(
    new Set(task?.periods ?? ["day"])
  );
  const [childIds, setChildIds] = useState<Set<number>>(
    new Set(task?.childIds ?? [])
  );

  const togglePeriod = (p: Period) => {
    const next = new Set(periods);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    if (next.size === 0) next.add(p);
    setPeriods(next);
  };
  const toggleChild = (id: number) => {
    const next = new Set(childIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChildIds(next);
  };

  const save = async () => {
    if (!label.trim() || childIds.size === 0) return;
    if (task) {
      await db.tasks.update(task.id!, {
        label: label.trim(),
        emoji,
        periods: Array.from(periods),
        childIds: Array.from(childIds),
      });
    } else {
      await db.tasks.add({
        label: label.trim(),
        emoji,
        periods: Array.from(periods),
        childIds: Array.from(childIds),
        order: tasksCount,
      });
    }
    dismiss?.();
  };

  const remove = async () => {
    if (!task) return;
    await db.tasks.delete(task.id!);
    await db.completions.where("taskId").equals(task.id!).delete();
    dismiss?.();
  };

  return (
    <>
      <div className="px-5 pb-6 space-y-4">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nom de la tâche"
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-300"
          autoFocus
        />

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">EMOJI</label>
          <div className="grid grid-cols-8 gap-1.5">
            {TASK_EMOJIS.map((m) => (
              <button
                key={m}
                onClick={() => setEmoji(m)}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition ${
                  emoji === m
                    ? "bg-sky-100 ring-2 ring-sky-400"
                    : "bg-slate-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">QUAND ?</label>
          <div className="flex gap-2">
            <button
              onClick={() => togglePeriod("day")}
              className={`flex-1 rounded-full px-4 py-2.5 font-semibold transition ${
                periods.has("day")
                  ? "bg-amber-400 text-white shadow"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              ☀️ Journée
            </button>
            <button
              onClick={() => togglePeriod("night")}
              className={`flex-1 rounded-full px-4 py-2.5 font-semibold transition ${
                periods.has("night")
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              🌙 Soir
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">ASSIGNÉE À</label>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => {
              const active = childIds.has(c.id!);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleChild(c.id!)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-sm transition ${
                    active ? "text-white shadow" : "bg-slate-100 text-slate-700"
                  }`}
                  style={active ? { backgroundColor: c.color } : undefined}
                >
                  <span className="text-lg">{c.mascot}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={!label.trim() || childIds.size === 0}
          className="w-full rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-400 text-white font-bold py-3.5 shadow-lg disabled:opacity-50"
        >
          {task ? "Enregistrer" : "Créer"}
        </motion.button>

        {task && (
          <button
            onClick={remove}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-600 font-bold py-3"
          >
            <Trash2 className="size-4" /> Supprimer cette tâche
          </button>
        )}
      </div>
    </>
  );
}
