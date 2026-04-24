"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PinLock } from "./PinLock";
import { ParentsHome } from "./ParentsHome";
import { ChildrenManager } from "./ChildrenManager";
import { TasksManager } from "./TasksManager";
import { RewardsManager } from "./RewardsManager";
import { StatsView } from "./StatsView";
import { SettingsView } from "./SettingsView";

export type ParentsRoute =
  | "home"
  | "children"
  | "tasks"
  | "rewards"
  | "stats"
  | "settings";

export function ParentsShell() {
  const [unlocked, setUnlocked] = useState(false);
  const [route, setRoute] = useState<ParentsRoute>("home");
  const pathname = usePathname();

  useEffect(() => {
    const relock = () => {
      setUnlocked(false);
      setRoute("home");
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") relock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!pathname?.startsWith("/parents")) {
      setUnlocked(false);
      setRoute("home");
    }
  }, [pathname]);

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-sky-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {route === "home" && <ParentsHome navigate={setRoute} />}
          {route === "children" && <ChildrenManager back={() => setRoute("home")} />}
          {route === "tasks" && <TasksManager back={() => setRoute("home")} />}
          {route === "rewards" && <RewardsManager back={() => setRoute("home")} />}
          {route === "stats" && <StatsView back={() => setRoute("home")} />}
          {route === "settings" && <SettingsView back={() => setRoute("home")} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
