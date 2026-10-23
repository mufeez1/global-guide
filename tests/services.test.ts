// Run with `npm test` (Node's built-in runner, TypeScript via type stripping). No live API calls.
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { normalizeCalendar } from "../src/lib/services/aladhan.ts";
import { nextPrayer, currentPrayer, countdown, dateIn } from "../src/lib/prayer.ts";
import { cleanArabic, normalizeSurah } from "../src/lib/services/quran-cloud.ts";
import { htmlToParagraphs, normalizeTafsir } from "../src/lib/services/quran-foundation.ts";
import { mergeEditions } from "../src/lib/services/hadith.ts";
import { parseMosques, haversineKm, findMosques } from "../src/lib/services/overpass.ts";
import { normalizeDuas } from "../src/lib/services/ummah-api.ts";
import { getJson, ProviderError } from "../src/lib/http.ts";

const hijri = { day: "5", month: { number: 10, en: "Shawwāl", ar: "شَوّال" }, year: "1448", weekday: { ar: "السبت" }, holidays: [] };
const day = (date: string, off: string, t: Record<string, string>) => ({
  timings: Object.fromEntries(Object.entries(t).map(([k, v]) => [k, `${date.split("-").reverse().join("-")}T${v}:00${off}`])),
  date: { gregorian: { date }, hijri },
  meta: { timezone: "America/New_York", method: { name: "ISNA" }, school: "STANDARD" },
});
const T = { Imsak: "04:46", Fajr: "04:58", Sunrise: "06:11", Dhuhr: "12:05", Asr: "15:24", Sunset: "18:00", Maghrib: "18:00", Isha: "19:15" };
// 13 → 14 March 2027 crosses the US DST change; the API gives each day its own offset.
const calendar = { code: 200, data: [day("13-03-2027", "-05:00", T), day("14-03-2027", "-04:00", { ...T, Fajr: "05:57" })] };

test("Aladhan calendar normalises dates and keeps per-day UTC offsets", () => {
  const s = normalizeCalendar(calendar);
  assert.equal(s.timezone, "America/New_York");
  assert.equal(s.days[0].date, "2027-03-13");
  assert.equal(s.days[1].times.Fajr, "2027-03-14T05:57:00-04:00");
  assert.equal(s.days[0].hijri.monthEn, "Shawwāl");
});

test("Aladhan calendar rejects missing or unreadable times", () => {
  assert.throws(() => normalizeCalendar({ code: 200, data: [] }), ProviderError);
  const bad = structuredClone(calendar);
  bad.data[0].timings.Asr = "15:24 (EST)";
  assert.throws(() => normalizeCalendar(bad), /unreadable Asr/);
});

test("next prayer rolls over to tomorrow's Fajr after Isha, across DST", () => {
  const { days } = normalizeCalendar(calendar);
  const afterIsha = Date.parse("2027-03-13T20:00:00-05:00");
  const n = nextPrayer(days, afterIsha)!;
  assert.equal(n.name, "Fajr");
  assert.equal(n.day.date, "2027-03-14");
  // 20:00 EST (01:00Z) → 05:57 EDT (09:57Z): real elapsed time, not wall-clock difference.
  assert.equal(countdown(n.at - afterIsha), "08:57:00");
  assert.equal(nextPrayer(days, Date.parse("2027-03-14T21:00:00-04:00")), null);
});

test("current prayer: none between Sunrise and Dhuhr", () => {
  const { days } = normalizeCalendar(calendar);
  assert.equal(currentPrayer(days[0], Date.parse("2027-03-13T05:30:00-05:00")), "Fajr");
  assert.equal(currentPrayer(days[0], Date.parse("2027-03-13T09:00:00-05:00")), null);
  assert.equal(currentPrayer(days[0], Date.parse("2027-03-13T23:00:00-05:00")), "Isha");
});

test("dateIn uses the location's timezone, not the device's", () => {
  const t = Date.parse("2026-10-31T23:30:00Z");
  assert.equal(dateIn("Asia/Karachi", t), "2026-11-01");
  assert.equal(dateIn("America/New_York", t), "2026-10-31");
});

test("Quran: strips the Bismillah AlQuran Cloud prepends, but not from Al-Fatihah", () => {
  const b = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  assert.equal(cleanArabic(`${b} الم`, 2, 1), "الم");
  assert.equal(cleanArabic(`﻿${b}`, 1, 1), b);
  assert.equal(cleanArabic(`${b} الم`, 2, 2), `${b} الم`);
  // Real AlQuran Cloud encoding puts shadda before fatha.
  assert.equal(cleanArabic("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الم", 2, 1), "الم");
  assert.equal(cleanArabic("قُلْ هُوَ اللَّهُ أَحَدٌ", 112, 1), "قُلْ هُوَ اللَّهُ أَحَدٌ");
});

test("Quran: editions align by position and a missing translation stays missing", () => {
  const ayah = (n: number, text: string) => ({ number: n, numberInSurah: n, text, juz: 1, page: 1, sajda: false });
  const s = normalizeSurah(112, [
    { edition: { identifier: "quran-simple-enhanced", englishName: "" }, ayahs: [ayah(1, "قُلْ"), ayah(2, "اللَّهُ")] },
    { edition: { identifier: "en.sahih", englishName: "" }, ayahs: [ayah(1, "Say"), ayah(2, "Allah")] },
  ], "ur.jalandhry");
  assert.deepEqual(s.ayahs.map((a) => [a.arabic, a.english, a.urdu]), [["قُلْ", "Say", undefined], ["اللَّهُ", "Allah", undefined]]);
  assert.throws(() => normalizeSurah(1, []), /Arabic text/);
});

test("Tafsir HTML becomes plain paragraphs; scripts and tags never survive", () => {
  const p = htmlToParagraphs('<h2>Title</h2><p>One &amp; two</p><script>alert(1)</script><p>Three&nbsp;<b>bold</b> &#1575;</p>');
  assert.deepEqual(p, ["Title", "One & two", "Three bold ا"]);
  assert.ok(!p.join("").includes("<"));
  assert.deepEqual(normalizeTafsir(159, "2:255", { tafsir: { resource_name: "Bayan", text: "" } }).paragraphs, []);
});

test("Hadith editions merge by number without inventing grades", () => {
  const h = mergeEditions(
    [{ hadithnumber: 2, text: "عربي" }, { hadithnumber: 1, text: "  " }],
    [{ hadithnumber: 2, text: "English", grades: [{ name: "Al-Albani", grade: "Sahih" }] }],
    undefined
  );
  assert.equal(h.length, 1);
  assert.deepEqual(h[0], { number: 2, arabic: "عربي", english: "English", grades: [{ name: "Al-Albani", grade: "Sahih" }], reference: undefined });
  assert.deepEqual(mergeEditions([{ hadithnumber: 3, text: "x" }])[0].grades, []);
});

test("Overpass: nodes and ways/relations both parse, sorted by distance", () => {
  const m = parseMosques({
    elements: [
      { type: "way", id: 9, center: { lat: 31.56, lon: 74.36 }, tags: { name: "Badshahi Mosque" } },
      { type: "node", id: 1, lat: 31.5442, lon: 74.3505, tags: {} },
      { type: "relation", id: 5 },
    ],
  }, 31.5442, 74.3505);
  assert.equal(m.length, 2);
  assert.equal(m[0].id, "node/1");
  assert.equal(m[0].name, undefined);
  assert.equal(m[1].osmUrl, "https://www.openstreetmap.org/way/9");
  assert.ok(Math.abs(haversineKm(31.5204, 74.3587, 24.8607, 67.0011) - 1030) < 15); // Lahore → Karachi
});

test("UmmahAPI duas: drops entries without Arabic, defaults repeat to 1", () => {
  const { duas } = normalizeDuas({ data: { categories: [], duas: [
    { id: 1, category: "morning", title: "A", arabic: "ذكر" },
    { id: 2, category: "morning", title: "B", arabic: " " },
  ] } });
  assert.deepEqual(duas.map((d) => [d.id, d.repeat]), [[1, 1]]);
});

test("getJson maps rate limits, outages and bad JSON to readable errors", async (t) => {
  const respond = (r: Response | Error) => mock.method(globalThis, "fetch", async () => { if (r instanceof Error) throw r; return r; });
  t.after(() => mock.restoreAll());
  respond(new Response("", { status: 429 }));
  await assert.rejects(getJson("Aladhan", "https://x"), /rate-limiting/);
  respond(new Response("", { status: 503 }));
  await assert.rejects(getJson("Aladhan", "https://x"), (e: ProviderError) => e.status === 503);
  respond(new TypeError("fetch failed"));
  await assert.rejects(getJson("Aladhan", "https://x"), /Couldn't reach Aladhan/);
  respond(new Response("<html>", { status: 200 }));
  await assert.rejects(getJson("Aladhan", "https://x"), /couldn't read/);
});

test("Overpass falls back to the mirror when the main instance is overloaded", async (t) => {
  const calls: string[] = [];
  mock.method(globalThis, "fetch", async (url: string) => {
    calls.push(url);
    return calls.length === 1 ? new Response("", { status: 504 }) : Response.json({ elements: [{ type: "node", id: 1, lat: 1, lon: 1, tags: { name: "M" } }] });
  });
  t.after(() => mock.restoreAll());
  const m = await findMosques(1, 1, 1000);
  assert.equal(m[0].name, "M");
  assert.match(calls[0], /overpass-api\.de/);
  assert.match(calls[1], /maps\.mail\.ru/);
});
