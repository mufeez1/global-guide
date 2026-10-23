import type { Metadata } from "next";
import Link from "next/link";
import { Quran } from "islam.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar, { SurahSelect } from "./Sidebar";
import ReaderShell from "./ReaderShell";
import VerseTools from "./VerseTools";
import { RECITERS, DEFAULT_RECITER, SURAHS } from "@/lib/audio";
import { DEFAULT_URDU, URDU_TRANSLATIONS, getMeta, getSurah, type Ayah } from "@/lib/services/quran-cloud";
import { Attribution, Urdu } from "@/components/ui";

const REVELATION: Record<string, string> = { "مكيّة": "Meccan", "مدنيّة": "Medinan" };

type Search = Promise<{ [key: string]: string | undefined }>;
const chapterOf = (s: { chapter?: string }) => Math.min(114, Math.max(1, parseInt(s.chapter || "1") || 1));

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const n = chapterOf(await searchParams);
  const s = SURAHS[n - 1];
  return {
    title: `Surah ${s.name}${s.meaning ? ` (${s.meaning})` : ""} — ${n}`,
    description: `Read Surah ${s.name} (${s.arabic}) in Arabic with English and Urdu translation, recitation and tafsir.`,
    alternates: { canonical: `/quran?chapter=${n}` },
    openGraph: { title: `Surah ${s.name} · The Noble Quran` },
  };
}

export default async function QuranPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const chapterNo = chapterOf(params);
  const reciter = params.reciter && params.reciter in RECITERS ? params.reciter : DEFAULT_RECITER;
  // ?ur=none turns Urdu off; an unknown id is ignored rather than swapped for another translator.
  const urdu = params.ur === "none" ? "" : params.ur && params.ur in URDU_TRANSLATIONS ? params.ur : DEFAULT_URDU;

  const quran = new Quran();
  // Only names and counts go to the client list, not every verse of the Quran.
  const chapters = quran.getAllChapters().map((c, i) => ({
    ...SURAHS[i],
    verses: c.numberOfVerses,
    revelation: REVELATION[c.type] ?? c.type,
  }));
  const chapter = chapters[chapterNo - 1];

  const [remote, meta] = await Promise.allSettled([getSurah(chapterNo, urdu || undefined), getMeta()]);
  // If AlQuran Cloud is down, fall back to the text bundled with islam.js and say so on screen.
  const ayahs: Ayah[] = remote.status === "fulfilled"
    ? remote.value.ayahs
    : quran.getVerseRangeWithTranslation(chapterNo, 1, chapter.verses).map((v, i) => ({ n: i + 1, global: 0, juz: 0, page: 0, sajda: false, arabic: v.verse, english: v.translation }));
  const urduMissing = !!urdu && (remote.status === "rejected" || ayahs.some((a) => !a.urdu));
  const refs = meta.status === "fulfilled" ? meta.value : { juzs: [], pages: [] };

  // Al-Fatihah's Bismillah is its first verse; At-Tawbah has none.
  const showBismillah = chapterNo !== 1 && chapterNo !== 9;
  const prev = chapters[chapterNo - 2];
  const next = chapters[chapterNo];
  const extra = urdu === DEFAULT_URDU ? "" : `&ur=${urdu || "none"}`;
  const href = (n: number) => `/quran?chapter=${n}&reciter=${reciter}${extra}`;

  return (
    <div className="flex items-start bg-[var(--color-surface)]">
      <Sidebar chapters={chapters} activeChapterNo={chapterNo} reciter={reciter} extra={extra} />

      <article className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-8 md:pt-14 pb-40">
          <div className="lg:hidden mb-6">
            <SurahSelect chapters={chapters} activeChapterNo={chapterNo} reciter={reciter} extra={extra} />
          </div>

          {/* Surah header */}
          <header className="relative overflow-hidden rounded-[2rem] bg-[var(--color-hero)] text-white px-6 sm:px-10 py-10 md:py-14 text-center">
            <div aria-hidden="true" className="absolute inset-0 pattern-star opacity-30" />
            <div aria-hidden="true" className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--color-secondary-fixed)]/20 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Surah {chapterNo}</p>
              <p className="mt-4 font-arabic text-5xl md:text-6xl text-[var(--color-secondary-fixed)] leading-[1.6]" dir="rtl" lang="ar">
                {chapter.arabic}
              </p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl tracking-[-0.02em]">{chapter.name}</h1>
              {chapter.meaning && <p className="mt-1 text-white/75">{chapter.meaning}</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">{chapter.revelation}</span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">{chapter.verses} verses</span>
                {ayahs[0].juz > 0 && <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">Juz {ayahs[0].juz}{ayahs.at(-1)!.juz !== ayahs[0].juz && `–${ayahs.at(-1)!.juz}`}</span>}
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">Sahih International</span>
                {urdu && !urduMissing && <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">Urdu: {URDU_TRANSLATIONS[urdu]}</span>}
              </div>
            </div>
          </header>

          {remote.status === "rejected" && (
            <p role="alert" className="mt-6 rounded-2xl bg-[var(--color-secondary-fixed)]/60 text-[var(--color-on-secondary-fixed)] p-4 text-sm">
              AlQuran Cloud couldn&apos;t be reached, so this page shows the Arabic text and Sahih International translation bundled with the islam.js library (from the surahquran.com dataset).
              {urdu && " The Urdu translation isn't available until the connection returns."}
            </p>
          )}
          {remote.status === "fulfilled" && urduMissing && (
            <p role="alert" className="mt-6 rounded-2xl bg-[var(--color-secondary-fixed)]/60 text-[var(--color-on-secondary-fixed)] p-4 text-sm">
              The {URDU_TRANSLATIONS[urdu]} Urdu translation wasn&apos;t returned for every verse; missing verses are left blank rather than replaced.
            </p>
          )}

          <ReaderShell reciter={reciter} chapter={chapterNo} name={chapter.name} total={chapter.verses} urdu={urdu} juzs={refs.juzs} pages={refs.pages}>
            {showBismillah && (
              <p className="mt-14 text-center font-arabic text-3xl md:text-4xl text-[var(--color-on-surface)] leading-[2]" dir="rtl" lang="ar">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            )}

            {/* Verses */}
            <ol className="mt-10 divide-y divide-[var(--color-outline-variant)]/40">
              {ayahs.map((v, i) => {
                const n = v.n;
                const juzStart = i > 0 && v.juz !== ayahs[i - 1].juz;
                return (
                  <li key={n} id={`v${n}`} data-verse={n} className="group py-10 scroll-mt-28 data-[reciting]:bg-[var(--color-primary-container)]/25 data-[reciting]:-mx-4 data-[reciting]:px-4 data-[reciting]:rounded-2xl transition-colors">
                    {juzStart && <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">Juz {v.juz} begins</p>}
                    <div className="flex items-start gap-4 sm:gap-6">
                      <a
                        href={`#v${n}`}
                        aria-label={`Link to verse ${n}`}
                        className="mt-2 w-10 h-10 shrink-0 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary-container)]/40 flex items-center justify-center text-xs font-bold tabular-nums text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors"
                      >
                        {n}
                      </a>
                      <p className="flex-1 quran-ar text-right text-[var(--color-on-surface)]" dir="rtl" lang="ar">
                        {v.arabic}
                      </p>
                    </div>
                    {v.urdu && <Urdu className="mt-5 sm:pr-0 sm:pl-16 text-[var(--color-on-surface)]/85">{v.urdu}</Urdu>}
                    {v.english && (
                      <p className="reader-en mt-4 sm:pl-16 text-[17px] leading-[1.8] text-[var(--color-on-surface)]/80 max-w-prose">{v.english}</p>
                    )}
                    {(v.page > 0 || v.sajda) && (
                      <p className="mt-3 sm:pl-16 text-xs text-[var(--color-on-surface)]/55">
                        {v.page > 0 && `Page ${v.page}`}{v.sajda && " · Prostration (sajdah) verse"}
                      </p>
                    )}
                    <VerseTools verse={n} />
                  </li>
                );
              })}
            </ol>
          </ReaderShell>

          <Attribution
            ids={remote.status === "fulfilled" ? ["tanzil", "alquran-cloud"] : ["islam-js"]}
            note={remote.status === "fulfilled" ? `Arabic: Tanzil Simple Enhanced · English: Saheeh International${urdu && !urduMissing ? ` · Urdu: ${URDU_TRANSLATIONS[urdu]}` : ""}` : "islam.js bundled text"}
          />

          {/* Previous / next surah */}
          <nav aria-label="Surah navigation" className="mt-8 grid grid-cols-2 gap-3">
            {prev ? (
              <Link href={href(prev.number)} className="group flex items-center gap-3 p-4 rounded-2xl border border-[var(--color-outline-variant)]/50 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-container-lowest)] transition-colors">
                <ChevronLeft size={18} className="text-[var(--color-primary)] group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-widest text-[var(--color-on-surface)]/60 font-bold">Previous</span>
                  <span className="block truncate font-semibold">{prev.number}. {prev.name}</span>
                </span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={href(next.number)} className="group flex items-center justify-end gap-3 p-4 rounded-2xl border border-[var(--color-outline-variant)]/50 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-container-lowest)] transition-colors text-right">
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-widest text-[var(--color-on-surface)]/60 font-bold">Next</span>
                  <span className="block truncate font-semibold">{next.number}. {next.name}</span>
                </span>
                <ChevronRight size={18} className="text-[var(--color-primary)] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            )}
          </nav>
        </div>
      </article>
    </div>
  );
}
