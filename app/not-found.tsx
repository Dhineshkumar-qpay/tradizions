"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Compass, Map } from "lucide-react";
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
    <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden py-24 bg-[#fcfaf7]">
      {/* Elegant Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--olive)]/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--orange)]/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      
      <div className="max-w-xl w-full text-center relative z-10 space-y-8">
        {/* Enhanced Icon Section */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[var(--olive)]/20 rounded-[2rem] rotate-6 scale-95 blur-sm" />
          <div className="relative bg-white p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(85,107,47,0.08)] border border-[var(--olive)]/10">
            <div className="relative">
              <Compass className="w-12 h-12 text-[var(--olive)] animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[var(--orange)] rounded-full animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Refined Typography */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--olive)]/5 border border-[var(--olive)]/10">
            <Map className="w-3.5 h-3.5 text-[var(--olive)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--olive)] uppercase">
              ERROR CODE: 404
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--olive-dark)] tracking-tight">
            {t.not_found?.title || "Lost in Tradition?"}
          </h1>
          
          <p className="text-gray-500 text-base font-light leading-relaxed max-w-md mx-auto">
            {t.not_found?.desc || "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
          </p>
        </div>

        {/* Elegant Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[var(--olive-dark)] text-white rounded-xl font-bold tracking-widest text-[11px] shadow-[0_10px_25px_rgba(61,77,34,0.2)] hover:shadow-[0_15px_30px_rgba(61,77,34,0.3)] hover:-translate-y-1 transition-all duration-500"
          >
            <Home className="w-4 h-4" />
            {t.not_found?.back_home || "RETURN HOME"}
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-[var(--olive-dark)] border border-gray-200 rounded-xl font-bold tracking-widest text-[11px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-500"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.my_account?.back_to_addr?.replace('← ', '') || "GO BACK"}
          </button>
        </div>

        {/* Refined Quick Links */}
        <div className="pt-12">
          <div className="h-px w-12 bg-gray-200 mx-auto mb-8" />
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {["Shop All", "Millets", "Wellness Gifts", "Pooja"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="text-[11px] font-bold text-gray-400 hover:text-[var(--orange)] tracking-widest uppercase transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
