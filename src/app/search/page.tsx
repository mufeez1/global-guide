import type { Metadata } from "next";
import Link from "next/link";
import { Quran, Azkar } from "islam.js";
import { Search } from "lucide-react";
import { SURAHS } from "@/lib/audio";
import { search as quranSearch, DEFAULT_URDU, URDU_TRANSLATIONS } from "@/lib/services/quran-cloud";
import { getDuas, getNames, searchHadith } from "@/lib/services/ummah-api";
import { errorMessage } from "@/lib/http";
import { Arabic, Attribution, Empty, PageHeader, btnPrimary, input } from "@/components/ui";
import LocalResults from "./LocalResults";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

// Arabic matching ignores diacritics and tatweel, and treats alef forms alike.
const norm = (s: string) => s.replace(/[ً-ٰٟۖ-ۭـ]/g, "").replace(/[أإآٱ]/g, "ا").toLowerCase();
const hasArabicScript = (s: string) => /[؀-ۿ]/.test(s);
const hasLatin = (s: string) => /[a-z]/i.test(s);

// Built once per server process: Arabic + Sahih International, bundled with islam.js.
const quran = new Quran();
const VERSES = quran.getAllChapters().flatMap((c) =>
  quran.getVerseRangeWithTranslation(c.number, 1, c.numberOfVerses).map((v, i) => ({ s: c.number, a: i + 1, ar: v.verse, en: v.translation, key: norm(v.verse) + "\n" + v.translation.toLowerCase() }))
);
const HISN = [...new Azkar().getAll().entries()].flatMap(([cat, items], ci) => items.map((z) => ({ cat, ci, z, key: norm(z.zikr + " " + cat) })));

const settle = <T,>(p: Promise<T>) => p.then((v) => ({ ok: true as const, v }), (e) => ({ ok: false as const, error: errorMessage(e) }));
const LIMIT = 25;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const nq = norm(q);
  const ready = q.length >= 2;

  const surahs = ready ? SURAHS.filter((s) => String(s.number) === q || norm(`${s.name} ${s.meaning} ${s.arabic}`).includes(nq)) : [];
  const verses = ready ? VERSES.filter((v) => v.key.includes(nq)) : [];
  const hisn = ready && hasArabicScript(q) ? HISN.filter((h) => h.key.includes(nq)) : [];

  const [urdu, duas, names, hadith] = ready
    ? await Promise.all([
        hasArabicScript(q) ? settle(quranSearch(q, DEFAULT_URDU)) : null,
        settle(getDuas()),
        settle(getNames()),
        hasLatin(q) ? settle(searchHadith(q)) : null,
      ])
    : [null, null, null, null];

  const duaHits = duas?.ok ? duas.v.duas.filter((d) => norm([d.title, d.translation, d.transliteration, d.arabic].join(" ")).includes(nq)) : [];
  const nameHits = names?.ok ? names.v.names.filter((n) => norm([n.transliteration, n.english, n.meaning, n.arabic].join(" ")).includes(nq)) : [];

  return (
    <div className="pb-24">
      <PageHeader width="max-w-4xl" kicker="Search" title="Search everything">
        <form action="/search" role="search" className="mt-6 flex gap-2 max-w-2xl">
          <label htmlFor="q" className="sr-only">Search</label>
          <input id="q" name="q" type="search" defaultValue={q} minLength={2} required placeholder="Surah, verse, dua, name… in English, Arabic or Urdu" className={input} />
          <button className={btnPrimary}><Search size={16} aria-hidden="true" /> Search</button>
        </form>
        <p className="mt-3 text-xs text-[var(--color-on-surface)]/60">Searches Quran text and translations, duas, Hisn al-Muslim, the 99 Names, hadith (English) and your bookmarks. Tafsir can&apos;t be searched; open it from any verse.</p>
      </PageHeader>

      {ready && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
          <LocalResults q={q} />

          <Group title="Surahs" count={surahs.length}>
            <ul className="grid sm:grid-cols-2 gap-2">
              {surahs.slice(0, 12).map((s) => (
                <li key={s.number}><Link href={`/quran?chapter=${s.number}`} className="flex justify-between gap-3 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4 hover:border-[var(--color-primary)]/40">
                  <span><span className="font-semibold">{s.number}. {s.name}</span><span className="block text-sm text-[var(--color-on-surface)]/60">{s.meaning}</span></span>
                  <span lang="ar" dir="rtl" className="font-arabic text-xl text-[var(--color-primary)]">{s.arabic.replace("سورة ", "")}</span>
                </Link></li>
              ))}
            </ul>
          </Group>

          <Group title="Quran verses" count={verses.length} note="Arabic text and Sahih International, searched offline">
            <ul className="space-y-3">
              {verses.slice(0, LIMIT).map((v) => (
                <li key={`${v.s}:${v.a}`}><Link href={`/quran?chapter=${v.s}#v${v.a}`} className="block rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4 hover:border-[var(--color-primary)]/40">
                  <span className="text-xs font-bold text-[var(--color-primary)]">{SURAHS[v.s - 1].name} {v.s}:{v.a}</span>
                  {hasArabicScript(q) ? <Arabic className="mt-1 text-xl leading-[2]">{v.ar}</Arabic> : <span className="mt-1 block">{v.en}</span>}
                </Link></li>
              ))}
            </ul>
            {verses.length > LIMIT && <p className="mt-2 text-sm text-[var(--color-on-surface)]/65">Showing {LIMIT} of {verses.length}. Add words to narrow the search.</p>}
          </Group>

          {urdu && (
            <Group title={`Urdu translation (${URDU_TRANSLATIONS[DEFAULT_URDU]})`} count={urdu.ok ? urdu.v.count : 0} error={urdu.ok ? undefined : urdu.error}>
              {urdu.ok && (
                <ul className="space-y-3">
                  {urdu.v.hits.slice(0, LIMIT).map((h) => (
                    <li key={`${h.surah}:${h.ayah}`}><Link href={`/quran?chapter=${h.surah}#v${h.ayah}`} className="block rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4 hover:border-[var(--color-primary)]/40">
                      <span className="text-xs font-bold text-[var(--color-primary)]">{h.surahName} {h.surah}:{h.ayah}</span>
                      <span lang="ur" dir="rtl" className="urdu block text-right mt-1">{h.text}</span>
                    </Link></li>
                  ))}
                </ul>
              )}
              {urdu.ok && <Attribution ids={["alquran-cloud"]} />}
            </Group>
          )}

          <Group title="Duas" count={duaHits.length} error={duas?.ok === false ? duas.error : undefined}>
            <ul className="space-y-2">
              {duaHits.slice(0, LIMIT).map((d) => (
                <li key={d.id}><Link href={`/dua-zikar?category=${d.category}#dua-${d.id}`} className="block rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4 hover:border-[var(--color-primary)]/40">
                  <span className="font-semibold">{d.title}</span>
                  {d.translation && <span className="block text-sm text-[var(--color-on-surface)]/70 line-clamp-2">{d.translation}</span>}
                </Link></li>
              ))}
            </ul>
          </Group>

          {hisnHitsSection(hisn)}

          <Group title="99 Names" count={nameHits.length} error={names?.ok === false ? names.error : undefined}>
            <ul className="flex flex-wrap gap-2">
              {nameHits.map((n) => (
                <li key={n.number}><Link href={`/names/${n.number}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)]/50 px-4 min-h-11 hover:border-[var(--color-primary)]/40">
                  <span lang="ar" className="font-arabic text-lg">{n.arabic}</span> {n.transliteration} · {n.english}
                </Link></li>
              ))}
            </ul>
          </Group>

          {hadith && (
            <Group title="Hadith" count={hadith.ok ? hadith.v.length : 0} error={hadith.ok ? undefined : hadith.error} note="English search via UmmahAPI (first 20 matches)">
              {hadith.ok && (
                <ul className="space-y-3">
                  {hadith.v.map((h) => (
                    <li key={h.id} className="rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4">
                      <p className="text-xs font-bold text-[var(--color-primary)]">{h.collectionName} {h.number}{h.grade && <span className="ml-2 font-normal text-[var(--color-on-surface)]/60">Grade (per UmmahAPI): {h.grade}</span>}</p>
                      {h.english && <p className="mt-1 text-sm line-clamp-4">{h.english}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {hadith.ok && <Attribution ids={["ummah-api"]} />}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function hisnHitsSection(hisn: typeof HISN) {
  if (!hisn.length) return null;
  return (
    <Group title="Hisn al-Muslim" count={hisn.length}>
      <ul className="space-y-2">
        {hisn.slice(0, LIMIT).map((h) => (
          <li key={h.z.id}><Link href={`/dua-zikar?tab=hisn&hisn=${h.ci}`} className="block rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4 hover:border-[var(--color-primary)]/40">
            <span lang="ar" dir="rtl" className="block text-right text-xs font-bold text-[var(--color-primary)]">{h.cat}</span>
            <Arabic className="mt-1 text-lg leading-[2] line-clamp-2">{h.z.zikr}</Arabic>
          </Link></li>
        ))}
      </ul>
    </Group>
  );
}

function Group({ title, count, note, error, children }: { title: string; count: number; note?: string; error?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="font-display text-2xl">{title} <span className="text-base font-body text-[var(--color-on-surface)]/55 tabular-nums">({count})</span></h2>
      {note && <p className="text-xs text-[var(--color-on-surface)]/60">{note}</p>}
      <div className="mt-4">
        {error ? <p role="alert" className="text-sm text-[var(--color-error)]">{error}</p> : count ? children : <Empty>No matches.</Empty>}
      </div>
    </section>
  );
}
