# The Global Guide — Islamic Companion

Next.js 16 (App Router) app: Quran with Urdu translations, recitation and tafsir; prayer times; hadith; duas and azkar; Hijri calendar; Ramadan timetable; 99 Names; tasbeeh; mosque finder; search. No backend or accounts — personal data stays in the browser (IndexedDB).

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Environment (`.env.local`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_AUDIO_BASE_URL` | Base URL of the full-surah audio bucket (Listen page and the Quran audio bar) |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and robots (defaults to `http://localhost:3000`) |

No API keys are needed: every provider used is public.

## Check

```bash
npm run lint
npm run typecheck
npm test             # Node's built-in test runner; remote APIs are mocked
npm run build
```

The service worker (`public/sw.js`) registers only in production builds.

## Layout

- `src/lib/services/*` — one adapter per provider (`aladhan`, `quran-cloud`, `quran-foundation`, `hadith`, `ummah-api`, `overpass`, `nominatim`). Each validates and normalises responses; UI never calls `fetch` directly.
- `src/lib/http.ts` — shared fetch with timeout and readable errors (`ProviderError`).
- `src/lib/db.ts` — IndexedDB (versioned stores: `cache`, `bookmarks`, `counters`, `tasbeehDaily`, `sessions`, `kv`), export/import, recovery.
- `src/lib/cache.ts` — `cached()` / `useCached()`: fresh cache → network → stale copy (flagged), never invented data.
- `src/lib/sources.ts` — source registry (licence, auth, limits, Urdu availability, date checked), shown at `/sources`.
- `src/lib/prayer.ts`, `src/lib/tasbeeh.ts` — pure logic, covered by `tests/`.

Server pages (Quran, hadith, duas, names, calendar, search) fetch with Next's data cache. Location-dependent features (prayer times, Ramadan, mosques) run on the client and cache in IndexedDB so they work offline.
