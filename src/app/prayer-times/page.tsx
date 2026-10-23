import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import PrayerTimes from "./PrayerTimes";

export const metadata: Metadata = {
  title: "Prayer Times",
  description: "Daily and monthly salah times for your location, with calculation method, Asr school and minute adjustments.",
  alternates: { canonical: "/prayer-times" },
};

export default function PrayerTimesPage() {
  return (
    <>
      <PageHeader kicker="Salah" title={<>Prayer Times &amp; <span className="text-[var(--color-primary)]">Hijri date</span></>} intro="Calculated for your chosen location and method. Saved on this device, so it still works offline." />
      <PrayerTimes />
    </>
  );
}
