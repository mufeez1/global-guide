import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import Tasbeeh from "./Tasbeeh";

export const metadata: Metadata = {
  title: "Tasbeeh Counter",
  description: "A digital tasbeeh with targets, multiple counters, history and daily totals, saved privately on your device.",
  alternates: { canonical: "/tasbeeh" },
};

type Search = Promise<{ text?: string; arabic?: string; target?: string }>;

export default async function TasbeehPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const preset = sp.text ? { text: sp.text.slice(0, 80), arabic: sp.arabic?.slice(0, 300), target: Math.max(1, Math.min(10000, parseInt(sp.target || "33") || 33)) } : undefined;
  return (
    <>
      <PageHeader kicker="Dhikr" title="Tasbeeh" intro="Tap the circle, or focus it and press Space. Everything is saved on this device." />
      <Tasbeeh preset={preset} />
    </>
  );
}
