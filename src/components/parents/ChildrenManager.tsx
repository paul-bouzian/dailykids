"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, Reorder } from "motion/react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { db, type Child } from "@/lib/db";
import { COLORS, MASCOTS } from "@/lib/utils";
import { StackHeader } from "./StackHeader";
import { BottomSheet, useBottomSheetDismiss } from "@/components/ui/BottomSheet";

export function ChildrenManager({ back }: { back: () => void }) {
  const children = useLiveQuery(() =>
    db.children.orderBy("order").toArray()
  );
  const [editing, setEditing] = useState<Child | "new" | null>(null);

  const reorder = async (list: Child[]) => {
    await db.transaction("rw", db.children, async () => {
      for (let i = 0; i < list.length; i++) {
        await db.children.update(list[i].id!, { order: i });
      }
    });
  };

  if (!children) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StackHeader
        title="Enfants"
        back={back}
        right={
          <button
            onClick={() => setEditing("new")}
            className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-lg flex items-center justify-center active:scale-95"
            aria-label="Ajouter"
          >
            <Plus className="size-5" strokeWidth={3} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-3 pb-28">
        {children.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-3">🐻</div>
            <p>Aucun enfant. Appuie sur + pour commencer.</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={children}
            onReorder={reorder}
            className="space-y-2"
          >
            {children.map((child) => (
              <Reorder.Item
                key={child.id}
                value={child}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                style={{ borderLeft: `6px solid ${child.color}` }}
              >
                <div className="cursor-grab touch-none text-slate-300">
                  <GripVertical className="size-5" />
                </div>
                <div className="text-3xl">{child.mascot}</div>
                <div className="flex-1 font-bold text-slate-800">{child.name}</div>
                <div className="text-sm text-slate-500 font-semibold">⭐ {child.stars}</div>
                <button
                  onClick={() => setEditing(child)}
                  className="size-9 rounded-full bg-slate-100 flex items-center justify-center"
                  aria-label="Modifier"
                >
                  <Pencil className="size-4 text-slate-600" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
      {editing && (
        <ChildEditor
          child={editing === "new" ? null : editing}
          childrenCount={children.length}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ChildEditor({
  child,
  childrenCount,
  onClose,
}: {
  child: Child | null;
  childrenCount: number;
  onClose: () => void;
}) {
  return (
    <BottomSheet onClose={onClose} title={child ? "Modifier" : "Nouvel enfant"}>
      <ChildForm child={child} childrenCount={childrenCount} />
    </BottomSheet>
  );
}

function ChildForm({
  child,
  childrenCount,
}: {
  child: Child | null;
  childrenCount: number;
}) {
  const dismiss = useBottomSheetDismiss();
  const [name, setName] = useState(child?.name ?? "");
  const [mascot, setMascot] = useState(child?.mascot ?? MASCOTS[0]);
  const [color, setColor] = useState(child?.color ?? COLORS[0].hex);

  const save = async () => {
    if (!name.trim()) return;
    if (child) {
      await db.children.update(child.id!, {
        name: name.trim(),
        mascot,
        color,
      });
    } else {
      await db.children.add({
        name: name.trim(),
        mascot,
        color,
        order: childrenCount,
        stars: 0,
      });
    }
    dismiss?.();
  };

  const remove = async () => {
    if (!child) return;
    await db.transaction("rw", db.children, db.tasks, db.completions, db.events, async () => {
      await db.children.delete(child.id!);
      const tasks = await db.tasks.toArray();
      for (const t of tasks) {
        if (t.childIds.includes(child.id!)) {
          const next = t.childIds.filter((id) => id !== child.id);
          if (next.length === 0) await db.tasks.delete(t.id!);
          else await db.tasks.update(t.id!, { childIds: next });
        }
      }
      await db.completions.where("childId").equals(child.id!).delete();
    });
    dismiss?.();
  };

  return (
    <>
      <div className="px-5 pb-6 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prénom"
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-300"
          autoFocus
        />

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">MASCOTTE</label>
          <div className="grid grid-cols-8 gap-1.5">
            {MASCOTS.map((m) => (
              <button
                key={m}
                onClick={() => setMascot(m)}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition ${
                  mascot === m
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
          <label className="text-xs font-bold text-slate-500 mb-2 block">COULEUR</label>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={`aspect-square rounded-full border-4 transition ${
                  color === c.hex ? "border-slate-700 scale-105" : "border-white"
                }`}
                style={{ backgroundColor: c.hex }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={!name.trim()}
          className="w-full rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white font-bold py-3.5 shadow-lg disabled:opacity-50"
        >
          {child ? "Enregistrer" : "Créer"}
        </motion.button>

        {child && (
          <button
            onClick={remove}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-600 font-bold py-3"
          >
            <Trash2 className="size-4" /> Supprimer cet enfant
          </button>
        )}
      </div>
    </>
  );
}
