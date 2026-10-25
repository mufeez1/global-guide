import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, Heart, Headphones, ScrollText, Sparkles, CalendarDays, Moon, Hash, MapPin, Search } from "lucide-react";
import { Quran } from "islam.js";
import heroImg from "@/assets/images/hero-background.png";
import { ALBUMS, RECITERS, SURAHS } from "@/lib/audio";
import { getDuas } from "@/lib/services/ummah-api";
import { gToH } from "@/lib/services/aladhan";
import { Arabic, Attribution } from "@/components/ui";
import TodayPanel, { ContinueCard } from "./TodayPanel";
import { dailyHadith } from "./hadith/data";

// Rebuild hourly so the verse of the day changes without a deploy.
export const revalidate = 3600;

const quran = new Quran();
const chapters = quran.getAllChapters();

// Short verses only, so the card stays readable.
const SHORT_VERSES = chapters.flatMap((c) =>
  quran
    .getVerseRangeWithTranslation(c.number, 1, c.numberOfVerses)
    .map((v, i) => ({ ...v, chapter: c.number, ayah: i + 1 }))
    .filter((v) => v.ayah > 1 && v.translation.length > 60 && v.translation.length < 150)
);

function verseOfTheDay() {
  const day = Math.floor(Date.now() / 86_400_000);
  return SHORT_VERSES[day % SHORT_VERSES.length];
}

const FEATURED = [1, 18, 36, 55, 67];

const EXPLORE = [
  { href: "/prayer-times", icon: Clock, title: "Prayer Times", text: "Daily and monthly salah times for your location." },
  { href: "/hadith", icon: ScrollText, title: "Hadith", text: "Bukhari, Muslim, the Sunan and more, in Arabic, English and Urdu." },
  { href: "/dua-zikar", icon: Heart, title: "Dua & Azkar", text: "Morning, evening and everyday supplications with counters." },
  { href: "/tasbeeh", icon: Hash, title: "Tasbeeh", text: "A private digital counter with targets and history." },
  { href: "/calendar", icon: CalendarDays, title: "Hijri Calendar", text: "Monthly calendar, major dates and a date converter." },
  { href: "/ramadan", icon: Moon, title: "Ramadan", text: "Sehri and Iftar timetable with countdowns." },
  { href: "/names", icon: Sparkles, title: "99 Names", text: "Al-Asma ul-Husna with meanings." },
  { href: "/mosques", icon: MapPin, title: "Mosque Finder", text: "Mosques near you from OpenStreetMap." },
  { href: "/search", icon: Search, title: "Search", text: "Find verses, duas, hadith and names." },
  { href: "/wisdom", icon: BookOpen, title: "Wisdom", text: "Short reflections to carry with you." },
];

const settle = <T,>(p: Promise<T>) => p.then((v) => ({ ok: true as const, v }), () => ({ ok: false as const }));

function todayKeys() {
  const now = new Date();
  return { dayIndex: Math.floor(now.getTime() / 86_400_000), todayDmy: now.toISOString().slice(0, 10).split("-").reverse().join("-") };
}

export default async function Home() {
  const today = verseOfTheDay();
  const todaySurah = SURAHS[today.chapter - 1];
  const { dayIndex, todayDmy } = todayKeys();
  const [hadith, duas, hijri] = await Promise.all([
    settle(dailyHadith()),
    settle(getDuas()),
    settle(gToH(todayDmy, { next: { revalidate: 3600 } })),
  ]);
  const dua = duas.ok ? duas.v.duas[dayIndex % duas.v.duas.length] : null;
  // Ramadan banner from the second half of Sha'ban through Ramadan (calculated calendar).
  const h = hijri.ok ? hijri.v.hijri : null;
  const ramadanSoon = h && ((h.month === 8 && h.day >= 15) || h.month === 9);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-8 pt-10 md:pt-16 pb-20 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary-container)_0%,transparent_60%)]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="listen-fade">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              <span className="w-6 h-px bg-[var(--color-primary)]" aria-hidden="true" />
              The Global Guide
            </p>
            <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--color-on-surface)] [text-wrap:balance]">
              Read, listen and <span className="text-[var(--color-primary)]">reflect.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-on-surface)]/75 max-w-lg">
              The Quran with translation and audio, prayer times, hadith and daily duas — in one calm, focused place.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quran" className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-7 py-4 rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
                Read the Quran <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/listen" className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-semibold border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]/50 transition-colors">
                <Headphones size={18} className="text-[var(--color-primary)]" aria-hidden="true" /> Listen
              </Link>
            </div>
            <TodayPanel />
          </div>

          {/* Arch image + verse of the day */}
          <div className="relative max-w-md w-full mx-auto lg:mr-0">
            <div className="rounded-t-full rounded-b-[2rem] overflow-hidden border-[10px] border-[var(--color-surface-container-lowest)] shadow-[0_30px_60px_-20px_rgba(27,109,36,0.35)]">
              <Image src={heroImg} alt="A person sitting in quiet prayer inside a mosque hall" className="w-full h-auto aspect-[4/5] object-cover" priority />
            </div>
            <figure className="relative -mt-24 mx-4 sm:mx-0 sm:-ml-10 lg:-ml-16 rounded-3xl bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-md p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] border border-[var(--color-outline-variant)]/40">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Verse of the day</p>
              <blockquote className="mt-3">
                <p className="font-arabic text-2xl leading-[1.9] text-right text-[var(--color-on-surface)]" dir="rtl" lang="ar">{today.verse}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-on-surface)]/80">&ldquo;{today.translation}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-4">
                <Link href={`/quran?chapter=${today.chapter}#v${today.ayah}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:underline underline-offset-4">
                  {todaySurah.name} {today.chapter}:{today.ayah} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {ramadanSoon && (
        <section className="px-4 sm:px-8 pb-6">
          <Link href="/ramadan" className="max-w-6xl mx-auto flex flex-wrap items-center gap-4 rounded-3xl bg-[var(--color-secondary-fixed)]/60 text-[var(--color-on-secondary-fixed)] p-5 sm:p-6 hover:opacity-90">
            <Moon size={24} aria-hidden="true" />
            <span className="flex-1 min-w-0">
              <span className="block font-display text-xl">{h!.month === 9 ? `Ramadan Mubarak — day ${h!.day}` : "Ramadan is approaching"}</span>
              <span className="block text-sm">Sehri and Iftar times for your city. Dates are calculated; follow your local moon sighting.</span>
            </span>
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </section>
      )}

      {/* Today: hadith, dua, continue */}
      <section aria-label="Today" className="px-4 sm:px-8 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5">
          <article className="flex flex-col rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Hadith of the day</p>
            {hadith.ok ? (
              <>
                {hadith.v.english && <p className="mt-4 leading-relaxed line-clamp-6 flex-1">{hadith.v.english}</p>}
                <Link href="/hadith" className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline">Forty Hadith of an-Nawawi, {hadith.v.number}</Link>
                <Attribution ids={["hadith-api"]} />
              </>
            ) : <p className="mt-4 text-sm text-[var(--color-on-surface)]/65 flex-1">Today&apos;s hadith couldn&apos;t be loaded. <Link href="/hadith" className="underline">Open the library</Link></p>}
          </article>
          <article className="flex flex-col rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Dua of the day</p>
            {dua ? (
              <>
                <h3 className="mt-3 font-display text-lg">{dua.title}</h3>
                <Arabic className="mt-2 text-xl leading-[2] line-clamp-3">{dua.arabic}</Arabic>
                {dua.translation && <p className="mt-2 text-sm leading-relaxed line-clamp-3 flex-1">{dua.translation}</p>}
                <Link href={`/dua-zikar?category=${dua.category}#dua-${dua.id}`} className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline">{dua.source ?? "Read in full"}</Link>
                <Attribution ids={["ummah-api"]} />
              </>
            ) : <p className="mt-4 text-sm text-[var(--color-on-surface)]/65 flex-1">Today&apos;s dua couldn&apos;t be loaded. <Link href="/dua-zikar?tab=hisn" className="underline">Open Hisn al-Muslim</Link></p>}
          </article>
          <ContinueCard />
        </div>
      </section>

      {/* Quran + Listen */}
      <section className="px-4 sm:px-8 py-20 bg-[var(--color-surface-container-low)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">Begin with the Quran</h2>
          <p className="mt-3 text-[var(--color-on-surface)]/70 max-w-xl">Read with translation, or press play and listen along.</p>

          <div className="mt-10 grid lg:grid-cols-3 gap-5">
            <Link href="/quran" className="group lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-[var(--color-hero)] text-white p-8 md:p-10 flex flex-col justify-between min-h-72">
              <div aria-hidden="true" className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
              <p aria-hidden="true" className="absolute -right-6 -bottom-10 font-arabic text-[11rem] leading-none text-white/10 select-none">القرآن</p>
              <div className="relative">
                <BookOpen size={28} className="text-[var(--color-secondary-fixed)]" aria-hidden="true" />
                <h3 className="mt-6 font-display text-3xl">The Noble Quran</h3>
                <p className="mt-2 text-white/80 max-w-md">All 114 surahs in Arabic with Sahih International and a choice of Urdu translations, verse-by-verse recitation and tafsir.</p>
              </div>
              <span className="relative mt-8 inline-flex items-center gap-2 font-semibold text-[var(--color-secondary-fixed)]">
                Start reading <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/listen" className="group relative overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_center,#0f2a14_0%,#07130a_70%)] text-white p-8 md:p-10 flex flex-col justify-between min-h-72">
              <div aria-hidden="true" className="absolute right-[-30%] top-1/2 -translate-y-1/2 w-72 h-72">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="absolute inset-0 rounded-full border border-[var(--color-secondary-fixed)]/25 group-hover:scale-105 transition-transform duration-700" style={{ margin: i * 28 }} />
                ))}
              </div>
              <div className="relative">
                <Headphones size={28} className="text-[var(--color-secondary-fixed)]" aria-hidden="true" />
                <h3 className="mt-6 font-display text-3xl">Listen</h3>
                <p className="mt-2 text-white/75">Quran tilawat by {ALBUMS.filter((a) => a.kind === "tilawat").length} renowned qaris and Urdu tafseer by {Object.values(RECITERS).join(" and ")}, in an immersive player.</p>
              </div>
              <span className="relative mt-8 inline-flex items-center gap-2 font-semibold text-[var(--color-secondary-fixed)]">
                Open player <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <h3 className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface)]/60">Often read</h3>
          <ul className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            {FEATURED.map((n) => {
              const s = SURAHS[n - 1];
              return (
                <li key={n}>
                  <Link href={`/quran?chapter=${n}`} className="block h-full rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-5 hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition">
                    <p className="font-arabic text-2xl text-[var(--color-primary)] text-right" dir="rtl" lang="ar">{s.arabic.replace("سورة ", "")}</p>
                    <p className="mt-3 font-semibold">{s.name}</p>
                    <p className="text-sm text-[var(--color-on-surface)]/60">{s.meaning || `Surah ${n}`} · {chapters[n - 1].numberOfVerses} verses</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Everything else */}
      <section className="px-4 sm:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">For every part of your day</h2>
          <ul className="mt-10 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
            {EXPLORE.map(({ href, icon: Icon, title, text }) => (
              <li key={href}>
                <Link href={href} className="group flex flex-col h-full rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-5 sm:p-7 hover:border-[var(--color-primary)]/40 hover:shadow-[0_16px_40px_-12px_rgba(27,109,36,0.2)] transition">
                  <span className="w-12 h-12 rounded-2xl bg-[var(--color-primary-container)]/60 text-[var(--color-primary)] flex items-center justify-center">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-on-surface)]/70 flex-1">{text}</p>
                  <ArrowRight size={18} className="mt-6 text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing verse */}
      <section className="px-4 sm:px-8 pb-24">
        <figure className="max-w-4xl mx-auto text-center rounded-[2rem] bg-[var(--color-secondary-fixed)]/50 px-6 py-14">
          <p className="font-arabic text-4xl md:text-5xl leading-[1.8] text-[var(--color-on-surface)]" dir="rtl" lang="ar">فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
          <p className="mt-4 text-lg text-[var(--color-on-surface)]/80">&ldquo;For indeed, with hardship will be ease.&rdquo;</p>
          <figcaption className="mt-3">
            <Link href="/quran?chapter=94#v5" className="text-sm font-semibold text-[var(--color-primary)] hover:underline underline-offset-4">Ash-Sharh 94:5</Link>
          </figcaption>
        </figure>
      </section>
    </div>
  );
}
