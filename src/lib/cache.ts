"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { dbGet, dbPut } from "./db.ts";
import { errorMessage } from "./http.ts";

type Entry<T> = { key: string; data: T; fetchedAt: number };
export type Cached<T> = { data: T; fetchedAt: number; fromCache: boolean; stale: boolean; error?: string };

export const DAY = 86_400_000;

// Fresh cache → use it. Otherwise fetch and store. If fetching fails, fall back to an
// expired copy (flagged stale) rather than showing nothing — never to made-up data.
export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<Cached<T>> {
  const hit = await dbGet<Entry<T>>("cache", key).catch(() => undefined);
  if (hit && Date.now() - hit.fetchedAt < ttlMs) return { data: hit.data, fetchedAt: hit.fetchedAt, fromCache: true, stale: false };
  try {
    const data = await load();
    const fetchedAt = Date.now();
    await dbPut("cache", { key, data, fetchedAt }).catch(() => {});
    return { data, fetchedAt, fromCache: false, stale: false };
  } catch (e) {
    if (hit) return { data: hit.data, fetchedAt: hit.fetchedAt, fromCache: true, stale: true, error: errorMessage(e) };
    throw e;
  }
}

export type Loadable<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | ({ status: "ready" } & Cached<T>);

// `key` null = not ready to load yet (e.g. no location chosen).
// Results are stored with the request they answer, so a new key or a retry reads as "loading".
export function useCached<T>(key: string | null, ttlMs: number, load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ id: string; value: Loadable<T> } | null>(null);
  const runLoad = useEffectEvent(() => load());
  const id = `${key}#${attempt}`;

  useEffect(() => {
    if (!key) return;
    let live = true;
    cached(key, ttlMs, runLoad)
      .then((r) => live && setResult({ id, value: { status: "ready", ...r } }))
      .catch((e) => live && setResult({ id, value: { status: "error", error: errorMessage(e) } }));
    return () => { live = false; };
  }, [key, ttlMs, id]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const state: Loadable<T> = result?.id === id ? result.value : { status: "loading" };
  return [state, retry] as const;
}
