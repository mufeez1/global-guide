"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Select from "@/components/Select";

type Chapter = { number: number; name: string; meaning: string; arabic: string; verses: number; revelation: string };

export default function Sidebar({ chapters, activeChapterNo, reciter, extra = "" }: { chapters: Chapter[]; activeChapterNo: number; reciter: string; extra?: string }) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const q = query.trim().toLowerCase();
  const filtered = chapters.filter(
    (c) =>
      String(c.number).startsWith(q) ||
      c.name.toLowerCase().includes(q) ||
      c.meaning.toLowerCase().includes(q) ||
      c.arabic.includes(query.trim())
  );

  useEffect(() => {
    listRef.current?.querySelector(`[data-n="${activeChapterNo}"]`)?.scrollIntoView({ block: "center" });
  }, [activeChapterNo]);

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 sticky top-[72px] h-[calc(100dvh-72px)] border-r border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)]">
      <div className="p-5 border-b border-[var(--color-outline-variant)]/40">
        <label className="relative block">
          <span className="sr-only">Filter surahs</span>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface)]/40" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, meaning or number"
            className="w-full bg-[var(--color-surface-container-low)] rounded-xl pl-10 pr-3 py-3 text-sm placeholder:text-[var(--color-on-surface)]/45 border border-transparent focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
          />
        </label>
        <p className="mt-3 text-[11px] uppercase tracking-widest text-[var(--color-on-surface)]/55 font-bold" aria-live="polite">
          {filtered.length} of 114 surahs
        </p>
      </div>

      <ul ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map((c) => {
          const active = c.number === activeChapterNo;
          return (
            <li key={c.number}>
              <Link
                data-n={c.number}
                href={`/quran?chapter=${c.number}&reciter=${reciter}${extra}`}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${active ? "bg-[var(--color-primary-container)]/50" : "hover:bg-[var(--color-surface-container-low)]"}`}
              >
                <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${active ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]/60"}`}>
                  {c.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold truncate ${active ? "text-[var(--color-primary)]" : ""}`}>{c.name}</span>
                  <span className="block text-xs text-[var(--color-on-surface)]/55 truncate">
                    {c.revelation} · {c.verses} verses
                  </span>
                </span>
                <span className="font-arabic text-lg text-[var(--color-on-surface)]/60 shrink-0" dir="rtl" lang="ar">
                  {c.arabic.replace("سورة ", "")}
                </span>
              </Link>
            </li>
          );
        })}
        {!filtered.length && (
          <li className="p-6 text-center text-sm text-[var(--color-on-surface)]/60">
            No surah matches &ldquo;{query}&rdquo;.{" "}
            <button onClick={() => setQuery("")} className="underline cursor-pointer">Clear</button>
          </li>
        )}
      </ul>
    </aside>
  );
}

// Small screens get a native picker instead of the sidebar.
export function SurahSelect({ chapters, activeChapterNo, reciter, extra = "" }: { chapters: Chapter[]; activeChapterNo: number; reciter: string; extra?: string }) {
  const router = useRouter();
  return (
    <Select
      label="Surah"
      hideLabel
      value={activeChapterNo}
      onChange={(v) => router.push(`/quran?chapter=${v}&reciter=${reciter}${extra}`)}
      options={chapters.map((c) => ({ value: c.number, label: `${c.number}. ${c.name}${c.meaning ? ` — ${c.meaning}` : ""}` }))}
    />
  );
}
