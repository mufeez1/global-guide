import Link from "next/link";
import { Play } from "lucide-react";
import { ALBUMS, type Album } from "@/lib/audio";
import { Attribution } from "@/components/ui";

const SHELVES = [
  { kind: "tafseer", title: "Urdu Tafseer", intro: "Surah-by-surah explanation of the Quran in Urdu." },
  { kind: "tilawat", title: "Quran Tilawat", intro: "Complete recitations of all 114 surahs by renowned qaris." },
] as const;

function Cover({ a }: { a: Album }) {
  return (
    <Link href={`/listen?reciter=${a.slug}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EAE4B1]">
      <div className="relative aspect-square">
        {/* Vinyl record sliding out of its sleeve */}
        <div
          aria-hidden="true"
          className="absolute inset-[5%] rounded-full translate-x-[10%] group-hover:translate-x-[22%] group-focus-visible:translate-x-[22%] group-hover:rotate-90 transition-transform duration-500 ease-out shadow-xl ring-1 ring-white/15"
          style={{ background: `radial-gradient(circle, #EAE4B1 0 3%, ${a.colors[0]} 3.5% 17%, #111 17.5% 19%, transparent 19.5%), conic-gradient(from 30deg, transparent 0 10%, rgba(255,255,255,0.18) 14%, transparent 20% 60%, rgba(255,255,255,0.12) 64%, transparent 70%), repeating-radial-gradient(circle, #1c1c1c 0 2px, #333 2px 3px)` }}
        />
        <div
          className="relative h-full rounded-2xl overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group-hover:-translate-y-1 transition-transform duration-300"
          style={{ background: `linear-gradient(145deg, ${a.colors[0]}, ${a.colors[1]})` }}
        >
          <div aria-hidden="true" className="absolute inset-0 pattern-star opacity-25" />
          <div aria-hidden="true" className="absolute -right-1/4 -top-1/4 w-3/4 h-3/4 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute left-3 top-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{a.kind === "tafseer" ? "Tafseer" : "Tilawat"}</span>
          <p
            lang={a.kind === "tafseer" ? "ur" : "ar"}
            dir="rtl"
            className={`absolute inset-x-3 top-1/2 -translate-y-1/2 text-center text-[#F5EDC8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] ${a.kind === "tafseer" ? "font-urdu text-2xl leading-[2.2]" : "font-arabic text-2xl sm:text-3xl leading-snug"}`}
          >
            {a.native}
          </p>
          <span aria-hidden="true" className="absolute right-3 bottom-3 w-11 h-11 rounded-full bg-[#EAE4B1] text-[#1E1C00] flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </span>
        </div>
      </div>
      <p className="mt-4 font-semibold text-white group-hover:text-[#EAE4B1] transition-colors">{a.name}</p>
      <p className="text-sm text-white/55">{a.style}</p>
    </Link>
  );
}

export default function Albums() {
  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[radial-gradient(ellipse_at_top,#0f2a14_0%,#07130a_55%,#030805_100%)] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EAE4B1]">Listen</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-[-0.02em]">Choose a reciter</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">Pick an album to open the player. Every album covers all 114 surahs.</p>

        {SHELVES.map((s) => (
          <section key={s.kind} aria-labelledby={`shelf-${s.kind}`} className="mt-14">
            <h2 id={`shelf-${s.kind}`} className="font-display text-2xl">{s.title}</h2>
            <p className="mt-1 text-sm text-white/55">{s.intro}</p>
            <ul className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-12">
              {ALBUMS.filter((a) => a.kind === s.kind).map((a) => <li key={a.slug}><Cover a={a} /></li>)}
            </ul>
          </section>
        ))}

        <div className="mt-14 [&_p]:!text-white/60">
          <Attribution ids={["r2-audio", "quranicaudio", "mp3quran"]} />
        </div>
      </div>
    </div>
  );
}
