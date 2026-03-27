import Link from "next/link";
import { ArrowLeft, Search, Book, Library } from "lucide-react";

export default function HadithPage() {
  const collections = [
    { title: "Sahih Bukhari", count: "7,563 Hadiths", color: "bg-[var(--color-primary)]", text: "text-[var(--color-on-primary)]" },
    { title: "Sahih Muslim", count: "3,033 Hadiths", color: "bg-[var(--color-surface-container-lowest)]", text: "text-[var(--color-on-surface)]" },
    { title: "Sunan an-Nasa'i", count: "5,758 Hadiths", color: "bg-[var(--color-surface-container-lowest)]", text: "text-[var(--color-on-surface)]" },
    { title: "Sunan Abu Dawud", count: "5,274 Hadiths", color: "bg-[var(--color-surface-container-lowest)]", text: "text-[var(--color-on-surface)]" },
    { title: "Jami' at-Tirmidhi", count: "3,956 Hadiths", color: "bg-[var(--color-surface-container-lowest)]", text: "text-[var(--color-on-surface)]" },
    { title: "Sunan Ibn Majah", count: "4,341 Hadiths", color: "bg-[var(--color-surface-container-lowest)]", text: "text-[var(--color-on-surface)]" },
  ];

  return (
    <div className="pb-24">
      {/* Header and Hero */}
      <header className="pt-16 pb-12 px-8 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 transition-opacity font-body text-sm font-bold uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Returns
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-end mb-12">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl md:text-6xl text-[var(--color-on-surface)] leading-[1.1] tracking-[-0.02em] mb-4">
              Hadith <span className="text-[var(--color-primary)]">Explorer</span>
            </h1>
            <p className="font-body text-lg text-[var(--color-on-surface)] opacity-70 leading-relaxed">
              Discover the profound wisdom, actions, and approvals of the Prophet Muhammad (ﷺ). Authentic collections carefully organized for your study.
            </p>
          </div>
          <div className="bg-[var(--color-surface-container-low)] px-6 py-4 rounded-[1rem] flex items-center gap-4">
             <Library size={20} className="text-[var(--color-primary)]" />
             <span className="font-body text-sm font-bold text-[var(--color-on-surface)]">6 Major Books</span>
          </div>
        </div>
        
        <div className="relative">
           <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search size={22} className="text-[var(--color-on-surface)] opacity-40 shadow-sm" />
           </div>
           <input 
             type="text" 
             placeholder="Search narrators, topics, or exact text..." 
             className="w-full bg-[var(--color-surface-container-lowest)] border-none rounded-[1.5rem] py-6 pl-16 pr-8 font-body text-lg shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)] focus:ring-[1px] focus:ring-[var(--color-primary)]/20 outline-none transition-all placeholder:text-[var(--color-on-surface)]/30 text-[var(--color-on-surface)]"
           />
        </div>
      </header>

      {/* Collections Grid */}
      <main className="px-8 max-w-5xl mx-auto mt-8">
         <h2 className="font-display text-3xl text-[var(--color-on-surface)] mb-8 tracking-[-0.01em]">The Sihah Sitta (Authentic Six)</h2>
         
         <div className="grid md:grid-cols-2 gap-8">
            {collections.map((col, idx) => (
              <div key={idx} className={`p-10 rounded-[1.5rem] group cursor-pointer transition-transform duration-300 hover:-translate-y-2 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] ${col.color} ${col.text} flex flex-col relative overflow-hidden`}>
                 {idx === 0 && (
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -z-10 translate-x-12 -translate-y-12"></div>
                 )}
                 <div className={`w-14 h-14 rounded-[0.75rem] flex items-center justify-center mb-8 ${idx === 0 ? 'bg-white/20' : 'bg-[var(--color-primary-container)]'}`}>
                    <Book size={28} className={idx === 0 ? 'text-white' : 'text-[var(--color-primary)]'} />
                 </div>
                 
                 <h3 className="font-display text-3xl mb-3 tracking-[-0.01em]">
                   {col.title}
                 </h3>
                 <p className={`font-body text-sm font-bold uppercase tracking-widest ${idx === 0 ? 'text-white/80' : 'text-[var(--color-on-surface)]/50'}`}>
                   {col.count}
                 </p>
                 
                 <div className="mt-8 pt-6 border-t border-current/10 flex justify-between items-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="font-body text-xs font-bold uppercase tracking-widest">Browse Chapters</span>
                    <ArrowLeft size={16} className="rotate-180" />
                 </div>
              </div>
            ))}
         </div>
      </main>
    </div>
  );
}
