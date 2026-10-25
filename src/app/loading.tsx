import { Skeleton } from "@/components/ui";

// Fallback for every route without its own loading.tsx: page header + content cards.
export default function Loading() {
  return (
    <div role="status" className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 md:pt-14 pb-24">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-11 w-3/4 max-w-md" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-2 h-5 w-2/3 max-w-xl" />
      <Skeleton className="mt-10 h-48 rounded-3xl" />
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
      </div>
    </div>
  );
}
