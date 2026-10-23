import type { Metadata } from "next";
import Link from "next/link";
import { Library, Search } from "lucide-react";
import { BOOKS } from "@/lib/services/hadith";
import { errorMessage } from "@/lib/http";
import { Attribution, ErrorState, PageHeader, btnPrimary, input } from "@/components/ui";
import HadithCard from "./HadithCard";
import { dailyHadith } from "./data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Hadith Library",
  description: "Browse Sahih al-Bukhari, Sahih Muslim, the Sunan and more by book, in Arabic, English and Urdu, with grades where the source provides them.",
  alternates: { canonical: "/hadith" },
};

export default async function HadithPage() {
  const today = await dailyHadith().then((h) => ({ ok: true as const, h }), (e) => ({ ok: false as const, error: errorMessage(e) }));

  return (
    <div className="pb-24">
      <PageHeader kicker="Sunnah" title={<>Hadith <span className="text-[var(--color-primary)]">Library</span></>} intro="Collections organised by book, with Arabic, English and, where published, Urdu. Grades appear only when the source supplies them.">
        <form action="/search" className="mt-8 flex gap-2 max-w-xl" role="search">
          <input type="hidden" name="in" value="hadith" />
          <label htmlFor="hq" className="sr-only">Search hadith</label>
          <input id="hq" name="q" required placeholder="Search hadith in English, e.g. intention" className={input} />
          <button className={btnPrimary}><Search size={16} aria-hidden="true" /> Search</button>
        </form>
      </PageHeader>

      <section aria-labelledby="daily-h" className="max-w-6xl mx-auto px-4 sm:px-8">
        <h2 id="daily-h" className="font-display text-2xl mb-4">Hadith of the day</h2>
        {today.ok ? (
          <>
            <HadithCard book="nawawi" h={today.h} />
            <Attribution ids={["hadith-api"]} note="Forty Hadith of an-Nawawi" />
          </>
        ) : <ErrorState message={today.error} />}
      </section>

      <section aria-labelledby="books-h" className="max-w-6xl mx-auto px-4 sm:px-8 mt-14">
        <h2 id="books-h" className="font-display text-2xl">Collections</h2>
        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(BOOKS).map(([slug, b]) => (
            <li key={slug}>
              <Link href={`/hadith/${slug}`} className="group flex flex-col h-full rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-6 hover:border-[var(--color-primary)]/40 hover:shadow-[0_16px_40px_-12px_rgba(27,109,36,0.2)] transition">
                <span className="flex items-start justify-between gap-3">
                  <Library size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
                  <span lang="ar" dir="rtl" className="font-arabic text-xl text-[var(--color-on-surface)]/70">{b.arabic}</span>
                </span>
                <span className="mt-5 font-display text-xl">{b.name}</span>
                <span className="mt-1 text-sm text-[var(--color-on-surface)]/65">Arabic · English{b.urdu ? " · اردو Urdu" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Attribution ids={["hadith-api"]} />
        <p className="mt-2 text-xs text-[var(--color-on-surface)]/60">Sunnah.com&apos;s API needs a private key that can&apos;t be used safely from the browser, so it isn&apos;t used here.</p>
      </section>
    </div>
  );
}
