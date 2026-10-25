import Player from "./Player";
import Albums from "./Albums";
import { album } from "@/lib/audio";

export const metadata = { title: "Listen - The Global Guide" };

export default async function ListenPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const chapter = Math.min(114, Math.max(1, parseInt(params.chapter || "1") || 1));
  if (!params.reciter || !album(params.reciter)) return <Albums />;

  return <Player initialChapter={chapter} initialReciter={params.reciter} />;
}
