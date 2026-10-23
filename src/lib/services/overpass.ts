import { getJson } from "../http.ts";

// Main public instance first; the VK Maps instance (listed on the OSM wiki) only if it fails or is overloaded.
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"];
const P = "Overpass (OpenStreetMap)";

export type Mosque = { id: string; name?: string; lat: number; lng: number; distanceKm: number; address?: string; denomination?: string; osmUrl: string };

type El = { type: "node" | "way" | "relation"; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export const mosqueQuery = (lat: number, lng: number, radiusM: number) =>
  `[out:json][timeout:25];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lng});out center tags;`;

// Nodes carry lat/lon; ways and relations carry a computed `center`.
export function parseMosques(json: { elements?: El[] }, lat: number, lng: number): Mosque[] {
  return (json?.elements ?? [])
    .map((e): Mosque | null => {
      const p = e.type === "node" ? { lat: e.lat, lon: e.lon } : e.center;
      if (p?.lat == null || p?.lon == null) return null;
      const t = e.tags ?? {};
      const address = [t["addr:housenumber"], t["addr:street"], t["addr:city"]].filter(Boolean).join(", ") || undefined;
      return {
        id: `${e.type}/${e.id}`,
        name: t.name ?? t["name:en"],
        lat: p.lat, lng: p.lon,
        distanceKm: haversineKm(lat, lng, p.lat, p.lon),
        address,
        denomination: t.denomination,
        osmUrl: `https://www.openstreetmap.org/${e.type}/${e.id}`,
      };
    })
    .filter((m): m is Mosque => m !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function findMosques(lat: number, lng: number, radiusM: number) {
  const init = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: `data=${encodeURIComponent(mosqueQuery(lat, lng, radiusM))}`,
  };
  let lastError: unknown;
  for (const url of ENDPOINTS) {
    try {
      return parseMosques(await getJson<{ elements?: El[] }>(P, url, init, 25000), lat, lng);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
