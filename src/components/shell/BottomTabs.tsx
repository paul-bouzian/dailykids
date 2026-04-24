"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ListChecks, ShieldUser } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/tasks", label: "Tâches", icon: ListChecks },
  { href: "/parents", label: "Parents", icon: ShieldUser },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-xl px-3 pb-1 pt-1">
        <div className="relative grid grid-cols-3 rounded-3xl bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(60,60,120,0.12)] border border-white">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[64px] text-xs font-semibold"
                prefetch
              >
                {active && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-1 rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <div className="relative flex flex-col items-center gap-0.5">
                  <Icon
                    className={cn(
                      "size-6 transition-colors",
                      active ? "text-sky-600" : "text-slate-400"
                    )}
                    strokeWidth={2.4}
                  />
                  <span
                    className={cn(
                      "transition-colors",
                      active ? "text-sky-700" : "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
