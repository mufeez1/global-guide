import { getJson, expect } from "../http.ts";

const BASE = "https://api.alquran.cloud/v1";
const P = "AlQuran Cloud";

export const ARABIC_EDITION = "quran-simple-enhanced"; // Tanzil Simple Enhanced
export const ENGLISH_EDITION = "en.sahih";

// Verified against GET /v1/edition?language=ur (text translations only).
export const URDU_TRANSLATIONS: Record<string, string> = {
  "ur.jalandhry": "Fateh Muhammad Jalandhry",
  "ur.maududi": "Abul A'la Maududi",
  "ur.junagarhi": "Muhammad Junagarhi",
  "ur.ahmedali": "Ahmed Ali",
  "ur.kanzuliman": "Ahmed Raza Khan (Kanz-ul-Iman)",
  "ur.qadri": "Tahir ul Qadri",
  "ur.jawadi": "Syed Zeeshan Haider Jawadi",
  "ur.najafi": "Muhammad Hussain Najafi",
};
export const DEFAULT_URDU = "ur.jalandhry";

// Verified against GET /v1/edition?format=audio&type=versebyverse; names as the API gives them.
export const RECITATIONS: Record<string, string> = {
  "ar.alafasy": "Alafasy",
  "ar.abdulsamad": "Abdul Samad",
  "ar.husary": "Husary",
  "ar.abdurrahmaansudais": "Abdurrahmaan As-Sudais",
  "ar.shaatree": "Abu Bakr Ash-Shaatree",
  "ar.mahermuaiqly": "Maher Al Muaiqly",
  "ar.hudhaify": "Hudhaify",
  "ar.muhammadayyoub": "Muhammad Ayyoub",
  "ar.abdullahbasfar": "Abdullah Basfar",
  "ar.saoodshuraym": "Saood bin Ibraaheem Ash-Shuraym",
};
export const DEFAULT_RECITATION = "ar.alafasy";

const BISMILLAH_BARE = "بسم الله الرحمن الرحيم";
const bare = (w: string) => w.replace(/[\u064B-\u065F\u0670]/g, "");

export type Ayah = { n: number; global: number; juz: number; page: number; sajda: boolean; arabic: string; english?: string; urdu?: string };
export type Surah = { number: number; ayahs: Ayah[]; urduName?: string };

type RawAyah = { number: number; text: string; numberInSurah: number; juz: number; page: number; sajda: boolean | object; audio?: string };
type RawEdition = { edition: { identifier: string; englishName: string }; ayahs: RawAyah[] };

// AlQuran Cloud prepends the Bismillah to verse 1 of every surah; Tanzil's own text keeps it separate.
// Compared without diacritics because mark order (shadda/fatha) varies between encodings.
export function cleanArabic(text: string, surah: number, ayah: number) {
  const t = text.replace(/^\uFEFF/, "");
  if (surah === 1 || ayah !== 1) return t;
  const words = t.split(" ");
  return words.slice(0, 4).map(bare).join(" ") === BISMILLAH_BARE ? words.slice(4).join(" ") : t;
}

export function normalizeSurah(number: number, editions: RawEdition[], urdu?: string): Surah {
  const by = (id: string) => editions.find((e) => e.edition.identifier === id);
  const ar = expect(P, by(ARABIC_EDITION), "Arabic text");
  const en = by(ENGLISH_EDITION);
  const ur = urdu ? by(urdu) : undefined;
  return {
    number,
    ayahs: ar.ayahs.map((a, i) => ({
      n: a.numberInSurah,
      global: a.number,
      juz: a.juz,
      page: a.page,
      sajda: !!a.sajda,
      arabic: cleanArabic(a.text, number, a.numberInSurah),
      english: en?.ayahs[i]?.text,
      urdu: ur?.ayahs[i]?.text,
    })),
  };
}

// Server-side: one request for Arabic + English (+ Urdu), cached by Next for 30 days.
export async function getSurah(number: number, urdu?: string) {
  const eds = [ARABIC_EDITION, ENGLISH_EDITION, ...(urdu ? [urdu] : [])].join(",");
  const json = await getJson<{ data: RawEdition[] }>(P, `${BASE}/surah/${number}/editions/${eds}`, { next: { revalidate: 2592000 } });
  return normalizeSurah(number, expect(P, json?.data, "surah editions"), urdu);
}

export type QuranMeta = { juzs: { surah: number; ayah: number }[]; pages: { surah: number; ayah: number }[] };
export async function getMeta(): Promise<QuranMeta> {
  const json = await getJson<{ data: { juzs: { references: QuranMeta["juzs"] }; pages: { references: QuranMeta["pages"] } } }>(
    P, `${BASE}/meta`, { next: { revalidate: false } }
  );
  const d = expect(P, json?.data, "metadata");
  return { juzs: d.juzs.references, pages: d.pages.references };
}

// Client-side: audio URL per verse for a reciter.
export async function getRecitationUrls(surah: number, reciter: string) {
  const json = await getJson<{ data: { ayahs: RawAyah[] } }>(P, `${BASE}/surah/${surah}/${reciter}`);
  return expect(P, json?.data?.ayahs, "audio").map((a) => expect(P, a.audio, "audio URL"));
}

export type SearchHit = { surah: number; surahName: string; ayah: number; text: string };
export async function search(q: string, edition: string): Promise<{ count: number; hits: SearchHit[] }> {
  // The API answers 404 when nothing matches.
  const json = await getJson<{ data?: { count: number; matches: { text: string; numberInSurah: number; surah: { number: number; englishName: string } }[] } }>(
    P, `${BASE}/search/${encodeURIComponent(q)}/all/${edition}`, { next: { revalidate: 86400 } }
  ).catch((e) => (e.status === 404 ? { data: { count: 0, matches: [] } } : Promise.reject(e)));
  const d = json.data ?? { count: 0, matches: [] };
  return { count: d.count, hits: d.matches.map((m) => ({ surah: m.surah.number, surahName: m.surah.englishName, ayah: m.numberInSurah, text: m.text })) };
}
