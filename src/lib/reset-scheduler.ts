"use client";

import { db } from "./db";
import { ymd } from "./utils";

export async function maybeResetDaily() {
  const settings = await db.settings.get(1);
  if (!settings) return;
  const today = ymd();
  if (settings.lastResetDate !== today) {
    await db.settings.update(1, { lastResetDate: today });
  }
}

export function scheduleMidnightReset(onTick: () => void) {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    5
  );
  const delay = Math.max(5000, next.getTime() - now.getTime());
  const t = window.setTimeout(async () => {
    await maybeResetDaily();
    onTick();
    scheduleMidnightReset(onTick);
  }, delay);
  return () => clearTimeout(t);
}
