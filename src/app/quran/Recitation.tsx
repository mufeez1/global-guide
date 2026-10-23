"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat, Repeat1, SkipBack, SkipForward, X } from "lucide-react";
import { DAY, useCached } from "@/lib/cache";
import { DEFAULT_RECITATION, RECITATIONS, getRecitationUrls } from "@/lib/services/quran-cloud";
import { usePref, useKv } from "@/lib/settings";
import { iconBtn } from "@/components/ui";
import Select from "@/components/Select";

type Prefs = { reciter: string; rate: number; repeat: "off" | "verse" | "surah" };
const DEFAULTS: Prefs = { reciter: DEFAULT_RECITATION, rate: 1, repeat: "off" };
const NEXT_REPEAT = { off: "verse", verse: "surah", surah: "off" } as const;

// Verse-by-verse Arabic recitation. `request.verse` 0 = resume from the saved position.
export default function Recitation({ chapter, total, request }: { chapter: number; total: number; request: { verse: number; at: number } | null }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [prefs, setPrefs] = usePref<Prefs>("ic:recitation", DEFAULTS);
  const [saved, setSaved] = useKv<{ chapter: number; verse: number }>("recitationPosition");
  const [open, setOpen] = useState(false);
  const [verse, setVerse] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const reciter = prefs.reciter in RECITATIONS ? prefs.reciter : DEFAULT_RECITATION;
  const [urls, retry] = useCached(open ? `recite:${reciter}:${chapter}` : null, 30 * DAY, () => getRecitationUrls(chapter, reciter));

  // A new play request (verse button or "Recite") opens the player; adjusting state while rendering.
  const [seen, setSeen] = useState(request);
  if (request !== seen) {
    setSeen(request);
    if (request) {
      setOpen(true);
      setError(null);
      setVerse(request.verse || (saved?.chapter === chapter ? saved.verse : 1));
      setPlaying(true);
    }
  }

  const src = urls.status === "ready" ? urls.data[verse - 1] : undefined;

  // Drive the element from state; highlight and follow the verse being recited.
  useEffect(() => {
    const a = audio.current;
    if (!a || !src) return;
    if (a.src !== src) a.src = src;
    a.playbackRate = prefs.rate;
    if (playing) a.play().catch((e) => { if (e.name !== "AbortError") { setPlaying(false); setError("Playback was blocked or the file couldn't load."); } });
    else a.pause();
  }, [src, playing, prefs.rate]);

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById(`v${verse}`);
    el?.setAttribute("data-reciting", "");
    if (playing) el?.scrollIntoView({ block: "center", behavior: "smooth" });
    setSaved({ chapter, verse });
    return () => el?.removeAttribute("data-reciting");
  }, [verse, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onEnded = () => {
    if (prefs.repeat === "verse") { audio.current!.currentTime = 0; audio.current!.play(); return; }
    if (verse < total) setVerse(verse + 1);
    else if (prefs.repeat === "surah") setVerse(1);
    else setPlaying(false);
  };

  const close = () => { setPlaying(false); setOpen(false); };
  if (!open) return null;

  const RepeatIcon = prefs.repeat === "verse" ? Repeat1 : Repeat;
  return (
    <div className="no-print sticky bottom-4 z-30">
      <div role="region" aria-label="Verse recitation" className="rounded-2xl bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-xl border border-[var(--color-outline-variant)]/50 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-3">
        <audio
          ref={audio}
          preload="auto"
          onPlay={() => window.dispatchEvent(new CustomEvent("ic:audio", { detail: "verse" }))}
          onEnded={onEnded}
          onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
          onError={() => { setPlaying(false); setError("This verse's audio is missing or couldn't be downloaded."); }}
        />
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" className={iconBtn} aria-label="Previous verse" disabled={verse <= 1} onClick={() => setVerse(Math.max(1, verse - 1))}><SkipBack size={18} aria-hidden="true" /></button>
          <button
            type="button"
            onClick={() => { setError(null); setPlaying(!playing); }}
            disabled={urls.status !== "ready"}
            aria-label={playing ? "Pause recitation" : "Play recitation"}
            className="w-12 h-12 shrink-0 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {playing ? <Pause size={20} fill="currentColor" aria-hidden="true" /> : <Play size={20} fill="currentColor" className="ml-0.5" aria-hidden="true" />}
          </button>
          <button type="button" className={iconBtn} aria-label="Next verse" disabled={verse >= total} onClick={() => setVerse(Math.min(total, verse + 1))}><SkipForward size={18} aria-hidden="true" /></button>

          <div className="flex-1 min-w-0 px-1">
            <p className="text-sm font-semibold" aria-live="polite">Verse {verse} of {total}</p>
            <div className="mt-1 h-1.5 rounded-full bg-[var(--color-surface-container)] overflow-hidden" aria-hidden="true">
              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${((verse - 1 + progress) / total) * 100}%` }} />
            </div>
          </div>

          <button
            type="button"
            className={`${iconBtn} ${prefs.repeat !== "off" ? "text-[var(--color-primary)] bg-[var(--color-primary-container)]/50" : ""}`}
            aria-label={`Repeat: ${prefs.repeat}. Change to ${NEXT_REPEAT[prefs.repeat]}`}
            title={`Repeat ${prefs.repeat}`}
            onClick={() => setPrefs({ repeat: NEXT_REPEAT[prefs.repeat] })}
          >
            <RepeatIcon size={18} aria-hidden="true" />
          </button>
          <button type="button" className={iconBtn} aria-label="Close recitation" onClick={close}><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Select label="Reciter" hideLabel value={reciter} onChange={(v) => setPrefs({ reciter: v })} buttonClassName="min-h-9 flex items-center gap-1.5 rounded-lg border border-[var(--color-outline-variant)]/60 bg-transparent pl-2.5 pr-2 text-xs cursor-pointer aria-expanded:border-[var(--color-primary)]"
            options={Object.entries(RECITATIONS).map(([value, label]) => ({ value, label }))} />
          <Select label="Speed" hideLabel value={prefs.rate} onChange={(v) => setPrefs({ rate: v })} buttonClassName="min-h-9 flex items-center gap-1.5 rounded-lg border border-[var(--color-outline-variant)]/60 bg-transparent pl-2.5 pr-2 text-xs cursor-pointer aria-expanded:border-[var(--color-primary)]"
            options={[0.75, 1, 1.25, 1.5].map((r) => ({ value: r, label: `${r}× speed` }))} />
          <span className="text-[var(--color-on-surface)]/60">Audio: AlQuran Cloud / Islamic Network</span>
        </div>

        {urls.status === "loading" && <p className="mt-2 text-xs text-[var(--color-on-surface)]/65">Loading recitation…</p>}
        {urls.status === "error" && <p role="alert" className="mt-2 text-xs text-[var(--color-error)]">{urls.error} <button className="underline cursor-pointer" onClick={retry}>Retry</button></p>}
        {error && <p role="alert" className="mt-2 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    </div>
  );
}
