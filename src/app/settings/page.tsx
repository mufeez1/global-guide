import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import Settings from "./Settings";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default function SettingsPage() {
  return (
    <div className="pb-24">
      <PageHeader width="max-w-3xl" kicker="Preferences" title="Settings" intro={<>Theme is in the top bar. Reading sizes are under <Link className="underline" href="/quran">Quran → Display</Link>; calculation method is on <Link className="underline" href="/prayer-times">Prayer Times</Link>.</>} />
      <div className="max-w-3xl mx-auto px-4 sm:px-8"><Settings /></div>
    </div>
  );
}
