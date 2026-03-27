import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, Heart, Calendar } from "lucide-react";
import heroImg from "@/assets/images/hero-background.png";
import quoteIcon from "@/assets/icons/quatation-mark.svg";
import { Quran, Hadith, Chapter } from 'islam.js';

export default function Home() {

  const quran = new Quran();

  let a: Chapter[] = quran.getAllChapters()
  console.log(a)
  return (
    <div className="pb-8">

      {/* Hero Section */}
      <header className="relative pt-3 pb-20 px-8 min-h-[80vh] flex flex-col justify-center bg-[radial-gradient(circle_at_top_right,var(--color-primary-container)_0%,transparent_80%)]">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="font-display text-5xl md:text-6xl text-[var(--color-on-surface)] leading-[1.1] tracking-[-0.02em]">
              Wisdom for the <br /> <span className="text-[var(--color-primary)]">Modern Soul.</span>
            </h1>
            <p className="font-body text-lg text-[var(--color-on-surface)] opacity-80 max-w-md leading-relaxed">
              A sanctuary of sacred knowledge, curated with editorial precision for a serene digital experience.
            </p>
            <div className="pt-4 flex items-center gap-6">
              <Link href="#foundations" className="inline-flex items-center gap-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-8 py-4 rounded-[1.5rem] font-body text-lg hover:opacity-90 transition-opacity">
                Explore Library
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          <div className=" pt-12 rounded-[1.5rem] relative">
            <div className="rounded-[1rem] z-10 translate-x-4 translate-y-4 overflow-hidden ">
              <Image src={heroImg} alt="Hero Background" className="w-full h-auto object-cover " priority />
            </div>
            <div className="bg-[var(--color-surface-container-low)] absolute p-6 bottom-[4rem] left-[-3.5rem] rounded-[1rem] w-[22rem] shadow-lg card-shadow">
              <Image src={quoteIcon} alt="Quote" className="mb-3 w-5 h-auto opacity-60" />
              <p className="font-display text-2xl italic text-[var(--color-on-surface)] leading-relaxed tracking-[-0.02em]">
                "And He is with you wherever you are."
              </p>
              <p className="font-body text-sm text-[var(--color-primary)] font-bold tracking-[0.05em] uppercase mt-4">
                Surah Al-Hadid 57:4
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Foundations Section */}
      <section id="foundations" className="py-24 px-8 bg-[var(--color-surface-container-low)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl text-[var(--color-on-surface)] mb-4 tracking-[-0.02em]">Foundations of Practice</h2>
              <p className="font-body text-lg text-[var(--color-on-surface)] opacity-70">
                Access the core pillars of our faith through a lens of clarity and beauty. Each module is designed for focus and contemplation.
              </p>
            </div>
            <Link href="/quran" className="inline-flex items-center gap-2 text-[var(--color-primary)] font-body font-semibold tracking-wider hover:underline underline-offset-4">
              Explore Full Library <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] group hover:-translate-y-2 transition-transform duration-300 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
              <div className="w-14 h-14 bg-[var(--color-primary-container)] text-[var(--color-primary)] rounded-[0.75rem] flex items-center justify-center mb-8">
                <BookOpen size={28} />
              </div>
              <h3 className="font-display text-2xl mb-3 text-[var(--color-on-surface)] tracking-[-0.02em]">The Noble Quran</h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70 leading-relaxed mb-8">
                Immerse yourself in the divine word with beautiful typography and multiple translations.
              </p>
              <Link href="/quran" className="uppercase font-body text-xs tracking-[0.05em] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">Read Surahs</Link>
            </div>

            <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] group hover:-translate-y-2 transition-transform duration-300 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
              <div className="w-14 h-14 bg-[var(--color-surface-container)] text-[var(--color-primary)] rounded-[0.75rem] flex items-center justify-center mb-8">
                <Clock size={28} />
              </div>
              <h3 className="font-display text-2xl mb-3 text-[var(--color-on-surface)] tracking-[-0.02em]">Prayer Times</h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70 leading-relaxed mb-8">
                Accurate schedules based on your precise location and preferred calculation method.
              </p>
              <Link href="/prayer-times" className="uppercase font-body text-xs tracking-[0.05em] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">View Times</Link>
            </div>

            <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] group hover:-translate-y-2 transition-transform duration-300 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
              <div className="w-14 h-14 bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)] rounded-[0.75rem] flex items-center justify-center mb-8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
              </div>
              <h3 className="font-display text-2xl mb-3 text-[var(--color-on-surface)] tracking-[-0.02em]">Hadith</h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70 leading-relaxed mb-8">
                Verified traditions from the Prophet (PBUH) organized by topic for daily living.
              </p>
              <Link href="/hadith" className="uppercase font-body text-xs tracking-[0.05em] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">Read Books</Link>
            </div>

            <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] group hover:-translate-y-2 transition-transform duration-300 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
              <div className="w-14 h-14 bg-[var(--color-surface-container)] text-[var(--color-primary)] rounded-[0.75rem] flex items-center justify-center mb-8">
                <Heart size={28} />
              </div>
              <h3 className="font-display text-2xl mb-3 text-[var(--color-on-surface)] tracking-[-0.02em]">Daily Dua</h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70 leading-relaxed mb-8">
                A collection of supplications for every state of the heart and circumstance.
              </p>
              <Link href="/dua-zikar" className="uppercase font-body text-xs tracking-[0.05em] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">Find Duas</Link>
            </div>

            <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] group hover:-translate-y-2 transition-transform duration-300 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
              <div className="w-14 h-14 bg-[var(--color-surface-container)] text-[var(--color-primary)] rounded-[0.75rem] flex items-center justify-center mb-8">
                <Calendar size={28} />
              </div>
              <h3 className="font-display text-2xl mb-3 text-[var(--color-on-surface)] tracking-[-0.02em]">Hijri Calendar</h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70 leading-relaxed mb-8">
                Stay connected to the Islamic months and significant religious dates.
              </p>
              <Link href="/prayer-times" className="uppercase font-body text-xs tracking-[0.05em] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">View Calendar</Link>
            </div>

            <div className="bg-[var(--color-primary)] p-10 rounded-[1.5rem] flex flex-col justify-center items-center text-center shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
              <p className="font-display text-3xl text-[var(--color-on-primary)] mb-4 leading-relaxed">
                فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
              </p>
              <p className="font-body text-[var(--color-on-primary)] opacity-90 text-[0.9rem] tracking-wide">
                "For indeed, with hardship [will be] ease."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl text-[var(--color-on-surface)] mb-6 tracking-[-0.02em]">Reflections in your inbox.</h2>
          <p className="font-body text-lg text-[var(--color-on-surface)] opacity-70 mb-12 max-w-2xl mx-auto">
            Join 15,000+ readers who receive our weekly editorial on living a purposeful life guided by the Quran.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[var(--color-surface-container-low)] rounded-[0.75rem] px-6 py-4 font-body outline-none focus:bg-[var(--color-surface-container-lowest)] focus:ring-[1px] focus:ring-[var(--color-primary)]/20 transition-all border-none placeholder:text-[var(--color-on-surface)]/40"
              required
            />
            <button type="submit" className="bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)] px-8 py-4 rounded-[0.75rem] font-body font-bold hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
