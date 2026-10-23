import audioFiles from "./audio-files.json";

// Folder name in the R2 bucket → label. Both folders use the same filenames.
export const RECITERS: Record<string, string> = {
  "israr-ahmed": "Dr. Israr Ahmed",
  maududi: "Syed Abul A'la Maududi",
};

export const DEFAULT_RECITER = "israr-ahmed";

export function audioUrl(reciter: string, chapter: number) {
  return `${process.env.NEXT_PUBLIC_AUDIO_BASE_URL}/${reciter}/${encodeURIComponent(audioFiles[chapter - 1])}`;
}

// "007 - Al-A'raf (The Heights ) - سورة الأعراف.mp3" → { name, meaning, arabic }
export const SURAHS = audioFiles.map((file, i) => {
  const [, name, meaning, arabic] = file.match(/^\d+ - ([^(]+?)\s*(?:\(\s*(.+?)\s*\))? - (.+)\.mp3$/)!;
  return { number: i + 1, name, meaning: meaning ?? "", arabic };
});
