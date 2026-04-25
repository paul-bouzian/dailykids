import type { Period, Weekday } from "./db";
import { timeToMinutes } from "./utils";

export function currentPeriod(threshold: string, now: Date = new Date()): Period {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin < timeToMinutes(threshold) ? "day" : "night";
}

/** Renvoie 0 (lundi) à 6 (dimanche) selon la convention française. */
export function currentWeekday(now: Date = new Date()): Weekday {
  return ((now.getDay() + 6) % 7) as Weekday;
}

export const WEEKDAY_LABELS_SHORT = ["L", "M", "M", "J", "V", "S", "D"] as const;
export const WEEKDAY_LABELS_LONG = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;
