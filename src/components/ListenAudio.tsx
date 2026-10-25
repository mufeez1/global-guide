"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play, Pause, SkipBack, SkipForward, X, Maximize2 } from "lucide-react";
import { SURAHS, album, audioUrl } from "@/lib/audio";

// Listen-page audio lives in the root layout so it keeps playing across navigation.
type Listen = {
  reciter: string;
  chapter: number;
  playing: boolean;
  loading: boolean;
  error: boolean;
  time: number;
  duration: number;
  volume: number;
  started: boolean; // pressed play at least once; the mini player only appears after that
  analyserRef: React.RefObject<AnalyserNode | null>;
  playingRef: React.RefObject<boolean>;
  select: (reciter: string, chapter: number) => void;
  go: (chapter: number) => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  retry: () => void;
  stop: () => void;
  setOnPlayer: (on: boolean) => void;
};

const Ctx = createContext<Listen | null>(null);
export const useListen = () => useContext(Ctx)!;

export default function ListenAudio({ children }: { children: React.ReactNode }) {
  const [reciter, setReciter] = useState("");
  const [chapter, setChapter] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [started, setStarted] = useState(false);
  const [onPlayer, setOnPlayer] = useState(false);
  // The analyser needs CORS headers on the audio host. Play plainly by default and only switch to a CORS
  // request once a HEAD check passes; otherwise the visualizer uses a gentle pulse.
  const [cors, setCors] = useState(false);
  const corsChecked = useRef(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playingRef = useRef(false);
  // What the listener asked for: changing src pauses the element, and we want to carry on.
  const resumeRef = useRef(false);

  const src = reciter ? audioUrl(reciter, chapter) : undefined;

  // One-time check, only while nothing is playing, since switching remounts the audio element.
  useEffect(() => {
    if (!src || corsChecked.current) return;
    corsChecked.current = true;
    fetch(src, { method: "HEAD" })
      .then((r) => { if (r.ok && audioRef.current?.paused) setCors(true); })
      .catch(() => {});
  }, [src]);

  useEffect(() => {
    if (resumeRef.current) audioRef.current?.play().catch(() => {});
  }, [src, cors]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, cors]);

  // Only one player at a time across the site.
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== "listen") { resumeRef.current = false; audioRef.current?.pause(); }
    };
    window.addEventListener("ic:audio", onOther);
    return () => window.removeEventListener("ic:audio", onOther);
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) { resumeRef.current = false; return audio.pause(); }
    if (cors && !analyserRef.current) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      ctx.createMediaElementSource(audio).connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    }
    await (analyserRef.current?.context as AudioContext | undefined)?.resume();
    resumeRef.current = true;
    setStarted(true);
    setLoading(true);
    audio.play().catch(() => setLoading(false));
  };

  const go = (n: number) => {
    resumeRef.current = playingRef.current;
    setChapter(((n - 1 + 114) % 114) + 1);
  };

  const value: Listen = {
    reciter, chapter, playing, loading, error, time, duration, volume, started, analyserRef, playingRef,
    select: (r, c) => {
      if (r === reciter && c === chapter) return;
      resumeRef.current = playingRef.current;
      setReciter(r);
      setChapter(c);
    },
    go,
    toggle,
    seek: (t) => { if (audioRef.current) audioRef.current.currentTime = t; setTime(t); },
    setVolume,
    retry: () => { setError(false); audioRef.current?.load(); },
    stop: () => { resumeRef.current = false; audioRef.current?.pause(); setStarted(false); },
    setOnPlayer,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {src && (
        <audio
          key={String(cors)}
          ref={audioRef}
          src={src}
          crossOrigin={cors ? "anonymous" : undefined}
          preload="metadata"
          onLoadStart={() => { setTime(0); setError(false); }}
          onPlay={() => { playingRef.current = true; setPlaying(true); window.dispatchEvent(new CustomEvent("ic:audio", { detail: "listen" })); }}
          onPlaying={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onPause={() => { playingRef.current = false; setPlaying(false); setLoading(false); }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => { resumeRef.current = true; setChapter((c) => (c % 114) + 1); }}
          onError={() => { setLoading(false); setError(true); }}
        />
      )}
      {started && !onPlayer && <MiniPlayer />}
    </Ctx.Provider>
  );
}

function MiniPlayer() {
  const l = useListen();
  const path = usePathname();
  const a = album(l.reciter)!;
  const surah = SURAHS[l.chapter - 1];
  const ctl = "w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#EAE4B1]";

  return (
    // Sits above the Quran page's own sticky audio bar there.
    <div role="region" aria-label="Now playing" className={`no-print fixed z-40 inset-x-3 sm:inset-x-auto sm:right-5 sm:w-[440px] ${path.startsWith("/quran") ? "bottom-24" : "bottom-4 sm:bottom-5"}`}>
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1A0F]/95 backdrop-blur-xl border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.45)] text-white">
        <div className="flex items-center gap-3 p-2.5 pr-2">
          <Link
            href={`/listen?reciter=${l.reciter}&chapter=${l.chapter}`}
            aria-label="Open the full player"
            className="group relative w-12 h-12 shrink-0 rounded-xl overflow-hidden focus-visible:outline-2 focus-visible:outline-[#EAE4B1]"
            style={{ background: `linear-gradient(145deg, ${a.colors[0]}, ${a.colors[1]})` }}
          >
            <span aria-hidden="true" className="absolute inset-0 pattern-star opacity-30" />
            <span aria-hidden="true" className={`absolute inset-0 flex items-center justify-center gap-0.5 ${l.playing ? "" : "opacity-0"} group-hover:opacity-0 transition-opacity`}>
              {[0, 1, 2].map((i) => <span key={i} className="w-1 h-4 rounded-full bg-[#EAE4B1] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
            </span>
            <Maximize2 size={16} aria-hidden="true" className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-[#EAE4B1]">{surah.number}. {surah.name}</p>
            <p className="text-xs text-white/55 truncate">{l.error ? "Couldn't load — tap play to retry" : a.name}</p>
          </div>
          <button type="button" onClick={() => l.go(l.chapter - 1)} aria-label="Previous surah" className={`${ctl} hidden min-[400px]:flex`}><SkipBack size={18} aria-hidden="true" /></button>
          <button
            type="button"
            onClick={l.error ? l.retry : l.toggle}
            aria-label={l.playing ? "Pause" : "Play"}
            className="relative w-11 h-11 shrink-0 rounded-full bg-[#EAE4B1] text-[#1E1C00] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAE4B1]"
          >
            {l.loading && <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-[#1B6D24] border-t-transparent animate-spin" />}
            {l.playing ? <Pause size={18} fill="currentColor" aria-hidden="true" /> : <Play size={18} fill="currentColor" className="ml-0.5" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => l.go(l.chapter + 1)} aria-label="Next surah" className={ctl}><SkipForward size={18} aria-hidden="true" /></button>
          <button type="button" onClick={l.stop} aria-label="Stop and close player" className={`${ctl} text-white/50`}><X size={18} aria-hidden="true" /></button>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
          <div className="h-full origin-left bg-[#EAE4B1] transition-transform duration-500 ease-linear" style={{ transform: `scaleX(${l.duration ? l.time / l.duration : 0})` }} />
        </div>
      </div>
    </div>
  );
}
