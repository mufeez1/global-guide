import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import Mosques from "./Mosques";

export const metadata: Metadata = {
  title: "Mosque Finder",
  description: "Find mosques near you from OpenStreetMap, with distance, map and directions.",
  alternates: { canonical: "/mosques" },
};

export default function MosquesPage() {
  return (
    <>
      <PageHeader kicker="Nearby" title="Mosque Finder" intro="Mosques mapped by the OpenStreetMap community around your location. Move the map and press “Search this area” to look elsewhere." />
      <Mosques />
    </>
  );
}
