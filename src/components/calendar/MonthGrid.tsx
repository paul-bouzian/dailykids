"use client";

import { useMemo } from "react";
import type { CalendarEvent, Child } from "@/lib/db";
import { expandEventsForMonth } from "@/lib/recurrence";
import { ymd } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

interface Cell {
  date: Date;
  key: string;
  inMonth: boolean;
}

function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - firstWeekday);
  const cells: Cell[] = [];
  const current = new Date(start);
  for (let i = 0; i < 42; i++) {
    cells.push({
      date: new Date(current),
      key: ymd(current),
      inMonth: current.getMonth() === month,
    });
    current.setDate(current.getDate() + 1);
  }
  while (cells.length > 35 && cells[cells.length - 1].date.getMonth() !== month && cells[cells.length - 8].date.getMonth() !== month) {
    cells.pop();
  }
  return cells;
}

export function MonthGrid({
  year,
  month,
  events,
  children,
  onDayClick,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  children: Child[];
  onDayClick: (date: string) => void;
}) {
  const cells = useMemo(() => buildGrid(year, month), [year, month]);
  const byDay = useMemo(
    () => expandEventsForMonth(events, year, month),
    [events, year, month]
  );
  const childMap = useMemo(
    () => Object.fromEntries(children.map((c) => [c.id!, c])),
    [children]
  );
  const todayKey = ymd();

  const rows = Math.ceil(cells.length / 7);

  return (
    <div className="h-full flex flex-col pb-2">
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 py-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div
        className="flex-1 grid grid-cols-7 gap-1"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => {
          const dayEvents = byDay[cell.key] ?? [];
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              onClick={() => onDayClick(cell.key)}
              className={`rounded-xl p-1.5 flex flex-col items-stretch text-left transition active:scale-[0.97] ${
                cell.inMonth
                  ? "bg-white shadow-sm"
                  : "bg-white/40 text-slate-400"
              } ${isToday ? "ring-2 ring-sky-400" : ""}`}
            >
              <div
                className={`text-xs font-bold leading-none mb-1 ${
                  isToday ? "text-sky-600" : "text-slate-700"
                }`}
              >
                {cell.date.getDate()}
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-hidden">
                {dayEvents.slice(0, 3).map((e) => {
                  const color =
                    e.childIds.length === 1 && childMap[e.childIds[0]]
                      ? childMap[e.childIds[0]].color
                      : e.childIds.length === 0
                        ? "#94a3b8"
                        : "#64748b";
                  return (
                    <div
                      key={e.id}
                      className="text-[10px] leading-tight rounded px-1 py-0.5 truncate text-white font-semibold"
                      style={{ backgroundColor: color }}
                    >
                      {e.emoji ? `${e.emoji} ` : ""}
                      {e.label}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-slate-500 font-semibold">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
