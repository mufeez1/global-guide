"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DAY, useCached } from "./cache.ts";
import { getMonth, type Day } from "./services/aladhan.ts";
import { dateIn } from "./prayer.ts";
import { useLocation, usePrayerPrefs } from "./settings.ts";

// Ticking clock; null during server render so markup never depends on server time.
export function useNow(intervalMs = 1000) {
  return useSyncExternalStore(
    (cb) => { const id = setInterval(cb, intervalMs); return () => clearInterval(id); },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null
  );
}

const deviceTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Monthly schedule for the saved location, cached per location + settings + month.
// Loads next month too near the end of a month, so "next prayer" after Isha works.
export function usePrayerSchedule() {
  const [loc, setLoc, locReady] = useLocation();
  const [prefs] = usePrayerPrefs();
  const tz = loc?.tz ?? deviceTz();
  const [y, m, d] = dateIn(tz).split("-").map(Number);
  const [ny, nm] = m === 12 ? [y + 1, 1] : [y, m + 1];
  const base = loc ? `prayer:${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}:${prefs.method}:${prefs.school}:${JSON.stringify(prefs.tune)}` : null;

  const [cur, retry] = useCached(base && `${base}:${y}-${m}`, 60 * DAY, () => getMonth(loc!.lat, loc!.lng, prefs, y, m));
  const [next] = useCached(base && d >= 27 ? `${base}:${ny}-${nm}` : null, 60 * DAY, () => getMonth(loc!.lat, loc!.lng, prefs, ny, nm));

  // Remember the location's timezone so "today" is the location's today, not the device's.
  const schedTz = cur.status === "ready" ? cur.data.timezone : undefined;
  useEffect(() => {
    if (loc && schedTz && loc.tz !== schedTz) setLoc({ ...loc, tz: schedTz });
  }, [loc, schedTz, setLoc]);

  const days: Day[] = [...(cur.status === "ready" ? cur.data.days : []), ...(next.status === "ready" ? next.data.days : [])];
  const today = days.find((x) => x.date === dateIn(schedTz ?? tz));
  return { loc, locReady, prefs, state: cur, retry, days, today, timezone: schedTz ?? tz };
}
