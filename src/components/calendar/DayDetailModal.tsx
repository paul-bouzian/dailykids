"use client";

import { Plus, Trash2, X } from "lucide-react";
import type { CalendarEvent, Child } from "@/lib/db";
import { db } from "@/lib/db";
import { eventOccursOn } from "@/lib/recurrence";
import { parseYmd } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";

const FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function DayDetailModal({
  date,
  events,
  children,
  onClose,
  onAddEvent,
}: {
  date: string;
  events: CalendarEvent[];
  children: Child[];
  onClose: () => void;
  onAddEvent: (d: string) => void;
}) {
  const dayEvents = events.filter((e) => eventOccursOn(e, date));
  const title = FORMATTER.format(parseYmd(date));

  const childMap = Object.fromEntries(children.map((c) => [c.id!, c]));

  const del = async (id: number) => {
    await db.events.delete(id);
  };

  return (
    <BottomSheet onClose={onClose} title={title}>
      <div className="px-5 pb-6 space-y-3">
        {dayEvents.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-5xl mb-2">📭</div>
            <p className="text-slate-500 text-sm">
              Aucun événement pour ce jour.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((e) => {
              const color =
                e.childIds.length === 1 && childMap[e.childIds[0]]
                  ? childMap[e.childIds[0]].color
                  : "#64748b";
              const who = e.childIds
                .map((id) => childMap[id]?.name)
                .filter(Boolean)
                .join(", ");
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl p-3 bg-slate-50"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="text-3xl">{e.emoji || "📌"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">
                      {e.label}
                    </div>
                    {who && (
                      <div className="text-xs text-slate-500 truncate">{who}</div>
                    )}
                    {e.recurrence !== "none" && (
                      <div className="text-[11px] text-sky-600 font-semibold">
                        {e.recurrence === "weekly" ? "↻ Chaque semaine" : "↻ Chaque mois"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => del(e.id!)}
                    className="size-9 rounded-full bg-white flex items-center justify-center"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => onAddEvent(date)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white font-bold py-3 shadow-lg"
        >
          <Plus className="size-5" strokeWidth={3} /> Ajouter un événement
        </button>
      </div>
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-3 right-3 size-9 rounded-full bg-slate-100 flex items-center justify-center"
      >
        <X className="size-5 text-slate-500" />
      </button>
    </BottomSheet>
  );
}
