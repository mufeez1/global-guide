import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--color-surface-container-low)] py-16 px-8 rounded-t-[2.5rem] mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="font-display text-xl font-bold text-[var(--color-primary)] tracking-[-0.01em]">The Global Guide</p>
        <div className="flex flex-wrap justify-center gap-8 text-[var(--color-on-surface)] opacity-70 font-body text-sm uppercase tracking-widest font-semibold">
          <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">About Us</Link>
          <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link>
          <Link href="#" className="font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity">Donate</Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 text-center font-body text-sm text-[var(--color-on-surface)] opacity-50 tracking-wider">
        © {year} The Global Guide. All rights reserved.
      </div>
    </footer>
  );
}
