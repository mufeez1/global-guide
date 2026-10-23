"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AllahName } from "@/lib/services/ummah-api";
import { useBookmarks } from "@/lib/bookmarks";
import { Empty, input } from "@/components/ui";

export default function NamesBrowser({ names }: { names: AllahName[] }) {
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const saved = useBookmarks();
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const favs = new Set(saved.filter((b) => b.kind === "name").map((b) => b.id));
    return names.filter((n) =>
      (!favOnly || favs.has(`name:${n.number}`)) &&
      (!needle || String(n.number) === needle || [n.transliteration, n.english, n.meaning, n.arabic].some((t) => t?.toLowerCase().includes(needle)))
    );
  }, [names, q, favOnly, saved]);

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <label htmlFor="nq" className="sr-only">Search names</label>
        <input id="nq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, meaning or number" className={`${input} flex-1 min-w-60`} />
        <label className="flex items-center gap-2 min-h-11 text-sm cursor-pointer">
          <input type="checkbox" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} className="w-5 h-5 accent-[var(--color-primary)]" /> Favourites only
        </label>
      </div>
      <p aria-live="polite" className="mt-2 text-xs text-[var(--color-on-surface)]/60">{list.length} of 99</p>
      {list.length ? (
        <ol className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((n) => (
            <li key={n.number}>
              <Link href={`/names/${n.number}`} className="flex flex-col h-full rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-4 hover:border-[var(--color-primary)]/40 transition-colors">
                <span className="text-xs font-bold tabular-nums text-[var(--color-on-surface)]/50">{n.number}</span>
                <span lang="ar" dir="rtl" className="mt-1 font-arabic text-3xl text-[var(--color-primary)] text-center leading-[1.8]">{n.arabic}</span>
                <span className="mt-2 font-semibold text-center">{n.transliteration}</span>
                <span className="text-sm text-center text-[var(--color-on-surface)]/65">{n.english}</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : <div className="mt-4"><Empty>{favOnly ? "No favourites yet. Open a name and bookmark it." : "No name matches your search."}</Empty></div>}
    </>
  );
}
