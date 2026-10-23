import type { Metadata } from "next";
import { getNames } from "@/lib/services/ummah-api";
import { errorMessage } from "@/lib/http";
import { Attribution, ErrorState, PageHeader } from "@/components/ui";
import NamesBrowser from "./NamesBrowser";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "99 Names of Allah",
  description: "Al-Asma ul-Husna: the 99 Names of Allah in Arabic with transliteration and English meaning.",
  alternates: { canonical: "/names" },
};

export default async function NamesPage() {
  const res = await getNames().then((d) => ({ ok: true as const, ...d }), (e) => ({ ok: false as const, error: errorMessage(e) }));
  return (
    <div className="pb-24">
      <PageHeader kicker="Al-Asma ul-Husna" title={<>The 99 Names <span className="text-[var(--color-primary)]">of Allah</span></>} />
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        {res.ok ? (
          <>
            <NamesBrowser names={res.names} />
            <Attribution ids={["ummah-api"]} note={res.source} />
            <p className="mt-2 text-xs text-[var(--color-on-surface)]/60">Urdu meanings and audio aren&apos;t provided by this source, so they aren&apos;t shown.</p>
          </>
        ) : <ErrorState message={res.error} />}
      </section>
    </div>
  );
}
