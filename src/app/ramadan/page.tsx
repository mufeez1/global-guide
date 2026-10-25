import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import Ramadan from "./Ramadan";

export const metadata: Metadata = {
  title: "Ramadan Sehri & Iftar Timetable",
  description: "Ramadan Sehri and Iftar times for your city with live countdowns, calculated from Fajr and Maghrib.",
  alternates: { canonical: "/ramadan" },
};

export default function RamadanPage() {
  return (
    <div className="ramadan-bg -mt-px pb-4">
      <div className="no-print"><PageHeader kicker="Fasting" title={<>Ramadan <span className="text-[var(--color-primary)]">Sehri &amp; Iftar</span></>} intro="Sehri ends at Fajr and Iftar is at Maghrib, calculated for your location with your prayer-time settings." /></div>
      <Ramadan />
    </div>
  );
}
