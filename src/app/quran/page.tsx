import Sidebar from "./Sidebar";
import { Settings, PlayCircle } from "lucide-react";
import { Quran } from "islam.js";

// @ts-ignore - To support both Next.js 14 and 15 Promise resolution
export default async function QuranPage(props: { searchParams: any }) {
  // Handle Next.js 15+ promise searchParams natively or fallback for 14
  const searchParams = await Promise.resolve(props.searchParams);
  const activeChapterNo = parseInt(searchParams?.chapter || "2");
  
  const quran = new Quran();
  const allChapters = quran.getAllChapters();
  const activeChapter = quran.getChapterByIndex(activeChapterNo);
  
  if (!activeChapter) {
    return <div className="p-24 text-center">Chapter not found</div>;
  }

  // Fetch all verses for the active chapter with translation
  const verses = quran.getVerseRangeWithTranslation(activeChapterNo, 1, activeChapter.numberOfVerses);

  return (
    <div className="flex md:h-[calc(100vh-72px)] bg-[var(--color-surface)] items-start">
      {/* Left Sidebar (Client Component for search) */}
      <Sidebar 
        allChapters={allChapters}
        activeChapterNo={activeChapterNo}
      />

      {/* Right Main Content */}
      <main className="flex-1 w-full bg-[var(--color-surface)] relative overflow-y-auto h-full scroll-smooth pt-16">
        <div className="max-w-[900px] mx-auto px-8 md:px-16 pb-32">
          <header className="mb-24">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-[var(--color-outline-variant)]/20 pb-16">
               <div>
                  <h1 className="font-display text-5xl md:text-6xl text-[var(--color-on-surface)] mb-4 tracking-[-0.02em]">Surah {activeChapter.englishName}</h1>
                  <p className="text-[var(--color-on-surface)] opacity-60 text-[15px] font-body">{activeChapter.type} • {activeChapter.numberOfVerses} Verses • Juz 1</p>
               </div>
               <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] opacity-80 text-[11px] font-bold px-4 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors">
                     Sahih International <span className="opacity-50 text-[10px]">▼</span>
                  </div>
                  <div className="border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface)] opacity-80 text-[11px] font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[var(--color-surface-container-low)] transition-colors">
                     <Settings size={14} /> Translation
                  </div>
               </div>
            </div>

            <div className="text-center pt-24 pb-12">
               <h2 className="font-display text-4xl md:text-5xl text-[var(--color-on-surface)] mb-6 leading-loose opacity-90" dir="rtl" >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
               <p className="font-display italic text-[var(--color-on-surface)] opacity-40 text-lg font-medium">In the name of Allah, the Entirely Merciful, the Especially Merciful</p>
            </div>
          </header>

          <div className="space-y-16">
            {verses.map((v, idx) => {
               const verseNo = idx + 1;
               const isHighlighted = verseNo === 1; // Highlight the first verse just like the design
               return (
                 <div key={verseNo} className={`p-8 md:p-14 rounded-[2rem] transition-colors ${isHighlighted ? 'bg-[#F9F6E8]' : 'hover:bg-[var(--color-surface-container-low)]/50'}`}>
                    
                    <div className="flex flex-row-reverse justify-between items-start mb-12 w-full gap-8">
                       <div className="flex-1 text-right">
                          <p className="font-display text-[2.5rem] md:text-[2rem] text-[var(--color-on-surface)] leading-[2.2] md:leading-[2.5] inline-block rtl" dir="rtl" style={{  wordSpacing: "0.15em" }}>
                             {v.verse}
                          </p>
                       </div>
                       <div className="flex items-center gap-4 shrink-0 mt-4">
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${isHighlighted ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] opacity-70'}`}>
                             {verseNo}
                          </span>
                       </div>
                    </div>

                    <div className={`mt-8 relative max-w-2xl ${isHighlighted ? 'pl-8' : 'pt-10'}`}>
                       {isHighlighted && <div className="absolute left-0 top-2 bottom-0 w-[3px] bg-[var(--color-outline-variant)]/40 rounded-full"></div>}
                       
                       <p className="font-body text-[19px] text-[var(--color-on-surface)] opacity-[0.85] leading-[1.8] mb-8">
                          {v.translation}
                       </p>
                       <p className="text-[11px] text-[var(--color-on-surface)] opacity-40 uppercase tracking-widest font-bold">
                          — SAHIH INTERNATIONAL
                       </p>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
