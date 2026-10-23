"use client";

import { useState } from "react";
import Link from "next/link";
import { useBookmarks, useBookmark, type Bookmark, type BookmarkKind } from "@/lib/bookmarks";
import { Empty, iconBtn } from "@/components/ui";
import { toast } from "@/components/client";
import { Trash2 } from "lucide-react";

const KINDS: { id: BookmarkKind | "all"; label: string }[] = [
  { id: "all", label: "All" }, { id: "quran", label: "Quran" }, { id: "hadith", label: "Hadith" }, { id: "dua", label: "Duas" }, { id: "name", label: "Names" },
];

export default function Bookmarks() {
  const all = useBookmarks();
  const [kind, setKind] = useState<BookmarkKind | "all">("all");
  const list = kind === "all" ? all : all.filter((b) => b.kind === kind);
  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
        {KINDS.map((k) => (
          <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}
            className={`min-h-10 px-4 rounded-full text-sm font-semibold border cursor-pointer ${kind === k.id ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent" : "border-[var(--color-outline-variant)]/70"}`}>
            {k.label} <span className="tabular-nums opacity-70">{k.id === "all" ? all.length : all.filter((b) => b.kind === k.id).length}</span>
          </button>
        ))}
      </div>
      {list.length ? (
        <ul className="mt-6 space-y-3">{list.map((b) => <Row key={b.id} b={b} />)}</ul>
      ) : <div className="mt-6"><Empty>Nothing saved yet. Use the bookmark button on any verse, hadith, dua or name.</Empty></div>}
    </>
  );
}

function Row({ b }: { b: Bookmark }) {
  const [, toggle] = useBookmark(b);
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-4">
      <Link href={b.href} className="flex-1 min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">{b.kind}</span>
        <span className="block font-semibold">{b.title}</span>
        <span className="block text-sm text-[var(--color-on-surface)]/70 line-clamp-2" dir="auto">{b.text}</span>
      </Link>
      <button type="button" className={iconBtn} aria-label={`Remove ${b.title}`} onClick={() => toggle().then(() => toast("Removed"))}><Trash2 size={18} aria-hidden="true" /></button>
    </li>
  );
}
