"use client";

import React, { useState, useEffect } from "react";
import { API } from "@/service/api_service";
import { CookingGuideData as GuideDatum } from "@/models/guide_blog_model";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Utensils, X, ChefHat, CheckCircle2, ArrowRight } from "lucide-react";
import { IMAGE_URL } from "@/routes/api_routes";

export default function NutritionGuidesPage() {
  const [cookingGuides, setCookingGuides] = useState<GuideDatum[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<GuideDatum | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await API.post("/guide/get-cooking-guides");
        if (response.data && response.data.data) {
          setCookingGuides(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch cooking guides", error);
      }
    };
    fetchGuides();
  }, []);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (selectedGuide) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedGuide]);

  const featuredGuide = cookingGuides.length > 0 ? cookingGuides[0] : null;
  const standardGuides = cookingGuides.length > 1 ? cookingGuides.slice(1) : [];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-32 relative overflow-hidden transition-colors duration-1000">

      {/* ================= PAGE HEADER ================= */}
      <header className="relative py-10 px-8 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[var(--dark-brown)]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
            <Utensils className="w-4 h-4 text-[var(--gold)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--olive)]">
              Curated Gastronomy
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[var(--dark-brown)] tracking-tighter leading-[1.05]">
            The Cooking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--olive)] to-[var(--gold)] italic font-light pr-2">
              Journals
            </span>
          </h1>

          <p className="text-sm md:text-base text-stone-500 font-medium max-w-2xl mx-auto leading-relaxed mt-4">
            An artisanal collection of community heritage recipes, elevated for the modern kitchen.
          </p>
        </div>
      </header>

      {/* ================= API COOKING GUIDES GRID ================= */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 space-y-16">
        {cookingGuides.length > 0 ? (
          <>
            {/* FEATURED MAGZINE-STYLE HERO CARD */}
            {featuredGuide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onClick={() => setSelectedGuide(featuredGuide)}
                className="group relative bg-white border border-stone-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md hover:border-stone-400 transition-all duration-300 cursor-pointer flex flex-col md:flex-row min-h-[300px]"
              >
                <div className="relative w-full md:w-[50%] overflow-hidden bg-stone-100 min-h-[220px] md:min-h-[300px]">
                  {featuredGuide.guideimage && (
                    <img
                      src={IMAGE_URL + featuredGuide.guideimage}
                      alt={featuredGuide.title || "Featured Guide"}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-white border border-stone-200 text-stone-900 text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase tracking-widest shadow-sm">
                      Featured Recipe
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-[50%] p-6 md:p-8 flex flex-col justify-center relative bg-white">

                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider border border-[var(--gold)]/20">
                      {featuredGuide.difficulty || "Medium"}
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-500 text-[10px] font-extrabold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {(featuredGuide.prep_time || 0) + (featuredGuide.cook_time || 0)} mins
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-[var(--dark-brown)] leading-tight mb-4 group-hover:text-[var(--olive)] transition-colors duration-500">
                    {featuredGuide.title}
                  </h2>

                  <p className="text-stone-500 text-sm md:text-base font-light leading-relaxed mb-6 line-clamp-3">
                    {featuredGuide.description}
                  </p>

                  <div className="mt-auto pt-6 border-t border-[var(--dark-brown)]/10 flex items-center justify-between group/btn">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-grey)]">
                        Key Ingredients
                      </span>
                      <span className="text-sm font-extrabold text-[var(--olive)] mt-1">
                        {featuredGuide.ingredients?.slice(0, 3).map(i => i.name).join(", ")}
                        {featuredGuide.ingredients && featuredGuide.ingredients.length > 3 ? "..." : ""}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--site-bg)] border border-[var(--dark-brown)]/10 flex items-center justify-center group-hover/btn:bg-[var(--olive)] group-hover/btn:text-white transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-[var(--dark-brown)] group-hover/btn:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ASYMMETRICAL STANDARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {standardGuides.map((guide: GuideDatum, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-sm hover:border-stone-400 hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 md:h-56 overflow-hidden bg-stone-100 border-b border-stone-100">
                    <div className="relative w-full h-full overflow-hidden">
                      {guide.guideimage && (
                        <img
                          src={IMAGE_URL + guide.guideimage}
                          alt={guide.title || "Cooking Guide"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="absolute top-4 right-4">
                        <span className="bg-stone-900/90 border border-stone-700 text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                          {guide.difficulty || "Medium"}
                        </span>
                      </div>

                      <div className="absolute bottom-5 left-5 right-5">
                        <span className="flex items-center gap-1.5 text-white/90 text-xs font-black drop-shadow-md mb-2">
                          <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
                          {(guide.prep_time || 0) + (guide.cook_time || 0)} mins
                        </span>
                        <h4 className="text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-lg group-hover:text-[var(--gold)] transition-colors duration-300">
                          {guide.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-6 flex-1 flex flex-col bg-white">
                    <p className="text-stone-500 text-sm font-medium line-clamp-3 mb-6 leading-relaxed">
                      {guide.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-[var(--dark-brown)]/10">
                      <div className="flex flex-wrap gap-1.5">
                        {guide.ingredients
                          ?.slice(0, 3)
                          .map((ing: any, i: number) => (
                            <span
                              key={i}
                              className="bg-[var(--site-bg)] border border-[var(--dark-brown)]/5 text-[11px] text-stone-600 font-extrabold px-2.5 py-1 rounded-md transition-colors group-hover:border-[var(--dark-brown)]/15"
                            >
                              {ing.name}
                            </span>
                          ))}
                        {guide.ingredients && guide.ingredients.length > 3 && (
                          <span className="bg-[var(--cream)]/40 text-[11px] text-[var(--gold)] font-black px-2.5 py-1 rounded-md">
                            +{guide.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-32 text-stone-400">
            <div className="inline-flex p-5 rounded-full bg-white shadow-sm border border-stone-100 mb-6 animate-pulse">
              <Utensils className="w-8 h-8 text-stone-200" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-stone-400">
              Unearthing Culinary Archives...
            </p>
          </div>
        )}
      </div>

      {/* ================= FARM TO HEARTH TRUST SEALS ================= */}
      <div className="max-w-7xl mx-auto mt-24 pt-12 px-6 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-30"></div>
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--gold)] mb-2 block">
            The Tradizions Standard
          </span>
          <h3 className="text-2xl font-black text-[var(--dark-brown)]">
            Integrity in Every Grain
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: "100% Organic", desc: "No chemical additives", emoji: "🌱" },
            { label: "No Preservatives", desc: "Packed fresh at source", emoji: "🚫" },
            { label: "Chemical Free", desc: "Zero synthetic farming", emoji: "🧪" },
            { label: "Farm to Hearth", desc: "Ethically sourced", emoji: "🏡" },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 py-6 px-5 rounded-sm shadow-sm hover:border-stone-400 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center group relative overflow-hidden"
            >
              <span className="text-4xl filter drop-shadow-sm transform group-hover:scale-110 group-hover:rotate-[-5deg] transition-transform duration-300 relative z-10 mb-4">
                {badge.emoji}
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-900 transition-colors duration-300">
                {badge.label}
              </span>
              <span className="text-[11px] text-stone-500 font-medium mt-1">
                {badge.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT SIDEBAR OVERLAY (PREMIUM REDESIGN) ================= */}
      <AnimatePresence>
        {selectedGuide && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuide(null)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 transition-colors"
            />

            {/* Floating Sidebar Card */}
            <motion.div
              initial={{ x: "120%", opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: "120%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto flex flex-col border-l border-stone-200"
            >
              {/* Close Button - Absolute */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="w-10 h-10 rounded-sm bg-white text-stone-900 shadow-sm border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hero Image Block */}
              <div className="relative w-full h-[280px] shrink-0 bg-stone-900">
                {selectedGuide.guideimage && (
                  <img
                    src={IMAGE_URL + selectedGuide.guideimage}
                    alt={selectedGuide.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-black/40"></div>
              </div>

              {/* Main Content */}
              <div className="relative px-8 pb-12 z-10 flex-1 bg-white pt-8 border-t border-stone-100">

                {/* Meta Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  <span className="bg-[var(--dark-brown)] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-md">
                    {selectedGuide.difficulty || "Medium"}
                  </span>
                  <span className="bg-[var(--site-bg)] border border-[var(--dark-brown)]/10 text-[var(--olive)] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3 h-3" />
                    {(selectedGuide.prep_time || 0) + (selectedGuide.cook_time || 0)} MINS TOTAL
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-black text-[var(--dark-brown)] leading-[1.1] mb-6 text-center tracking-tight">
                  {selectedGuide.title}
                </h2>

                {/* Horizontal Divider */}
                <div className="w-12 h-1 bg-[var(--gold)] mx-auto mb-8 rounded-full"></div>

                {/* Description */}
                <div className="flex flex-col gap-4 mb-10 px-4 text-justify">
                  {selectedGuide.description && (() => {
                    const desc = selectedGuide.description;
                    const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];
                    let desc1 = desc;
                    let desc2 = "";
                    if (sentences.length > 1) {
                      const mid = Math.ceil(sentences.length / 2);
                      desc1 = sentences.slice(0, mid).join(" ").trim();
                      desc2 = sentences.slice(mid).join(" ").trim();
                    } else if (desc.length > 50) {
                      const middle = Math.floor(desc.length / 2);
                      const spaceIndex = desc.indexOf(" ", middle);
                      if (spaceIndex !== -1) {
                        desc1 = desc.substring(0, spaceIndex).trim();
                        desc2 = desc.substring(spaceIndex + 1).trim();
                      }
                    }
                    return (
                      <>
                        <p className="text-stone-600 text-sm leading-relaxed font-medium">
                          {desc1}
                        </p>
                        {desc2 && (
                          <p className="text-stone-600 text-sm leading-relaxed font-medium">
                            {desc2}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Time Cards */}
                <div className="flex justify-center gap-4 mb-12">
                  <div className="bg-stone-50 rounded-sm p-4 w-32 border border-stone-200 flex flex-col items-center text-center shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">Prep Time</span>
                    <span className="text-xl font-bold text-stone-900">{selectedGuide.prep_time || 0}<span className="text-xs text-stone-400 ml-1">m</span></span>
                  </div>
                  <div className="bg-stone-50 rounded-sm p-4 w-32 border border-stone-200 flex flex-col items-center text-center shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">Cook Time</span>
                    <span className="text-xl font-bold text-stone-900">{selectedGuide.cook_time || 0}<span className="text-xs text-stone-400 ml-1">m</span></span>
                  </div>
                </div>

                {/* Ingredients Container */}
                <div className="bg-stone-50 rounded-sm p-8 mb-8 border border-stone-200 shadow-sm">
                  <h3 className="text-lg font-black text-[var(--dark-brown)] mb-6 flex items-center justify-center gap-2 text-center">
                    <Utensils className="w-5 h-5 text-[var(--olive)]" />
                    Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {selectedGuide.ingredients?.map((ing: any, i: number) => (
                      <li
                        key={i}
                        className="flex justify-between items-center py-2 border-b border-[var(--dark-brown)]/5 last:border-0"
                      >
                        <span className="text-xs font-extrabold text-[var(--dark-grey)]">
                          {ing.name}
                        </span>
                        <span className="text-[10px] font-black text-[var(--gold)] uppercase tracking-wider bg-white px-2 py-1 rounded-md shadow-sm border border-[var(--dark-brown)]/5">
                          {ing.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="px-2">
                  <h3 className="text-lg font-black text-[var(--dark-brown)] mb-8 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-[var(--gold)]" />
                    Preparation Method
                  </h3>
                  <div className="space-y-6">
                    {selectedGuide.instructions?.map((step: string, i: number) => (
                      <div key={i} className="flex gap-5 group">
                        <div className="flex flex-col items-center shrink-0">
                          <span className="w-8 h-8 rounded-sm bg-stone-900 text-white flex items-center justify-center font-bold text-[11px] shadow-sm transition-colors">
                            {i + 1}
                          </span>
                          {i !== (selectedGuide.instructions?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-[var(--dark-brown)]/10 mt-2 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed font-medium pb-6 group-hover:text-stone-900 transition-colors pt-1">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Mark */}
                <div className="flex items-center justify-center pt-10 pb-4 opacity-40">
                  <div className="h-px bg-stone-300 flex-1"></div>
                  <CheckCircle2 className="w-6 h-6 text-stone-400 mx-6" />
                  <div className="h-px bg-stone-300 flex-1"></div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
