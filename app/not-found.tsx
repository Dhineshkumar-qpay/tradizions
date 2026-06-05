"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Compass, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

export default function NotFound() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang");
    if (savedLang && translations[savedLang]) {
      setSelectedLang(savedLang);
    }

    const handleLangChange = () => {
      const lang = localStorage.getItem("selectedLang");
      if (lang && translations[lang]) {
        setSelectedLang(lang);
      }
    };

    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  const t = translations[selectedLang] || translations["EN"];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 relative overflow-hidden py-24 bg-[var(--site-bg)]">
      {/* Decorative background shapes using app colors */}
      <div className="absolute top-1/4 -left-20 w-[30rem] h-[30rem] bg-[var(--beige)] rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />
      <div className="absolute bottom-1/4 -right-20 w-[25rem] h-[25rem] bg-[var(--gold-light)]/30 rounded-full blur-[100px] pointer-events-none animate-pulse delay-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[var(--olive)]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-grain mix-blend-multiply" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-10 mt-12 md:mt-20">
        
        {/* Floating 404 Element */}
        <div className="relative inline-flex flex-col items-center justify-center animate-float">
           <div className="absolute inset-0 bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] opacity-10 blur-2xl rounded-full scale-[1.8]" />
           <h1 className="text-[7rem] md:text-[9rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[var(--olive-dark)] via-[var(--olive)] to-[var(--gold)] drop-shadow-sm select-none">
             404
           </h1>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
             <div className="glass rounded-full p-4 md:p-5 animate-spin-slow shadow-2xl border border-[var(--gold)]/40 bg-white/50 backdrop-blur-md">
               <Compass className="w-12 h-12 md:w-16 md:h-16 text-[var(--orange)] drop-shadow-md" />
             </div>
           </div>
        </div>

        {/* Text Content */}
        <div className="space-y-6 relative animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full glass-dark text-[var(--olive-dark)] font-bold text-[11px] tracking-[0.2em] uppercase border border-[var(--olive)]/20 shadow-sm">
            <MapPin className="w-4 h-4 text-[var(--orange)]" />
            <span>Path Not Found</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--dark-brown)] tracking-tight">
            {t.not_found?.title || "Lost your way?"}
          </h2>

          <p className="text-[var(--dark-grey)] text-base md:text-sm font-medium leading-relaxed max-w-lg mx-auto opacity-90">
            {t.not_found?.desc || "The tradition you are seeking seems to have faded into history. Let's guide you back to our roots."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 animate-fade-in-up delay-200">
          <Link
            href="/"
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[var(--olive)] text-white rounded-2xl font-bold tracking-widest text-[12px] shadow-[0_15px_30px_rgba(85,107,47,0.25)] hover:shadow-[0_20px_40px_rgba(85,107,47,0.35)] hover:-translate-y-1 hover:bg-[var(--olive-dark)] transition-all duration-400 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
            {t.not_found?.back_home || "BACK TO HOME"}
          </Link>

          <button
            onClick={() => router.back()}
            className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-[var(--dark-brown)] border-2 border-[var(--cream)] rounded-2xl font-bold tracking-widest text-[12px] hover:border-[var(--gold)] hover:bg-[var(--beige)] hover:-translate-y-1 shadow-sm hover:shadow-md transition-all duration-400"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1.5 text-[var(--orange)]" />
            {t.my_account?.back_to_addr?.replace('← ', '') || "GO BACK"}
          </button>
        </div>

        {/* Useful Links */}
        <div className="pt-16 animate-fade-in-up delay-300">
          <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
            <div className="h-px w-12 bg-[var(--dark-grey)]" />
            <p className="text-[11px] font-bold text-[var(--dark-grey)] uppercase tracking-[0.2em]">
              Explore Our Traditions
            </p>
            <div className="h-px w-12 bg-[var(--dark-grey)]" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Shop All", link: "/shop" },
              { name: "Millets", link: "/shop?category=Millets" },
              { name: "Wellness Gifts", link: "/gifts" },
              { name: "Pooja Needs", link: "/shop?category=Pooja%20Needs" }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className="px-6 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-[var(--olive)]/10 text-[12px] font-bold text-[var(--olive-dark)] hover:bg-[var(--olive)] hover:border-[var(--olive)] hover:text-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 uppercase tracking-widest"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
