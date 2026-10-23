// Tiny IndexedDB layer. Everything personal (bookmarks, tasbeeh, location) stays on this device.

const DB_NAME = "islamic-companion";
const DB_VERSION = 1;

export type StoreName = "cache" | "bookmarks" | "counters" | "tasbeehDaily" | "sessions" | "kv";
export const STORES: StoreName[] = ["cache", "bookmarks", "counters", "tasbeehDaily", "sessions", "kv"];

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Local storage isn't available in this browser."));
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    // Versioned upgrades: add a `case` per version, never edit an old one.
    req.onupgradeneeded = (e) => {
      const db = req.result;
      switch (e.oldVersion) {
        case 0: {
          db.createObjectStore("cache", { keyPath: "key" });
          db.createObjectStore("bookmarks", { keyPath: "id" }).createIndex("kind", "kind");
          db.createObjectStore("counters", { keyPath: "id" });
          db.createObjectStore("tasbeehDaily", { keyPath: "id" }).createIndex("day", "day");
          db.createObjectStore("sessions", { keyPath: "id", autoIncrement: true }).createIndex("endedAt", "endedAt");
          db.createObjectStore("kv", { keyPath: "key" });
        }
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); dbPromise = null; };
      resolve(db);
    };
    req.onerror = () => { dbPromise = null; reject(req.error ?? new Error("Couldn't open local storage.")); };
    req.onblocked = () => reject(new Error("Close other tabs of this app to finish updating local storage."));
  });
  return dbPromise;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export const dbGet = <T>(store: StoreName, key: IDBValidKey) => run<T | undefined>(store, "readonly", (s) => s.get(key));
export const dbAll = <T>(store: StoreName) => run<T[]>(store, "readonly", (s) => s.getAll());
export const dbAllByIndex = <T>(store: StoreName, index: string, query: IDBKeyRange | IDBValidKey) =>
  run<T[]>(store, "readonly", (s) => s.index(index).getAll(query));
export const dbPut = <T>(store: StoreName, value: T) => run(store, "readwrite", (s) => s.put(value));
export const dbDelete = (store: StoreName, key: IDBValidKey) => run(store, "readwrite", (s) => s.delete(key));
export const dbClear = (store: StoreName) => run(store, "readwrite", (s) => s.clear());

// Small key-value settings (location, last read, playback position…).
export const kvGet = async <T>(key: string) => (await dbGet<{ key: string; value: T }>("kv", key))?.value;
export const kvSet = <T>(key: string, value: T) => dbPut("kv", { key, value });

export async function exportAll() {
  const out: Record<string, unknown[]> = {};
  for (const s of STORES) if (s !== "cache") out[s] = await dbAll(s);
  return { app: DB_NAME, version: DB_VERSION, exportedAt: new Date().toISOString(), data: out };
}

export async function importAll(json: unknown) {
  const data = (json as { app?: string; data?: Record<string, unknown[]> })?.data;
  if ((json as { app?: string })?.app !== DB_NAME || !data) throw new Error("This file isn't an Islamic Companion backup.");
  for (const s of STORES) {
    if (s === "cache" || !Array.isArray(data[s])) continue;
    for (const row of data[s]) await dbPut(s, row);
  }
}

// Recovery path for a corrupted database: wipe and start fresh.
export function deleteDatabase() {
  dbPromise?.then((db) => db.close()).catch(() => {});
  dbPromise = null;
  return new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
