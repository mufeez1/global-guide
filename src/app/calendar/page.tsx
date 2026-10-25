import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  gToH,
  gToHCalendar,
  hToG,
  type Conversion,
} from "@/lib/services/aladhan";
import { errorMessage } from "@/lib/http";
import {
  Attribution,
  ErrorState,
  PageHeader,
  btn,
  btnPrimary,
  card,
  input,
} from "@/components/ui";
import Select from "@/components/Select";
import { Dedication } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Hijri Calendar",
  description:
    "Monthly Hijri calendar with Gregorian dates, major Islamic dates and a two-way date converter.",
  alternates: { canonical: "/calendar" },
};

// Widely observed dates, by the names Aladhan uses. Regional commemorations are left out.
const MAJOR = new Set([
  "1st Day of Ramadan",
  "Lailat-ul-Qadr",
  "Eid-ul-Fitr",
  "Hajj",
  "Arafa",
  "Eid-ul-Adha",
  "Ashura",
  "Mawlid (Birth) al-Nabi ﷺ",
  "Lailat-ul-Miraj",
  "Lailat-ul-Bara'at",
]);
const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qadah",
  "Dhu al-Hijjah",
];
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const day = { next: { revalidate: 86400 } };

type Search = Promise<{
  m?: string;
  y?: string;
  g?: string;
  hd?: string;
  hm?: string;
  hy?: string;
}>;
const dmy = (iso: string) => iso.split("-").reverse().join("-");
const settle = <T,>(p: Promise<T>) =>
  p.then(
    (v) => ({ ok: true as const, v }),
    (e) => ({ ok: false as const, error: errorMessage(e) }),
  );
const long = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const todayIso = new Date().toISOString().slice(0, 10);
  const [ty, tm] = todayIso.split("-").map(Number);
  const y = Math.min(2200, Math.max(1900, parseInt(sp.y ?? "") || ty));
  const m = Math.min(12, Math.max(1, parseInt(sp.m ?? "") || tm));
  const [py, pm] = m === 1 ? [y - 1, 12] : [y, m - 1];
  const [ny, nm] = m === 12 ? [y + 1, 1] : [y, m + 1];

  const gInput = sp.g && /^\d{4}-\d{2}-\d{2}$/.test(sp.g) ? sp.g : null;
  const hInput =
    sp.hd && sp.hm && sp.hy
      ? `${sp.hd.padStart(2, "0")}-${sp.hm.padStart(2, "0")}-${sp.hy}`
      : null;

  const [month, today, gConv, hConv] = await Promise.all([
    settle(gToHCalendar(m, y, day)),
    settle(gToH(dmy(todayIso), day)),
    gInput ? settle(gToH(dmy(gInput), day)) : null,
    hInput ? settle(hToG(hInput, day)) : null,
  ]);

  // Ramadan estimate: this year's if it hasn't ended yet, otherwise next year's.
  const hy = today.ok
    ? today.v.hijri.month > 9
      ? today.v.hijri.year + 1
      : today.v.hijri.year
    : null;
  const [ramadan, eid] = hy
    ? await Promise.all([
        settle(hToG(`01-09-${hy}`, day)),
        settle(hToG(`01-10-${hy}`, day)),
      ])
    : [null, null];

  const lead = month.ok
    ? new Date(month.v[0].date + "T12:00:00Z").getUTCDay()
    : 0;
  const title = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="pb-24">
      <PageHeader
        kicker="Calendar"
        title={
          <>
            Hijri <span className="text-[var(--color-primary)]">Calendar</span>
          </>
        }
        intro="Dates are calculated, so they can differ by a day or two from the start of a month announced locally after moon sighting. Confirm important dates with your local committee or mosque."
      >
        {today.ok && (
          <p className="mt-6 text-lg">
            Today:{" "}
            <strong>
              {today.v.hijri.day} {today.v.hijri.monthEn} {today.v.hijri.year}{" "}
              AH
            </strong>{" "}
            ·{" "}
            <bdi lang="ar" className="font-arabic text-xl">
              {today.v.hijri.day} {today.v.hijri.monthAr}
            </bdi>
          </p>
        )}
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[1fr_20rem] gap-8 items-start">
        <section aria-labelledby="month-h">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/calendar?m=${pm}&y=${py}`}
              className={btn}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </Link>
            <h2 id="month-h" className="font-display text-2xl text-center">
              {title}
              {month.ok && (
                <span className="block text-sm font-body text-[var(--color-on-surface)]/65">
                  {[
                    ...new Set(
                      month.v.map((d) => `${d.hijri.monthEn} ${d.hijri.year}`),
                    ),
                  ].join(" – ")}
                </span>
              )}
            </h2>
            <Link
              href={`/calendar?m=${nm}&y=${ny}`}
              className={btn}
              aria-label="Next month"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </div>

          {!month.ok ? (
            <div className="mt-6">
              <ErrorState message={month.error} />
            </div>
          ) : (
            <>
              <ol
                className="mt-6 grid grid-cols-7 gap-1 sm:gap-2"
                aria-label={`${title} with Hijri dates`}
              >
                {WEEK.map((w) => (
                  <li
                    key={w}
                    aria-hidden="true"
                    className="text-center text-[11px] font-bold uppercase tracking-widest text-[var(--color-on-surface)]/55 pb-1"
                  >
                    {w}
                  </li>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <li key={`b${i}`} aria-hidden="true" />
                ))}
                {month.v.map((d) => {
                  const events = d.hijri.holidays.filter((h) => MAJOR.has(h));
                  if (d.hijri.day === 1 && d.hijri.month === 1)
                    events.unshift("Islamic New Year");
                  const isToday = d.date === todayIso;
                  return (
                    <li
                      key={d.date}
                      aria-current={isToday ? "date" : undefined}
                      className={`min-h-20 sm:min-h-24 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 border text-left ${isToday ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]/40" : "border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)]"} ${events.length ? "ring-1 ring-[var(--color-gold)]/50" : ""}`}
                    >
                      <span className="block font-display text-lg sm:text-xl tabular-nums">
                        {+d.date.slice(8)}
                      </span>
                      <span className="block text-[11px] sm:text-xs text-[var(--color-primary)] font-semibold tabular-nums">
                        {d.hijri.day}
                        {d.hijri.day === 1 && (
                          <span className="hidden sm:inline">
                            {" "}
                            {d.hijri.monthEn}
                          </span>
                        )}
                      </span>
                      {events.map((e) => (
                        <span
                          key={e}
                          className="mt-1 block text-[10px] sm:text-[11px] leading-tight text-[var(--color-gold)] font-semibold"
                        >
                          {e}
                        </span>
                      ))}
                      <span className="sr-only">
                        {long(d.date)}: {d.hijri.day} {d.hijri.monthEn}{" "}
                        {d.hijri.year}
                        {events.length ? `. ${events.join(", ")}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-xs text-[var(--color-on-surface)]/60">
                Large numbers are Gregorian days; green numbers are Hijri days.
                Gold labels mark major dates. Today is outlined (UTC).
              </p>
              <Attribution
                ids={["aladhan"]}
                note={`Calculation: ${month.v[0].hijri.method ?? "Aladhan default"}`}
              />
              <div className="print-dedication-local mt-6 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-5 py-4 text-sm text-[var(--color-gold)]">
                <Dedication className="leading-loose" />
              </div>
            </>
          )}
        </section>

        <aside className="space-y-6">
          {hy && (
            <section aria-labelledby="ram-h" className={`${card} p-5`}>
              <h2 id="ram-h" className="font-display text-lg">
                Ramadan {hy} AH (estimate)
              </h2>
              {ramadan?.ok && (
                <p className="mt-2 text-sm">
                  {ramadan.v.gregorian <= todayIso
                    ? "Began around"
                    : "Expected to begin around"}{" "}
                  <strong>{long(ramadan.v.gregorian)}</strong>.
                </p>
              )}
              {eid?.ok && (
                <p className="mt-1 text-sm">
                  Eid al-Fitr around <strong>{long(eid.v.gregorian)}</strong>.
                </p>
              )}
              {ramadan && !ramadan.ok && (
                <p className="mt-2 text-sm text-[var(--color-error)]">
                  {ramadan.error}
                </p>
              )}
              <p className="mt-2 text-xs text-[var(--color-on-surface)]/60">
                Calculated, not confirmed. The actual start depends on the local
                moon sighting.
              </p>
              <Link
                href="/ramadan"
                className="mt-3 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Sehri &amp; Iftar timetable →
              </Link>
            </section>
          )}

          <section aria-labelledby="g2h-h" className={`${card} p-5`}>
            <h2 id="g2h-h" className="font-display text-lg">
              Gregorian → Hijri
            </h2>
            <form action="/calendar" className="mt-3 space-y-2">
              <input type="hidden" name="m" value={m} />
              <input type="hidden" name="y" value={y} />
              <label className="block text-sm">
                <span className="block mb-1">Date</span>
                <input
                  type="date"
                  name="g"
                  required
                  defaultValue={gInput ?? todayIso}
                  className={input}
                />
              </label>
              <button className={btnPrimary}>Convert</button>
            </form>
            {gConv && <ConvResult r={gConv} kind="h" />}
          </section>

          <section aria-labelledby="h2g-h" className={`${card} p-5`}>
            <h2 id="h2g-h" className="font-display text-lg">
              Hijri → Gregorian
            </h2>
            <form action="/calendar" className="mt-3 space-y-2">
              <input type="hidden" name="m" value={m} />
              <input type="hidden" name="y" value={y} />
              <div className="grid grid-cols-[4.5rem_1fr_5.5rem] gap-2">
                <label className="text-sm">
                  <span className="block mb-1">Day</span>
                  <input
                    type="number"
                    name="hd"
                    min={1}
                    max={30}
                    required
                    defaultValue={sp.hd ?? 1}
                    className={input}
                  />
                </label>
                <Select
                  label="Month"
                  name="hm"
                  defaultValue={
                    Number(sp.hm) || (today.ok ? today.v.hijri.month : 1)
                  }
                  options={HIJRI_MONTHS.map((n, i) => ({
                    value: i + 1,
                    label: n,
                  }))}
                />
                <label className="text-sm">
                  <span className="block mb-1">Year</span>
                  <input
                    type="number"
                    name="hy"
                    min={1}
                    max={1700}
                    required
                    defaultValue={
                      sp.hy ?? (today.ok ? today.v.hijri.year : 1448)
                    }
                    className={input}
                  />
                </label>
              </div>
              <button className={btnPrimary}>Convert</button>
            </form>
            {hConv && <ConvResult r={hConv} kind="g" />}
          </section>
        </aside>
      </div>
    </div>
  );
}

function ConvResult({
  r,
  kind,
}: {
  r: { ok: true; v: Conversion } | { ok: false; error: string };
  kind: "h" | "g";
}) {
  if (!r.ok)
    return (
      <p role="alert" className="mt-3 text-sm text-[var(--color-error)]">
        {r.error}
      </p>
    );
  return (
    <p
      role="status"
      className="mt-3 text-sm rounded-xl bg-[var(--color-primary-container)]/40 p-3"
    >
      {kind === "h" ? (
        <>
          ={" "}
          <strong>
            {r.v.hijri.day} {r.v.hijri.monthEn} {r.v.hijri.year} AH
          </strong>{" "}
          ·{" "}
          <bdi lang="ar" className="font-arabic">
            {r.v.hijri.monthAr}
          </bdi>
        </>
      ) : (
        <>
          = <strong>{long(r.v.gregorian)}</strong>
        </>
      )}
      {r.v.hijri.holidays.length > 0 && (
        <span className="block mt-1 text-xs">
          {r.v.hijri.holidays.filter((h) => MAJOR.has(h)).join(", ")}
        </span>
      )}
    </p>
  );
}
