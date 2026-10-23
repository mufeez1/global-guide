"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, Trash2, DatabaseZap } from "lucide-react";
import { dbAll, dbClear, deleteDatabase, exportAll, importAll } from "@/lib/db";
import LocationPicker from "@/components/LocationPicker";
import { Dialog, toast } from "@/components/client";
import { btn, card } from "@/components/ui";
import { errorMessage } from "@/lib/http";

export default function Settings() {
  const file = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<{ cache: number; bookmarks: number; counters: number; usage?: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    Promise.all([dbAll("cache"), dbAll("bookmarks"), dbAll("counters"), navigator.storage?.estimate?.()])
      .then(([c, b, t, est]) => setStats({ cache: c.length, bookmarks: b.length, counters: t.length, usage: est?.usage ? `${(est.usage / 1048576).toFixed(1)} MB` : undefined }))
      .catch(() => setStats({ cache: 0, bookmarks: 0, counters: 0 }));
  }, [refresh]);

  const download = async () => {
    const blob = new Blob([JSON.stringify(await exportAll(), null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `islamic-companion-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (f: File) => {
    try {
      await importAll(JSON.parse(await f.text()));
      toast("Backup restored. Reloading…");
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      toast(e instanceof SyntaxError ? "That file isn't valid JSON." : errorMessage(e));
    }
  };

  const clearCache = async () => {
    await dbClear("cache");
    if ("caches" in window) for (const k of await caches.keys()) await caches.delete(k);
    toast("Saved content cleared. Your bookmarks and counts are untouched.");
    setRefresh((n) => n + 1);
  };

  const wipe = async () => {
    await deleteDatabase().catch(() => {});
    try { Object.keys(localStorage).filter((k) => k.startsWith("ic:")).forEach((k) => localStorage.removeItem(k)); } catch {}
    if ("caches" in window) for (const k of await caches.keys()) await caches.delete(k);
    location.reload();
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="loc-h" className={`${card} p-6`}>
        <h2 id="loc-h" className="font-display text-xl">Location</h2>
        <div className="mt-4"><LocationPicker /></div>
      </section>

      <section aria-labelledby="data-h" className={`${card} p-6`}>
        <h2 id="data-h" className="font-display text-xl">Your data</h2>
        <p className="mt-2 text-sm text-[var(--color-on-surface)]/75">
          Bookmarks, tasbeeh counts, reading position and location are stored only in this browser (IndexedDB). Nothing is uploaded.
        </p>
        {stats && (
          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[["Saved responses", stats.cache], ["Bookmarks", stats.bookmarks], ["Counters", stats.counters], ["Storage used", stats.usage ?? "—"]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[var(--color-surface-container-low)] p-3"><dt className="text-xs text-[var(--color-on-surface)]/60">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>
            ))}
          </dl>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={download}><Download size={16} aria-hidden="true" /> Export backup</button>
          <button type="button" className={btn} onClick={() => file.current?.click()}><Upload size={16} aria-hidden="true" /> Import backup</button>
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
          <button type="button" className={btn} onClick={clearCache}><DatabaseZap size={16} aria-hidden="true" /> Clear saved content</button>
          <button type="button" className={`${btn} !text-[var(--color-error)] !border-[var(--color-error)]/50`} onClick={() => setConfirm(true)}><Trash2 size={16} aria-hidden="true" /> Erase everything</button>
        </div>
        <p className="mt-3 text-xs text-[var(--color-on-surface)]/60">“Clear saved content” removes cached prayer times, translations and tafsir; they reload next time you&apos;re online.</p>
      </section>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Erase all data on this device?">
        <p className="text-sm">This deletes your bookmarks, tasbeeh counts and history, location and settings. Export a backup first if you want to keep them.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btn} onClick={() => setConfirm(false)}>Cancel</button>
          <button type="button" className={`${btn} !bg-[var(--color-error)] !text-white !border-transparent`} onClick={wipe}>Erase everything</button>
        </div>
      </Dialog>
    </div>
  );
}
