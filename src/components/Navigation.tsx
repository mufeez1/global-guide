"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Quran", href: "/quran" },
    { name: "Hadith", href: "/hadith" },
    { name: "Dua", href: "/dua-zikar" },
    { name: "Prayer Times", href: "/prayer-times" },
    { name: "Wisdom", href: "/wisdom" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--color-surface)]/80 backdrop-blur-[20px] border-b border-[var(--color-outline-variant)]/10 py-4 px-8 flex justify-between items-center transition-all">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-[var(--color-primary)] hover:opacity-80 transition-opacity">
          The Global Guide
        </Link>
        <div className="hidden md:flex gap-8 text-[var(--color-on-surface-variant)] text-sm uppercase tracking-widest font-semibold font-body">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--color-primary)] transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
        <button
          className="md:hidden text-[var(--color-primary)]"
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-[var(--color-surface)]/95 backdrop-blur-[20px] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center py-4 px-8 border-b border-[var(--color-outline-variant)]/10">
          <span className="font-display text-xl font-bold tracking-tight text-[var(--color-primary)]">
            Menu
          </span>
          <button
            className="text-[var(--color-primary)] bg-[var(--color-primary-container)] rounded-full p-2"
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col px-8 py-16 gap-10 text-center text-[var(--color-on-surface)] text-3xl font-display tracking-[-0.01em]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
