// Source registry: what each provider supplies, its terms, and what we verified.
// "checked" is the date the endpoints below were called and inspected for this app.

export type SourceId =
  | "aladhan" | "alquran-cloud" | "tanzil" | "islamic-network-audio" | "quran-com" | "hadith-api"
  | "ummah-api" | "hisn-muslim" | "islam-js" | "overpass" | "osm-tiles" | "nominatim" | "r2-audio";

export type Source = {
  name: string;
  url: string;
  data: string;
  auth: string;
  rateLimit: string;
  attribution: string;
  license: string;
  urdu: string;
  audio?: string;
  checked: string;
};

const CHECKED = "2026-10-23";

export const SOURCES: Record<SourceId, Source> = {
  aladhan: {
    name: "Aladhan API",
    url: "https://aladhan.com/prayer-times-api",
    data: "Prayer times (daily, monthly, Hijri-month), calculation methods, Gregorian↔Hijri conversion, Hijri calendar and holidays",
    auth: "None",
    rateLimit: "12 requests/second (from ratelimit response headers)",
    attribution: "Credit Aladhan / Islamic Network",
    license: "Free public API; no published redistribution licence found",
    urdu: "Not applicable (times and dates)",
    checked: CHECKED,
  },
  "alquran-cloud": {
    name: "AlQuran Cloud API",
    url: "https://alquran.cloud/api",
    data: "Quran text editions, translations, verse-by-verse audio URLs, Juz/page metadata, search",
    auth: "None",
    rateLimit: "Not published",
    attribution: "Credit AlQuran Cloud and the named translator for each translation",
    license: "Free API; each translation keeps its own copyright, held by its translator or publisher",
    urdu: "Yes — 8 Urdu text translations (e.g. ur.jalandhry, ur.maududi, ur.junagarhi)",
    checked: CHECKED,
  },
  tanzil: {
    name: "Tanzil Quran Text (Simple Enhanced)",
    url: "https://tanzil.net/docs/text_license",
    data: "Arabic Quran text, served through AlQuran Cloud as quran-simple-enhanced",
    auth: "None",
    rateLimit: "—",
    attribution: "Tanzil Project licence: credit Tanzil and do not modify the text",
    license: "Creative Commons Attribution 3.0, verbatim copies only",
    urdu: "—",
    checked: CHECKED,
  },
  "islamic-network-audio": {
    name: "Islamic Network audio CDN",
    url: "https://alquran.cloud/api",
    data: "Verse-by-verse recitation MP3s (URLs returned by AlQuran Cloud audio editions)",
    auth: "None",
    rateLimit: "Not published",
    attribution: "Credit the reciter and AlQuran Cloud / Islamic Network",
    license: "Streaming only; no download or redistribution rights verified, so offline download is not offered",
    urdu: "ur.khan (Shamshad Ali Khan) audio translation exists; not used",
    audio: "Streaming",
    checked: CHECKED,
  },
  "quran-com": {
    name: "Quran.com API v4",
    url: "https://api-docs.quran.com/",
    data: "Tafsir by verse (Urdu, Arabic, English editions)",
    auth: "None for api.quran.com/api/v4 at time of checking. Quran Foundation's newer Content API uses OAuth2 client credentials, so this may change.",
    rateLimit: "Not published",
    attribution: "Credit Quran.com and the tafsir author",
    license: "Tafsir texts belong to their authors or publishers; shown for personal reading with attribution",
    urdu: "Yes — Tafsir Ibn Kathir (160), Bayan ul Quran (159), Tazkir ul Quran (818), Fi Zilal al-Quran (157)",
    checked: CHECKED,
  },
  "hadith-api": {
    name: "Hadith API (fawazahmed0)",
    url: "https://github.com/fawazahmed0/hadith-api",
    data: "Hadith collections by book and section, in Arabic, English and Urdu, with grades where supplied",
    auth: "None (served by the jsDelivr CDN)",
    rateLimit: "jsDelivr fair use",
    attribution: "Credit the collection and the Hadith API project",
    license: "Repository released under the Unlicense; the underlying translations may carry their own rights",
    urdu: "Yes — Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Malik",
    checked: CHECKED,
  },
  "ummah-api": {
    name: "UmmahAPI",
    url: "https://ummahapi.com/",
    data: "Duas with transliteration, translation, source and repeat count; 99 Names of Allah; Hadith search",
    auth: "None",
    rateLimit: "5000 requests per 15 minutes (from ratelimit response headers)",
    attribution: "Credit UmmahAPI and the source listed on each item",
    license: "No licence or redistribution terms published; treat as display-only",
    urdu: "No — English only for duas and names",
    checked: CHECKED,
  },
  "hisn-muslim": {
    name: "Hisn al-Muslim (bundled in islam.js)",
    url: "https://github.com/dev-ahmadbilal/islam.js",
    data: "134 categories of Arabic azkar with repeat count and hadith reference, available offline",
    auth: "None (bundled npm data)",
    rateLimit: "—",
    attribution: "Hisn al-Muslim by Sa'id ibn Wahf al-Qahtani, via islam.js (MIT)",
    license: "islam.js is MIT-licensed; its author says the data is not an authoritative source",
    urdu: "No — Arabic only",
    checked: CHECKED,
  },
  "islam-js": {
    name: "islam.js (bundled offline data)",
    url: "https://github.com/dev-ahmadbilal/islam.js",
    data: "Arabic Quran text and Sahih International translation (surahquran.com dataset), used offline and as a fallback",
    auth: "None (bundled npm data)",
    rateLimit: "—",
    attribution: "islam.js (MIT) and its listed sources",
    license: "MIT package; its author says the data is not an authoritative source",
    urdu: "Bundled Urdu translation has no named translator, so it isn't shown",
    checked: CHECKED,
  },
  overpass: {
    name: "Overpass API (OpenStreetMap)",
    url: "https://wiki.openstreetmap.org/wiki/Overpass_API",
    data: "Mosques mapped as amenity=place_of_worship + religion=muslim",
    auth: "None",
    rateLimit: "Shared public instances: about 10,000 queries/day and 1 GB/day. We query only on demand and fall back to the VK Maps instance if overpass-api.de is overloaded.",
    attribution: "© OpenStreetMap contributors",
    license: "ODbL 1.0",
    urdu: "Names as mapped",
    checked: CHECKED,
  },
  "osm-tiles": {
    name: "OpenStreetMap standard tiles",
    url: "https://operations.osmfoundation.org/policies/tiles/",
    data: "Map imagery",
    auth: "None",
    rateLimit: "Tile usage policy: light use only, no bulk download or offline prefetch",
    attribution: "© OpenStreetMap contributors",
    license: "ODbL data; tiles under the OSMF tile usage policy",
    urdu: "—",
    checked: CHECKED,
  },
  nominatim: {
    name: "Nominatim (OpenStreetMap geocoding)",
    url: "https://operations.osmfoundation.org/policies/nominatim/",
    data: "City search and coordinate → place name",
    auth: "None",
    rateLimit: "At most 1 request per second; no autocomplete (we search only when you submit)",
    attribution: "© OpenStreetMap contributors",
    license: "ODbL 1.0",
    urdu: "Place names follow your browser language",
    checked: CHECKED,
  },
  "r2-audio": {
    name: "Project audio library",
    url: "/listen",
    data: "Full-surah audio by Dr. Israr Ahmed and Syed Abul A'la Maududi, hosted by this site",
    auth: "—",
    rateLimit: "—",
    attribution: "As listed in the player",
    license: "Hosted by the site owner",
    urdu: "Audio",
    audio: "Streaming",
    checked: CHECKED,
  },
};
