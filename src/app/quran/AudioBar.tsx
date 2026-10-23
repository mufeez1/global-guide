"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, Maximize2 } from "lucide-react";
import { RECITERS } from "@/lib/audio";

const fmt = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

// Compact recitation bar pinned to the bottom of the reading view.
export default function AudioBar({ src, chapter, reciter, extra = "" }: { src: string; chapter: number; reciter: string; extra?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // What the listener asked for, not what the element reports: changing src pauses the element,
  // and we want to keep going on the new surah or reciter.
  const wantPlayRef = useRef(false);
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = () => {
    setLoading(true);
    audioRef.current!.play().catch(() => setLoading(false));
  };

  const toggle = () => {
    wantPlayRef.current = audioRef.current!.paused;
    if (wantPlayRef.current) play();
    else audioRef.current!.pause();
  };

  useEffect(() => {
    if (wantPlayRef.current) audioRef.current!.play().catch(() => {});
  }, [src]);

  // Only one player at a time: pause when the verse-by-verse recitation starts.
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== "surah") { wantPlayRef.current = false; audioRef.current?.pause(); }
    };
    window.addEventListener("ic:audio", onOther);
    return () => window.removeEventListener("ic:audio", onOther);
  }, []);

  return (
    <div className="sticky bottom-4 z-20 px-4 sm:px-8 pb-4">
      <div className="max-w-3xl mx-auto flex items-center gap-3 sm:gap-4 rounded-2xl bg-[var(--color-surface-container-lowest)]/90 backdrop-blur-xl border border-[var(--color-outline-variant)]/50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-2.5 sm:p-3">
        <audio
          ref={audioRef}
          src={src}
          preload="none"
          onLoadStart={() => { setTime(0); setDuration(0); }}
          onEnded={() => { if (chapter < 114) router.push(`/quran?chapter=${chapter + 1}&reciter=${reciter}${extra}`); }}
          onPlay={() => { setPlaying(true); window.dispatchEvent(new CustomEvent("ic:audio", { detail: "surah" })); }}
          onPlaying={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onPause={() => { setPlaying(false); setLoading(false); }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />

        <button
          onClick={toggle}
          aria-label={playing ? "Pause recitation" : "Play recitation"}
          className="relative w-12 h-12 shrink-0 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          {loading && <span className="absolute inset-0 rounded-full border-2 border-[var(--color-secondary-fixed)] border-t-transparent animate-spin" />}
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1" role="group" aria-label="Reciter">
            {Object.entries(RECITERS).map(([slug, label]) => (
              <Link
                key={slug}
                scroll={false}
                replace
                href={`/quran?chapter=${chapter}&reciter=${slug}${extra}`}
                aria-current={slug === reciter ? "true" : undefined}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${slug === reciter ? "bg-[var(--color-primary-container)] text-[var(--color-primary)]" : "text-[var(--color-on-surface)]/60 hover:text-[var(--color-on-surface)]"}`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--color-on-surface)]/60 tabular-nums">
            <span className="w-9 text-right">{fmt(time)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={time}
              onChange={(e) => { audioRef.current!.currentTime = +e.target.value; setTime(+e.target.value); }}
              aria-label="Seek"
              className="flex-1 min-w-0 accent-[var(--color-primary)] cursor-pointer"
            />
            <span className="w-9">{fmt(duration)}</span>
          </div>
        </div>

        <Link
          href={`/listen?chapter=${chapter}&reciter=${reciter}`}
          aria-label="Open immersive player"
          title="Open immersive player"
          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-[var(--color-on-surface)]/60 hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-colors"
        >
          <Maximize2 size={18} />
        </Link>
      </div>
    </div>
  );
}
