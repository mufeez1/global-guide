"use client";

import { DAY, useCached } from "@/lib/cache";
import { DEFAULT_TAFSIR, TAFSIRS, getTafsir } from "@/lib/services/quran-foundation";
import { usePref } from "@/lib/settings";
import { Dialog } from "@/components/client";
import { Attribution, ErrorState, Skeleton, btn } from "@/components/ui";
import Select from "@/components/Select";

const LANG = { ur: "Urdu", ar: "Arabic", en: "English" } as const;

export default function TafsirDialog({ chapter, name, verse, onClose }: { chapter: number; name: string; verse: number | null; onClose: () => void }) {
  const [{ id: saved }, setPref] = usePref("ic:tafsir", { id: DEFAULT_TAFSIR });
  const id = saved in TAFSIRS ? saved : DEFAULT_TAFSIR;
  const meta = TAFSIRS[id];
  const [state, retry] = useCached(verse ? `tafsir:${id}:${chapter}:${verse}` : null, 90 * DAY, () => getTafsir(id, chapter, verse!));

  return (
    <Dialog open={verse !== null} onClose={onClose} title={`Tafsir · ${name} ${chapter}:${verse ?? ""}`} wide>
      <Select
        label="Commentary"
        value={id}
        onChange={(v) => setPref({ id: v })}
        options={(["ur", "ar", "en"] as const).flatMap((lang) =>
          Object.entries(TAFSIRS).filter(([, t]) => t.lang === lang).map(([tid, t]) => ({ value: +tid, label: `${t.name} — ${t.author}`, group: LANG[lang] })))}
      />
      <p className="mt-3 text-sm text-[var(--color-on-surface)]/70">
        {meta.name} by {meta.author} · {LANG[meta.lang]} ·{" "}
        <a href={`#v${verse}`} onClick={onClose} className="text-[var(--color-primary)] underline underline-offset-2">Verse {chapter}:{verse}</a>
      </p>

      <div className="mt-5">
        {state.status === "loading" && <div className="space-y-3"><Skeleton className="h-5" /><Skeleton className="h-5 w-11/12" /><Skeleton className="h-5 w-4/5" /></div>}
        {state.status === "error" && <ErrorState message={state.error} retry={<button className={btn} onClick={retry}>Try again</button>} />}
        {state.status === "ready" && (
          <>
            {state.data.paragraphs.length ? (
              <div
                lang={meta.lang}
                dir={meta.lang === "en" ? "ltr" : "rtl"}
                className={`space-y-4 max-w-prose ${meta.lang === "ur" ? "urdu" : meta.lang === "ar" ? "font-arabic text-xl leading-[2.1]" : "text-[17px] leading-[1.8]"}`}
              >
                {state.data.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-on-surface)]/75">
                This edition has no separate commentary for verse {verse}. It may explain this verse together with a neighbouring one, so try the verse before it.
              </p>
            )}
            <Attribution ids={["quran-com"]} fetchedAt={state.fetchedAt} fromCache={state.fromCache} stale={state.stale} note={state.data.resourceName} />
          </>
        )}
      </div>
    </Dialog>
  );
}
