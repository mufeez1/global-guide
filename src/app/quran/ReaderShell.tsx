"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenText, Play, SlidersHorizontal, History } from "lucide-react";
import { URDU_TRANSLATIONS } from "@/lib/services/quran-cloud";
import { READER_DEFAULTS, useLastRead, usePref, type LastRead, type ReaderPrefs } from "@/lib/settings";
import { kvGet } from "@/lib/db";
import { Dialog } from "@/components/client";
import { btn, input } from "@/components/ui";
import Recitation from "./Recitation";
import TafsirDialog from "./TafsirDialog";
import Select from "@/components/Select";

type Ctx = { play: (verse: number) => void; openTafsir: (verse: number) => void; chapter: number; name: string };
const ReaderContext = createContext<Ctx | null>(null);
export const useReader = () => useContext(ReaderContext)!;

type Ref = { surah: number; ayah: number };

export default function ReaderShell({ reciter, chapter, name, total, urdu, juzs, pages, children }: {
  reciter: string; chapter: number; name: string; total: number; urdu: string; juzs: Ref[]; pages: Ref[]; children: React.ReactNode;
}) {
  const router = useRouter();
  const [playFrom, setPlayFrom] = useState<{ verse: number; at: number } | null>(null);
  const [tafsirVerse, setTafsirVerse] = useState<number | null>(null);
  const [display, setDisplay] = useState(false);
  const [prefs] = usePref<ReaderPrefs & { showEnglish: boolean }>("ic:reader", { ...READER_DEFAULTS, showEnglish: true });

  const go = (to: Ref) => router.push(`/quran?chapter=${to.surah}&reciter=${reciter}&ur=${urdu || "none"}#v${to.ayah}`);

  return (
    <ReaderContext.Provider value={{ play: (verse) => setPlayFrom({ verse, at: Date.now() }), openTafsir: setTafsirVerse, chapter, name }}>
      <ReadingProgress chapter={chapter} name={name} total={total} />
      <div className="no-print mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2">
        <Select
          label="Urdu translation"
          className="min-w-0 col-span-2 sm:w-64"
          value={urdu}
          onChange={(v) => router.push(`/quran?chapter=${chapter}&reciter=${reciter}&ur=${v || "none"}`, { scroll: false })}
          options={[{ value: "", label: "None (English only)" }, ...Object.entries(URDU_TRANSLATIONS).map(([value, label]) => ({ value, label }))]}
        />
        <Select
          label="Go to Juz"
          className="sm:w-28"
          placeholder="Juz"
          onChange={(v) => go(juzs[v - 1])}
          options={juzs.map((_, i) => ({ value: i + 1, label: `Juz ${i + 1}` }))}
        />
        <form className="text-sm" onSubmit={(e) => { e.preventDefault(); const n = +new FormData(e.currentTarget).get("page")!; if (pages[n - 1]) go(pages[n - 1]); }}>
          <label htmlFor="page-n" className="block mb-1 font-semibold">Page</label>
          <div className="flex gap-1">
            <input id="page-n" name="page" type="number" min={1} max={pages.length} inputMode="numeric" placeholder="1–604" className={`${input} min-w-0 sm:w-24`} />
            <button className={btn} type="submit">Go</button>
          </div>
        </form>
        <div className="col-span-2 grid grid-cols-2 sm:flex gap-2 sm:ml-auto">
          <button type="button" className={btn} onClick={() => setPlayFrom({ verse: 0, at: Date.now() })}><Play size={16} aria-hidden="true" /> Recite</button>
          <button type="button" className={btn} onClick={() => setDisplay(true)}><SlidersHorizontal size={16} aria-hidden="true" /> Display</button>
        </div>
      </div>

      <div data-hide-en={prefs.showEnglish ? undefined : ""}>{children}</div>

      <Recitation chapter={chapter} total={total} request={playFrom} />
      <TafsirDialog chapter={chapter} name={name} verse={tafsirVerse} onClose={() => setTafsirVerse(null)} />
      <Dialog open={display} onClose={() => setDisplay(false)} title="Display">
        <DisplaySettings />
      </Dialog>
    </ReaderContext.Provider>
  );
}

function DisplaySettings() {
  const [prefs, setPrefs] = usePref<ReaderPrefs & { showEnglish: boolean }>("ic:reader", { ...READER_DEFAULTS, showEnglish: true });
  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty("--quran-size", `${prefs.arabicSize}rem`);
    s.setProperty("--quran-leading", String(prefs.lineHeight));
    s.setProperty("--urdu-size", `${prefs.urduSize}rem`);
  }, [prefs]);
  const slider = (key: keyof ReaderPrefs, label: string, min: number, max: number, step: number, unit = "") => (
    <label className="block">
      <span className="flex justify-between text-sm font-semibold"><span>{label}</span><span className="tabular-nums">{prefs[key]}{unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={prefs[key]} onChange={(e) => setPrefs({ [key]: +e.target.value })} className="mt-2 w-full accent-[var(--color-primary)] cursor-pointer" />
    </label>
  );
  return (
    <div className="space-y-6">
      {slider("arabicSize", "Arabic size", 1.4, 3.6, 0.1, "rem")}
      {slider("lineHeight", "Arabic line spacing", 1.6, 3, 0.1)}
      {slider("urduSize", "Urdu size", 1, 2, 0.05, "rem")}
      <label className="flex items-center gap-3 min-h-11 cursor-pointer">
        <input type="checkbox" checked={prefs.showEnglish} onChange={(e) => setPrefs({ showEnglish: e.target.checked })} className="w-5 h-5 accent-[var(--color-primary)]" />
        Show English translation
      </label>
      <p lang="ar" dir="rtl" className="quran-ar text-right">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <button type="button" className={btn} onClick={() => setPrefs({ ...READER_DEFAULTS, showEnglish: true })}>Reset</button>
    </div>
  );
}

// Tracks the verse at the top of the screen: progress bar + last-read position.
function ReadingProgress({ chapter, name, total }: { chapter: number; name: string; total: number }) {
  const [verse, setVerse] = useState(0);
  const [, setLastRead] = useLastRead();
  const [resume, setResume] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Offer to continue once per surah, only if there's no verse in the URL.
  useEffect(() => {
    let live = true;
    kvGet<LastRead>("lastRead").then((lr) => {
      if (live && lr?.chapter === chapter && lr.verse > 1 && !location.hash) setResume(lr.verse);
    }).catch(() => {});
    return () => { live = false; };
  }, [chapter]);

  useEffect(() => {
    const visible = new Set<number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const n = +(e.target as HTMLElement).dataset.verse!;
        if (e.isIntersecting) visible.add(n); else visible.delete(n);
      }
      if (!visible.size) return;
      const top = Math.min(...visible);
      setVerse(top);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setLastRead({ chapter, verse: top, name, total, at: Date.now() }), 1200);
    }, { rootMargin: "-80px 0px -55% 0px" });
    document.querySelectorAll("[data-verse]").forEach((el) => io.observe(el));
    return () => { io.disconnect(); clearTimeout(saveTimer.current); };
  }, [chapter, name, total, setLastRead]);

  const pct = total ? Math.round((verse / total) * 100) : 0;
  return (
    <>
      <div className="no-print fixed top-[72px] left-0 right-0 z-40 h-1 bg-transparent" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="h-full bg-[var(--color-primary)] origin-left transition-transform" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      {resume && (
        <div className="no-print mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--color-primary-container)]/50 p-4">
          <History size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
          <p className="text-sm flex-1">You were reading verse {resume}.</p>
          <a href={`#v${resume}`} onClick={() => setResume(null)} className={btn}><BookOpenText size={16} aria-hidden="true" /> Continue</a>
          <button type="button" onClick={() => setResume(null)} className="text-sm underline cursor-pointer">Dismiss</button>
        </div>
      )}
    </>
  );
}
