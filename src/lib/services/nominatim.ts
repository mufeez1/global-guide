import { getJson } from "../http.ts";

const BASE = "https://nominatim.openstreetmap.org";
const P = "OpenStreetMap search";

export type Place = { name: string; detail: string; lat: number; lng: number };

const lang = () => (typeof navigator !== "undefined" ? navigator.language : "en");

// Called only when the user submits a search (Nominatim forbids autocomplete).
export async function searchPlaces(q: string): Promise<Place[]> {
  const rows = await getJson<{ name: string; display_name: string; lat: string; lon: string }[]>(
    P, `${BASE}/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=6&accept-language=${lang()}`
  );
  return (Array.isArray(rows) ? rows : []).map((r) => ({ name: r.name || r.display_name.split(",")[0], detail: r.display_name, lat: +r.lat, lng: +r.lon }));
}

export async function reverse(lat: number, lng: number): Promise<string | undefined> {
  const r = await getJson<{ address?: Record<string, string>; name?: string }>(
    P, `${BASE}/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=10&accept-language=${lang()}`
  ).catch(() => undefined);
  const a = r?.address ?? {};
  return a.city ?? a.town ?? a.village ?? a.municipality ?? r?.name ?? undefined;
}
