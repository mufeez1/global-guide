// Dark like the album grid and the player, so either one swaps in without a flash.
export default function Loading() {
  const box = "animate-pulse rounded-2xl bg-white/[0.06]";
  return (
    <div role="status" className="min-h-[calc(100dvh-72px)] bg-[radial-gradient(ellipse_at_top,#0f2a14_0%,#07130a_55%,#030805_100%)]">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true" className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-24">
        <div className={`${box} h-3 w-16`} />
        <div className={`${box} mt-4 h-11 w-72 max-w-full`} />
        <div className={`${box} mt-4 h-5 w-full max-w-xl`} />
        <div className={`${box} mt-14 h-7 w-40`} />
        <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-12">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <div className={`${box} aspect-square`} />
              <div className={`${box} mt-4 h-4 w-3/4`} />
              <div className={`${box} mt-2 h-3 w-1/2`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
