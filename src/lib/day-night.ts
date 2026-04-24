import type { Period } from "./db";
import { timeToMinutes } from "./utils";

export function currentPeriod(threshold: string, now: Date = new Date()): Period {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin < timeToMinutes(threshold) ? "day" : "night";
}
