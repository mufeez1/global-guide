import Link from "next/link";

export const DEDICATION = {
  en: "Sadaqah Jariyah from Mr & Mrs Khalid Mehmood and Family",
  ur: "صدقۂ جاریہ — منجانب جناب و بیگم خالد محمود اور اہلِ خانہ",
};

// Shown in the footer on every page; the print-only copy covers printed pages, where the footer is hidden.
export function Dedication({ lang, className = "" }: { lang?: "en" | "ur"; className?: string }) {
  return (
    <p className={`text-center ${className}`}>
      {lang !== "ur" && <span className="font-semibold">{DEDICATION.en}</span>}
      {!lang && <span aria-hidden="true" className="mx-2 opacity-50">·</span>}
      {lang !== "en" && <span lang="ur" dir="rtl" className="font-urdu font-semibold">{DEDICATION.ur}</span>}
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface-container-low)] py-16 px-8 rounded-t-[2.5rem] mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="font-display text-xl font-bold text-[var(--color-primary)] tracking-[-0.01em]">The Global Guide</p>
        <div className="flex flex-wrap justify-center gap-8 text-[var(--color-on-surface)]/70 font-body text-sm uppercase tracking-widest font-semibold">
          <Link href="/sources" className="hover:text-[var(--color-primary)] transition-colors">Sources &amp; licences</Link>
          <Link href="/sources#privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy</Link>
          <Link href="/settings" className="hover:text-[var(--color-primary)] transition-colors">Settings</Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-10 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-5 py-4 text-sm text-[var(--color-gold)]">
        <Dedication className="leading-loose" />
      </div>
      <p className="max-w-6xl mx-auto mt-6 text-center text-xs text-[var(--color-on-surface)]/60">
        Prayer times and Hijri dates are calculated and may differ from your local mosque or moon-sighting committee.
      </p>
    </footer>
  );
}
