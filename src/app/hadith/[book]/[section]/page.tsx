import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BOOKS, getSection } from "@/lib/services/hadith";
import { errorMessage } from "@/lib/http";
import { Attribution, ErrorState, Empty, PageHeader, BackLink, btn } from "@/components/ui";
import HadithCard from "../../HadithCard";
import SectionFilter from "./SectionFilter";

const PER_PAGE = 40;

type Params = Promise<{ book: string; section: string }>;
type Search = Promise<{ page?: string; ur?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book, section } = await params;
  const b = BOOKS[book];
  return b ? { title: `${b.name} · Book ${section}`, alternates: { canonical: `/hadith/${book}/${section}` } } : {};
}

export default async function SectionPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { book, section } = await params;
  const sp = await searchParams;
  const b = BOOKS[book];
  const n = parseInt(section);
  if (!b || !(n > 0)) notFound();
  const withUrdu = b.urdu && sp.ur !== "0";

  const res = await getSection(book, n, withUrdu).then((s) => ({ ok: true as const, s }), (e) => ({ ok: false as const, error: errorMessage(e) }));
  if (!res.ok) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16"><ErrorState message={res.error} retry={<BackLink href={`/hadith/${book}`}>Back to {b.name}</BackLink>} /></div>;
  }
  const { s } = res;
  const pages = Math.max(1, Math.ceil(s.hadiths.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, parseInt(sp.page || "1") || 1));
  const shown = s.hadiths.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const q = (p: number, ur = withUrdu) => `?page=${p}${b.urdu && !ur ? "&ur=0" : ""}`;
  const urduMissing = withUrdu && s.hadiths.length > 0 && s.hadiths.every((h) => !h.urdu);

  return (
    <div className="pb-24">
      <PageHeader width="max-w-3xl" kicker={`${b.name} · Book ${n}`} title={s.title || `Book ${n}`}>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BackLink href={`/hadith/${book}`}><ChevronLeft size={16} aria-hidden="true" /> {b.name}</BackLink>
          {b.urdu && (
            <Link href={q(page, !withUrdu)} className={btn}>{withUrdu ? "Hide Urdu" : "Show Urdu (اردو)"}</Link>
          )}
        </div>
      </PageHeader>

      <section className="max-w-3xl mx-auto px-4 sm:px-8">
        {urduMissing && <p role="status" className="mb-4 text-sm rounded-2xl bg-[var(--color-secondary-fixed)]/60 text-[var(--color-on-secondary-fixed)] p-4">The Urdu edition isn&apos;t available for this book section.</p>}
        {shown.length ? (
          <>
            <SectionFilter />
            <ol className="mt-4 space-y-4">
              {shown.map((h) => <li key={h.number}><HadithCard book={book} section={n} h={h} id={`h${h.number}`} /></li>)}
            </ol>
          </>
        ) : <Empty>No hadith text is published for this section.</Empty>}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && <Link className={btn} href={q(page - 1)}>Previous</Link>}
            <span className="text-sm tabular-nums px-3">Page {page} of {pages}</span>
            {page < pages && <Link className={btn} href={q(page + 1)}>Next</Link>}
          </nav>
        )}
        <Attribution ids={["hadith-api"]} note="Grades as published by the dataset, where present" />
      </section>
    </div>
  );
}
