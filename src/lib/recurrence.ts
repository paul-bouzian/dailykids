import type { CalendarEvent } from "./db";
import { parseYmd, ymd } from "./utils";

export function eventOccursOn(event: CalendarEvent, dayYmd: string): boolean {
  if (event.date === dayYmd) return true;
  if (event.recurrence === "none") return false;
  const origin = parseYmd(event.date);
  const target = parseYmd(dayYmd);
  if (target < origin) return false;
  if (event.recurrence === "weekly") {
    return origin.getDay() === target.getDay();
  }
  if (event.recurrence === "monthly") {
    return origin.getDate() === target.getDate();
  }
  return false;
}

export function expandEventsForMonth(
  events: CalendarEvent[],
  year: number,
  month: number
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const key = ymd(d);
    map[key] = events.filter((e) => eventOccursOn(e, key));
  }
  return map;
}
