"use client";

import { useEffect, useState } from "react";
import { input } from "@/components/ui";

// Filters the hadith already on the page; the provider has no search for books.
export default function SectionFilter() {
  const [q, setQ] = useState("");
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const id = setTimeout(() => {
      const needle = q.trim().toLowerCase();
      let shown = 0;
      document.querySelectorAll<HTMLElement>("[data-h]").forEach((el) => {
        const hit = !needle || el.textContent!.toLowerCase().includes(needle);
        el.parentElement!.hidden = !hit;
        if (hit) shown++;
      });
      setCount(needle ? shown : null);
    }, 200);
    return () => clearTimeout(id);
  }, [q]);
  return (
    <div className="no-print">
      <label htmlFor="hf" className="sr-only">Filter this page</label>
      <input id="hf" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter this page (Arabic, English or Urdu)" className={input} />
      <p aria-live="polite" className="mt-1 text-xs text-[var(--color-on-surface)]/60">{count !== null && `${count} on this page match`}</p>
    </div>
  );
}
