import Link from "next/link";
import { ArrowLeft, Clock, Compass, Calendar, Moon, Sunrise, Sun } from "lucide-react";

export default function PrayerTimes() {
  return (
    <div className="pb-24">
      {/* Header and Hero */}
      <header className="pt-16 px-8 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 transition-opacity font-body text-sm font-bold uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Returns
        </Link>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-display text-5xl md:text-6xl text-[var(--color-on-surface)] leading-[1.1] tracking-[-0.02em] mb-4">
              Prayer Times & <br /><span className="text-[var(--color-primary)]">Hijri Calendar</span>
            </h1>
            <p className="font-body text-lg text-[var(--color-on-surface)] opacity-70 mb-8">
              Accurate schedules based on your precise location and preferred calculation method. Stay connected to your spiritual rhythm.
            </p>
          </div>

          <div className="bg-[var(--color-primary-container)] rounded-[1.5rem] p-10 relative overflow-hidden shadow-[0_12px_32px_-4px_rgba(27,109,36,0.1)]">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
            <p className="font-body text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2">Next Prayer</p>
            <h2 className="font-display text-5xl text-[var(--color-on-primary-container)] mb-2">Asr Prayer</h2>
            <p className="font-body text-[var(--color-on-primary-container)] opacity-80 text-lg mb-6">
              is approaching in <span className="font-bold">01:42:15</span>
            </p>
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-body text-sm font-bold">
              <Clock size={16} /> Current time is 2:38 PM
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="px-8 max-w-5xl mx-auto mt-16 grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Daily Times */}
        <div className="md:col-span-7 space-y-8">
          <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
            <div className="flex justify-between items-end mb-8">
              <h3 className="font-display text-3xl text-[var(--color-on-surface)] tracking-[-0.02em]">Daily Prayer Times</h3>
              <p className="font-body text-xs uppercase tracking-widest text-[var(--color-on-surface)] opacity-50 font-bold">Location: London, UK</p>
            </div>
            
            <div className="space-y-4 font-body">
               {/* Fagr */}
               <div className="flex justify-between items-center py-4 border-b border-[var(--color-outline-variant)]/30 group">
                 <div className="flex items-center gap-4 text-[var(--color-on-surface)]">
                    <Moon size={20} className="text-[var(--color-primary)]/70" />
                    <span className="text-lg font-semibold">Fajr</span>
                 </div>
                 <span className="text-lg font-medium opacity-80">5:12 AM</span>
               </div>
               
               {/* Sunrise */}
               <div className="flex justify-between items-center py-4 border-b border-[var(--color-outline-variant)]/30 opacity-60">
                 <div className="flex items-center gap-4 text-[var(--color-on-surface)]">
                    <Sunrise size={20} className="text-[var(--color-primary)]/70" />
                    <span className="text-lg">Sunrise</span>
                 </div>
                 <span className="text-lg">6:45 AM</span>
               </div>
               
               {/* Dhuhr */}
               <div className="flex justify-between items-center py-4 border-b border-[var(--color-outline-variant)]/30">
                 <div className="flex items-center gap-4 text-[var(--color-on-surface)]">
                    <Sun size={20} className="text-[var(--color-primary)]/70" />
                    <span className="text-lg font-semibold">Dhuhr</span>
                 </div>
                 <span className="text-lg font-medium opacity-80">12:30 PM</span>
               </div>
               
               {/* Asr - Active */}
               <div className="flex justify-between items-center py-4 px-4 -mx-4 bg-[var(--color-surface-container)] rounded-[0.75rem]">
                 <div className="flex items-center gap-4 text-[var(--color-primary)]">
                    <Sun size={20} className="fill-[var(--color-primary)]/20" />
                    <span className="text-lg font-bold">Asr</span>
                 </div>
                 <span className="text-lg font-bold text-[var(--color-primary)]">4:20 PM</span>
               </div>
               
               {/* Maghrib */}
               <div className="flex justify-between items-center py-4 border-b border-[var(--color-outline-variant)]/30">
                 <div className="flex items-center gap-4 text-[var(--color-on-surface)]">
                    <Sunrise size={20} className="rotate-180 text-[var(--color-primary)]/70" />
                    <span className="text-lg font-semibold">Maghrib</span>
                 </div>
                 <span className="text-lg font-medium opacity-80">6:15 PM</span>
               </div>
               
               {/* Isha */}
               <div className="flex justify-between items-center py-4">
                 <div className="flex items-center gap-4 text-[var(--color-on-surface)]">
                    <Moon size={20} className="text-[var(--color-primary)]/70" />
                    <span className="text-lg font-semibold">Isha</span>
                 </div>
                 <span className="text-lg font-medium opacity-80">7:48 PM</span>
               </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]/30 flex justify-between items-center">
              <span className="font-body text-xs text-[var(--color-on-surface)] opacity-50 uppercase tracking-widest font-bold">Calculation Method</span>
              <span className="font-body text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-md">ISNA</span>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface-container-low)] p-10 rounded-[1.5rem] flex items-center gap-6">
            <div className="w-16 h-16 bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] rounded-[1rem] flex items-center justify-center shrink-0">
               <Compass size={32} />
            </div>
            <div>
              <h3 className="font-display text-2xl mb-1 text-[var(--color-on-surface)]">Qibla Direction</h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70">Accurate compass alignment for your location.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Extras */}
        <div className="md:col-span-5 space-y-8">
          
          <div className="bg-[var(--color-secondary)] p-10 rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(26,28,28,0.1)] text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-secondary-fixed)] opacity-20 rounded-bl-[4rem] rounded-tr-[1.5rem] -z-10 translate-x-4 -translate-y-4"></div>
             <p className="font-body text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-secondary-fixed)] mb-2">Today's Hijri Date</p>
             <h2 className="font-display text-6xl text-[var(--color-on-primary)] mb-2 tracking-[-0.02em]">14</h2>
             <p className="font-display text-2xl text-[var(--color-secondary-fixed)] mb-6 tracking-wide">Sha'ban 1445 AH</p>
             <div className="h-px w-16 bg-white/20 mx-auto my-6"></div>
             <p className="font-body text-[var(--color-on-primary)] opacity-80 font-medium tracking-wide">
               Tomorrow's Fasting: recommended (15th of Sha'ban)
             </p>
          </div>
          
          <div className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
             <div className="w-12 h-12 bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)] rounded-xl flex items-center justify-center mb-6">
                <Calendar size={24} />
             </div>
             <h3 className="font-display text-2xl mb-6 text-[var(--color-on-surface)] tracking-[-0.02em]">Significant Dates</h3>
             <ul className="space-y-6 font-body">
                <li>
                   <p className="text-xs uppercase font-bold tracking-widest text-[var(--color-primary)] mb-1">March 11, 2024</p>
                   <p className="text-lg text-[var(--color-on-surface)] font-semibold">1st of Ramadan</p>
                </li>
                <li>
                   <p className="text-xs uppercase font-bold tracking-widest text-[var(--color-primary)] mb-1">April 10, 2024</p>
                   <p className="text-lg text-[var(--color-on-surface)] font-semibold">Eid al-Fitr</p>
                </li>
             </ul>
          </div>
        </div>
      </main>

    </div>
  );
}
