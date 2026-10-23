import { getJson, expect } from "../http.ts";

const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const P = "Hadith API";

// Book slugs and the languages each one is published in (from editions.json).
export const BOOKS: Record<string, { name: string; arabic: string; urdu: boolean }> = {
  bukhari: { name: "Sahih al-Bukhari", arabic: "صحيح البخاري", urdu: true },
  muslim: { name: "Sahih Muslim", arabic: "صحيح مسلم", urdu: true },
  abudawud: { name: "Sunan Abu Dawud", arabic: "سنن أبي داود", urdu: true },
  tirmidhi: { name: "Jami at-Tirmidhi", arabic: "جامع الترمذي", urdu: true },
  nasai: { name: "Sunan an-Nasa'i", arabic: "سنن النسائي", urdu: true },
  ibnmajah: { name: "Sunan Ibn Majah", arabic: "سنن ابن ماجه", urdu: true },
  malik: { name: "Muwatta Malik", arabic: "موطأ مالك", urdu: true },
  nawawi: { name: "Forty Hadith of an-Nawawi", arabic: "الأربعون النووية", urdu: false },
  qudsi: { name: "Forty Hadith Qudsi", arabic: "الأحاديث القدسية", urdu: false },
};

export type Grade = { name: string; grade: string };
export type Hadith = { number: number; arabic?: string; english?: string; urdu?: string; grades: Grade[]; reference?: { book: number; hadith: number } };
export type Section = { book: string; section: number; title: string; hadiths: Hadith[] };
export type SectionInfo = { number: number; title: string; first: number; last: number };

type RawHadith = { hadithnumber: number; text: string; grades?: Grade[]; reference?: { book: number; hadith: number } };
type RawSection = { metadata: { section: Record<string, string> }; hadiths: RawHadith[] };

const cacheFor = { next: { revalidate: 604800 } }; // a week; the dataset changes rarely

// Merge per-language editions by hadith number. Missing languages stay undefined, never filled in.
export function mergeEditions(ara?: RawHadith[], eng?: RawHadith[], urd?: RawHadith[]): Hadith[] {
  const map = new Map<number, Hadith>();
  const add = (rows: RawHadith[] | undefined, lang: "arabic" | "english" | "urdu") => {
    for (const r of rows ?? []) {
      if (!r.text?.trim()) continue;
      const h = map.get(r.hadithnumber) ?? { number: r.hadithnumber, grades: [] };
      h[lang] = r.text.trim();
      if (!h.grades.length && r.grades?.length) h.grades = r.grades;
      h.reference ??= r.reference;
      map.set(r.hadithnumber, h);
    }
  };
  add(ara, "arabic"); add(eng, "english"); add(urd, "urdu");
  return [...map.values()].sort((a, b) => a.number - b.number);
}

const edition = (lang: string, book: string, path: string) =>
  getJson<RawSection>(P, `${BASE}/editions/${lang}-${book}/${path}.min.json`, cacheFor).catch(() => undefined);

export async function getSection(book: string, section: number, withUrdu: boolean): Promise<Section> {
  const [ara, eng, urd] = await Promise.all([
    edition("ara", book, `sections/${section}`),
    edition("eng", book, `sections/${section}`),
    withUrdu && BOOKS[book]?.urdu ? edition("urd", book, `sections/${section}`) : undefined,
  ]);
  const meta = expect(P, (ara ?? eng)?.metadata, "section");
  return { book, section, title: meta.section[String(section)] ?? "", hadiths: mergeEditions(ara?.hadiths, eng?.hadiths, urd?.hadiths) };
}

export async function getHadith(book: string, n: number) {
  const one = (lang: string) => getJson<{ hadiths: RawHadith[] }>(P, `${BASE}/editions/${lang}-${book}/${n}.min.json`, cacheFor).catch(() => undefined);
  const [ara, eng] = await Promise.all([one("ara"), one("eng")]);
  return expect(P, mergeEditions(ara?.hadiths, eng?.hadiths)[0], "hadith");
}

// info.json is ~6 MB, so callers wrap this in unstable_cache and keep only the section list.
export async function getSections(book: string): Promise<SectionInfo[]> {
  const info = await getJson<Record<string, { metadata: { sections: Record<string, string>; section_details: Record<string, { hadithnumber_first: number; hadithnumber_last: number }> } }>>(
    P, `${BASE}/info.min.json`, { cache: "no-store" }, 30000
  );
  const m = expect(P, info?.[book]?.metadata, "book sections");
  return Object.entries(m.sections)
    .filter(([n, title]) => n !== "0" && title)
    .map(([n, title]) => ({ number: +n, title, first: m.section_details[n]?.hadithnumber_first, last: m.section_details[n]?.hadithnumber_last }))
    .filter((s) => s.first > 0);
}
