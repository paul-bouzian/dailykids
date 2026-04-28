"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Sun, Moon, ArrowDownUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALL_WEEKDAYS, db } from "@/lib/db";
import { currentPeriod, currentWeekday } from "@/lib/day-night";
import { ymd } from "@/lib/utils";
import { scheduleMidnightReset } from "@/lib/reset-scheduler";
import { ChildColumn } from "./ChildColumn";

export function TasksBoard() {
  const children = useLiveQuery(() =>
    db.children.orderBy("order").toArray()
  );
  const tasks = useLiveQuery(() => db.tasks.orderBy("order").toArray());
  const settings = useLiveQuery(() => db.settings.get(1));

  const today = useMemo(() => ymd(), []);
  const completions = useLiveQuery(
    () => db.completions.where("date").equals(today).toArray(),
    [today]
  );

  const period = settings
    ? currentPeriod(settings.dayNightThreshold)
    : "day";
  const todayWeekday = currentWeekday();

  const [reorderMode, setReorderMode] = useState(false);

  const [, setTick] = useState(0);
  useEffect(() => {
    const off = scheduleMidnightReset(() => setTick((n) => n + 1));
    return off;
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!children || !tasks || !settings || !completions) {
    return <LoadingScreen />;
  }

  const isNight = period === "night";

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden transition-colors duration-500"
      style={{
        background: isNight
          ? "linear-gradient(180deg, #2A1F66 0%, #4A2D7A 60%, #6B3BA8 100%)"
          : "linear-gradient(180deg, #C8E9F8 0%, #FDF3D1 100%)",
      }}
    >
      <DecorativeSky night={isNight} />

      <div className="relative z-10 flex items-center justify-between px-4 pt-4 gap-2">
        <div className={isNight ? "text-white" : "text-slate-800"}>
          <h1 className="text-2xl font-bold leading-tight">
            {reorderMode ? "Réorganiser" : isNight ? "Bonsoir !" : "Bonjour !"}
          </h1>
          <p className={`text-sm ${isNight ? "text-white/70" : "text-slate-600"}`}>
            {reorderMode
              ? "Glisse les tâches pour les réordonner"
              : isNight
                ? "Tâches du soir"
                : "Tâches de la journée"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!reorderMode && (
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-2 shadow-lg font-semibold text-sm pointer-events-none ${
                isNight
                  ? "bg-white/20 text-white backdrop-blur border border-white/20"
                  : "bg-white text-slate-700"
              }`}
              aria-label={isNight ? "Période : soir" : "Période : jour"}
            >
              {isNight ? (
                <Moon className="size-4" strokeWidth={2.5} />
              ) : (
                <Sun className="size-4" strokeWidth={2.5} />
              )}
            </div>
          )}

          {children && children.length > 0 && (
            reorderMode ? (
              <button
                onClick={() => setReorderMode(false)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 shadow-lg font-bold text-sm bg-emerald-500 text-white active:scale-95"
                aria-label="Terminer la réorganisation"
              >
                <Check className="size-4" strokeWidth={3} /> Terminer
              </button>
            ) : (
              <button
                onClick={() => setReorderMode(true)}
                className={`size-10 rounded-full shadow-lg flex items-center justify-center active:scale-95 ${
                  isNight
                    ? "bg-white/20 text-white backdrop-blur border border-white/20"
                    : "bg-white text-slate-700"
                }`}
                aria-label="Réorganiser les tâches"
                title="Réorganiser les tâches"
              >
                <ArrowDownUp className="size-4" strokeWidth={2.5} />
              </button>
            )
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0 mt-4">
        {children.length === 0 ? (
          <EmptyState night={isNight} />
        ) : (
          <div className="h-full overflow-x-auto overflow-y-hidden no-scrollbar px-4 pb-28">
            <div className="flex gap-4 h-full">
              <AnimatePresence mode="popLayout">
                {children.map((child, idx) => (
                  <motion.div
                    key={child.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="h-full"
                  >
                    <ChildColumn
                      child={child}
                      tasks={tasks.filter(
                        (t) =>
                          t.childIds.includes(child.id!) &&
                          t.periods.includes(period) &&
                          (t.weekdays ?? ALL_WEEKDAYS).includes(todayWeekday)
                      )}
                      completions={completions.filter(
                        (c) => c.childId === child.id && c.period === period
                      )}
                      period={period}
                      night={isNight}
                      starsPerTask={settings.starsPerTask}
                      reorderMode={reorderMode}
                      index={idx}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DecorativeSky({ night }: { night: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {night ? (
        <>
          <div className="absolute top-6 right-8 text-6xl float-slow">🌙</div>
          <div className="absolute top-16 left-10 text-2xl float-slow" style={{ animationDelay: "0.5s" }}>
            ⭐
          </div>
          <div className="absolute top-24 right-24 text-xl float-slow" style={{ animationDelay: "1s" }}>
            ✨
          </div>
          <div className="absolute top-10 left-24 text-lg float-slow" style={{ animationDelay: "1.5s" }}>
            ⭐
          </div>
        </>
      ) : (
        <>
          <div className="absolute top-4 right-6 text-6xl float-slow">☀️</div>
          <div className="absolute top-16 left-8 text-3xl float-slow" style={{ animationDelay: "0.5s" }}>
            ☁️
          </div>
          <div className="absolute top-8 left-1/2 text-2xl float-slow" style={{ animationDelay: "1s" }}>
            ☁️
          </div>
          <div className="absolute top-20 right-1/3 text-lg float-slow" style={{ animationDelay: "1.5s" }}>
            🦋
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ night }: { night: boolean }) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${night ? "text-white" : "text-slate-700"}`}>
      <div className="text-6xl mb-4 float-slow">🧸</div>
      <h2 className="text-xl font-bold mb-2">Aucun enfant pour le moment</h2>
      <p className="text-sm opacity-80">
        Va dans l&apos;onglet <b>Parents</b> pour ajouter tes enfants et leurs tâches !
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-4xl float-slow">🐻</div>
    </div>
  );
}
