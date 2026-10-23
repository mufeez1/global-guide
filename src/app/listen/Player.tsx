"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, AudioLines } from "lucide-react";
import Visualizer from "./Visualizer";
import { RECITERS, SURAHS, audioUrl } from "@/lib/audio";
import Select from "@/components/Select";

const fmt = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

export default function Player({ initialChapter, initialReciter }: { initialChapter: number; initialReciter: string }) {
  const [chapter, setChapter] = useState(initialChapter);
  const [reciter, setReciter] = useState(initialReciter);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(false);
  // The analyser needs CORS headers on the bucket. Play plainly by default and only switch to a CORS
  // request once a HEAD check passes; otherwise the visualizer uses a gentle pulse.
  const [cors, setCors] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playingRef = useRef(false);
  const resumeRef = useRef(false);

  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const q = query.trim().toLowerCase();
  const filtered = SURAHS.filter(
    (s) =>
      String(s.number).startsWith(q) ||
      s.name.toLowerCase().includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      s.arabic.includes(query.trim())
  );

  // Keep the playing surah visible in the list.
  useEffect(() => {
    listRef.current?.querySelector(`[data-n="${chapter}"]`)?.scrollIntoView({ block: "nearest" });
  }, [chapter]);

  const surah = SURAHS[chapter - 1];
  const src = audioUrl(reciter, chapter);

  useEffect(() => {
    window.history.replaceState(null, "", `/listen?chapter=${chapter}&reciter=${reciter}`);
  }, [chapter, reciter]);

  // One-time check: does the bucket send CORS headers? Only switch while nothing is playing,
  // since switching remounts the audio element.
  useEffect(() => {
    fetch(src, { method: "HEAD" })
      .then((r) => { if (r.ok && audioRef.current?.paused) setCors(true); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New track: keep playing if we were playing.
  useEffect(() => {
    if (resumeRef.current) audioRef.current?.play().catch(() => {});
  }, [src, cors]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current!;
    if (!audio.paused) return audio.pause();
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
    setLoading(true);
    audio.play().catch(() => setLoading(false));
  };

  const go = (n: number) => {
    resumeRef.current = playingRef.current;
    setChapter(((n - 1 + 114) % 114) + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement).closest("input, select, button")) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <section className="relative h-[calc(100dvh-72px)] min-h-[560px] overflow-hidden bg-[radial-gradient(ellipse_at_center,#0f2a14_0%,#07130a_55%,#030805_100%)] text-white flex">
      {/* Surah list */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-xl z-10">
        <div className="p-5 border-b border-white/10">
          <label className="relative block">
            <span className="sr-only">Filter surahs</span>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, meaning or number"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#EAE4B1]/60 transition-colors"
            />
          </label>
          <p className="mt-3 text-[11px] uppercase tracking-widest text-white/40 font-bold" aria-live="polite">
            {filtered.length} of 114 surahs
          </p>
        </div>
        <ul ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {filtered.map((s) => {
            const active = s.number === chapter;
            return (
              <li key={s.number}>
                <button
                  data-n={s.number}
                  onClick={() => go(s.number)}
                  aria-current={active ? "true" : undefined}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#EAE4B1] ${active ? "bg-[#EAE4B1]/10 border border-[#EAE4B1]/30" : "border border-transparent hover:bg-white/5"}`}
                >
                  <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${active ? "bg-[#EAE4B1] text-[#1E1C00]" : "bg-white/5 text-white/60"}`}>
                    {active && playing ? <AudioLines size={16} className="animate-pulse" /> : s.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold truncate ${active ? "text-[#EAE4B1]" : "text-white/90"}`}>{s.name}</span>
                    {s.meaning && <span className="block text-xs text-white/45 truncate">{s.meaning}</span>}
                  </span>
                  <span className="font-display text-base text-white/50 shrink-0" dir="rtl">{s.arabic.replace("سورة ", "")}</span>
                </button>
              </li>
            );
          })}
          {!filtered.length && (
            <li className="p-6 text-center text-sm text-white/50">
              No surah matches &ldquo;{query}&rdquo;.{" "}
              <button onClick={() => setQuery("")} className="underline cursor-pointer">Clear</button>
            </li>
          )}
        </ul>
      </aside>

      <div className="relative flex-1 min-w-0 flex flex-col">
      <Visualizer analyserRef={analyserRef} playingRef={playingRef} />

      <audio
        key={String(cors)}
        ref={audioRef}
        src={src}
        crossOrigin={cors ? "anonymous" : undefined}
        preload="metadata"
        onLoadStart={() => { setTime(0); setError(false); }}
        onPlay={() => { playingRef.current = true; setPlaying(true); }}
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPause={() => { playingRef.current = false; setPlaying(false); setLoading(false); }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { resumeRef.current = true; go(chapter + 1); }}
        onError={() => { setLoading(false); setError(true); }}
      />

      {/* Reciter */}
      <div className="relative z-10 flex justify-center gap-2 pt-8 px-4" role="group" aria-label="Reciter">
        {Object.entries(RECITERS).map(([slug, label]) => (
          <button
            key={slug}
            onClick={() => { resumeRef.current = playingRef.current; setReciter(slug); }}
            aria-pressed={slug === reciter}
            className={`text-[11px] font-bold uppercase tracking-widest px-5 py-3 rounded-full backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#EAE4B1] ${slug === reciter ? "bg-[#EAE4B1] text-[#1E1C00]" : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Title, centred over the sphere */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <p key={chapter} className="listen-fade font-display text-5xl md:text-7xl text-[#EAE4B1] drop-shadow-[0_0_30px_rgba(234,228,177,0.35)]" dir="rtl">
          {surah.arabic}
        </p>
        <h1 className="mt-6 font-display text-2xl md:text-3xl tracking-[-0.01em]">
          {surah.number}. {surah.name}
        </h1>
        {surah.meaning && <p className="mt-2 text-white/60 font-body">{surah.meaning}</p>}
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300 pointer-events-auto">
            Couldn&apos;t load this recitation. <button className="underline cursor-pointer" onClick={() => { setError(false); audioRef.current?.load(); }}>Retry</button>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-10">
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 md:p-6 shadow-[0_0_60px_rgba(27,109,36,0.25)]">
          <div className="flex items-center gap-3 text-xs text-white/60 tabular-nums">
            <span className="w-10 text-right">{fmt(time)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={time}
              onChange={(e) => { audioRef.current!.currentTime = +e.target.value; setTime(+e.target.value); }}
              aria-label="Seek"
              className="flex-1 accent-[#EAE4B1] cursor-pointer"
            />
            <span className="w-10">{fmt(duration)}</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <Select
              label="Surah"
              hideLabel
              className="lg:invisible w-28 md:w-40"
              buttonClassName="w-full flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white text-left cursor-pointer"
              value={chapter}
              onChange={go}
              options={SURAHS.map((s) => ({ value: s.number, label: `${s.number}. ${s.name}` }))}
            />

            <div className="flex items-center gap-3">
              <button onClick={() => go(chapter - 1)} aria-label="Previous surah" className="p-3 rounded-full text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
                <SkipBack size={20} />
              </button>
              <button
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="relative w-16 h-16 rounded-full bg-[#EAE4B1] text-[#1E1C00] flex items-center justify-center shadow-[0_0_40px_rgba(234,228,177,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {loading && <span className="absolute inset-0 rounded-full border-2 border-[#1B6D24] border-t-transparent animate-spin" />}
                {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={() => go(chapter + 1)} aria-label="Next surah" className="p-3 rounded-full text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
                <SkipForward size={20} />
              </button>
            </div>

            <div className="w-28 md:w-40 flex items-center gap-2 justify-end">
              <button onClick={() => setVolume(volume ? 0 : 1)} aria-label={volume ? "Mute" : "Unmute"} className="p-2 text-white/70 hover:text-white cursor-pointer">
                {volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={volume}
                onChange={(e) => setVolume(+e.target.value)}
                aria-label="Volume"
                className="hidden md:block w-20 accent-[#EAE4B1] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
