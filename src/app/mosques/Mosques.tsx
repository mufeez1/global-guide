"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Navigation2, MapPin, Search, ExternalLink, List, Map as MapIcon } from "lucide-react";
import { useLocation } from "@/lib/settings";
import { DAY, useCached } from "@/lib/cache";
import { findMosques } from "@/lib/services/overpass";
import LocationPicker from "@/components/LocationPicker";
import { Dialog } from "@/components/client";
import { Attribution, Empty, ErrorState, Skeleton, btn, btnPrimary, card } from "@/components/ui";
import Select from "@/components/Select";

const MosqueMap = dynamic(() => import("./MosqueMap"), { ssr: false, loading: () => <Skeleton className="h-[50dvh] lg:h-[70dvh]" /> });

const RADII = [1000, 2000, 5000, 10000];
const km = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);

export default function Mosques() {
  const [loc, , ready] = useLocation();
  const [radius, setRadius] = useState(2000);
  // Search point: starts at the saved location, moves only when "Search this area" is pressed.
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const at = point ?? (loc ? { lat: loc.lat, lng: loc.lng } : null);
  const key = at ? `mosques:${at.lat.toFixed(3)},${at.lng.toFixed(3)}:${radius}` : null;
  const [state, retry] = useCached(key, 7 * DAY, () => findMosques(at!.lat, at!.lng, radius));
  const onMove = useCallback((c: { lat: number; lng: number }) => setMapCenter(c), []);
  const moved = mapCenter && at && Math.abs(mapCenter.lat - at.lat) + Math.abs(mapCenter.lng - at.lng) > 0.004;

  if (!ready) return <div className="max-w-6xl mx-auto px-4 sm:px-8"><Skeleton className="h-96" /></div>;
  if (!loc && !point)
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-8 pb-24">
        <div className={`${card} p-6 sm:p-8`}><h2 className="font-display text-2xl">Where should we look?</h2><div className="mt-5"><LocationPicker /></div></div>
      </section>
    );

  const list = state.status === "ready" ? state.data : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
      <div className="flex flex-wrap items-end gap-2">
        <button type="button" className={btn} onClick={() => setPicker(true)}><MapPin size={16} aria-hidden="true" /> {point ? "Map area" : loc!.name}</button>
        <Select label="Search radius" hideLabel className="w-40" value={radius} onChange={setRadius} options={RADII.map((r) => ({ value: r, label: `Within ${r / 1000} km` }))} />
        {point && loc && <button type="button" className={btn} onClick={() => setPoint(null)}>Back to {loc.name}</button>}
        <div className="ml-auto flex lg:hidden rounded-xl border border-[var(--color-outline-variant)]/70 overflow-hidden" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={`min-h-11 px-4 inline-flex items-center gap-2 text-sm font-semibold cursor-pointer ${view === "list" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : ""}`}><List size={16} aria-hidden="true" /> List</button>
          <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")} className={`min-h-11 px-4 inline-flex items-center gap-2 text-sm font-semibold cursor-pointer ${view === "map" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : ""}`}><MapIcon size={16} aria-hidden="true" /> Map</button>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[22rem_1fr] gap-6 items-start">
        <section aria-label="Mosques" className={view === "map" ? "hidden lg:block" : ""}>
          {state.status === "loading" && <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>}
          {state.status === "error" && <ErrorState message={state.error} retry={<button className={btn} onClick={retry}>Try again</button>} />}
          {state.status === "ready" && (
            list.length ? (
              <>
                <p className="text-sm text-[var(--color-on-surface)]/70" aria-live="polite">{list.length} mapped mosque{list.length === 1 ? "" : "s"} within {radius / 1000} km</p>
                <ul className="mt-3 space-y-2 lg:max-h-[64dvh] lg:overflow-y-auto pr-1">
                  {list.map((m) => (
                    <li key={m.id}>
                      <div className={`rounded-2xl border p-4 transition-colors ${m.id === selected ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]/30" : "border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)]"}`}>
                        <button type="button" onClick={() => { setSelected(m.id); setView("map"); }} className="w-full text-left cursor-pointer">
                          <span className="block font-semibold">{m.name ?? <span className="italic text-[var(--color-on-surface)]/65">Name not mapped</span>}</span>
                          <span className="block text-sm text-[var(--color-on-surface)]/65">{km(m.distanceKm)} away{m.address && ` · ${m.address}`}</span>
                        </button>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary)] hover:underline"><Navigation2 size={14} aria-hidden="true" /> Directions</a>
                          <a href={m.osmUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--color-on-surface)]/70 hover:underline"><ExternalLink size={14} aria-hidden="true" /> OpenStreetMap</a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : <Empty>No mosques are mapped within {radius / 1000} km here. Try a bigger radius, or add missing mosques on OpenStreetMap.</Empty>
          )}
          {state.status === "ready" && <Attribution ids={["overpass"]} fetchedAt={state.fetchedAt} fromCache={state.fromCache} stale={state.stale} />}
        </section>

        <section className={`relative ${view === "list" ? "hidden lg:block" : ""}`}>
          {at && <MosqueMap center={at} mosques={list} selected={selected} onSelect={setSelected} onMove={onMove} />}
          {moved && (
            <button type="button" onClick={() => { setPoint(mapCenter); setSelected(null); }} className={`${btnPrimary} absolute top-3 left-1/2 -translate-x-1/2 z-[500] shadow-lg`}>
              <Search size={16} aria-hidden="true" /> Search this area
            </button>
          )}
          <p className="mt-2 text-xs text-[var(--color-on-surface)]/60">Only places tagged as mosques on OpenStreetMap are shown; opening hours and jama&apos;at times aren&apos;t mapped.</p>
        </section>
      </div>

      <Dialog open={picker} onClose={() => setPicker(false)} title="Location">
        <LocationPicker onDone={() => { setPoint(null); setPicker(false); }} />
      </Dialog>
    </div>
  );
}
