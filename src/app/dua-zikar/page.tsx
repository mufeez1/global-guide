import type { Metadata } from "next";
import Link from "next/link";
import { Azkar } from "islam.js";
import { getDuas } from "@/lib/services/ummah-api";
import { errorMessage } from "@/lib/http";
import { Arabic, Attribution, ErrorState, PageHeader, btn } from "@/components/ui";
import { CopyButton } from "@/components/client";
import DuaBrowser from "./DuaBrowser";
import Select from "@/components/Select";

export const metadata: Metadata = {
  title: "Duas & Azkar",
  description: "Morning and evening adhkar and everyday duas with Arabic, transliteration, translation, references and repeat counters.",
  alternates: { canonical: "/dua-zikar" },
};

// Hisn al-Muslim ships with islam.js, so this half of the page works with no network at all.
const HISN = [...new Azkar().getAll().entries()];

type Search = Promise<{ tab?: string; category?: string; hisn?: string }>;

const tab = (on: boolean) => `min-h-11 px-5 inline-flex items-center rounded-full text-sm font-semibold ${on ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "border border-[var(--color-outline-variant)]/70 hover:border-[var(--color-primary)]/50"}`;

export default async function DuaPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const hisnTab = sp.tab === "hisn";

  return (
    <div className="pb-24">
      <PageHeader width="max-w-3xl" kicker="Remembrance" title={<>Duas <span className="text-[var(--color-primary)]">&amp; Azkar</span></>} intro="Supplications for every part of the day, each with its reference. Tap the counter as you recite, or send a dhikr to the Tasbeeh counter.">
        <nav aria-label="Collections" className="mt-8 flex flex-wrap gap-2">
          <Link href="/dua-zikar" aria-current={!hisnTab ? "page" : undefined} className={tab(!hisnTab)}>Duas with translation</Link>
          <Link href="/dua-zikar?tab=hisn" aria-current={hisnTab ? "page" : undefined} className={tab(hisnTab)}>Hisn al-Muslim (Arabic)</Link>
        </nav>
      </PageHeader>
      <div className="max-w-3xl mx-auto px-4 sm:px-8">{hisnTab ? <Hisn index={sp.hisn} /> : <UmmahDuas category={sp.category} />}</div>
    </div>
  );
}

async function UmmahDuas({ category }: { category?: string }) {
  const res = await getDuas().then((d) => ({ ok: true as const, ...d }), (e) => ({ ok: false as const, error: errorMessage(e) }));
  if (!res.ok)
    return <ErrorState message={res.error} retry={<Link className={btn} href="/dua-zikar?tab=hisn">Open Hisn al-Muslim (works offline)</Link>} />;
  return (
    <>
      <DuaBrowser duas={res.duas} categories={res.categories} initialCategory={category} />
      <Attribution ids={["ummah-api"]} note="References as listed by the source" />
      <p className="mt-2 text-xs text-[var(--color-on-surface)]/60">Urdu translations aren&apos;t offered by this source, so none are shown.</p>
    </>
  );
}

function Hisn({ index }: { index?: string }) {
  const i = Math.min(HISN.length - 1, Math.max(0, parseInt(index || "0") || 0));
  const [name, items] = HISN[i];
  return (
    <>
      <form action="/dua-zikar" className="flex gap-2 items-end">
        <input type="hidden" name="tab" value="hisn" />
        <Select label={`Category (${HISN.length})`} className="flex-1 min-w-0" name="hisn" defaultValue={i} dir="rtl" lang="ar" options={HISN.map(([n], k) => ({ value: k, label: n }))} />
        <button className={btn}>Open</button>
      </form>
      <h2 className="mt-8 font-arabic text-3xl text-right" lang="ar" dir="rtl">{name}</h2>
      <ol className="mt-6 space-y-4">
        {items.map((z) => (
          <li key={z.id} className="rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-5 sm:p-7">
            <Arabic className="text-[1.6rem] leading-[2.1]">{z.zikr}</Arabic>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--color-on-surface)]/70">
              {z.reference && <span>Reference: <span lang="ar">{z.reference}</span></span>}
              {Number(z.count) > 1 && <span className="font-semibold text-[var(--color-primary)]">Repeat {z.count}×</span>}
              <span className="ml-auto flex no-print">
                <CopyButton text={`${z.zikr}\n\n— ${z.reference}`} label="Copy" />
                <Link href={`/tasbeeh?text=${encodeURIComponent(name)}&arabic=${encodeURIComponent(z.zikr.slice(0, 200))}&target=${Number(z.count) > 1 ? z.count : 33}`} className="inline-flex items-center px-3 font-semibold text-[var(--color-primary)] hover:underline">Tasbeeh</Link>
              </span>
            </div>
          </li>
        ))}
      </ol>
      <Attribution ids={["hisn-muslim"]} note="Arabic only; no translation is bundled" />
    </>
  );
}
