import { getJson, expect } from "../http.ts";

const BASE = "https://api.quran.com/api/v4";
const P = "Quran.com";

// IDs, names and authors as returned by GET /resources/tafsirs. Only editions that exist are listed.
export const TAFSIRS: Record<number, { name: string; author: string; lang: "ur" | "ar" | "en" }> = {
  160: { name: "Tafsir Ibn Kathir", author: "Hafiz Ibn Kathir", lang: "ur" },
  159: { name: "Bayan ul Quran", author: "Dr. Israr Ahmad", lang: "ur" },
  818: { name: "Tazkir ul Quran", author: "Maulana Wahid Uddin Khan", lang: "ur" },
  157: { name: "Fi Zilal al-Quran", author: "Sayyid Ibrahim Qutb", lang: "ur" },
  14: { name: "Tafsir Ibn Kathir", author: "Hafiz Ibn Kathir", lang: "ar" },
  16: { name: "Tafsir Muyassar", author: "المیسر", lang: "ar" },
  91: { name: "Al-Sa'di", author: "Saddi", lang: "ar" },
  169: { name: "Ibn Kathir (Abridged)", author: "Hafiz Ibn Kathir", lang: "en" },
  168: { name: "Ma'arif al-Qur'an", author: "Mufti Muhammad Shafi", lang: "en" },
};
export const DEFAULT_TAFSIR = 160;

export type Tafsir = { id: number; resourceName: string; verseKey: string; paragraphs: string[] };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

// Provider HTML → plain paragraphs. We never inject third-party HTML into the page.
export function htmlToParagraphs(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\s*(br|\/p|\/h\d|\/div|\/li|\/blockquote)[^>]*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) =>
      e[0] === "#" ? String.fromCodePoint(parseInt(e.slice(e[1] === "x" ? 2 : 1), e[1] === "x" ? 16 : 10)) : ENTITIES[e.toLowerCase()] ?? m)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function normalizeTafsir(id: number, verseKey: string, json: { tafsir?: { resource_name?: string; text?: string } }): Tafsir {
  const t = expect(P, json?.tafsir, "tafsir");
  return { id, verseKey, resourceName: t.resource_name ?? TAFSIRS[id]?.name ?? "", paragraphs: htmlToParagraphs(t.text ?? "") };
}

export async function getTafsir(id: number, surah: number, ayah: number) {
  const key = `${surah}:${ayah}`;
  return normalizeTafsir(id, key, await getJson(P, `${BASE}/tafsirs/${id}/by_ayah/${key}`));
}
