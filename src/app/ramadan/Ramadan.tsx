"use client";

import { useState } from "react";
import { MapPin, Moon, Printer, Share2, Sunrise } from "lucide-react";
import { DAY, useCached } from "@/lib/cache";
import { gToH, getHijriMonth } from "@/lib/services/aladhan";
import { useLocation, usePrayerPrefs } from "@/lib/settings";
import { countdown, dateIn, timeIn } from "@/lib/prayer";
import { useNow } from "@/lib/usePrayer";
import LocationPicker from "@/components/LocationPicker";
import { Dialog, shareOrCopy } from "@/components/client";
import { Attribution, ErrorState, Skeleton, btn, card } from "@/components/ui";

export default function Ramadan() {
  const [loc, , ready] = useLocation();
  const [prefs] = usePrayerPrefs();
  const now = useNow();
  const [picker, setPicker] = useState(false);
  const todayDmy = dateIn(loc?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone).split("-").reverse().join("-");
  const [hijri] = useCached(`gToH:${todayDmy}`, 7 * DAY, () => gToH(todayDmy));
  // This year's Ramadan until it ends, then next year's — taken from the API's Hijri date, not computed.
  const hYear = hijri.status === "ready" ? (hijri.data.hijri.month > 9 ? hijri.data.hijri.year + 1 : hijri.data.hijri.year) : null;
  const key = loc && hYear ? `ramadan:${hYear}:${loc.lat},${loc.lng}:${prefs.method}:${prefs.school}:${JSON.stringify(prefs.tune)}` : null;
  const [sched, retry] = useCached(key, 60 * DAY, () => getHijriMonth(loc!.lat, loc!.lng, prefs, hYear!, 9));

  if (!ready) return <div className="max-w-6xl mx-auto px-4 sm:px-8"><Skeleton className="h-96" /></div>;
  if (!loc)
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-8 pb-24">
        <div className={`${card} p-6 sm:p-8`}><h2 className="font-display text-2xl">Choose your location</h2><div className="mt-5"><LocationPicker /></div></div>
      </section>
    );

  if (hijri.status === "error") return <div className="max-w-6xl mx-auto px-4 sm:px-8"><ErrorState message={hijri.error} /></div>;
  if (sched.status === "error") return <div className="max-w-6xl mx-auto px-4 sm:px-8"><ErrorState message={sched.error} retry={<button className={btn} onClick={retry}>Try again</button>} /></div>;
  if (sched.status !== "ready" || !now) return <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-4"><Skeleton className="h-40" /><Skeleton className="h-96" /></div>;

  const { days, timezone, methodName } = sched.data;
  const fmt = (iso: string) => timeIn(iso, timezone);
  const events = days.flatMap((d) => [
    { kind: "Sehri ends" as const, at: Date.parse(d.times.Fajr), d },
    { kind: "Iftar" as const, at: Date.parse(d.times.Maghrib), d },
  ]);
  const next = events.find((e) => e.at > now);
  const started = now >= Date.parse(days[0].times.Fajr);
  const todayIso = dateIn(timezone, now);

  const share = () => shareOrCopy({
    title: `Ramadan ${hYear} timetable — ${loc.name}`,
    text: `Ramadan ${hYear} AH, ${loc.name} (${methodName}). Day 1: Sehri ends ${fmt(days[0].times.Fajr)}, Iftar ${fmt(days[0].times.Maghrib)}. Calculated times; follow your local mosque.`,
    url: "/ramadan",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24 space-y-8">
      <div className="no-print flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => setPicker(true)}><MapPin size={16} aria-hidden="true" /> {loc.name}</button>
        <button type="button" className={btn} onClick={share}><Share2 size={16} aria-hidden="true" /> Share</button>
        <button type="button" className={btn} onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print</button>
      </div>

      <section aria-labelledby="count-h" className="relative overflow-hidden rounded-3xl bg-[var(--color-hero)] text-white p-7 sm:p-9">
        <div aria-hidden="true" className="absolute inset-0 pattern-star opacity-40" />
        <div className="relative grid sm:grid-cols-2 gap-6 items-end">
          <div>
            <p id="count-h" className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/75">Ramadan {hYear} AH · {loc.name}</p>
            {next ? (
              <>
                <p className="mt-3 font-display text-4xl flex items-center gap-3">
                  {next.kind === "Iftar" ? <Moon size={30} aria-hidden="true" /> : <Sunrise size={30} aria-hidden="true" />}
                  {!started ? "Ramadan begins" : next.kind}
                </p>
                <p className="mt-1 text-white/85">
                  {!started ? `around ${new Date(days[0].date + "T12:00:00Z").toLocaleDateString(undefined, { dateStyle: "full", timeZone: "UTC" })} (estimated)` : `at ${fmt(next.d.times[next.kind === "Iftar" ? "Maghrib" : "Fajr"])}, day ${next.d.hijri.day}`}
                </p>
              </>
            ) : <p className="mt-3 font-display text-3xl">Ramadan {hYear} has ended</p>}
          </div>
          {next && <p className="font-display text-5xl tabular-nums sm:text-right">{(next.at - now) > 2 * 86_400_000 ? `${Math.ceil((next.at - now) / 86_400_000)} days` : countdown(next.at - now)}</p>}
        </div>
      </section>

      <section aria-labelledby="tt-h">
        <h2 id="tt-h" className="font-display text-2xl">Timetable</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)]">
          <table className="w-full min-w-[560px] text-sm tabular-nums">
            <caption className="sr-only">Ramadan {hYear} Sehri and Iftar times for {loc.name}</caption>
            <thead className="bg-[var(--color-surface-container-low)] text-left">
              <tr>
                <th scope="col" className="p-3">Ramadan</th>
                <th scope="col" className="p-3">Date</th>
                <th scope="col" className="p-3">Imsak*</th>
                <th scope="col" className="p-3">Sehri ends (Fajr)</th>
                <th scope="col" className="p-3">Iftar (Maghrib)</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} aria-current={d.date === todayIso ? "date" : undefined} className={`border-t border-[var(--color-outline-variant)]/30 ${d.date === todayIso ? "bg-[var(--color-primary-container)]/50 font-semibold" : ""}`}>
                  <th scope="row" className="p-3 text-left">{d.hijri.day}{d.hijri.holidays.includes("Lailat-ul-Qadr") && <span className="ml-1 text-xs text-[var(--color-gold)]">Laylat al-Qadr (est.)</span>}</th>
                  <td className="p-3 whitespace-nowrap">{new Date(d.date + "T12:00:00Z").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}</td>
                  <td className="p-3 text-[var(--color-on-surface)]/65">{fmt(d.times.Imsak)}</td>
                  <td className="p-3 font-semibold">{fmt(d.times.Fajr)}</td>
                  <td className="p-3 font-semibold">{fmt(d.times.Maghrib)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-1 text-xs text-[var(--color-on-surface)]/65 max-w-3xl">
          <p>Eating and drinking must stop at <strong>Fajr</strong>; that column is the end of Sehri. <strong>*Imsak</strong> is a precautionary time about 10 minutes earlier that some timetables show; it is not the deadline itself.</p>
          <p>Dates come from the calculated Hijri calendar. Ramadan&apos;s first day and Eid depend on your local moon sighting and may shift by a day. Follow your local mosque&apos;s timetable where it differs.</p>
          <p>{methodName} · Asr school does not affect these times · Times in {timezone}</p>
        </div>
        <Attribution ids={["aladhan"]} fetchedAt={sched.fetchedAt} fromCache={sched.fromCache} stale={sched.stale} />
      </section>

      <Dialog open={picker} onClose={() => setPicker(false)} title="Location"><LocationPicker onDone={() => setPicker(false)} /></Dialog>
    </div>
  );
}
