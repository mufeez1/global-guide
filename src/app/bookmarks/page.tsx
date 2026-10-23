import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import Bookmarks from "./Bookmarks";

export const metadata: Metadata = { title: "Bookmarks", robots: { index: false } };

export default function BookmarksPage() {
  return (
    <div className="pb-24">
      <PageHeader width="max-w-3xl" kicker="Saved" title="Bookmarks" intro="Verses, hadith, duas and names you've saved. They're stored on this device and readable offline." />
      <section className="max-w-3xl mx-auto px-4 sm:px-8"><Bookmarks /></section>
    </div>
  );
}
