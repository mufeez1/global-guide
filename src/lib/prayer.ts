// Pure prayer-time helpers. Times arrive as ISO strings with the location's UTC offset,
// so comparisons are plain epoch math and DST is already handled by the API.
import { PRAYERS, type Day, type PrayerName } from "./services/aladhan.ts";

export const SALAH: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

// YYYY-MM-DD for `now` as seen in `timeZone`.
export function dateIn(timeZone: string, now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function timeIn(iso: string, timeZone: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

// Next upcoming prayer (Sunrise excluded) across the loaded days.
export function nextPrayer(days: Day[], now = Date.now()) {
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const name of SALAH) {
      const at = Date.parse(day.times[name]);
      if (at > now) return { name, at, day };
    }
  }
  return null;
}

// The prayer whose time has started and not yet ended (Fajr ends at Sunrise).
export function currentPrayer(day: Day, now = Date.now()): PrayerName | null {
  let current: PrayerName | null = null;
  for (const name of PRAYERS) if (Date.parse(day.times[name]) <= now) current = name;
  return current === "Sunrise" ? null : current;
}

export function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
