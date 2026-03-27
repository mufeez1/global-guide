"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Sidebar({ allChapters, activeChapterNo }: { allChapters: any[], activeChapterNo: number }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChapters = allChapters.filter(c => 
    c.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.includes(searchQuery) ||
    String(c.number).includes(searchQuery)
  );

  return (
    <aside className="hidden lg:flex flex-col w-[360px] shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto border-r border-[var(--color-outline-variant)]/20 px-8 py-10 bg-[var(--color-surface)] z-10 custom-scrollbar">
      <div className="mb-10 pl-2">
        <h2 className="text-[var(--color-primary)] font-display text-2xl mb-2 tracking-[-0.01em]">Navigation</h2>
        <p className="text-[var(--color-on-surface)] opacity-50 text-[11px] font-bold uppercase tracking-widest">Explore the Wisdom</p>
      </div>
      
      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
           <Search size={18} className="text-[var(--color-on-surface)] opacity-40" />
        </div>
        <input 
           type="text" 
           placeholder="Search Surahs..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface)] placeholder:opacity-40 rounded-[1rem] py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-body text-sm"
        />
      </div>

      <div className="mb-6 flex justify-between items-center pl-2 pr-2">
        <h3 className="text-[var(--color-on-surface)] opacity-50 text-[11px] font-bold uppercase tracking-widest">Surahs</h3>
        <span className="bg-[var(--color-primary-container)] text-[var(--color-primary)] text-[10px] font-bold px-3 py-1 rounded-full">{filteredChapters.length} Total</span>
      </div>

      <div className="space-y-3">
        {filteredChapters.length > 0 ? (
          filteredChapters.map(c => {
            const isActive = c.number === activeChapterNo;
            return (
              <Link scroll={false} href={`/quran?chapter=${c.number}`} key={c.number} className={`block p-5 rounded-[1.25rem] transition-all duration-300 ${isActive ? 'bg-[var(--color-surface-container-lowest)] card-shadow translate-x-1' : 'hover:bg-[var(--color-surface-container-low)]'}`}>
                 <div className="flex justify-between items-start mb-2">
                   <span className={`text-xs font-bold ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)] opacity-40'}`}>{String(c.number).padStart(3, '0')}</span>
                   <span className={`font-display text-xl rtl ${isActive ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface)] opacity-80'}`} dir="rtl" style={{ fontFamily: "Amiri, Noto Serif, serif" }}>{c.name}</span>
                 </div>
                 <h4 className={`font-bold text-[15px] ${isActive ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface)] opacity-80'}`}>{c.englishName}</h4>
                 <p className="text-[10px] text-[var(--color-on-surface)] opacity-50 uppercase tracking-widest mt-1.5">{c.type} • {c.numberOfVerses} Verses</p>
              </Link>
            )
          })
        ) : (
          <div className="text-center py-10 opacity-50 text-[var(--color-on-surface)] text-sm font-bold">
            No Surahs found
          </div>
        )}
      </div>
    </aside>
  );
}
