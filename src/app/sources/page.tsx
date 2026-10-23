import type { Metadata } from "next";
import { SOURCES } from "@/lib/sources";
import { PageHeader, card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sources & licences",
  description: "Where every piece of content comes from, its licence, and how your data is handled.",
  alternates: { canonical: "/sources" },
};

const FIELDS = [
  ["data", "Provides"], ["auth", "Authentication"], ["rateLimit", "Rate limits"], ["attribution", "Attribution"],
  ["license", "Licence / redistribution"], ["urdu", "Urdu"], ["audio", "Audio use"], ["checked", "Last checked"],
] as const;

export default function SourcesPage() {
  return (
    <div className="pb-24">
      <PageHeader width="max-w-4xl" kicker="Transparency" title="Sources & licences" intro="Quran text, translations, tafsir, hadith, audio and maps each come from different providers under different terms. Nothing here is made up: when a source is unavailable we say so instead of filling the gap." />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-4">
        {Object.entries(SOURCES).map(([id, s]) => (
          <section key={id} id={id} aria-labelledby={`${id}-h`} className={`${card} p-6`}>
            <h2 id={`${id}-h`} className="font-display text-xl"><a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a></h2>
            <dl className="mt-3 grid sm:grid-cols-[11rem_1fr] gap-x-4 gap-y-2 text-sm">
              {FIELDS.filter(([k]) => s[k]).map(([k, label]) => (
                <div key={k} className="contents"><dt className="text-[var(--color-on-surface)]/60">{label}</dt><dd>{s[k]}</dd></div>
              ))}
            </dl>
          </section>
        ))}

        <section id="privacy" aria-labelledby="privacy-h" className={`${card} p-6`}>
          <h2 id="privacy-h" className="font-display text-xl">Privacy</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm">
            <li>There are no accounts. Bookmarks, tasbeeh history, reading position, location and settings stay in your browser.</li>
            <li>Your location is asked for only when you press “Use my current location”. It is rounded to about 10 m and sent only to Aladhan (prayer times), OpenStreetMap Nominatim (place name) and Overpass (nearby mosques).</li>
            <li>Tasbeeh counts are never sent anywhere. Export them from the Tasbeeh page or Settings.</li>
            <li>Map tiles are loaded from OpenStreetMap only on the Mosque Finder page.</li>
          </ul>
        </section>

        <section aria-labelledby="blocked-h" className={`${card} p-6`}>
          <h2 id="blocked-h" className="font-display text-xl">Not available from a verified free source</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm">
            <li>Urdu translations of duas and of the 99 Names: UmmahAPI and Hisn al-Muslim offer English or Arabic only.</li>
            <li>Sunnah.com: its API needs a private key that can&apos;t safely be used in a browser-only app.</li>
            <li>Audio for the 99 Names and duas: no source we checked provides it.</li>
            <li>Offline audio downloads: no audio provider grants redistribution rights, so audio streams only.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
