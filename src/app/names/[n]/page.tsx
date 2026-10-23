import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getNames } from "@/lib/services/ummah-api";
import { errorMessage } from "@/lib/http";
import { Attribution, BackLink, ErrorState, btn } from "@/components/ui";
import { BookmarkButton, CopyButton, ShareButton } from "@/components/client";

export const revalidate = 604800;

type Params = Promise<{ n: string }>;
const num = async (p: Params) => parseInt((await p).n);

export function generateStaticParams() {
  return Array.from({ length: 99 }, (_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const n = await num(params);
  const name = await getNames().then((r) => r.names.find((x) => x.number === n)).catch(() => undefined);
  return name ? { title: `${name.transliteration} (${name.arabic}) — ${name.english}`, description: name.meaning, alternates: { canonical: `/names/${n}` } } : {};
}

export default async function NamePage({ params }: { params: Params }) {
  const n = await num(params);
  if (!(n >= 1 && n <= 99)) notFound();
  const res = await getNames().then((d) => ({ ok: true as const, ...d }), (e) => ({ ok: false as const, error: errorMessage(e) }));
  if (!res.ok) return <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16"><ErrorState message={res.error} /></div>;
  const name = res.names.find((x) => x.number === n);
  if (!name) notFound();
  const text = `${name.arabic} — ${name.transliteration}: ${name.english}${name.meaning ? `. ${name.meaning}` : ""}`;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 pt-10 pb-24">
      <BackLink href="/names"><ChevronLeft size={16} aria-hidden="true" /> All 99 Names</BackLink>
      <div className="mt-6 relative overflow-hidden rounded-[2rem] bg-[var(--color-hero)] text-white px-6 py-14 text-center">
        <div aria-hidden="true" className="absolute inset-0 pattern-star opacity-30" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Name {n} of 99</p>
          <p lang="ar" dir="rtl" className="mt-4 font-arabic text-7xl leading-[1.6] text-[var(--color-secondary-fixed)]">{name.arabic}</p>
          <h1 className="mt-3 font-display text-4xl">{name.transliteration}</h1>
          <p className="mt-1 text-xl text-white/85">{name.english}</p>
        </div>
      </div>
      {name.meaning && <p className="mt-8 text-lg leading-relaxed max-w-prose">{name.meaning}</p>}
      <div className="mt-6 flex gap-1">
        <BookmarkButton item={{ id: `name:${n}`, kind: "name", title: `${name.transliteration} — ${name.english}`, text: name.arabic, href: `/names/${n}` }} label="Favourite name" />
        <CopyButton text={text} />
        <ShareButton title={name.transliteration} text={text} url={`/names/${n}`} />
      </div>
      <Attribution ids={["ummah-api"]} note="Meanings as given by the source" />
      <nav aria-label="Other names" className="mt-10 flex justify-between gap-3">
        {n > 1 ? <Link href={`/names/${n - 1}`} className={btn}><ChevronLeft size={16} aria-hidden="true" /> {res.names.find((x) => x.number === n - 1)?.transliteration}</Link> : <span />}
        {n < 99 && <Link href={`/names/${n + 1}`} className={btn}>{res.names.find((x) => x.number === n + 1)?.transliteration} <ChevronRight size={16} aria-hidden="true" /></Link>}
      </nav>
    </article>
  );
}
