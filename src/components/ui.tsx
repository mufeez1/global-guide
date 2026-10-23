import Link from "next/link";
import { AlertTriangle, CloudOff } from "lucide-react";
import { SOURCES, type SourceId } from "@/lib/sources";

// Shared class strings, so every screen uses the same controls.
export const btn =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold border border-[var(--color-outline-variant)]/70 bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
export const iconBtn =
  "inline-flex items-center justify-center w-11 h-11 rounded-full text-[var(--color-on-surface)]/65 hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-colors cursor-pointer";
export const input =
  "w-full min-h-11 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/70 rounded-xl px-3.5 py-2.5 text-[16px] placeholder:text-[var(--color-on-surface)]/45 focus:outline-none focus:border-[var(--color-primary)] transition-colors";
export const card = "rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40";
export const eyebrow = "text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]";

export function PageHeader({ kicker, title, intro, children, width = "max-w-6xl" }: { kicker: string; title: React.ReactNode; intro?: React.ReactNode; children?: React.ReactNode; width?: string }) {
  return (
    <header className={`${width} mx-auto px-4 sm:px-8 pt-10 md:pt-14 pb-8`}>
      <p className={eyebrow}>{kicker}</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-[-0.02em] text-[var(--color-on-surface)] [text-wrap:balance]">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-on-surface)]/75">{intro}</p>}
      {children}
    </header>
  );
}

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(t).toLocaleDateString();
};

// Source line shown under remote content: who supplied it and how fresh it is.
export function Attribution({ ids, fetchedAt, fromCache, stale, note }: { ids: SourceId[]; fetchedAt?: number; fromCache?: boolean; stale?: boolean; note?: string }) {
  return (
    <p className="mt-3 text-xs text-[var(--color-on-surface)]/60 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>
        Source:{" "}
        {ids.map((id, i) => (
          <span key={id}>
            {i > 0 && ", "}
            <a href={SOURCES[id].url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--color-primary)]">{SOURCES[id].name}</a>
          </span>
        ))}
      </span>
      {note && <span>· {note}</span>}
      {fetchedAt && <span suppressHydrationWarning>· Updated {ago(fetchedAt)}</span>}
      {fromCache && (
        <span className={`inline-flex items-center gap-1 ${stale ? "text-[var(--color-error)] font-semibold" : ""}`}>
          · <CloudOff size={12} aria-hidden="true" /> {stale ? "Saved copy (couldn't refresh)" : "Saved on this device"}
        </span>
      )}
    </p>
  );
}

export function ErrorState({ title = "Couldn't load this", message, retry }: { title?: string; message: string; retry?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-[var(--color-error)]/40 bg-[var(--color-error)]/5 p-5 flex gap-3">
      <AlertTriangle size={20} className="text-[var(--color-error)] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-[var(--color-on-surface)]/75">{message}</p>
        {retry && <div className="mt-3">{retry}</div>}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[var(--color-outline-variant)] p-8 text-center text-sm text-[var(--color-on-surface)]/65">{children}</div>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-[var(--color-surface-container)] ${className}`} />;
}

export function Arabic({ children, className = "", as: Tag = "p" }: { children: React.ReactNode; className?: string; as?: "p" | "span" | "div" }) {
  return <Tag lang="ar" dir="rtl" className={`font-arabic text-right ${className}`}>{children}</Tag>;
}

export function Urdu({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p lang="ur" dir="rtl" className={`urdu text-right ${className}`}>{children}</p>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline underline-offset-4">{children}</Link>;
}
