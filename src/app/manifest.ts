import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Global Guide — Quran, Prayer Times & Duas",
    short_name: "Global Guide",
    description: "Quran with Urdu translation, prayer times, hadith, duas, tasbeeh and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#1B6D24",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
