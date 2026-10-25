import audioFiles from "./audio-files.json";

const pad = (n: number) => String(n).padStart(3, "0");
const r2 = (folder: string) => (n: number) => `${process.env.NEXT_PUBLIC_AUDIO_BASE_URL}/${folder}/${encodeURIComponent(audioFiles[n - 1])}`;
const qdc = (path: string) => (n: number) => `https://download.quranicaudio.com/qdc/${path}/${n}.mp3`;
const mp3quran = (path: string) => (n: number) => `https://cdn.mp3quran.net/audio/${path}/r1/${pad(n)}.mp3`;

export type Album = {
  slug: string;
  name: string;
  native: string; // name in the reciter's own script (Urdu for tafseer, Arabic for tilawat)
  kind: "tafseer" | "tilawat";
  style: string;
  colors: [string, string]; // cover gradient
  url: (chapter: number) => string;
};

// Every URL pattern checked for surahs 1 and 114 (200 + CORS) on 2026-10-25.
export const ALBUMS: Album[] = [
  { slug: "israr-ahmed", name: "Dr. Israr Ahmed", native: "ڈاکٹر اسرار احمد", kind: "tafseer", style: "Urdu tafseer", colors: ["#1B6D24", "#0B2E14"], url: r2("israr-ahmed") },
  { slug: "maududi", name: "Syed Abul A'la Maududi", native: "سید ابوالاعلیٰ مودودی", kind: "tafseer", style: "Urdu tafseer", colors: ["#8A6D1F", "#3A2A06"], url: r2("maududi") },
  { slug: "alafasy", name: "Mishary Rashid Alafasy", native: "مشاري راشد العفاسي", kind: "tilawat", style: "Murattal · Kuwait", colors: ["#0E4D64", "#06222E"], url: qdc("mishari_al_afasy/murattal") },
  { slug: "abdul-basit-mujawwad", name: "Abdul Basit Abdus Samad", native: "عبد الباسط عبد الصمد", kind: "tilawat", style: "Mujawwad · Egypt", colors: ["#6B2D5C", "#2A0F24"], url: qdc("abdul_baset/mujawwad") },
  { slug: "abdul-basit", name: "Abdul Basit Abdus Samad", native: "عبد الباسط عبد الصمد", kind: "tilawat", style: "Murattal · Egypt", colors: ["#7A3B2E", "#2E120C"], url: qdc("abdul_baset/murattal") },
  { slug: "sudais", name: "Abdur-Rahman as-Sudais", native: "عبد الرحمن السديس", kind: "tilawat", style: "Murattal · Makkah", colors: ["#2E4A7A", "#0F1A2E"], url: qdc("abdurrahmaan_as_sudais/murattal") },
  { slug: "shuraim", name: "Saud ash-Shuraim", native: "سعود الشريم", kind: "tilawat", style: "Murattal · Makkah", colors: ["#3D5A4A", "#13201A"], url: mp3quran("saud-shuraim") },
  { slug: "maher", name: "Maher al-Muaiqly", native: "ماهر المعيقلي", kind: "tilawat", style: "Murattal · Makkah", colors: ["#5A3E8A", "#1E1330"], url: mp3quran("maher-muaiqly") },
  { slug: "dossari", name: "Yasser ad-Dossari", native: "ياسر الدوسري", kind: "tilawat", style: "Murattal · Makkah", colors: ["#1F6B6B", "#0A2626"], url: mp3quran("yasser-dosari") },
  { slug: "husary", name: "Mahmoud Khalil al-Husary", native: "محمود خليل الحصري", kind: "tilawat", style: "Murattal · Egypt", colors: ["#8A4B1F", "#2E1806"], url: qdc("khalil_al_husary/murattal") },
  { slug: "minshawi", name: "Muhammad Siddiq al-Minshawi", native: "محمد صديق المنشاوي", kind: "tilawat", style: "Murattal · Egypt", colors: ["#4A5A1F", "#1A2008"], url: qdc("siddiq_minshawi/murattal") },
  { slug: "rifai", name: "Hani ar-Rifai", native: "هاني الرفاعي", kind: "tilawat", style: "Murattal · Saudi Arabia", colors: ["#7A2E3D", "#2E0F16"], url: qdc("hani_ar_rifai/murattal") },
  { slug: "shatri", name: "Abu Bakr ash-Shatri", native: "أبو بكر الشاطري", kind: "tilawat", style: "Murattal · Saudi Arabia", colors: ["#2E6B8A", "#0C2430"], url: qdc("abu_bakr_shatri/murattal") },
];

export const album = (slug: string) => ALBUMS.find((a) => a.slug === slug);

// Urdu tafseer pair used beside the Quran reader.
export const RECITERS: Record<string, string> = Object.fromEntries(ALBUMS.filter((a) => a.kind === "tafseer").map((a) => [a.slug, a.name]));

export const DEFAULT_RECITER = "israr-ahmed";

export function audioUrl(reciter: string, chapter: number) {
  return (album(reciter) ?? album(DEFAULT_RECITER)!).url(chapter);
}

// "007 - Al-A'raf (The Heights ) - سورة الأعراف.mp3" → { name, meaning, arabic }
export const SURAHS = audioFiles.map((file, i) => {
  const [, name, meaning, arabic] = file.match(/^\d+ - ([^(]+?)\s*(?:\(\s*(.+?)\s*\))? - (.+)\.mp3$/)!;
  return { number: i + 1, name, meaning: meaning ?? "", arabic };
});
