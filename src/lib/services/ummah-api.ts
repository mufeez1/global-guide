import { getJson, expect } from "../http.ts";

const BASE = "https://ummahapi.com/api";
const P = "UmmahAPI";

export type Dua = { id: number; category: string; title: string; arabic: string; transliteration?: string; translation?: string; source?: string; repeat: number };
export type DuaCategory = { id: string; name: string; description: string; count: number };
export type AllahName = { number: number; arabic: string; transliteration: string; english: string; meaning?: string };
export type HadithHit = { id: string; collection: string; collectionName: string; number: number; arabic?: string; english?: string; grade?: string };

const day = { next: { revalidate: 86400 } };

export function normalizeDuas(json: { data?: { categories?: DuaCategory[]; duas?: (Omit<Dua, "repeat"> & { repeat?: number })[] } }) {
  const d = expect(P, json?.data, "duas");
  const duas = expect(P, d.duas, "dua list")
    .filter((x) => x.arabic?.trim() && x.title)
    .map((x) => ({ ...x, repeat: Math.max(1, Number(x.repeat) || 1) }));
  return { categories: expect(P, d.categories, "dua categories"), duas };
}

export async function getDuas() {
  return normalizeDuas(await getJson(P, `${BASE}/duas`, day));
}

export async function getNames() {
  const json = await getJson<{ data?: { names?: AllahName[]; source?: string } }>(P, `${BASE}/asma-ul-husna`, { next: { revalidate: 604800 } });
  const names = expect(P, json?.data?.names, "names");
  if (names.length !== 99) throw new Error(`${P} returned ${names.length} names instead of 99.`);
  return { names, source: json.data?.source };
}

export async function searchHadith(q: string): Promise<HadithHit[]> {
  const json = await getJson<{ data?: { hadiths?: { id: string; collection: string; collection_name: string; hadithnumber: number; arabic?: string; english?: string; grade?: string }[] } }>(
    P, `${BASE}/hadith/search?q=${encodeURIComponent(q)}&limit=20`, day
  );
  return (json?.data?.hadiths ?? []).map((h) => ({
    id: h.id, collection: h.collection, collectionName: h.collection_name, number: h.hadithnumber, arabic: h.arabic, english: h.english, grade: h.grade,
  }));
}
