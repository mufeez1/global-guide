"use client";

import { Fragment, useState } from "react";
import {
  FileDown,
  ImageDown,
  Loader2,
  MapPin,
  Moon,
  Share2,
  Sunrise,
} from "lucide-react";
import { DAY, useCached } from "@/lib/cache";
import { gToH, getHijriMonth } from "@/lib/services/aladhan";
import { useLocation, usePrayerPrefs } from "@/lib/settings";
import { countdown, dateIn, timeIn } from "@/lib/prayer";
import { useNow } from "@/lib/usePrayer";
import LocationPicker from "@/components/LocationPicker";
import { Dialog, shareOrCopy, toast } from "@/components/client";
import {
  Attribution,
  ErrorState,
  Skeleton,
  btn,
  btnPrimary,
  card,
} from "@/components/ui";
import { Dedication } from "@/components/Footer";
import { download, jpegToPdf } from "@/lib/export";
import { drawRamadanPoster } from "./poster";

const ASHRA_TONE = [
  "bg-[var(--color-primary)]/12 text-[var(--color-primary)]",
  "bg-[#2B6CB0]/12 text-[#2B6CB0] dark:text-[#9CC3F0]",
  "bg-[var(--color-gold)]/15 text-[var(--color-gold)]",
];

const T = {
  en: {
    kicker: "Sehri & Iftar Timetable",
    title: (y: number) => `Ramadan ${y} AH`,
    day: "Ramadan",
    date: "Date",
    imsak: "Imsak*",
    sehri: "Sehri ends (Fajr)",
    iftar: "Iftar (Maghrib)",
    qadr: "Laylat al-Qadr (est.)",
    ashra: [
      "First Ashra · Mercy",
      "Second Ashra · Forgiveness",
      "Third Ashra · Salvation",
    ],
    notes: [
      "Eating and drinking must stop at Fajr; that column is the end of Sehri. *Imsak is a precautionary time about 10 minutes earlier; it is not the deadline itself.",
      "Ramadan's first day and Eid depend on local moon sighting and may shift by a day. Follow your local mosque's timetable where it differs.",
    ],
  },
  ur: {
    kicker: "نظام الاوقات سحر و افطار",
    title: (y: number) => `رمضان المبارک ${y} ھ`,
    day: "روزہ",
    date: "تاریخ",
    imsak: "امساک*",
    sehri: "اختتامِ سحری (فجر)",
    iftar: "افطار (مغرب)",
    qadr: "شبِ قدر (متوقع)",
    ashra: ["پہلا عشرہ · رحمت", "دوسرا عشرہ · مغفرت", "تیسرا عشرہ · نجات"],
    notes: [
      "فجر کے وقت کھانا پینا بند کرنا لازم ہے؛ یہی سحری کا آخری وقت ہے۔ *امساک احتیاطاً تقریباً دس منٹ پہلے کا وقت ہے، اصل آخری وقت نہیں۔",
      "رمضان کے آغاز اور عید کا انحصار مقامی رویتِ ہلال پر ہے اور ایک دن کا فرق ہو سکتا ہے۔ اختلاف کی صورت میں اپنی مقامی مسجد کے اوقات پر عمل کریں۔",
    ],
  },
};

export default function Ramadan() {
  const [loc, , ready] = useLocation();
  const [prefs] = usePrayerPrefs();
  const now = useNow();
  const [picker, setPicker] = useState(false);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const todayDmy = dateIn(
    loc?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  )
    .split("-")
    .reverse()
    .join("-");
  const [hijri] = useCached(`gToH:${todayDmy}`, 7 * DAY, () => gToH(todayDmy));
  // This year's Ramadan until it ends, then next year's — taken from the API's Hijri date, not computed.
  const hYear =
    hijri.status === "ready"
      ? hijri.data.hijri.month > 9
        ? hijri.data.hijri.year + 1
        : hijri.data.hijri.year
      : null;
  const key =
    loc && hYear
      ? `ramadan:${hYear}:${loc.lat},${loc.lng}:${prefs.method}:${prefs.school}:${JSON.stringify(prefs.tune)}`
      : null;
  const [sched, retry] = useCached(key, 60 * DAY, () =>
    getHijriMonth(loc!.lat, loc!.lng, prefs, hYear!, 9),
  );

  if (!ready)
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <Skeleton className="h-96" />
      </div>
    );
  if (!loc)
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-8 pb-24">
        <div className={`${card} p-6 sm:p-8`}>
          <h2 className="font-display text-2xl">Choose your location</h2>
          <div className="mt-5">
            <LocationPicker />
          </div>
        </div>
      </section>
    );

  if (hijri.status === "error")
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ErrorState message={hijri.error} />
      </div>
    );
  if (sched.status === "error")
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ErrorState
          message={sched.error}
          retry={
            <button className={btn} onClick={retry}>
              Try again
            </button>
          }
        />
      </div>
    );
  if (sched.status !== "ready" || !now)
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );

  const { days, timezone, methodName } = sched.data;
  const fmt = (iso: string) => timeIn(iso, timezone);
  const events = days.flatMap((d) => [
    { kind: "Sehri ends" as const, at: Date.parse(d.times.Fajr), d },
    { kind: "Iftar" as const, at: Date.parse(d.times.Maghrib), d },
  ]);
  const next = events.find((e) => e.at > now);
  const started = now >= Date.parse(days[0].times.Fajr);
  const todayIso = dateIn(timezone, now);

  const share = () =>
    shareOrCopy({
      title: `Ramadan ${hYear} timetable — ${loc.name}`,
      text: `Ramadan ${hYear} AH, ${loc.name} (${methodName}). Day 1: Sehri ends ${fmt(days[0].times.Fajr)}, Iftar ${fmt(days[0].times.Maghrib)}. Calculated times; follow your local mosque.`,
      url: "/ramadan",
    });

  const t = T[lang];
  const ur = lang === "ur";
  const locale = ur ? "ur-PK" : undefined;
  const fmtT = (iso: string) =>
    ur
      ? timeIn(iso, timezone, "en-US").replace("AM", "صبح").replace("PM", "شام")
      : fmt(iso);
  const fmtD = (iso: string, o: Intl.DateTimeFormatOptions) =>
    new Date(iso + "T12:00:00Z").toLocaleDateString(locale, {
      ...o,
      timeZone: "UTC",
    });

  const savePoster = async (kind: "png" | "pdf") => {
    setExporting(kind);
    try {
      const canvas = await drawRamadanPoster({
        lang,
        hYear: hYear!,
        place: loc.name,
        methodName,
        timezone,
        days,
        time: ur ? fmtT : (iso) => timeIn(iso, timezone, "en-US"),
        date: (iso) =>
          fmtD(iso, { weekday: "short", day: "numeric", month: "short" }),
      });
      const name = `ramadan-${hYear}-${loc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${lang}`;
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, kind === "png" ? "image/png" : "image/jpeg", 0.92),
      );
      if (!blob) throw new Error("canvas");
      if (kind === "png") download(blob, `${name}.png`);
      else
        download(
          new Blob(
            [
              jpegToPdf(
                new Uint8Array(await blob.arrayBuffer()),
                canvas.width,
                canvas.height,
              ) as BlobPart,
            ],
            { type: "application/pdf" },
          ),
          `${name}.pdf`,
        );
    } catch {
      toast("Couldn't create the file. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24 space-y-8 print:p-0 print:space-y-0">
      <div className="no-print flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={() => setPicker(true)}>
          <MapPin size={16} aria-hidden="true" /> {loc.name}
        </button>
        <button type="button" className={btn} onClick={share}>
          <Share2 size={16} aria-hidden="true" /> Share
        </button>
        <fieldset className="flex items-center gap-1 rounded-xl border border-[var(--color-outline-variant)]/70 bg-[var(--color-surface-container-lowest)] p-1 sm:ml-auto">
          <legend className="sr-only">Timetable and print language</legend>
          {(["en", "ur"] as const).map((l) => (
            <label
              key={l}
              className={`min-h-9 px-3.5 inline-flex items-center rounded-lg text-sm font-semibold cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--color-primary)] ${lang === l ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "hover:bg-[var(--color-surface-container-low)]"}`}
            >
              <input
                type="radio"
                name="tt-lang"
                value={l}
                checked={lang === l}
                onChange={() => setLang(l)}
                className="sr-only"
              />
              {l === "en" ? (
                "English"
              ) : (
                <span lang="ur" className="font-urdu">
                  اردو
                </span>
              )}
            </label>
          ))}
        </fieldset>
        {(["pdf", "png"] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={k === "pdf" ? btnPrimary : btn}
            disabled={!!exporting}
            aria-busy={exporting === k}
            onClick={() => savePoster(k)}
          >
            {exporting === k ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : k === "pdf" ? (
              <FileDown size={16} aria-hidden="true" />
            ) : (
              <ImageDown size={16} aria-hidden="true" />
            )}
            {k === "pdf" ? "Save PDF" : "Save image"}{" "}
            {ur ? "(اردو)" : "(English)"}
          </button>
        ))}
      </div>

      <section
        aria-labelledby="count-h"
        className="no-print ramadan-sky relative overflow-hidden rounded-3xl text-white p-7 sm:p-9 shadow-xl shadow-[#0E2A47]/20"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pattern-star opacity-30"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute -right-10 -top-10 w-44 h-44 sm:w-52 sm:h-52 text-[#F2D078] opacity-40"
        >
          <path
            fill="currentColor"
            d="M62 8a42 42 0 1 0 30 70A36 36 0 1 1 62 8z"
          />
        </svg>
        <div className="relative grid sm:grid-cols-2 gap-6 items-end">
          <div>
            <p
              id="count-h"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2D078]"
            >
              Ramadan {hYear} AH · {loc.name}
            </p>
            {next ? (
              <>
                <p className="mt-3 font-display text-4xl flex items-center gap-3">
                  {next.kind === "Iftar" ? (
                    <Moon size={30} aria-hidden="true" />
                  ) : (
                    <Sunrise size={30} aria-hidden="true" />
                  )}
                  {!started ? "Ramadan begins" : next.kind}
                </p>
                <p className="mt-1 text-white/85">
                  {!started
                    ? `around ${new Date(days[0].date + "T12:00:00Z").toLocaleDateString(undefined, { dateStyle: "full", timeZone: "UTC" })} (estimated)`
                    : `at ${fmt(next.d.times[next.kind === "Iftar" ? "Maghrib" : "Fajr"])}, day ${next.d.hijri.day}`}
                </p>
              </>
            ) : (
              <p className="mt-3 font-display text-3xl">
                Ramadan {hYear} has ended
              </p>
            )}
          </div>
          {next && (
            <p className="font-display text-5xl tabular-nums sm:text-right">
              {next.at - now > 2 * 86_400_000
                ? `${Math.ceil((next.at - now) / 86_400_000)} days`
                : countdown(next.at - now)}
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="tt-h"
        lang={lang}
        dir={ur ? "rtl" : "ltr"}
        className={`print-dedication-local overflow-hidden rounded-3xl border border-[var(--color-gold)]/30 bg-[var(--color-surface-container-lowest)] shadow-lg shadow-[var(--color-primary)]/5 print:shadow-none print:rounded-xl ${ur ? "font-urdu" : ""}`}
      >
        <header className="print-exact ramadan-sky relative overflow-hidden px-6 py-6 sm:px-8 print:py-4 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 pattern-star opacity-25"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[#F2D078] text-sm font-semibold">{t.kicker}</p>
              <h2
                id="tt-h"
                className={`font-display text-3xl print:text-2xl ${ur ? "leading-[1.9]" : "mt-1"}`}
              >
                {t.title(hYear!)}
              </h2>
              <p className="text-white/85 text-sm">
                {loc.name} ·{" "}
                {fmtD(days[0].date, { day: "numeric", month: "short" })} –{" "}
                {fmtD(days[days.length - 1].date, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <Moon size={40} aria-hidden="true" className="text-[#F2D078]" />
          </div>
        </header>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[560px] print:min-w-0 text-sm print:text-[11px] tabular-nums">
            <caption className="sr-only">
              {t.title(hYear!)} — {loc.name}
            </caption>
            <thead className="print-exact bg-[var(--color-primary-container)]/60 text-start">
              <tr>
                {[t.day, t.date, t.imsak, t.sehri, t.iftar].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="p-3 print:p-1.5 text-start"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => {
                const today = d.date === todayIso;
                const qadr = d.hijri.holidays.includes("Lailat-ul-Qadr");
                return (
                  <Fragment key={d.date}>
                    {i % 10 === 0 && i < 30 && (
                      <tr className="print-exact">
                        <th
                          colSpan={5}
                          scope="colgroup"
                          className={`px-3 py-2 print:py-1 text-start text-xs font-bold ${ur ? "" : "uppercase tracking-[0.15em]"} ${ASHRA_TONE[i / 10]}`}
                        >
                          {t.ashra[i / 10]}
                        </th>
                      </tr>
                    )}
                    <tr
                      aria-current={today ? "date" : undefined}
                      className={`print-exact border-t border-[var(--color-outline-variant)]/30 ${today ? "bg-[var(--color-primary-container)] font-semibold" : qadr ? "bg-[var(--color-gold)]/10" : i % 2 ? "bg-[var(--color-surface-container-low)]/60" : ""}`}
                    >
                      <th scope="row" className="p-3 print:p-1.5 text-start">
                        <span className="inline-flex w-7 h-7 print:w-5 print:h-5 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold">
                          {d.hijri.day}
                        </span>
                        {qadr && (
                          <span className="ms-2 text-xs text-[var(--color-gold)] font-semibold">
                            {t.qadr}
                          </span>
                        )}
                      </th>
                      <td className="p-3 print:p-1.5 whitespace-nowrap">
                        {fmtD(d.date, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="p-3 print:p-1.5 text-[var(--color-on-surface)]/65">
                        <span dir="ltr">{fmtT(d.times.Imsak)}</span>
                      </td>
                      <td className="p-3 print:p-1.5 font-semibold text-[#0E2A47] dark:text-[#9CC3F0]">
                        <span dir="ltr">{fmtT(d.times.Fajr)}</span>
                      </td>
                      <td className="p-3 print:p-1.5 font-semibold text-[var(--color-primary)]">
                        <span dir="ltr">{fmtT(d.times.Maghrib)}</span>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 sm:px-8 py-5 print:py-2 space-y-1 text-xs text-[var(--color-on-surface)]/65 border-t border-[var(--color-outline-variant)]/30">
          {t.notes.map((n) => (
            <p key={n} className={ur ? "leading-loose" : ""}>
              {n}
            </p>
          ))}
          <p dir="ltr" className={ur ? "text-end" : ""}>
            {methodName} · {timezone}
          </p>
        </div>
        <div className="print-exact bg-[var(--color-gold)]/10 border-t border-[var(--color-gold)]/30 px-6 py-3 text-sm text-[var(--color-gold)]">
          <Dedication lang={lang} className={ur ? "leading-loose" : ""} />
        </div>
      </section>
      <div className="no-print">
        <Attribution
          ids={["aladhan"]}
          fetchedAt={sched.fetchedAt}
          fromCache={sched.fromCache}
          stale={sched.stale}
        />
      </div>

      <Dialog open={picker} onClose={() => setPicker(false)} title="Location">
        <LocationPicker onDone={() => setPicker(false)} />
      </Dialog>
    </div>
  );
}
