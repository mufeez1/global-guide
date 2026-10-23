"use client";

import { useCallback, useSyncExternalStore } from "react";
import { dbAll, dbDelete, dbPut } from "./db.ts";

export type BookmarkKind = "quran" | "hadith" | "dua" | "name";
export type Bookmark = { id: string; kind: BookmarkKind; title: string; text: string; href: string; createdAt: number };

// One shared in-memory copy so a page with hundreds of verses reads IndexedDB once.
let items: Bookmark[] = [];
let loaded = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!loaded) {
    loaded = true;
    dbAll<Bookmark>("bookmarks").then((rows) => { items = rows.sort((a, b) => b.createdAt - a.createdAt); emit(); }).catch(() => {});
  }
  return () => subs.delete(cb);
}

const EMPTY: Bookmark[] = [];
export const useBookmarks = () => useSyncExternalStore(subscribe, () => items, () => EMPTY);

export function useBookmark(item: Omit<Bookmark, "createdAt">) {
  const all = useBookmarks();
  const saved = all.some((b) => b.id === item.id);
  const toggle = useCallback(async (text?: string) => {
    if (saved) {
      items = items.filter((b) => b.id !== item.id);
      emit();
      await dbDelete("bookmarks", item.id);
    } else {
      const b = { ...item, text: text ?? item.text, createdAt: Date.now() };
      items = [b, ...items];
      emit();
      await dbPut("bookmarks", b);
    }
    return !saved;
  }, [saved, item]);
  return [saved, toggle] as const;
}
