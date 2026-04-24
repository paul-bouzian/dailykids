"use client";

import { useEffect } from "react";
import { ensureDefaults } from "@/lib/db";
import { maybeResetDaily } from "@/lib/reset-scheduler";
import { BottomTabs } from "./BottomTabs";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureDefaults().then(() => maybeResetDaily());
  }, []);

  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden">
      <ServiceWorkerRegister />
      <main className="flex-1 min-h-0 overflow-hidden pb-24">{children}</main>
      <BottomTabs />
    </div>
  );
}
