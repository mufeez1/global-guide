"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDown, ImageDown, Loader2, Plus, RotateCcw, Trash2, Undo2, Vibrate, Volume2 } from "lucide-react";
import { dbAll, dbAllByIndex, dbDelete, dbGet, dbPut } from "@/lib/db";
import { PRESETS, addDaily, dayKey, increment, newCounter, reset, undo, type Counter, type Daily, type Session } from "@/lib/tasbeeh";
import { usePref } from "@/lib/settings";
import { Dialog, toast } from "@/components/client";
import { Arabic, Empty, ErrorState, Skeleton, btn, btnPrimary, card, input } from "@/components/ui";
import Select from "@/components/Select";
import { download, jpegToPdf } from "@/lib/export";
import { drawHistoryCard } from "./exportCard";

const R = 120;
const C = 2 * Math.PI * R;

let audioCtx: AudioContext | null = null;
function click(freq = 880) {
  audioCtx ??= new AudioContext();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.08, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.09);
}

export default function Tasbeeh({ preset }: { preset?: { text: string; arabic?: string; target: number } }) {
  const [counters, setCounters] = useState<Counter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>("subhanallah");
  const [prefs, setPrefs] = usePref("ic:tasbeeh", { vibrate: true, sound: false });
  const [confirm, setConfirm] = useState<"reset" | "delete" | null>(null);
  const [adding, setAdding] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [historyKey, setHistoryKey] = useState(0);
  const writeQueue = useRef(Promise.resolve());
  // Latest counters for event handlers, so rapid taps never read a stale render.
  const latest = useRef<Counter[] | null>(null);
  const commit = (next: Counter[]) => { latest.current = next; setCounters(next); };

  // Serialise writes so rapid taps can't reorder daily totals.
  const persist = useCallback((fn: () => Promise<unknown>) => {
    writeQueue.current = writeQueue.current.then(fn).then(() => {}, () => setError("Couldn't save to this device. Your count may not be kept."));
  }, []);

  useEffect(() => {
    (async () => {
      let rows = await dbAll<Counter>("counters");
      const now = Date.now();
      for (const p of PRESETS) if (!rows.some((r) => r.id === p.id)) { const c = newCounter(p, now); rows.push(c); await dbPut("counters", c); }
      let pick = (await dbGet<{ value: string }>("kv", "tasbeehActive"))?.value;
      if (preset?.text) {
        const existing = rows.find((r) => r.custom && r.label === preset.text);
        const c = existing ?? newCounter({ id: `custom-${now}`, label: preset.text, arabic: preset.arabic, target: preset.target, custom: true }, now);
        if (!existing) { rows.push(c); await dbPut("counters", c); }
        pick = c.id;
      }
      rows = [...rows.filter((r) => !r.custom).sort((a, b) => PRESETS.findIndex((p) => p.id === a.id) - PRESETS.findIndex((p) => p.id === b.id)), ...rows.filter((r) => r.custom)];
      commit(rows);
      if (pick && rows.some((r) => r.id === pick)) setActiveId(pick);
    })().catch(() => setError("Local storage isn't available, so counts can't be saved in this browser."));
  }, [preset?.text, preset?.arabic, preset?.target]);

  const active = counters?.find((c) => c.id === activeId) ?? counters?.[0];
  const current = () => latest.current?.find((c) => c.id === active?.id);

  const update = (c: Counter) => commit(latest.current!.map((x) => (x.id === c.id ? c : x)));
  const select = (id: string) => { setActiveId(id); persist(() => dbPut("kv", { key: "tasbeehActive", value: id })); };

  const tap = () => {
    const c0 = current();
    if (!c0) return;
    const now = Date.now();
    const { counter, completed } = increment(c0, now);
    update(counter);
    if (completed) {
      if (prefs.vibrate) navigator.vibrate?.([60, 40, 120]);
      if (prefs.sound) click(660);
      setAnnounce(`${counter.label} complete: ${counter.target}`);
    } else {
      if (prefs.vibrate) navigator.vibrate?.(10);
      if (prefs.sound) click();
    }
    persist(async () => {
      await dbPut("counters", counter);
      await dbPut("tasbeehDaily", addDaily(await dbGet<Daily>("tasbeehDaily", `${dayKey(now)}:${counter.id}`), counter, 1, now));
      if (completed) { await dbPut("sessions", completed); setHistoryKey((k) => k + 1); }
    });
  };

  const doUndo = () => {
    const c0 = current();
    if (!c0 || c0.count === 0) return;
    const now = Date.now();
    const c = undo(c0, now);
    update(c);
    setAnnounce(`Undone. ${c.count}`);
    persist(async () => {
      await dbPut("counters", c);
      const row = await dbGet<Daily>("tasbeehDaily", `${dayKey(now)}:${c.id}`);
      if (row) await dbPut("tasbeehDaily", addDaily(row, c, -1, now));
    });
  };

  const doReset = () => {
    const { counter, session } = reset(current()!, Date.now());
    update(counter);
    setConfirm(null);
    toast(session ? "Reset. The unfinished round was saved to history." : "Reset");
    persist(async () => { await dbPut("counters", counter); if (session) { await dbPut("sessions", session); setHistoryKey((k) => k + 1); } });
  };

  const doDelete = () => {
    const id = active!.id;
    commit(latest.current!.filter((c) => c.id !== id));
    setActiveId("subhanallah");
    setConfirm(null);
    persist(() => dbDelete("counters", id));
  };

  if (error && !counters) return <div className="max-w-3xl mx-auto px-4 sm:px-8"><ErrorState message={error} /></div>;
  if (!counters || !active) return <div className="max-w-3xl mx-auto px-4 sm:px-8"><Skeleton className="h-96" /></div>;

  const pct = Math.min(1, active.count / active.target);
  const complete = active.count >= active.target;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24 grid lg:grid-cols-[1fr_20rem] gap-8 items-start">
      <section aria-label="Counter" className={`${card} p-5 sm:p-8 flex flex-col items-center`}>
        {error && <p role="alert" className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        <Select label="Dhikr" hideLabel className="w-full max-w-sm" value={active.id} onChange={select}
          options={counters.map((c) => ({ value: c.id, label: `${c.label} (${c.target})`, group: c.custom ? "Your dhikr" : "Presets" }))} />
        {active.arabic && <Arabic className="mt-6 !text-center text-3xl leading-[1.9]">{active.arabic}</Arabic>}

        <button
          type="button"
          onClick={tap}
          aria-label={`Count ${active.label}. ${active.count} of ${active.target}`}
          className="relative mt-6 w-72 h-72 max-w-full aspect-square rounded-full select-none touch-manipulation cursor-pointer active:scale-[0.97] transition-transform focus-visible:outline-4"
        >
          <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="130" cy="130" r={R} fill="var(--color-primary-container)" fillOpacity="0.35" stroke="var(--color-surface-container)" strokeWidth="12" />
            <circle cx="130" cy="130" r={R} fill="none" stroke="var(--color-primary)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} className="transition-[stroke-dashoffset] duration-200" />
          </svg>
          <span className="relative flex flex-col items-center">
            <span className="font-display text-7xl tabular-nums text-[var(--color-on-surface)]">{active.count}</span>
            <span className="mt-1 text-sm text-[var(--color-on-surface)]/65 tabular-nums">of {active.target}</span>
            <span className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">{complete ? "Complete · tap for next round" : "Tap to count"}</span>
          </span>
        </button>
        <p className="sr-only" aria-live="assertive">{announce}</p>
        <p className="mt-4 text-sm text-[var(--color-on-surface)]/65">Rounds completed: <span className="tabular-nums font-semibold">{active.rounds}</span></p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className={btn} onClick={doUndo} disabled={active.count === 0}><Undo2 size={16} aria-hidden="true" /> Undo</button>
          <button type="button" className={btn} onClick={() => setConfirm("reset")} disabled={active.count === 0}><RotateCcw size={16} aria-hidden="true" /> Reset</button>
          <label className={`${btn} gap-2`}>
            Target
            <input type="number" min={1} max={10000} inputMode="numeric" value={active.target} aria-label="Target count"
              onChange={(e) => { const c = { ...current()!, target: Math.max(1, Math.min(10000, Math.round(+e.target.value) || 1)) }; update(c); persist(() => dbPut("counters", c)); }}
              className="w-20 bg-transparent text-center tabular-nums border-b border-[var(--color-outline-variant)] focus:outline-none" />
          </label>
          {active.custom && <button type="button" className={btn} onClick={() => setConfirm("delete")}><Trash2 size={16} aria-hidden="true" /> Delete</button>}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <label className="flex items-center gap-2 min-h-11 cursor-pointer">
            <input type="checkbox" checked={prefs.vibrate} onChange={(e) => setPrefs({ vibrate: e.target.checked })} className="w-5 h-5 accent-[var(--color-primary)]" />
            <Vibrate size={16} aria-hidden="true" /> Vibration <span className="text-xs text-[var(--color-on-surface)]/55">(where supported)</span>
          </label>
          <label className="flex items-center gap-2 min-h-11 cursor-pointer">
            <input type="checkbox" checked={prefs.sound} onChange={(e) => setPrefs({ sound: e.target.checked })} className="w-5 h-5 accent-[var(--color-primary)]" />
            <Volume2 size={16} aria-hidden="true" /> Sound
          </label>
        </div>
      </section>

      <aside className="space-y-6">
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" /> New dhikr</button>
        <History refreshKey={historyKey} />
      </aside>

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === "delete" ? `Delete “${active.label}”?` : `Reset ${active.label}?`}>
        <p className="text-sm">
          {confirm === "delete" ? "This removes the counter. Its past daily totals and sessions stay in your history." : `Your current count of ${active.count} will go back to 0. An unfinished round is kept in history.`}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btn} onClick={() => setConfirm(null)}>Cancel</button>
          <button type="button" className={`${btnPrimary} !bg-[var(--color-error)]`} onClick={confirm === "delete" ? doDelete : doReset}>{confirm === "delete" ? "Delete" : "Reset"}</button>
        </div>
      </Dialog>

      <Dialog open={adding} onClose={() => setAdding(false)} title="New dhikr">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const label = String(f.get("label")).trim();
            if (!label) return;
            const c = newCounter({ id: `custom-${Date.now()}`, label, arabic: String(f.get("arabic")).trim() || undefined, target: Math.max(1, +f.get("target")! || 33), custom: true }, Date.now());
            commit([...latest.current!, c]);
            select(c.id);
            persist(() => dbPut("counters", c));
            setAdding(false);
          }}
        >
          <label className="block text-sm"><span className="block mb-1 font-semibold">Name</span><input name="label" required maxLength={80} className={input} placeholder="e.g. Salawat" /></label>
          <label className="block text-sm"><span className="block mb-1 font-semibold">Arabic text (optional)</span><input name="arabic" dir="rtl" lang="ar" maxLength={300} className={`${input} font-arabic text-xl`} /></label>
          <label className="block text-sm"><span className="block mb-1 font-semibold">Target</span><input name="target" type="number" min={1} max={10000} defaultValue={33} className={input} /></label>
          <button className={btnPrimary}>Add</button>
        </form>
      </Dialog>
    </div>
  );
}

function History({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<{ today: string; days: { day: string; total: number }[]; sessions: Session[] } | null>(null);
  useEffect(() => {
    const since = dayKey(Date.now() - 6 * 86_400_000);
    Promise.all([dbAllByIndex<Daily>("tasbeehDaily", "day", IDBKeyRange.lowerBound(since)), dbAll<Session>("sessions")])
      .then(([daily, sessions]) => {
        const totals = new Map<string, number>();
        for (const d of daily) totals.set(d.day, (totals.get(d.day) ?? 0) + d.count);
        setData({ today: dayKey(Date.now()), days: [...totals].map(([day, total]) => ({ day, total })).sort((a, b) => b.day.localeCompare(a.day)), sessions: sessions.sort((a, b) => b.endedAt - a.endedAt).slice(0, 8) });
      })
      .catch(() => setData({ today: "", days: [], sessions: [] }));
  }, [refreshKey]);

  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const exportHistory = async (kind: "png" | "pdf") => {
    if (!data) return;
    setExporting(kind);
    try {
      const sessions = (await dbAll<Session>("sessions")).sort((a, b) => b.endedAt - a.endedAt);
      const canvas = await drawHistoryCard(data.days, sessions);
      const name = `tasbeeh-${dayKey(Date.now())}`;
      if (kind === "png") {
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
        if (blob) download(blob, `${name}.png`);
      } else {
        const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
        if (jpeg) download(new Blob([jpegToPdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height) as BlobPart], { type: "application/pdf" }), `${name}.pdf`);
      }
    } catch {
      toast("Couldn't create the file. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  if (!data) return <Skeleton className="h-48" />;
  return (
    <>
      <section aria-labelledby="daily-h" className={`${card} p-5`}>
        <h2 id="daily-h" className="font-display text-lg">Last 7 days</h2>
        {data.days.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {data.days.map((d) => (
              <li key={d.day} className="flex justify-between"><span>{d.day === data.today ? "Today" : new Date(d.day + "T12:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span><span className="tabular-nums font-semibold">{d.total.toLocaleString()}</span></li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-[var(--color-on-surface)]/65">No counts yet this week.</p>}
      </section>
      <section aria-labelledby="sess-h" className={`${card} p-5`}>
        <h2 id="sess-h" className="font-display text-lg">Recent sessions</h2>
        {data.sessions.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {data.sessions.map((s) => (
              <li key={s.id ?? s.endedAt} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{s.label}<span className="block text-xs text-[var(--color-on-surface)]/55">{new Date(s.endedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span></span>
                <span className="tabular-nums shrink-0">{s.count}/{s.target}{!s.completed && <span className="block text-xs text-[var(--color-on-surface)]/55">reset early</span>}</span>
              </li>
            ))}
          </ul>
        ) : <div className="mt-3"><Empty>Complete or reset a round to see it here.</Empty></div>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["png", "pdf"] as const).map((k) => (
            <button key={k} type="button" className={btn} disabled={!!exporting} aria-busy={exporting === k} onClick={() => exportHistory(k)}>
              {exporting === k ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : k === "png" ? <ImageDown size={16} aria-hidden="true" /> : <FileDown size={16} aria-hidden="true" />}
              {k === "png" ? "Save image" : "Save PDF"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--color-on-surface)]/55">Your counts never leave this device unless you export them.</p>
      </section>
    </>
  );
}
