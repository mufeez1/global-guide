"use client";

import { BookText, Play } from "lucide-react";
import { BookmarkButton, CopyButton, ShareButton } from "@/components/client";
import { iconBtn } from "@/components/ui";
import { useReader } from "./ReaderShell";

// Verse text is read from the page when needed, so it isn't sent to the browser twice.
const textOf = (verse: number, sel: string) => document.querySelector(`#v${verse} ${sel}`)?.textContent?.trim() ?? "";

export default function VerseTools({ verse }: { verse: number }) {
  const { play, openTafsir, chapter, name } = useReader();
  const ref = `${name} ${chapter}:${verse}`;
  const full = () => [textOf(verse, ".quran-ar"), textOf(verse, ".urdu"), textOf(verse, ".reader-en"), `— ${ref}`].filter(Boolean).join("\n\n");
  const href = `/quran?chapter=${chapter}#v${verse}`;
  return (
    <div className="no-print mt-4 sm:pl-16 flex flex-wrap gap-1" role="group" aria-label={`Actions for verse ${verse}`}>
      <button type="button" onClick={() => play(verse)} aria-label={`Recite from verse ${verse}`} title="Recite from here" className={iconBtn}><Play size={18} aria-hidden="true" /></button>
      <button type="button" onClick={() => openTafsir(verse)} aria-label={`Tafsir for verse ${verse}`} title="Tafsir" className={iconBtn}><BookText size={18} aria-hidden="true" /></button>
      <BookmarkButton item={{ id: `quran:${chapter}:${verse}`, kind: "quran", title: ref, text: "", href }} getText={() => textOf(verse, ".reader-en") || textOf(verse, ".quran-ar")} label="Bookmark verse" />
      <CopyButton text={full} label={`Copy verse ${verse}`} />
      <ShareButton title={ref} text={full} url={href} label={`Share verse ${verse}`} />
    </div>
  );
}
