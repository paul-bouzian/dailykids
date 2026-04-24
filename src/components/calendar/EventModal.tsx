"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { db, type Child, type Recurrence } from "@/lib/db";
import { ymd } from "@/lib/utils";
import { BottomSheet, useBottomSheetDismiss } from "@/components/ui/BottomSheet";

export function EventModal({
  initialDate,
  children,
  onClose,
}: {
  initialDate?: string;
  children: Child[];
  onClose: () => void;
}) {
  return (
    <BottomSheet onClose={onClose} title="Nouvel événement">
      <EventForm initialDate={initialDate} children={children} />
    </BottomSheet>
  );
}

function EventForm({
  initialDate,
  children,
}: {
  initialDate?: string;
  children: Child[];
}) {
  const dismiss = useBottomSheetDismiss();
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [date, setDate] = useState(initialDate ?? ymd());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [recurrence, setRecurrence] = useState<Recurrence>("none");

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const save = async () => {
    if (!label.trim()) return;
    await db.events.add({
      label: label.trim(),
      emoji,
      date,
      childIds: Array.from(selected),
      recurrence,
    });
    dismiss?.();
  };

  return (
    <>
      <div className="space-y-4 px-5 pb-6">
        <div className="flex gap-3">
          <input
            type="text"
            maxLength={3}
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 3))}
            className="w-16 text-center text-2xl rounded-2xl bg-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="🎉"
          />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nom de l'événement"
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-300"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">DATE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">
            RÉCURRENCE
          </label>
          <div className="flex gap-2">
            {[
              { v: "none", l: "Aucune" },
              { v: "weekly", l: "Hebdo" },
              { v: "monthly", l: "Mensuel" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setRecurrence(o.v as Recurrence)}
                className={`flex-1 rounded-full px-4 py-2 font-semibold text-sm transition ${
                  recurrence === o.v
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">
            CONCERNÉ·ES (optionnel)
          </label>
          {children.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun enfant enregistré.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {children.map((c) => {
                const active = selected.has(c.id!);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id!)}
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
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={!label.trim()}
          className="w-full rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white font-bold py-3.5 shadow-lg disabled:opacity-50"
        >
          Créer l&apos;événement
        </motion.button>
      </div>
      <button
        onClick={() => dismiss?.()}
        aria-label="Fermer"
        className="absolute top-3 right-3 size-9 rounded-full bg-slate-100 flex items-center justify-center"
      >
        <X className="size-5 text-slate-500" />
      </button>
    </>
  );
}
