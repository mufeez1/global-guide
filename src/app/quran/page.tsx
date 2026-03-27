import Link from "next/link";
import { ArrowLeft, Settings2, Bookmark, PlayCircle, Share2 } from "lucide-react";

export default function QuranPage() {
  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-[72px] z-40 bg-[var(--color-surface)]/90 backdrop-blur-[20px] py-6 px-8 border-b border-[var(--color-outline-variant)]/20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 transition-opacity font-body text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Returns
          </Link>
          <div className="text-center">
             <h1 className="font-display text-2xl text-[var(--color-primary)] font-bold tracking-[-0.01em]">Al-Baqarah</h1>
             <p className="font-body text-xs text-[var(--color-on-surface)] opacity-50 font-bold uppercase tracking-widest mt-1">Verse 255 • The Cow</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-[var(--color-surface-container-low)] flex items-center justify-center text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors">
             <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Content - Reading View */}
      <main className="px-8 max-w-4xl mx-auto mt-12">
        <div className="bg-[var(--color-surface-container-lowest)] p-12 md:p-16 rounded-[2rem] shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] relative">
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-bl-[6rem] rounded-tr-[2rem] -z-10"></div>
           
           {/* Actions Bar */}
           <div className="flex justify-between items-center mb-16 border-b border-[var(--color-outline-variant)]/20 pb-6">
              <span className="w-10 h-10 rounded-full border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-body text-sm font-bold">
                 255
              </span>
              <div className="flex gap-4">
                 <button className="text-[var(--color-on-surface)] opacity-40 hover:opacity-100 hover:text-[var(--color-primary)] transition-all">
                    <PlayCircle size={22} />
                 </button>
                 <button className="text-[var(--color-on-surface)] opacity-40 hover:opacity-100 hover:text-[var(--color-primary)] transition-all">
                    <Bookmark size={20} />
                 </button>
                 <button className="text-[var(--color-on-surface)] opacity-40 hover:opacity-100 hover:text-[var(--color-primary)] transition-all">
                    <Share2 size={20} />
                 </button>
              </div>
           </div>
           
           {/* Arabic Text */}
           <div className="mb-12 text-right">
              <h2 className="font-display text-4xl leading-[2.2] md:leading-[2.2] text-[var(--color-on-surface)] tracking-normal rtl break-words" dir="rtl" style={{ fontFamily: "Amiri, Noto Serif, serif" }}>
                 ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ
              </h2>
           </div>

           {/* Translation */}
           <div className="space-y-8 bg-[var(--color-surface-container)]/30 p-8 rounded-[1.5rem]">
              <div>
                 <p className="font-body text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Translation (Sahih International)</p>
                 <p className="font-body text-lg text-[var(--color-on-surface)] opacity-80 leading-relaxed">
                    Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.
                 </p>
              </div>
           </div>
           
        </div>
        
        {/* Navigation Between Verses */}
        <div className="flex justify-between items-center mt-12 bg-[var(--color-surface-container-low)] p-4 rounded-full border border-[var(--color-outline-variant)]/20">
           <button className="flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 font-body text-xs font-bold uppercase tracking-widest transition-opacity px-4 py-2">
              <ArrowLeft size={16} /> Previous
           </button>
           <button className="flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 font-body text-xs font-bold uppercase tracking-widest transition-opacity px-4 py-2">
              Next <ArrowLeft size={16} className="rotate-180" />
           </button>
        </div>
      </main>
    </div>
  );
}
