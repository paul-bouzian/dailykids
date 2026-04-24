"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MonthGrid } from "./MonthGrid";
import { EventModal } from "./EventModal";
import { DayDetailModal } from "./DayDetailModal";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function CalendarView() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [direction, setDirection] = useState(0);
  const [eventModal, setEventModal] = useState<{ date?: string } | null>(null);
  const [dayDetail, setDayDetail] = useState<string | null>(null);

  const children = useLiveQuery(() => db.children.orderBy("order").toArray());
  const events = useLiveQuery(() => db.events.toArray());

  const shift = (delta: number) => {
    setDirection(delta);
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const title = useMemo(
    () => `${MONTH_NAMES[cursor.month]} ${cursor.year}`,
    [cursor]
  );

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-b from-violet-50 via-sky-50 to-amber-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl font-bold text-slate-800 capitalize">{title}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => shift(-1)}
            className="size-10 rounded-full bg-white shadow flex items-center justify-center active:scale-95"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="size-5 text-slate-700" />
          </button>
          <button
            onClick={() => shift(1)}
            className="size-10 rounded-full bg-white shadow flex items-center justify-center active:scale-95"
            aria-label="Mois suivant"
          >
            <ChevronRight className="size-5 text-slate-700" />
          </button>
          <button
            onClick={() => setEventModal({})}
            className="ml-1 size-11 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-lg flex items-center justify-center active:scale-95"
            aria-label="Ajouter un événement"
          >
            <Plus className="size-6" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 mt-2 overflow-hidden relative pb-24 flex">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${cursor.year}-${cursor.month}`}
            custom={direction}
            initial={{ x: direction === 0 ? 0 : direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 40, opacity: 0 }}
            transition={{ duration: 0.22 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) shift(1);
              else if (info.offset.x > 60) shift(-1);
            }}
            className="flex-1 min-h-0 px-3"
          >
            <MonthGrid
              year={cursor.year}
              month={cursor.month}
              events={events ?? []}
              children={children ?? []}
              onDayClick={(d) => setDayDetail(d)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {eventModal && (
        <EventModal
          initialDate={eventModal.date}
          children={children ?? []}
          onClose={() => setEventModal(null)}
        />
      )}
      {dayDetail && (
        <DayDetailModal
          date={dayDetail}
          events={events ?? []}
          children={children ?? []}
          onClose={() => setDayDetail(null)}
          onAddEvent={(d) => {
            setDayDetail(null);
            setEventModal({ date: d });
          }}
        />
      )}
    </div>
  );
}
