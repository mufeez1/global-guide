import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

// Served by the service worker when a page you haven't opened before is requested offline.
export default function OfflinePage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-24 text-center">
      <WifiOff size={40} className="mx-auto text-[var(--color-primary)]" aria-hidden="true" />
      <h1 className="mt-6 font-display text-4xl">You&apos;re offline</h1>
      <p className="mt-4 text-[var(--color-on-surface)]/75">This page hasn&apos;t been saved yet. Pages you&apos;ve opened before, your prayer times, bookmarks and tasbeeh still work.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 font-semibold text-[var(--color-primary)]">
        <Link href="/prayer-times" className="underline">Prayer times</Link>
        <Link href="/tasbeeh" className="underline">Tasbeeh</Link>
        <Link href="/bookmarks" className="underline">Bookmarks</Link>
        <Link href="/dua-zikar?tab=hisn" className="underline">Hisn al-Muslim</Link>
      </div>
    </div>
  );
}
