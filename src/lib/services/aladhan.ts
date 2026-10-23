import { getJson, expect, ProviderError } from "../http.ts";

const BASE = "https://api.aladhan.com/v1";
const P = "Aladhan";

export const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];
// Order of Aladhan's `tune` parameter.
const TUNE_ORDER = ["Imsak", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Sunset", "Isha", "Midnight"] as const;

export type PrayerPrefs = { method: number; school: 0 | 1; tune: Partial<Record<PrayerName, number>> };
export const DEFAULT_PREFS: PrayerPrefs = { method: 1, school: 1, tune: {} };

export type HijriDate = { day: number; month: number; monthEn: string; monthAr: string; year: number; weekdayAr: string; holidays: string[]; method?: string };
export type Day = {
  date: string; // YYYY-MM-DD (Gregorian, in the location's timezone)
  hijri: HijriDate;
  times: Record<PrayerName | "Imsak" | "Sunset", string>; // ISO 8601 with UTC offset
};
export type Schedule = { days: Day[]; timezone: string; methodName: string; school: string };

type RawHijri = { day: string; month: { number: number; en: string; ar: string }; year: string; weekday: { ar: string }; holidays?: string[]; method?: string };
type RawDay = { timings: Record<string, string>; date: { gregorian: { date: string }; hijri: RawHijri } };
type RawCalendar = { code: number; data: (RawDay & { meta: { timezone: string; method: { name: string }; school: string } })[] };

const isoDate = (dmy: string) => dmy.split("-").reverse().join("-"); // DD-MM-YYYY → YYYY-MM-DD

export function normalizeHijri(h: RawHijri): HijriDate {
  return {
    day: +h.day, month: h.month.number, monthEn: h.month.en, monthAr: h.month.ar, year: +h.year,
    weekdayAr: h.weekday.ar, holidays: h.holidays ?? [], method: h.method,
  };
}

export function normalizeCalendar(json: RawCalendar): Schedule {
  const rows = expect(P, Array.isArray(json?.data) && json.data.length ? json.data : null, "calendar days");
  const meta = expect(P, rows[0].meta, "calendar metadata");
  const days = rows.map((r) => {
    const times = {} as Day["times"];
    for (const k of [...PRAYERS, "Imsak", "Sunset"] as const) {
      const t = expect(P, r.timings?.[k], `${k} time`);
      if (Number.isNaN(Date.parse(t))) throw new ProviderError(P, 200, `${P} returned an unreadable ${k} time.`);
      times[k] = t;
    }
    return { date: isoDate(r.date.gregorian.date), hijri: normalizeHijri(r.date.hijri), times };
  });
  return { days, timezone: meta.timezone, methodName: meta.method?.name ?? "", school: meta.school };
}

function params(lat: number, lng: number, p: PrayerPrefs) {
  const tune = TUNE_ORDER.map((k) => (p.tune as Record<string, number>)[k] ?? 0).join(",");
  return `latitude=${lat}&longitude=${lng}&method=${p.method}&school=${p.school}&tune=${tune}&iso8601=true`;
}

export async function getMonth(lat: number, lng: number, prefs: PrayerPrefs, year: number, month: number) {
  return normalizeCalendar(await getJson<RawCalendar>(P, `${BASE}/calendar/${year}/${month}?${params(lat, lng, prefs)}`));
}

export async function getHijriMonth(lat: number, lng: number, prefs: PrayerPrefs, hYear: number, hMonth: number) {
  return normalizeCalendar(await getJson<RawCalendar>(P, `${BASE}/hijriCalendar/${hYear}/${hMonth}?${params(lat, lng, prefs)}`));
}

export type Method = { id: number; name: string };
export async function getMethods(): Promise<Method[]> {
  const json = await getJson<{ data: Record<string, { id: number; name?: string }> }>(P, `${BASE}/methods`);
  return Object.values(expect(P, json?.data, "methods"))
    .filter((m): m is Method => typeof m.name === "string" && m.id !== 99)
    .sort((a, b) => a.id - b.id);
}

type RawConvert = { data: { hijri: RawHijri; gregorian: { date: string; weekday: { en: string }; month: { en: string } } } };
export type Conversion = { hijri: HijriDate; gregorian: string; weekday: string };

const convert = (json: RawConvert): Conversion => {
  const d = expect(P, json?.data, "converted date");
  return { hijri: normalizeHijri(d.hijri), gregorian: isoDate(d.gregorian.date), weekday: d.gregorian.weekday.en };
};

// Dates are DD-MM-YYYY, as the API expects.
export const gToH = async (dmy: string, init?: RequestInit) => convert(await getJson<RawConvert>(P, `${BASE}/gToH/${dmy}`, init));
export const hToG = async (dmy: string, init?: RequestInit) => convert(await getJson<RawConvert>(P, `${BASE}/hToG/${dmy}`, init));

export async function gToHCalendar(month: number, year: number, init?: RequestInit) {
  const json = await getJson<{ data: { hijri: RawHijri; gregorian: { date: string } }[] }>(P, `${BASE}/gToHCalendar/${month}/${year}`, init);
  return expect(P, Array.isArray(json?.data) ? json.data : null, "calendar").map((d) => ({ date: isoDate(d.gregorian.date), hijri: normalizeHijri(d.hijri) }));
}
