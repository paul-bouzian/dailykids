"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { ymd } from "@/lib/utils";
import { StackHeader } from "./StackHeader";

function dateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
}

export function StatsView({ back }: { back: () => void }) {
  const children = useLiveQuery(() =>
    db.children.orderBy("order").toArray()
  );
  const since30 = useMemo(() => dateNDaysAgo(30), []);
  const since7 = useMemo(() => dateNDaysAgo(7), []);

  const completions = useLiveQuery(
    () => db.completions.where("date").aboveOrEqual(since30).toArray(),
    [since30]
  );

  if (!children || !completions) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StackHeader title="Statistiques" back={back} />
      <div className="flex-1 overflow-y-auto px-3 pb-28 space-y-3">
        {children.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-3">📊</div>
            <p>Aucun enfant pour afficher des stats.</p>
          </div>
        ) : (
          children.map((child) => {
            const mine = completions.filter((c) => c.childId === child.id);
            const week = mine.filter((c) => c.date >= since7).length;
            const month = mine.length;
            const max = Math.max(10, month);
            const byDay = new Array(7).fill(0);
            for (let i = 0; i < 7; i++) {
              const key = dateNDaysAgo(6 - i);
              byDay[i] = mine.filter((c) => c.date === key).length;
            }
            const maxDay = Math.max(1, ...byDay);
            return (
              <div
                key={child.id}
                className="rounded-2xl p-4 shadow-sm"
                style={{ backgroundColor: child.color + "1A", borderLeft: `6px solid ${child.color}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{child.mascot}</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{child.name}</div>
                    <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold">
                      <Star className="size-4 fill-amber-400 text-amber-400" strokeWidth={2.5} />
                      {child.stars} étoiles
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl bg-white p-2.5 text-center">
                    <div className="text-2xl font-bold text-slate-800">{week}</div>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">7 jours</div>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 text-center">
                    <div className="text-2xl font-bold text-slate-800">{month}</div>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">30 jours</div>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {byDay.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${(v / maxDay) * 100}%`,
                          minHeight: v > 0 ? 4 : 2,
                          backgroundColor: child.color,
                          opacity: v === 0 ? 0.2 : 1,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-1 text-[10px] text-slate-400 font-semibold text-center">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => {
                    const now = new Date();
                    const day = new Date(now);
                    day.setDate(day.getDate() - (6 - i));
                    return (
                      <div key={i} className="flex-1">
                        {["D", "L", "M", "M", "J", "V", "S"][day.getDay()]}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Total 30 jours / max quotidien : <b>{max}</b>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
