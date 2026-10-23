import Link from "next/link";

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
      <p className="max-w-6xl mx-auto mt-10 text-center text-xs text-[var(--color-on-surface)]/60">
        Prayer times and Hijri dates are calculated and may differ from your local mosque or moon-sighting committee.
      </p>
    </footer>
  );
}
