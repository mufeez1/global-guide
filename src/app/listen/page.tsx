import Player from "./Player";
import { RECITERS, DEFAULT_RECITER } from "@/lib/audio";

export const metadata = { title: "Listen - The Global Guide" };

export default async function ListenPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const chapter = Math.min(114, Math.max(1, parseInt(params.chapter || "1") || 1));
  const reciter = params.reciter && params.reciter in RECITERS ? params.reciter : DEFAULT_RECITER;

  return <Player initialChapter={chapter} initialReciter={reciter} />;
}
