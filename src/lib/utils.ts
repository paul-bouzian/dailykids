import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLORS = [
  { name: "orange", hex: "#F5A623", soft: "#FFE3B8" },
  { name: "bleu", hex: "#3BB0E8", soft: "#C8E9F8" },
  { name: "rose", hex: "#FF8FAB", soft: "#FFD6E0" },
  { name: "violet", hex: "#A78BFA", soft: "#E4DBFB" },
  { name: "vert", hex: "#6EC46E", soft: "#D4F1D4" },
  { name: "jaune", hex: "#F7D154", soft: "#FFF3BC" },
  { name: "rouge", hex: "#F06B6B", soft: "#FFD0D0" },
  { name: "turquoise", hex: "#4FD1C5", soft: "#C7F1EB" },
  { name: "indigo", hex: "#7C86F5", soft: "#D3D6FA" },
  { name: "menthe", hex: "#8FE3C9", soft: "#D6F5EA" },
  { name: "corail", hex: "#FF9E80", soft: "#FFDACD" },
  { name: "lavande", hex: "#C8A2F5", soft: "#EADEFD" },
] as const;

export const MASCOTS = [
  "🦁", "🐯", "🐼", "🐨", "🐵", "🦊", "🐶", "🐱",
  "🐻", "🐰", "🐸", "🐷", "🐮", "🐧", "🐥", "🦉",
  "🦄", "🐲", "🐙", "🐳", "🦋", "🐢", "🦒", "🦔",
];

export const TASK_EMOJIS = [
  "🦷", "🛁", "👕", "🍽️", "📚", "🎒", "🧸", "🎨",
  "⚽", "🎹", "📝", "🧹", "🛏️", "🥛", "🍎", "💧",
  "🧴", "🪥", "🧦", "👟", "📖", "✏️", "🌙", "☀️",
  "🧼", "🪞", "🚿", "🥗", "🎮", "📺", "🎵", "⏰",
];

export function ymd(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
