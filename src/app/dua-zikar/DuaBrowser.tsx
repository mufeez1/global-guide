"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Hash, RotateCcw } from "lucide-react";
import type { Dua, DuaCategory } from "@/lib/services/ummah-api";
import { useBookmarks } from "@/lib/bookmarks";
import { BookmarkButton, CopyButton, ShareButton } from "@/components/client";
import { Arabic, Empty, input, iconBtn } from "@/components/ui";

const chip = (on: boolean) =>
  `shrink-0 min-h-10 px-4 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${on ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent" : "border-[var(--color-outline-variant)]/70 hover:border-[var(--color-primary)]/50"}`;

export default function DuaBrowser({ duas, categories, initialCategory }: { duas: Dua[]; categories: DuaCategory[]; initialCategory?: string }) {
  const [cat, setCat] = useState<string>(initialCategory && categories.some((c) => c.id === initialCategory) ? initialCategory : "all");
  const [q, setQ] = useState("");
  const saved = useBookmarks();

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const favs = new Set(saved.filter((b) => b.kind === "dua").map((b) => b.id));
    return duas.filter((d) =>
      (cat === "all" || (cat === "favorites" ? favs.has(`dua:${d.id}`) : d.category === cat)) &&
      (!needle || [d.title, d.translation, d.transliteration, d.arabic, d.source].some((t) => t?.toLowerCase().includes(needle)))
    );
  }, [duas, cat, q, saved]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" role="group" aria-label="Categories">
        {[{ id: "all", name: "All" }, { id: "favorites", name: "Favourites" }, ...categories].map((c) => (
          <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={chip(cat === c.id)}>{c.name}</button>
        ))}
      </div>
      <label htmlFor="dq" className="sr-only">Search duas</label>
      <input id="dq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, meaning, transliteration or Arabic" className={`${input} mt-4`} />
      <p aria-live="polite" className="mt-2 text-xs text-[var(--color-on-surface)]/60">{list.length} dua{list.length === 1 ? "" : "s"}</p>

      {list.length ? (
        <ul className="mt-4 space-y-4">
          {list.map((d) => <li key={d.id}><DuaCard d={d} /></li>)}
        </ul>
      ) : (
        <div className="mt-4"><Empty>{cat === "favorites" ? "No favourites yet. Tap the bookmark on any dua to save it here." : "No duas match your search."}</Empty></div>
      )}
    </div>
  );
}

function DuaCard({ d }: { d: Dua }) {
  const [count, setCount] = useState(0);
  const text = [d.arabic, d.transliteration, d.translation, d.source && `— ${d.source}`].filter(Boolean).join("\n\n");
  const href = `/dua-zikar?category=${d.category}#dua-${d.id}`;
  return (
    <article id={`dua-${d.id}`} className="scroll-mt-28 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-xl">{d.title}</h3>
        <div className="flex no-print">
          <BookmarkButton item={{ id: `dua:${d.id}`, kind: "dua", title: d.title, text: d.translation ?? d.arabic, href }} label="Favourite dua" />
          <CopyButton text={text} label="Copy dua" />
          <ShareButton title={d.title} text={text} url={href} label="Share dua" />
        </div>
      </header>
      <Arabic className="mt-4 text-[1.7rem] leading-[2.1]">{d.arabic}</Arabic>
      {d.transliteration && <p className="mt-4 italic text-[var(--color-on-surface)]/75">{d.transliteration}</p>}
      {d.translation && <p className="mt-3 text-[17px] leading-[1.8] max-w-prose">{d.translation}</p>}
      <footer className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        {d.source && <span className="text-[var(--color-on-surface)]/65">Reference: {d.source}</span>}
        {d.repeat > 1 && (
          <span className="flex items-center gap-1 ml-auto no-print">
            <button
              type="button"
              onClick={() => { setCount((c) => Math.min(d.repeat, c + 1)); navigator.vibrate?.(8); }}
              aria-label={`Count recitation, ${count} of ${d.repeat}`}
              className={`min-h-11 px-4 rounded-full font-semibold tabular-nums cursor-pointer ${count >= d.repeat ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "bg-[var(--color-primary-container)]/60 text-[var(--color-primary)]"}`}
            >
              {count} / {d.repeat}{count >= d.repeat && " · done"}
            </button>
            {count > 0 && <button type="button" aria-label="Reset count" onClick={() => setCount(0)} className={iconBtn}><RotateCcw size={16} aria-hidden="true" /></button>}
          </span>
        )}
        <Link href={`/tasbeeh?text=${encodeURIComponent(d.title)}&arabic=${encodeURIComponent(d.arabic.slice(0, 200))}&target=${d.repeat > 1 ? d.repeat : 33}`} className="no-print inline-flex items-center gap-1 font-semibold text-[var(--color-primary)] hover:underline underline-offset-4">
          <Hash size={14} aria-hidden="true" /> Count in Tasbeeh
        </Link>
      </footer>
    </article>
  );
}
