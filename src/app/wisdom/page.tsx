import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ChevronRight, ArrowRight } from "lucide-react";

export default function WisdomPage() {
  const articles = [
    {
      id: 1,
      title: "The Art of Sabr",
      excerpt: "Understanding patience not as passive waiting, but as active, resilient faith in the face of adversity.",
      category: "Spiritual Growth",
      readTime: "5 min read",
      author: "The Global Guide",
    },
    {
      id: 2,
      title: "Finding Stillness in Salah",
      excerpt: "Transform your daily prayers from routine rituals into profound moments of connection with the Divine.",
      category: "Daily Practice",
      readTime: "8 min read",
      author: "The Global Guide",
    },
    {
      id: 3,
      title: "Reflections on Gratitude",
      excerpt: "How cultivating a heart of thankfulness (Shukr) reshapes our entire perspective on worldly blessings.",
      category: "Mindfulness",
      readTime: "4 min read",
      author: "The Global Guide",
    }
  ];

  return (
    <div className="pb-24">
      {/* Header and Hero */}
      <header className="pt-16 pb-12 px-8 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-on-surface)] opacity-60 hover:opacity-100 transition-opacity font-body text-sm font-bold uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Returns
        </Link>

        <div className="flex flex-col md:flex-row gap-12 justify-between items-start md:items-end">
          <div className="max-w-2xl">
            <p className="font-body text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] mb-4">Editorial</p>
            <h1 className="font-display text-5xl md:text-6xl text-[var(--color-on-surface)] leading-[1.1] tracking-[-0.02em] mb-6">
              Islamic <span className="text-[var(--color-primary)]">Wisdom</span>
            </h1>
            <p className="font-body text-lg text-[var(--color-on-surface)] opacity-70 leading-relaxed">
              Curated articles, reflections, and insights designed to nourish the modern soul and deepen your connection with faith.
            </p>
          </div>
          <div className="bg-[var(--color-surface-container-low)] px-6 py-4 rounded-2xl flex items-center gap-4">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
            <span className="font-body text-sm font-bold text-[var(--color-on-surface)]">148 Articles Available</span>
          </div>
        </div>
      </header>

      <main className="px-8 max-w-5xl mx-auto mt-8">
        {/* Featured Article */}
        <div className="bg-[var(--color-primary-container)] rounded-[2rem] p-10 md:p-16 mb-16 relative overflow-hidden group cursor-pointer shadow-[0_12px_32px_-4px_rgba(27,109,36,0.1)] transition-transform duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-150"></div>
          <div className="flex gap-4 items-center mb-6">
            <span className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-4 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-widest">Featured</span>
            <span className="font-body text-sm text-[var(--color-primary)] font-bold flex items-center gap-2">
              <Clock size={14} /> 12 min read
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--color-on-primary-container)] mb-6 max-w-2xl leading-[1.15] tracking-[-0.01em]">
            The Architecture of the Heart: Building Resilience Through Quranic Narratives
          </h2>
          <p className="font-body text-lg text-[var(--color-on-primary-container)] opacity-80 max-w-2xl mb-10 leading-relaxed">
            An exploration of how the stories of the Prophets in the Quran serve not just as historical accounts, but as blueprints for constructing inner strength.
          </p>
          <button className="inline-flex items-center gap-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-8 py-4 rounded-[1.5rem] font-body text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all">
            Read Editorial <ArrowRight size={18} />
          </button>
        </div>

        {/* Article Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-[var(--color-surface-container-lowest)] p-10 rounded-[1.5rem] group cursor-pointer hover:-translate-y-2 transition-transform duration-300 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex flex-col">
              <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-4">{article.category}</p>
              <h3 className="font-display text-3xl text-[var(--color-on-surface)] mb-4 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                {article.title}
              </h3>
              <p className="font-body text-[var(--color-on-surface)] opacity-70 mb-8 flex-1">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--color-outline-variant)]/30">
                <div className="flex items-center gap-2 text-[var(--color-on-surface)] opacity-50 font-body text-xs font-bold uppercase tracking-wider">
                  <Clock size={14} /> {article.readTime}
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container-low)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 px-8 py-4 rounded-[1.5rem] font-body font-bold hover:bg-[var(--color-surface-container)] transition-colors">
            Load More Editorials
          </button>
        </div>
      </main>
    </div>
  );
}
