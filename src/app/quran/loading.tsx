import { Skeleton } from "@/components/ui";

// Mirrors the reader: surah list, green surah header, then verses (Arabic line + translation).
export default function Loading() {
  return (
    <div role="status" className="flex items-start bg-[var(--color-surface)]">
      <span className="sr-only">Loading surah…</span>
      <aside aria-hidden="true" className="hidden lg:flex flex-col w-80 shrink-0 sticky top-[72px] h-[calc(100dvh-72px)] border-r border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)] p-5 gap-3">
        <Skeleton className="h-11" />
        {Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-14" />)}
      </aside>
      <div className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-8 md:pt-14 pb-40">
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-hero)] h-64 md:h-72 animate-pulse">
            <div aria-hidden="true" className="absolute inset-0 pattern-star opacity-30" />
          </div>
          <div className="mt-10 space-y-10">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-10 w-5/6 ms-auto" />
                <Skeleton className="h-10 w-2/3 ms-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
