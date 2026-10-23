import type { MetadataRoute } from "next";
import { BOOKS } from "@/lib/services/hadith";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/quran", "/listen", "/prayer-times", "/hadith", "/dua-zikar", "/tasbeeh", "/calendar", "/ramadan", "/names", "/mosques", "/wisdom", "/sources"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}` })),
    ...Array.from({ length: 114 }, (_, i) => ({ url: `${BASE}/quran?chapter=${i + 1}` })),
    ...Array.from({ length: 99 }, (_, i) => ({ url: `${BASE}/names/${i + 1}` })),
    ...Object.keys(BOOKS).map((b) => ({ url: `${BASE}/hadith/${b}` })),
  ];
}
