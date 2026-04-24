import Dexie, { type Table } from "dexie";

export type Period = "day" | "night";
export type Recurrence = "none" | "weekly" | "monthly";

export interface Child {
  id?: number;
  name: string;
  mascot: string;
  color: string;
  order: number;
  stars: number;
}

export interface Task {
  id?: number;
  label: string;
  emoji: string;
  childIds: number[];
  periods: Period[];
  order: number;
}

export interface TaskCompletion {
  id?: number;
  taskId: number;
  childId: number;
  date: string;
  period: Period;
  completedAt: number;
}

export interface CalendarEvent {
  id?: number;
  label: string;
  emoji?: string;
  date: string;
  childIds: number[];
  recurrence: Recurrence;
}

export interface Reward {
  id?: number;
  label: string;
  emoji: string;
  starsCost: number;
}

export interface Settings {
  id: 1;
  pin: string;
  dayNightThreshold: string;
  starsPerTask: number;
  lastResetDate: string;
}

class DailyKidsDB extends Dexie {
  children!: Table<Child, number>;
  tasks!: Table<Task, number>;
  completions!: Table<TaskCompletion, number>;
  events!: Table<CalendarEvent, number>;
  rewards!: Table<Reward, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super("dailykids");
    this.version(1).stores({
      children: "++id, order",
      tasks: "++id, order",
      completions: "++id, [taskId+childId+date+period], date, childId",
      events: "++id, date",
      rewards: "++id",
      settings: "id",
    });
  }
}

export const db = new DailyKidsDB();

export async function ensureDefaults() {
  const existing = await db.settings.get(1);
  if (!existing) {
    await db.settings.put({
      id: 1,
      pin: "0000",
      dayNightThreshold: "16:00",
      starsPerTask: 1,
      lastResetDate: new Date().toISOString().slice(0, 10),
    });
  }

  const childCount = await db.children.count();
  if (childCount === 0) {
    const id1 = await db.children.add({
      name: "Louna",
      mascot: "🦊",
      color: "#FF8FAB",
      order: 0,
      stars: 0,
    });
    const id2 = await db.children.add({
      name: "Noah",
      mascot: "🦁",
      color: "#F5A623",
      order: 1,
      stars: 0,
    });

    await db.tasks.bulkAdd([
      { label: "Se brosser les dents", emoji: "🪥", childIds: [id1, id2], periods: ["day", "night"], order: 0 },
      { label: "Faire le lit", emoji: "🛏️", childIds: [id1, id2], periods: ["day"], order: 1 },
      { label: "Prendre le petit déjeuner", emoji: "🥣", childIds: [id1, id2], periods: ["day"], order: 2 },
      { label: "S'habiller", emoji: "👕", childIds: [id1, id2], periods: ["day"], order: 3 },
      { label: "Faire ses devoirs", emoji: "📚", childIds: [id1], periods: ["day"], order: 4 },
      { label: "Ranger sa chambre", emoji: "🧸", childIds: [id1, id2], periods: ["night"], order: 5 },
      { label: "Prendre la douche", emoji: "🚿", childIds: [id1, id2], periods: ["night"], order: 6 },
      { label: "Lire un livre", emoji: "📖", childIds: [id1], periods: ["night"], order: 7 },
    ]);

    await db.rewards.bulkAdd([
      { label: "Un bonbon", emoji: "🍭", starsCost: 5 },
      { label: "Un dessin animé", emoji: "📺", starsCost: 10 },
      { label: "Une sortie au parc", emoji: "🛝", starsCost: 30 },
    ]);
  }
}
