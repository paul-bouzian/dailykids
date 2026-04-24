"use client";

import { motion } from "motion/react";
import { Baby, ListChecks, BarChart3, Sparkles, Settings } from "lucide-react";
import type { ParentsRoute } from "./ParentsShell";

const ITEMS: Array<{
  key: Exclude<ParentsRoute, "home">;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  gradient: string;
  desc: string;
}> = [
  {
    key: "children",
    label: "Gérer les enfants",
    icon: Baby,
    gradient: "from-pink-400 to-orange-400",
    desc: "Ajouter, modifier, réordonner",
  },
  {
    key: "tasks",
    label: "Gérer les tâches",
    icon: ListChecks,
    gradient: "from-sky-400 to-indigo-400",
    desc: "Créer et assigner des tâches",
  },
  {
    key: "rewards",
    label: "Récompenses",
    icon: Sparkles,
    gradient: "from-amber-400 to-yellow-400",
    desc: "Objectifs en étoiles",
  },
  {
    key: "stats",
    label: "Statistiques",
    icon: BarChart3,
    gradient: "from-emerald-400 to-teal-400",
    desc: "Progression des enfants",
  },
  {
    key: "settings",
    label: "Paramètres",
    icon: Settings,
    gradient: "from-violet-400 to-purple-400",
    desc: "Code PIN, jour/soir, sauvegarde",
  },
];

export function ParentsHome({
  navigate,
}: {
  navigate: (r: ParentsRoute) => void;
}) {
  return (
    <div className="h-full overflow-y-auto px-5 pt-5 pb-28">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Espace parents</h1>
        <p className="text-sm text-slate-500">Tout ce dont tu as besoin pour gérer DailyKids.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {ITEMS.map(({ key, label, icon: Icon, gradient, desc }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(key)}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-md text-left"
          >
            <div
              className={`size-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} shadow-md`}
            >
              <Icon className="size-7" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800">{label}</div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
