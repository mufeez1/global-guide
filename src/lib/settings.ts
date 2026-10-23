"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { kvGet, kvSet } from "./db.ts";
import { DEFAULT_PREFS, type PrayerPrefs } from "./services/aladhan.ts";

const EVENT = "ic:store";
const announce = (key: string) => window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));

// ---- Non-sensitive preferences: localStorage (sync, readable before paint) ----

const parsed = new Map<string, { raw: string | null; value: unknown }>();

function readPref<T>(key: string, initial: T): T {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key); } catch {}
  const hit = parsed.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = initial;
  try { if (raw) value = { ...initial, ...JSON.parse(raw) }; } catch {}
  parsed.set(key, { raw, value });
  return value;
}

export function usePref<T extends object>(key: string, initial: T) {
  const subscribe = useCallback((cb: () => void) => {
    const on = (e: Event) => { if (!(e instanceof CustomEvent) || e.detail === key) cb(); };
    window.addEventListener(EVENT, on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener(EVENT, on); window.removeEventListener("storage", on); };
  }, [key]);
  const value = useSyncExternalStore(subscribe, () => readPref(key, initial), () => initial);
  const set = useCallback((next: Partial<T>) => {
    try { localStorage.setItem(key, JSON.stringify({ ...readPref(key, initial), ...next })); } catch {}
    announce(key);
  }, [key, initial]);
  return [value, set] as const;
}

export type ReaderPrefs = { arabicSize: number; lineHeight: number; urduSize: number };
export const READER_DEFAULTS: ReaderPrefs = { arabicSize: 2.1, lineHeight: 2.2, urduSize: 1.25 };
export const usePrayerPrefs = () => usePref<PrayerPrefs>("ic:prayer", DEFAULT_PREFS);

// ---- Personal data: IndexedDB ----

export function useKv<T>(key: string) {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = () => kvGet<T>(key).then(setValue).catch(() => {}).finally(() => setReady(true));
    load();
    const on = (e: Event) => { if (e instanceof CustomEvent && e.detail === key) load(); };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [key]);
  const set = useCallback(async (v: T) => {
    setValue(v);
    await kvSet(key, v).catch(() => {});
    announce(key);
  }, [key]);
  return [value, set, ready] as const;
}

export type Loc = { name: string; lat: number; lng: number; tz?: string };
export const useLocation = () => useKv<Loc>("location");

export type LastRead = { chapter: number; verse: number; name: string; total: number; at: number };
export const useLastRead = () => useKv<LastRead>("lastRead");
