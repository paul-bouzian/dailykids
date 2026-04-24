"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { Download, Upload } from "lucide-react";
import { db } from "@/lib/db";
import { StackHeader } from "./StackHeader";

export function SettingsView({ back }: { back: () => void }) {
  const settings = useLiveQuery(() => db.settings.get(1));
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [threshold, setThreshold] = useState("16:00");
  const [starsPerTask, setStarsPerTask] = useState(1);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setThreshold(settings.dayNightThreshold);
      setStarsPerTask(settings.starsPerTask);
    }
  }, [settings]);

  const savePin = async () => {
    if (pin.length !== 4 || pin !== confirmPin) return;
    await db.settings.update(1, { pin });
    setPin("");
    setConfirmPin("");
    flash();
  };

  const saveThreshold = async () => {
    await db.settings.update(1, { dayNightThreshold: threshold });
    flash();
  };
  const saveStars = async () => {
    await db.settings.update(1, { starsPerTask });
    flash();
  };

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const exportData = async () => {
    const data = {
      children: await db.children.toArray(),
      tasks: await db.tasks.toArray(),
      completions: await db.completions.toArray(),
      events: await db.events.toArray(),
      rewards: await db.rewards.toArray(),
      settings: await db.settings.toArray(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailykids-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await db.transaction(
      "rw",
      [db.children, db.tasks, db.completions, db.events, db.rewards, db.settings],
      async () => {
        await db.children.clear();
        await db.tasks.clear();
        await db.completions.clear();
        await db.events.clear();
        await db.rewards.clear();
        if (data.children) await db.children.bulkAdd(data.children);
        if (data.tasks) await db.tasks.bulkAdd(data.tasks);
        if (data.completions) await db.completions.bulkAdd(data.completions);
        if (data.events) await db.events.bulkAdd(data.events);
        if (data.rewards) await db.rewards.bulkAdd(data.rewards);
        if (data.settings?.[0]) await db.settings.put(data.settings[0]);
      }
    );
    flash();
  };

  if (!settings) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StackHeader title="Paramètres" back={back} />
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {saved && (
          <div className="rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold text-center py-2">
            ✓ Enregistré
          </div>
        )}

        <Section title="🔒 Code PIN">
          <p className="text-xs text-slate-500 mb-2">
            Code actuel : <b>{"•".repeat(settings.pin.length)}</b>
          </p>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Nouveau code (4 chiffres)"
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-2"
          />
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Confirmer"
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-2"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={savePin}
            disabled={pin.length !== 4 || pin !== confirmPin}
            className="w-full rounded-2xl bg-indigo-500 text-white font-bold py-3 disabled:opacity-50"
          >
            Changer le code
          </motion.button>
        </Section>

        <Section title="☀️🌙 Seuil journée / soir">
          <p className="text-xs text-slate-500 mb-2">
            Avant cette heure : tâches du jour. Après : tâches du soir.
          </p>
          <div className="flex gap-2">
            <input
              type="time"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={saveThreshold}
              className="rounded-2xl bg-indigo-500 text-white font-bold px-5"
            >
              OK
            </button>
          </div>
        </Section>

        <Section title="⭐ Étoiles par tâche">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={5}
              value={starsPerTask}
              onChange={(e) => setStarsPerTask(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <div className="text-xl font-bold w-8 text-center">{starsPerTask}</div>
            <button
              onClick={saveStars}
              className="rounded-2xl bg-amber-500 text-white font-bold px-5 py-2"
            >
              OK
            </button>
          </div>
        </Section>

        <Section title="💾 Sauvegarde">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportData}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 text-emerald-700 font-bold py-3"
            >
              <Download className="size-4" /> Exporter
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-100 text-sky-700 font-bold py-3"
            >
              <Upload className="size-4" /> Importer
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importData(f);
                e.target.value = "";
              }}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}
