"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, CalendarDays, MapPin, Settings2 } from "lucide-react";
import { usePrayerSchedule, useNow } from "@/lib/usePrayer";
import { usePrayerPrefs, useKv, usePref } from "@/lib/settings";
import { DAY, useCached } from "@/lib/cache";
import { getMethods, PRAYERS, type PrayerName } from "@/lib/services/aladhan";
import { countdown, currentPrayer, nextPrayer, timeIn } from "@/lib/prayer";
import LocationPicker from "@/components/LocationPicker";
import { Dialog, toast } from "@/components/client";
import { Attribution, ErrorState, Skeleton, btn, card, eyebrow, input } from "@/components/ui";
import Select from "@/components/Select";

type MosqueTimes = { name?: string; times: Partial<Record<PrayerName, string>> };
const ADJUSTABLE: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export default function PrayerTimes() {
  const { loc, locReady, state, retry, days, today, timezone } = usePrayerSchedule();
  const now = useNow();
  const [picker, setPicker] = useState(false);
  const [settings, setSettings] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [mosque] = useKv<MosqueTimes>("mosqueTimes");
  const [notify, setNotify] = usePref("ic:notify", { on: false });

  const next = now ? nextPrayer(days, now) : null;
  const current = today && now ? currentPrayer(today, now) : null;
  const fmt = (iso: string) => timeIn(iso, timezone);

  // Notifications only fire while this tab stays open; browsers suspend timers in the background.
  useEffect(() => {
    if (!notify.on || !next || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const id = setTimeout(() => new Notification(`${next.name} time`, { body: `${next.name} has begun in ${loc?.name}.`, icon: "/icon.svg" }), next.at - Date.now());
    return () => clearTimeout(id);
  }, [notify.on, next?.at, next?.name, loc?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleNotify = async () => {
    if (notify.on) return setNotify({ on: false });
    if (typeof Notification === "undefined") return toast("This browser doesn't support notifications.");
    const p = await Notification.requestPermission();
    if (p === "granted") { setNotify({ on: true }); toast("You'll be notified while this page is open"); }
    else toast("Notifications are blocked for this site.");
  };

  if (!locReady) return <div className="max-w-6xl mx-auto px-4 sm:px-8"><Skeleton className="h-64" /></div>;

  if (!loc)
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-8 pb-24">
        <div className={`${card} p-6 sm:p-8`}>
          <h2 className="font-display text-2xl">Choose your location</h2>
          <div className="mt-5"><LocationPicker /></div>
        </div>
      </section>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24 space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setPicker(true)} className={btn}><MapPin size={16} aria-hidden="true" /> {loc.name}</button>
        <button type="button" onClick={() => setSettings(true)} className={btn}><Settings2 size={16} aria-hidden="true" /> Calculation &amp; adjustments</button>
        <button type="button" onClick={toggleNotify} aria-pressed={notify.on} className={btn}>
          {notify.on ? <Bell size={16} aria-hidden="true" /> : <BellOff size={16} aria-hidden="true" />} {notify.on ? "Notifications on" : "Notify me"}
        </button>
      </div>

      {state.status === "loading" && <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6"><Skeleton className="h-56" /><Skeleton className="h-80" /></div>}
      {state.status === "error" && <ErrorState message={state.error} retry={<button className={btn} onClick={retry}>Try again</button>} />}

      {state.status === "ready" && (
        <>
          {state.stale && (
            <p role="alert" className="rounded-2xl bg-[var(--color-secondary-fixed)]/60 text-[var(--color-on-secondary-fixed)] p-4 text-sm font-semibold">
              Showing a saved schedule because the prayer-time service couldn&apos;t be reached ({state.error}). Times are still correct for {loc.name} with these settings.
            </p>
          )}
          {!today && <ErrorState title="Today isn't in the saved schedule" message="Reconnect to load the current month." retry={<button className={btn} onClick={retry}>Try again</button>} />}

          {today && (
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
              <section aria-labelledby="next-h" className="relative overflow-hidden rounded-3xl bg-[var(--color-hero)] text-white p-7 sm:p-9">
                <div aria-hidden="true" className="absolute inset-0 pattern-star opacity-40" />
                <div className="relative">
                  <p id="next-h" className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/75">Next prayer</p>
                  {next ? (
                    <>
                      <p className="mt-3 font-display text-5xl">{next.name}</p>
                      <p className="mt-1 text-white/85 text-lg">at {fmt(next.day.times[next.name])}{next.day.date !== today.date && " tomorrow"}</p>
                      <p className="mt-6 font-display text-4xl tabular-nums" aria-live="off">{countdown(next.at - now!)}</p>
                      <p className="text-sm text-white/70">remaining</p>
                    </>
                  ) : <p className="mt-3 text-white/85">Loading tomorrow&apos;s times…</p>}
                  <p className="mt-6 text-sm text-white/80"><bdi lang="ar" className="font-arabic text-base">{today.hijri.weekdayAr} {today.hijri.day} {today.hijri.monthAr} {today.hijri.year}</bdi></p>
                  <p className="text-sm text-white/80">{today.hijri.day} {today.hijri.monthEn} {today.hijri.year} AH (calculated)</p>
                </div>
              </section>

              <section aria-labelledby="today-h" className={`${card} p-6 sm:p-8`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id="today-h" className="font-display text-2xl">Today</h2>
                  <p className="text-sm text-[var(--color-on-surface)]/65">
                    {new Date(today.times.Dhuhr).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", timeZone: timezone })}
                  </p>
                </div>
                <table className="mt-4 w-full text-left">
                  <thead className="sr-only"><tr><th>Prayer</th><th>Time</th>{mosque?.times && <th>Mosque</th>}</tr></thead>
                  <tbody>
                    {PRAYERS.map((p) => {
                      const isNow = p === current;
                      return (
                        <tr key={p} className={`border-t border-[var(--color-outline-variant)]/40 ${isNow ? "bg-[var(--color-primary-container)]/50" : ""}`}>
                          <th scope="row" className="py-3.5 pl-3 font-semibold">
                            {p}{isNow && <span className="ml-2 text-[11px] uppercase tracking-widest text-[var(--color-primary)]">Now</span>}
                            {p === "Sunrise" && <span className="ml-2 text-xs font-normal text-[var(--color-on-surface)]/60">Fajr ends</span>}
                          </th>
                          <td className="py-3.5 text-right font-display text-xl tabular-nums pr-3">{fmt(today.times[p])}</td>
                          {mosque?.times && <td className="py-3.5 pr-3 text-right tabular-nums text-[var(--color-on-surface)]/70">{mosque.times[p] ? `Jama'at ${mosque.times[p]}` : ""}</td>}
                        </tr>
                      );
                    })}
                    <tr className="border-t border-[var(--color-outline-variant)]/40 text-sm text-[var(--color-on-surface)]/70">
                      <th scope="row" className="py-3 pl-3 font-normal">Sunset</th>
                      <td className="py-3 pr-3 text-right tabular-nums">{fmt(today.times.Sunset)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-4 text-xs text-[var(--color-on-surface)]/65">
                  {state.data.methodName} · Asr: {state.data.school === "HANAFI" ? "Hanafi" : "Standard (Shafi'i, Maliki, Hanbali)"} · Times in {timezone}
                </p>
                <Attribution ids={["aladhan"]} fetchedAt={state.fetchedAt} fromCache={state.fromCache} stale={state.stale} />
              </section>
            </div>
          )}

          <section aria-labelledby="month-h">
            <div className="flex items-center justify-between gap-3">
              <h2 id="month-h" className="font-display text-2xl">This month</h2>
              <button type="button" className={btn} aria-expanded={showMonth} onClick={() => setShowMonth((s) => !s)}>
                <CalendarDays size={16} aria-hidden="true" /> {showMonth ? "Hide timetable" : "Show timetable"}
              </button>
            </div>
            {showMonth && <MonthTable days={state.data.days} fmt={fmt} todayDate={today?.date} timezone={timezone} />}
          </section>
        </>
      )}

      <Dialog open={picker} onClose={() => setPicker(false)} title="Location">
        <LocationPicker onDone={() => setPicker(false)} />
      </Dialog>
      <Dialog open={settings} onClose={() => setSettings(false)} title="Calculation & adjustments">
        <PrayerSettings />
      </Dialog>
      <p className="text-xs text-[var(--color-on-surface)]/60">
        Notifications need this page open in a tab; phones and browsers may delay or suppress them in the background. Calculated times can differ from your local mosque by a few minutes.
      </p>
    </div>
  );
}

function MonthTable({ days, fmt, todayDate, timezone }: { days: { date: string; times: Record<string, string>; hijri: { day: number; monthEn: string } }[]; fmt: (s: string) => string; todayDate?: string; timezone: string }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)]">
      <table className="w-full min-w-[640px] text-sm tabular-nums">
        <caption className="sr-only">Monthly prayer timetable ({timezone})</caption>
        <thead className="bg-[var(--color-surface-container-low)] text-left">
          <tr>
            <th scope="col" className="p-3">Date</th>
            <th scope="col" className="p-3">Hijri</th>
            {PRAYERS.map((p) => <th key={p} scope="col" className="p-3">{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date} aria-current={d.date === todayDate ? "date" : undefined} className={`border-t border-[var(--color-outline-variant)]/30 ${d.date === todayDate ? "bg-[var(--color-primary-container)]/50 font-semibold" : ""}`}>
              <th scope="row" className="p-3 text-left font-semibold whitespace-nowrap">{new Date(d.date + "T12:00:00Z").toLocaleDateString(undefined, { day: "numeric", month: "short", weekday: "short", timeZone: "UTC" })}</th>
              <td className="p-3 whitespace-nowrap">{d.hijri.day} {d.hijri.monthEn}</td>
              {PRAYERS.map((p) => <td key={p} className="p-3">{fmt(d.times[p])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrayerSettings() {
  const [prefs, setPrefs] = usePrayerPrefs();
  const [methods] = useCached("aladhan:methods", 30 * DAY, getMethods);
  const [mosque, setMosque] = useKv<MosqueTimes>("mosqueTimes");
  const times = useMemo(() => mosque?.times ?? {}, [mosque]);

  return (
    <div className="space-y-7">
      <div>
        {methods.status === "ready" ? (
          <Select label="Calculation method" value={prefs.method} onChange={(v) => setPrefs({ method: v })} options={methods.data.map((m) => ({ value: m.id, label: m.name }))} />
        ) : (
          <>
            <p className="text-sm font-semibold">Calculation method</p>
            {methods.status === "error" ? <p className="mt-2 text-sm text-[var(--color-error)]">{methods.error}</p> : <Skeleton className="mt-2 h-11" />}
          </>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Asr time</legend>
        {([[0, "Standard — Shafi'i, Maliki, Hanbali"], [1, "Hanafi (later Asr)"]] as const).map(([v, label]) => (
          <label key={v} className="mt-2 flex items-center gap-3 min-h-11 cursor-pointer">
            <input type="radio" name="school" checked={prefs.school === v} onChange={() => setPrefs({ school: v })} className="w-5 h-5 accent-[var(--color-primary)]" />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Adjust by minutes</legend>
        <p className="text-xs text-[var(--color-on-surface)]/65">Shift a calculated time to match your local timetable. Use negative numbers for earlier.</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ADJUSTABLE.map((p) => (
            <label key={p} className="text-sm">
              <span className="block mb-1">{p}</span>
              <input type="number" min={-60} max={60} step={1} inputMode="numeric" value={prefs.tune[p] ?? 0}
                onChange={(e) => setPrefs({ tune: { ...prefs.tune, [p]: Math.max(-60, Math.min(60, Math.round(+e.target.value || 0))) } })}
                className={input} />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Compare with your mosque</legend>
        <p className="text-xs text-[var(--color-on-surface)]/65">Enter your mosque&apos;s jama&apos;at times; they appear next to the calculated times. Saved on this device only.</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ADJUSTABLE.map((p) => (
            <label key={p} className="text-sm">
              <span className="block mb-1">{p}</span>
              <input type="time" value={times[p] ?? ""} onChange={(e) => setMosque({ ...mosque, times: { ...times, [p]: e.target.value || undefined } })} className={input} />
            </label>
          ))}
        </div>
        {Object.values(times).some(Boolean) && (
          <button type="button" className={`${btn} mt-3`} onClick={() => setMosque({ times: {} })}>Clear mosque times</button>
        )}
      </fieldset>
      <p className={eyebrow}>Changes apply immediately</p>
    </div>
  );
}
