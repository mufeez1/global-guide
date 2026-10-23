import { unstable_cache } from "next/cache";
import { getHadith, getSections } from "@/lib/services/hadith";

// Keeps only the small section list from the 6 MB info.json, refreshed weekly.
export const sectionsFor = unstable_cache((book: string) => getSections(book), ["hadith-sections-v1"], { revalidate: 604800 });

// Daily hadith from the Forty Hadith of an-Nawawi: short, complete narrations with English and Arabic.
export function dailyHadith(now = Date.now()) {
  const n = (Math.floor(now / 86_400_000) % 42) + 1;
  return getHadith("nawawi", n).then((h) => ({ ...h, book: "nawawi" as const }));
}
