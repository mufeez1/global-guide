"use client";

import Link from "next/link";
import { useBookmarks } from "@/lib/bookmarks";

// Searches what's saved on this device; nothing is sent anywhere.
export default function LocalResults({ q }: { q: string }) {
  const needle = q.toLowerCase();
  const hits = useBookmarks().filter((b) => `${b.title} ${b.text}`.toLowerCase().includes(needle));
  if (!hits.length) return null;
  return (
    <section aria-label="Your bookmarks">
      <h2 className="font-display text-2xl">Your bookmarks <span className="text-base font-body text-[var(--color-on-surface)]/55">({hits.length})</span></h2>
      <ul className="mt-4 space-y-2">
        {hits.slice(0, 10).map((b) => (
          <li key={b.id}>
            <Link href={b.href} className="block rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-container)]/20 p-4 hover:border-[var(--color-primary)]/60">
              <span className="font-semibold">{b.title}</span>
              <span className="block text-sm text-[var(--color-on-surface)]/70 line-clamp-2">{b.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
