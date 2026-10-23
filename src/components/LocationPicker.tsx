"use client";

import { useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { searchPlaces, reverse, type Place } from "@/lib/services/nominatim";
import { useLocation } from "@/lib/settings";
import { errorMessage } from "@/lib/http";
import { btn, btnPrimary, input } from "./ui";
import { toast } from "./client";

// Location is only requested after the user presses the button, with the reason stated first.
export default function LocationPicker({ onDone }: { onDone?: () => void }) {
  const [loc, setLoc] = useLocation();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState<"geo" | "search" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (name: string, lat: number, lng: number) => {
    await setLoc({ name, lat: +lat.toFixed(4), lng: +lng.toFixed(4) });
    setResults(null);
    toast(`Location set to ${name}`);
    onDone?.();
  };

  const useGeo = () => {
    setError(null);
    if (!("geolocation" in navigator)) return setError("This browser can't share your location. Search for your city instead.");
    setBusy("geo");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = +coords.latitude.toFixed(4), lng = +coords.longitude.toFixed(4);
        const name = (await reverse(lat, lng)) ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        await choose(name, lat, lng);
        setBusy(null);
      },
      (e) => {
        setBusy(null);
        setError(e.code === e.PERMISSION_DENIED ? "Location permission was denied. Search for your city below instead." : "Couldn't get your location. Search for your city below instead.");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setError(null);
    setBusy("search");
    try {
      setResults(await searchPlaces(q.trim()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {loc && (
        <p className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-[var(--color-primary)]" aria-hidden="true" /> Current: <strong>{loc.name}</strong>
          <span className="text-[var(--color-on-surface)]/60 tabular-nums">({loc.lat}, {loc.lng})</span>
        </p>
      )}
      <div>
        <p className="text-sm text-[var(--color-on-surface)]/75">
          Prayer times and nearby mosques are worked out from your coordinates. Your location is kept only on this device and sent only to the prayer-time and map services.
        </p>
        <button type="button" onClick={useGeo} disabled={busy !== null} className={`${btnPrimary} mt-3`}>
          <LocateFixed size={18} aria-hidden="true" /> {busy === "geo" ? "Locating…" : "Use my current location"}
        </button>
      </div>

      <form onSubmit={search} className="space-y-2" role="search" aria-label="Find a city">
        <label htmlFor="city-q" className="block text-sm font-semibold">Or search for a city</label>
        <div className="flex gap-2">
          <input id="city-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Lahore, Pakistan" autoComplete="address-level2" className={input} />
          <button type="submit" disabled={busy !== null || !q.trim()} className={btn}>
            <Search size={16} aria-hidden="true" /> {busy === "search" ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="text-sm text-[var(--color-error)] font-semibold">{error}</p>}

      {results && (
        results.length ? (
          <ul className="space-y-1" aria-label="Matching places">
            {results.map((r) => (
              <li key={`${r.lat},${r.lng}`}>
                <button type="button" onClick={() => choose(r.name, r.lat, r.lng)} className="w-full text-left p-3 rounded-xl hover:bg-[var(--color-surface-container-low)] cursor-pointer">
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block text-xs text-[var(--color-on-surface)]/60 truncate">{r.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-on-surface)]/70">No places found for &ldquo;{q}&rdquo;. Try adding the country.</p>
        )
      )}
      <p className="text-xs text-[var(--color-on-surface)]/55">City search by OpenStreetMap Nominatim · © OpenStreetMap contributors</p>
    </div>
  );
}
