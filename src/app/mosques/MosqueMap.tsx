"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Mosque } from "@/lib/services/overpass";

// Circle markers avoid Leaflet's bundled marker images, which break under bundlers.
export default function MosqueMap({ center, mosques, selected, onSelect, onMove }: {
  center: { lat: number; lng: number };
  mosques: Mosque[];
  selected: string | null;
  onSelect: (id: string) => void;
  onMove: (c: { lat: number; lng: number }) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const reportMove = useEffectEvent((c: { lat: number; lng: number }) => onMove(c));

  useEffect(() => {
    const m = L.map(el.current!, { scrollWheelZoom: false }).setView([center.lat, center.lng], 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    // Only report where the map is; searching stays an explicit button press.
    m.on("moveend", () => { const c = m.getCenter(); reportMove({ lat: c.lat, lng: c.lng }); });
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    // The map may start hidden (mobile list view); re-measure when it becomes visible.
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current!);
    return () => { ro.disconnect(); m.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    map.current?.setView([center.lat, center.lng], map.current.getZoom());
  }, [center.lat, center.lng]);

  useEffect(() => {
    const g = layer.current!;
    g.clearLayers();
    L.circleMarker([center.lat, center.lng], { radius: 7, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).bindTooltip("Search centre").addTo(g);
    for (const ms of mosques) {
      const on = ms.id === selected;
      L.circleMarker([ms.lat, ms.lng], { radius: on ? 10 : 7, color: "#fff", weight: 2, fillColor: on ? "#8A6D1F" : "#1B6D24", fillOpacity: 1 })
        .bindTooltip(ms.name ?? "Unnamed mosque")
        .on("click", () => onSelect(ms.id))
        .addTo(g);
    }
  }, [mosques, selected, center.lat, center.lng, onSelect]);

  useEffect(() => {
    const ms = mosques.find((m) => m.id === selected);
    if (ms) map.current?.panTo([ms.lat, ms.lng]);
  }, [selected, mosques]);

  return <div ref={el} className="h-[50dvh] lg:h-[70dvh] w-full rounded-3xl overflow-hidden border border-[var(--color-outline-variant)]/40 z-0" role="region" aria-label="Map of nearby mosques" />;
}
