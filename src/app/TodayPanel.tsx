"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Hash, MapPin } from "lucide-react";
import { usePrayerSchedule, useNow } from "@/lib/usePrayer";
import { useLastRead } from "@/lib/settings";
import { countdown, currentPrayer, nextPrayer, timeIn } from "@/lib/prayer";
import { PRAYERS } from "@/lib/services/aladhan";
import { dbAllByIndex } from "@/lib/db";
import { dayKey, type Daily } from "@/lib/tasbeeh";
import { Skeleton } from "@/components/ui";

export default function TodayPanel() {
  const { loc, locReady, state, days, today, timezone } = usePrayerSchedule();
  const now = useNow();
  const next = now ? nextPrayer(days, now) : null;
  const current = today && now ? currentPrayer(today, now) : null;

  return (
    <div className="mt-8 rounded-3xl bg-[var(--color-surface-container-lowest)]/90 border border-[var(--color-outline-variant)]/40 p-5 sm:p-6 shadow-[0_20px_50px_-25px_rgba(27,109,36,0.35)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold" suppressHydrationWarning>{now ? new Date(now).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : " "}</p>
        {today && <p className="text-sm text-[var(--color-primary)] font-semibold">{today.hijri.day} {today.hijri.monthEn} {today.hijri.year} AH <span lang="ar" className="font-arabic">· {today.hijri.monthAr}</span></p>}
      </div>

      {!locReady ? <Skeleton className="mt-4 h-28" /> : !loc ? (
        <div className="mt-4">
          <p className="text-sm text-[var(--color-on-surface)]/75">Set your location to see today&apos;s prayer times, the Hijri date and a countdown to the next prayer.</p>
          <Link href="/prayer-times" className="mt-3 inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"><MapPin size={16} aria-hidden="true" /> Choose location</Link>
        </div>
      ) : state.status === "error" ? (
        <p role="alert" className="mt-4 text-sm text-[var(--color-error)]">{state.error} <Link href="/prayer-times" className="underline">Open prayer times</Link></p>
      ) : !today || !now ? <Skeleton className="mt-4 h-28" /> : (
        <>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface)]/60 flex items-center gap-1"><MapPin size={12} aria-hidden="true" /> {loc.name} · next prayer</p>
              {next && <p className="font-display text-3xl">{next.name} <span className="text-[var(--color-on-surface)]/60 text-xl">{timeIn(next.day.times[next.name], timezone)}</span></p>}
            </div>
            {next && <p className="font-display text-3xl tabular-nums text-[var(--color-primary)]">{countdown(next.at - now)}</p>}
          </div>
          <ul className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center" aria-label="Today's prayer times">
            {PRAYERS.map((p) => (
              <li key={p} className={`rounded-xl py-2 ${p === current ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "bg-[var(--color-surface-container-low)]"}`}>
                <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">{p}{p === current && <span className="sr-only"> (current)</span>}</span>
                <span className="block font-semibold tabular-nums text-sm">{timeIn(today.times[p], timezone)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-on-surface)]/60">Sunset {timeIn(today.times.Sunset, timezone)} · {state.status === "ready" && state.data.methodName} · <Link href="/prayer-times" className="underline">Details</Link></p>
        </>
      )}
    </div>
  );
}

export function ContinueCard() {
  const [lastRead, , ready] = useLastRead();
  const [tasbeeh, setTasbeeh] = useState<{ total: number; label?: string } | null>(null);
  useEffect(() => {
    dbAllByIndex<Daily>("tasbeehDaily", "day", dayKey(Date.now()))
      .then((rows) => setTasbeeh({ total: rows.reduce((s, r) => s + r.count, 0), label: rows.sort((a, b) => b.count - a.count)[0]?.label }))
      .catch(() => setTasbeeh({ total: 0 }));
  }, []);

  return (
    <div className="flex flex-col h-full rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Continue</p>
      <div className="mt-4 space-y-5 flex-1">
        {!ready ? <Skeleton className="h-14" /> : lastRead ? (
          <Link href={`/quran?chapter=${lastRead.chapter}#v${lastRead.verse}`} className="group flex items-start gap-3">
            <BookOpen size={20} className="text-[var(--color-primary)] mt-1" aria-hidden="true" />
            <span>
              <span className="block font-semibold group-hover:underline">{lastRead.name}, verse {lastRead.verse}</span>
              <span className="block text-sm text-[var(--color-on-surface)]/65">{Math.round((lastRead.verse / lastRead.total) * 100)}% through the surah</span>
            </span>
          </Link>
        ) : (
          <Link href="/quran" className="flex items-start gap-3 group"><BookOpen size={20} className="text-[var(--color-primary)] mt-1" aria-hidden="true" /><span className="font-semibold group-hover:underline">Start reading the Quran</span></Link>
        )}
        {tasbeeh && (
          <Link href="/tasbeeh" className="group flex items-start gap-3">
            <Hash size={20} className="text-[var(--color-primary)] mt-1" aria-hidden="true" />
            <span>
              <span className="block font-semibold group-hover:underline">{tasbeeh.total ? `${tasbeeh.total.toLocaleString()} dhikr today` : "Tasbeeh"}</span>
              <span className="block text-sm text-[var(--color-on-surface)]/65">{tasbeeh.label ? `Most: ${tasbeeh.label}` : "Nothing counted yet today"}</span>
            </span>
          </Link>
        )}
      </div>
      <Link href="/bookmarks" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline">Bookmarks <ArrowRight size={14} aria-hidden="true" /></Link>
    </div>
  );
}
