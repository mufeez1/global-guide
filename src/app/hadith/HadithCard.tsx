import { BOOKS, type Hadith } from "@/lib/services/hadith";
import { BookmarkButton, CopyButton, ShareButton } from "@/components/client";
import { Arabic, Urdu } from "@/components/ui";

export default function HadithCard({ book, section, h, id }: { book: string; section?: number; h: Hadith; id?: string }) {
  const name = BOOKS[book]?.name ?? book;
  const ref = `${name} ${h.number}`;
  const href = section ? `/hadith/${book}/${section}#h${h.number}` : `/hadith/${book}`;
  const text = [h.arabic, h.english, h.urdu, `— ${ref}`].filter(Boolean).join("\n\n");
  return (
    <article id={id} data-h className="scroll-mt-28 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-5 sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {name} <span className="tabular-nums">· Hadith {h.number}</span>
          {h.reference && <span className="ml-2 text-xs font-normal text-[var(--color-on-surface)]/60">Book {h.reference.book}, No. {h.reference.hadith}</span>}
        </h3>
        <div className="no-print flex">
          <BookmarkButton item={{ id: `hadith:${book}:${h.number}`, kind: "hadith", title: ref, text: h.english ?? h.urdu ?? h.arabic ?? "", href }} label="Bookmark hadith" />
          <CopyButton text={text} label="Copy hadith" />
          <ShareButton title={ref} text={text} url={href} label="Share hadith" />
        </div>
      </header>
      {h.arabic && <Arabic className="mt-4 text-2xl leading-[2]">{h.arabic}</Arabic>}
      {h.urdu && <Urdu className="mt-4 text-[var(--color-on-surface)]/85">{h.urdu}</Urdu>}
      {h.english && <p className="mt-4 text-[17px] leading-[1.8] text-[var(--color-on-surface)]/85 max-w-prose">{h.english}</p>}
      {h.grades.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-2 text-xs">
          {h.grades.map((g) => (
            <div key={g.name} className="px-3 py-1.5 rounded-full bg-[var(--color-surface-container-low)]">
              <dt className="inline text-[var(--color-on-surface)]/65">{g.name}: </dt>
              <dd className="inline font-semibold">{g.grade}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
