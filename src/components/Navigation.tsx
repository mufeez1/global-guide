"use client";

import Link, { useLinkStatus } from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import { usePref } from "@/lib/settings";

// Thin bar across the top while a clicked link's page loads; must render inside that <Link>.
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span aria-hidden="true" className="nav-progress fixed inset-x-0 top-0 z-[90] h-[3px] bg-[var(--color-primary)]" /> : null;
}

const PRIMARY = [
  { name: "Quran", href: "/quran" },
  { name: "Listen", href: "/listen" },
  { name: "Prayer Times", href: "/prayer-times" },
  { name: "Hadith", href: "/hadith" },
  { name: "Dua", href: "/dua-zikar" },
  { name: "Tasbeeh", href: "/tasbeeh" },
];

const MORE = [
  { name: "Hijri Calendar", href: "/calendar" },
  { name: "Ramadan", href: "/ramadan" },
  { name: "99 Names", href: "/names" },
  { name: "Mosque Finder", href: "/mosques" },
  { name: "Bookmarks", href: "/bookmarks" },
  { name: "Wisdom", href: "/wisdom" },
  { name: "Settings", href: "/settings" },
];

type Theme = { mode: "system" | "light" | "dark" };
const THEME_DEFAULT: Theme = { mode: "system" };
const NEXT_MODE = { system: "light", light: "dark", dark: "system" } as const;

function ThemeToggle() {
  const [{ mode }, setTheme] = usePref<Theme>("ic:theme", THEME_DEFAULT);
  useEffect(() => {
    if (mode === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = mode;
  }, [mode]);
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={() => setTheme({ mode: NEXT_MODE[mode] })}
      aria-label={`Theme: ${mode}. Switch to ${NEXT_MODE[mode]}`}
      title={`Theme: ${mode}`}
      className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors cursor-pointer"
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Close menus after navigating (state adjusted during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsOpen(false);
    setMoreOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [moreOpen]);

  const linkClass = (href: string) =>
    `hover:text-[var(--color-primary)] transition-colors ${active(href) ? "text-[var(--color-primary)] underline underline-offset-8 decoration-2" : ""}`;

  return (
    <>
      <nav aria-label="Main" className="fixed top-0 left-0 w-full z-50 h-[72px] bg-[var(--color-surface)]/85 backdrop-blur-[20px] border-b border-[var(--color-outline-variant)]/30 px-4 sm:px-8 flex justify-between items-center gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-[var(--color-primary)] hover:opacity-80 transition-opacity">
          The Global Guide<Pending />
        </Link>
        <div className="hidden lg:flex items-center gap-7 text-[var(--color-on-surface)]/75 text-sm uppercase tracking-widest font-semibold font-body">
          {PRIMARY.map((link) => (
            <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={linkClass(link.href)}>
              {link.name}<Pending />
            </Link>
          ))}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              onClick={() => setMoreOpen((o) => !o)}
              className={`inline-flex items-center gap-1 uppercase tracking-widest font-semibold cursor-pointer hover:text-[var(--color-primary)] ${MORE.some((l) => active(l.href)) ? "text-[var(--color-primary)]" : ""}`}
            >
              More <ChevronDown size={16} aria-hidden="true" className={moreOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            {moreOpen && (
              <ul id="more-menu" className="absolute right-0 mt-4 w-56 p-2 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] normal-case tracking-normal text-[15px]">
                {MORE.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`block px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-container-low)] ${active(link.href) ? "text-[var(--color-primary)] font-bold" : "text-[var(--color-on-surface)]"}`}>
                      {link.name}<Pending />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search" className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors">
            <Search size={20} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center text-[var(--color-primary)] cursor-pointer"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={28} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer: inert while closed so hidden links can't be tabbed to */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!isOpen}
        className={`fixed inset-0 z-[60] bg-[var(--color-surface)]/95 backdrop-blur-[20px] transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center h-[72px] px-4 sm:px-8 border-b border-[var(--color-outline-variant)]/20">
          <span className="font-display text-xl font-bold tracking-tight text-[var(--color-primary)]">Menu</span>
          <button
            className="text-[var(--color-primary)] bg-[var(--color-primary-container)] rounded-full w-11 h-11 flex items-center justify-center cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 px-8 py-10">
          {[...PRIMARY, ...MORE].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              className={`py-3 text-2xl font-display tracking-[-0.01em] border-b border-[var(--color-outline-variant)]/20 ${active(link.href) ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface)]"}`}
            >
              {link.name}<Pending />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
