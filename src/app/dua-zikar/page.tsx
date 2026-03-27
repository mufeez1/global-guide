import Link from "next/link";
import { ArrowLeft, Search, Heart, Shield, Sun, Moon, CloudRain, Briefcase } from "lucide-react";

export default function DuaZikarPage() {
  const categories = [
    { icon: <Sun size={24} />, name: "Morning", count: "12 Duas", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]/10" },
    { icon: <Moon size={24} />, name: "Evening", count: "14 Duas", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-surface-container)]" },
    { icon: <Shield size={24} />, name: "Protection", count: "8 Duas", color: "text-[var(--color-on-secondary-fixed)]", bg: "bg-[var(--color-secondary-fixed)]" },
    { icon: <Heart size={24} />, name: "Anxiety", count: "9 Duas", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-surface-container)]" },
    { icon: <Briefcase size={24} />, name: "Work & Success", count: "5 Duas", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-container)]" },
    { icon: <CloudRain size={24} />, name: "During Rain", count: "3 Duas", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-surface-container)]" },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="pt-16 pb-12 px-8 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 transition-opacity font-body text-sm font-bold uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Returns
        </Link>
        
        <div className="flex flex-col md:flex-row gap-12 justify-between items-start md:items-end">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl md:text-6xl text-[var(--color-on-surface)] leading-[1.1] tracking-[-0.02em] mb-4">
              Dua & <span className="text-[var(--color-primary)]">Zikar</span>
            </h1>
            <p className="font-body text-lg text-[var(--color-on-surface)] opacity-70 leading-relaxed">
              A curated collection of daily supplications to keep your heart anchored and your tongue moist with the remembrance of Allah.
            </p>
          </div>
        </div>
      </header>

      {/* Search and Daily Dua */}
      <section className="px-8 max-w-5xl mx-auto mb-16">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 relative">
               <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search size={20} className="text-[var(--color-on-surface)] opacity-40" />
               </div>
               <input 
                 type="text" 
                 placeholder="Search supplications (e.g., 'morning', 'anxiety')" 
                 className="w-full bg-[var(--color-surface-container-lowest)] border-none rounded-[1.5rem] py-6 pl-16 pr-8 font-body text-lg shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] focus:ring-[1px] focus:ring-[var(--color-primary)]/20 outline-none transition-all placeholder:text-[var(--color-on-surface)]/30 text-[var(--color-on-surface)]"
               />
            </div>
            <button className="bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)] px-10 py-6 rounded-[1.5rem] font-body font-bold shrink-0 hover:opacity-90 transition-opacity flex items-center gap-3">
               <Heart size={20} /> Saved Duas
            </button>
         </div>
      </section>

      {/* Featured Routine */}
      <section className="px-8 max-w-5xl mx-auto mb-20">
         <h2 className="font-display text-3xl text-[var(--color-on-surface)] mb-8 tracking-[-0.01em]">Recommended Routine</h2>
         <div className="bg-[var(--color-surface-container-low)] rounded-[2rem] p-10 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-primary-container)] rounded-bl-[4rem] rounded-tr-[2rem] -z-10 translate-x-12 -translate-y-12"></div>
            
            <p className="font-body text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] mb-4">Ayat ul-Kursi</p>
            <p className="font-display text-3xl md:text-5xl text-[var(--color-on-surface)] leading-relaxed text-right mb-8" dir="rtl">
               اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ
            </p>
            <p className="font-body text-lg text-[var(--color-on-surface)] opacity-80 mb-8 max-w-3xl">
               "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence..."
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
               <span className="bg-[var(--color-surface-container-lowest)] px-4 py-2 rounded-full font-body text-xs font-bold tracking-widest uppercase text-[var(--color-on-surface)] opacity-70">Recite after Fard Prayer</span>
               <span className="bg-[var(--color-surface-container-lowest)] px-4 py-2 rounded-full font-body text-xs font-bold tracking-widest uppercase text-[var(--color-on-surface)] opacity-70">Morning & Evening</span>
               <button className="ml-auto text-[var(--color-primary)] font-body font-bold text-sm tracking-wider hover:underline underline-offset-4">Read Full Ayat →</button>
            </div>
         </div>
      </section>

      {/* Categories Grid */}
      <main className="px-8 max-w-5xl mx-auto">
         <h2 className="font-display text-3xl text-[var(--color-on-surface)] mb-8 tracking-[-0.01em]">Categories</h2>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[1.5rem] cursor-pointer hover:bg-[var(--color-surface-container-low)] transition-colors group border border-transparent hover:border-[var(--color-outline-variant)]/20 shadow-[0_4px_24px_-4px_rgba(26,28,28,0.02)]">
                 <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-[1rem] flex items-center justify-center mb-6`}>
                    {cat.icon}
                 </div>
                 <h3 className="font-display text-xl md:text-2xl text-[var(--color-on-surface)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">{cat.name}</h3>
                 <p className="font-body text-sm text-[var(--color-on-surface)] opacity-50 uppercase tracking-widest font-bold">{cat.count}</p>
              </div>
            ))}
         </div>
      </main>
    </div>
  );
}
