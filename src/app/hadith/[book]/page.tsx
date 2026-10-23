import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BOOKS } from "@/lib/services/hadith";
import { errorMessage } from "@/lib/http";
import { Attribution, ErrorState, PageHeader, BackLink } from "@/components/ui";
import { sectionsFor } from "../data";

export const revalidate = 604800;

type Params = Promise<{ book: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book } = await params;
  const b = BOOKS[book];
  return b ? { title: `${b.name} — books`, description: `Browse ${b.name} by book.`, alternates: { canonical: `/hadith/${book}` } } : {};
}

export default async function BookPage({ params }: { params: Params }) {
  const { book } = await params;
  const b = BOOKS[book];
  if (!b) notFound();
  const sections = await sectionsFor(book).then((s) => ({ ok: true as const, s }), (e) => ({ ok: false as const, error: errorMessage(e) }));

  return (
    <div className="pb-24">
      <PageHeader kicker="Hadith collection" title={b.name} intro={<span lang="ar" dir="rtl" className="font-arabic">{b.arabic}</span>}>
        <div className="mt-6"><BackLink href="/hadith"><ChevronLeft size={16} aria-hidden="true" /> All collections</BackLink></div>
      </PageHeader>
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        {!sections.ok ? <ErrorState message={sections.error} /> : (
          <ol className="grid sm:grid-cols-2 gap-3">
            {sections.s.map((s) => (
              <li key={s.number}>
                <Link href={`/hadith/${book}/${s.number}`} className="flex items-center gap-4 h-full rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-4 hover:border-[var(--color-primary)]/40 transition-colors">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-primary-container)]/50 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold tabular-nums">{s.number}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{s.title}</span>
                    <span className="block text-xs text-[var(--color-on-surface)]/60 tabular-nums">Hadith {s.first}–{s.last}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
        <Attribution ids={["hadith-api"]} />
      </section>
    </div>
  );
}
