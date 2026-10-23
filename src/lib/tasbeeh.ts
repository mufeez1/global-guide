// Pure tasbeeh rules. Persistence lives in the page; this file has no browser APIs.

export type Counter = { id: string; label: string; arabic?: string; count: number; target: number; rounds: number; startedAt: number; updatedAt: number; custom?: boolean };
export type Session = { id?: number; counterId: string; label: string; count: number; target: number; startedAt: number; endedAt: number; completed: boolean };
export type Daily = { id: string; day: string; counterId: string; label: string; count: number };

export const PRESETS: Omit<Counter, "count" | "rounds" | "startedAt" | "updatedAt">[] = [
  { id: "subhanallah", label: "SubhanAllah", arabic: "سُبْحَانَ اللَّهِ", target: 33 },
  { id: "alhamdulillah", label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33 },
  { id: "allahuakbar", label: "Allahu Akbar", arabic: "اللَّهُ أَكْبَرُ", target: 34 },
  { id: "tahlil", label: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", target: 100 },
  { id: "istighfar", label: "Astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
];

export const newCounter = (p: Omit<Counter, "count" | "rounds" | "startedAt" | "updatedAt">, now: number): Counter =>
  ({ ...p, count: 0, rounds: 0, startedAt: now, updatedAt: now });

// Local calendar day, so "today" matches the user's clock.
export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Reaching the target completes a round (logged as a session); the next tap starts a fresh round.
export function increment(c: Counter, now: number): { counter: Counter; completed?: Session } {
  const fresh = c.count >= c.target;
  const count = fresh ? 1 : c.count + 1;
  const counter = { ...c, count, startedAt: fresh || c.count === 0 ? now : c.startedAt, updatedAt: now, rounds: count === c.target ? c.rounds + 1 : c.rounds };
  return count === c.target
    ? { counter, completed: { counterId: c.id, label: c.label, count, target: c.target, startedAt: counter.startedAt, endedAt: now, completed: true } }
    : { counter };
}

export function undo(c: Counter, now: number): Counter {
  if (c.count === 0) return c;
  return { ...c, count: c.count - 1, rounds: c.count === c.target ? Math.max(0, c.rounds - 1) : c.rounds, updatedAt: now };
}

// Reset keeps an unfinished round in history so nothing is silently lost.
export function reset(c: Counter, now: number): { counter: Counter; session?: Session } {
  const counter = { ...c, count: 0, startedAt: now, updatedAt: now };
  if (c.count === 0 || c.count >= c.target) return { counter };
  return { counter, session: { counterId: c.id, label: c.label, count: c.count, target: c.target, startedAt: c.startedAt, endedAt: now, completed: false } };
}

export function addDaily(row: Daily | undefined, c: Counter, delta: number, now: number): Daily {
  const day = dayKey(now);
  return { id: `${day}:${c.id}`, day, counterId: c.id, label: c.label, count: Math.max(0, (row?.count ?? 0) + delta) };
}
