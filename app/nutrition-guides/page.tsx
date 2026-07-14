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
    <div className="min-h-screen bg-[var(--site-bg)] text-[var(--foreground)] pb-32 relative overflow-hidden transition-colors duration-1000">

      {/* ================= PAGE HEADER ================= */}
      <header className="relative pt-10 pb-16 px-6 sm:px-12 lg:px-20 text-center border-b border-[var(--dark-grey)]/10 bg-[var(--white)] z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--olive)] mb-2 animate-fade-in-up">
            Corporate Wellness
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] leading-[1.2] tracking-tight animate-fade-in-up delay-100">
            Professional <br />
            <span className="text-[var(--dark-brown)]">
              Nutrition Guides
            </span>
          </h1>

          <p className="text-base md:text-lg text-[var(--dark-grey)] font-medium max-w-2xl mx-auto leading-relaxed mt-4 animate-fade-in-up delay-200">
            A curated collection of community heritage recipes and nutrition insights, tailored for the modern enterprise lifestyle.
          </p>
        </div>
      </header>

      {/* ================= API COOKING GUIDES GRID ================= */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10 space-y-16">
        {cookingGuides.length > 0 ? (
          <>
            {/* FEATURED MAGZINE-STYLE HERO CARD */}
            {featuredGuide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onClick={() => setSelectedGuide(featuredGuide)}
                className="group relative bg-[var(--white)] border border-[var(--dark-grey)]/10 rounded-sm overflow-hidden shadow-sm hover:shadow-lg hover:border-[var(--olive)]/50 transition-all duration-300 cursor-pointer flex flex-col md:flex-row min-h-[300px]"
              >
                <div className="relative w-full md:w-[50%] overflow-hidden bg-[var(--cream)] min-h-[220px] md:min-h-[300px] border-r border-[var(--dark-grey)]/10">
                  {featuredGuide.guideimage && (
                    <img
                      src={IMAGE_URL + featuredGuide.guideimage}
                      alt={featuredGuide.title || "Featured Guide"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--foreground)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-[var(--white)] border border-[var(--dark-grey)]/20 text-[var(--foreground)] text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase tracking-widest shadow-sm">
                      Featured Guide
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-[50%] p-6 md:p-10 flex flex-col justify-center relative bg-[var(--white)]">

                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[var(--olive)] text-[var(--white)] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                      {featuredGuide.difficulty || "Medium"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[var(--dark-grey)] text-[10px] font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[var(--orange)]" />
                      {(featuredGuide.prep_time || 0) + (featuredGuide.cook_time || 0)} mins
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-tight mb-4 group-hover:text-[var(--olive-dark)] transition-colors duration-500">
                    {featuredGuide.title}
                  </h2>

                  <p className="text-[var(--dark-grey)] text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                    {featuredGuide.description}
                  </p>

                  <div className="mt-auto pt-6 border-t border-[var(--dark-grey)]/10 flex items-center justify-between group/btn">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dark-grey)]">
                        Key Ingredients
                      </span>
                      <span className="text-sm font-semibold text-[var(--olive)] mt-1">
                        {featuredGuide.ingredients?.slice(0, 3).map(i => i.name).join(", ")}
                        {featuredGuide.ingredients && featuredGuide.ingredients.length > 3 ? "..." : ""}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--site-bg)] border border-[var(--dark-grey)]/20 flex items-center justify-center group-hover/btn:bg-[var(--olive)] transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-[var(--foreground)] group-hover/btn:text-[var(--white)] transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-8 mt-12">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[var(--olive)]"></div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] uppercase tracking-wider">
                  All Guides
                </h2>
              </div>
              <div className="hidden sm:block flex-1 h-px bg-[var(--dark-grey)]/10 ml-8" />
            </div>

            {/* ASYMMETRICAL STANDARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {standardGuides.map((guide: GuideDatum, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-[var(--white)] border border-[var(--dark-grey)]/10 rounded-sm overflow-hidden shadow-sm hover:border-[var(--olive)]/50 hover:shadow-lg transition-all duration-300 group flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 md:h-56 overflow-hidden bg-[var(--cream)] border-b border-[var(--dark-grey)]/10">
                    <div className="relative w-full h-full overflow-hidden">
                      {guide.guideimage && (
                        <img
                          src={IMAGE_URL + guide.guideimage}
                          alt={guide.title || "Cooking Guide"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="absolute top-4 right-4">
                        <span className="bg-[var(--foreground)] border border-[var(--dark-grey)] text-[var(--white)] text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                          {guide.difficulty || "Medium"}
                        </span>
                      </div>

                      <div className="absolute bottom-5 left-5 right-5">
                        <span className="flex items-center gap-1.5 text-[var(--white)]/90 text-xs font-bold drop-shadow-md mb-2">
                          <Clock className="w-3.5 h-3.5 text-[var(--orange)]" />
                          {(guide.prep_time || 0) + (guide.cook_time || 0)} mins
                        </span>
                        <h4 className="text-lg font-bold text-[var(--white)] leading-tight line-clamp-2 drop-shadow-lg group-hover:text-[var(--gold)] transition-colors duration-300">
                          {guide.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-6 flex-1 flex flex-col bg-[var(--white)]">
                    <p className="text-[var(--dark-grey)] text-sm font-medium line-clamp-3 mb-6 leading-relaxed">
                      {guide.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-[var(--dark-grey)]/10">
                      <div className="flex flex-wrap gap-2">
                        {guide.ingredients
                          ?.slice(0, 3)
                          .map((ing: any, i: number) => (
                            <span
                              key={i}
                              className="bg-[var(--site-bg)] border border-[var(--dark-grey)]/10 text-[11px] text-[var(--dark-grey)] font-semibold px-2.5 py-1 rounded-md transition-colors group-hover:border-[var(--olive)]/30"
                            >
                              {ing.name}
                            </span>
                          ))}
                        {guide.ingredients && guide.ingredients.length > 3 && (
                          <span className="bg-[var(--olive)]/10 text-[11px] text-[var(--olive-dark)] font-bold px-2.5 py-1 rounded-md">
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
          <div className="text-center py-32 text-[var(--dark-grey)]">
            <div className="inline-flex p-5 rounded-full bg-[var(--white)] shadow-sm border border-[var(--dark-grey)]/10 mb-6 animate-pulse">
              <Utensils className="w-8 h-8 text-[var(--dark-grey)]/30" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--dark-grey)]">
              Loading Resources...
            </p>
          </div>
        )}
      </div>

      {/* ================= TRUST SEALS ================= */}
      <div className="max-w-7xl mx-auto mt-16 pt-12 px-6 relative z-10 border-t border-[var(--dark-grey)]/10">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--olive)] mb-2 block">
            The Tradizions Standard
          </span>
          <h3 className="text-2xl font-bold text-[var(--foreground)]">
            Corporate Integrity
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: "100% Organic", desc: "No chemical additives", emoji: "🌱" },
            { label: "No Preservatives", desc: "Packed fresh at source", emoji: "🚫" },
            { label: "Chemical Free", desc: "Zero synthetic farming", emoji: "🧪" },
            { label: "Ethically Sourced", desc: "Farm to enterprise", emoji: "🏢" },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="bg-[var(--white)] border border-[var(--dark-grey)]/10 py-6 px-5 rounded-sm shadow-sm hover:border-[var(--olive)]/50 hover:shadow-md transition-all duration-300 text-center flex flex-col items-center group"
            >
              <span className="text-4xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300 mb-4">
                {badge.emoji}
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--foreground)] transition-colors duration-300">
                {badge.label}
              </span>
              <span className="text-[11px] text-[var(--dark-grey)] mt-1">
                {badge.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT SIDEBAR OVERLAY (PREMIUM CORPORATE REDESIGN) ================= */}
      <AnimatePresence>
        {selectedGuide && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuide(null)}
              className="fixed inset-0 bg-[var(--foreground)]/50 backdrop-blur-sm z-40 transition-colors"
            />

            {/* Floating Sidebar Card */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-[48rem] bg-[var(--site-bg)] shadow-2xl z-50 overflow-y-auto flex flex-col border-l border-[var(--dark-grey)]/10"
            >
              {/* Close Button - Absolute */}
              <div className="absolute top-6 right-6 z-50">
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="w-10 h-10 rounded-sm bg-[var(--white)] text-[var(--foreground)] shadow-sm border border-[var(--dark-grey)]/20 flex items-center justify-center hover:bg-[var(--foreground)] hover:text-[var(--white)] transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hero Image Block */}
              <div className="relative w-full h-[320px] shrink-0 bg-[var(--cream)] border-b border-[var(--dark-grey)]/10">
                {selectedGuide.guideimage && (
                  <img
                    src={IMAGE_URL + selectedGuide.guideimage}
                    alt={selectedGuide.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--site-bg)] via-transparent to-[var(--foreground)]/30"></div>
                
                {/* Meta Tags overlaid on image bottom */}
                <div className="absolute bottom-6 left-8 sm:left-12 flex flex-wrap items-center gap-3">
                  <span className="bg-[var(--foreground)] text-[var(--white)] text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase tracking-widest shadow-sm">
                    {selectedGuide.difficulty || "Medium"}
                  </span>
                  <span className="bg-[var(--white)] text-[var(--foreground)] text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[var(--olive)]" />
                    {(selectedGuide.prep_time || 0) + (selectedGuide.cook_time || 0)} MINS TOTAL
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative px-8 sm:px-12 pb-16 z-10 flex-1 bg-[var(--site-bg)] pt-8">

                {/* Title Section */}
                <div className="mb-10 pb-8 border-b border-[var(--dark-grey)]/10">
                  <h2 className="text-3xl md:text-5xl font-semibold text-[var(--foreground)] leading-[1.1] mb-6 tracking-tight">
                    {selectedGuide.title}
                  </h2>

                  {/* Description */}
                  <div className="flex flex-col gap-4 text-justify">
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
                          <p className="text-[var(--dark-grey)] text-base leading-relaxed">
                            {desc1}
                          </p>
                          {desc2 && (
                            <p className="text-[var(--dark-grey)] text-base leading-relaxed">
                              {desc2}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Left Column: Ingredients & Stats */}
                  <div className="w-full lg:w-5/12 flex flex-col gap-8">
                    {/* Time Cards */}
                    <div className="flex gap-4">
                      <div className="bg-[var(--white)] rounded-sm p-5 flex-1 border border-[var(--dark-grey)]/10 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dark-grey)] block mb-2">Prep Time</span>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-[var(--foreground)]">{selectedGuide.prep_time || 0}</span>
                          <span className="text-xs font-semibold text-[var(--dark-grey)] ml-1">mins</span>
                        </div>
                      </div>
                      <div className="bg-[var(--white)] rounded-sm p-5 flex-1 border border-[var(--dark-grey)]/10 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dark-grey)] block mb-2">Cook Time</span>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-[var(--foreground)]">{selectedGuide.cook_time || 0}</span>
                          <span className="text-xs font-semibold text-[var(--dark-grey)] ml-1">mins</span>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Container */}
                    <div className="bg-[var(--white)] rounded-sm p-6 border border-[var(--dark-grey)]/10 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--dark-grey)]/10">
                        <Utensils className="w-4 h-4 text-[var(--olive)]" />
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">
                          Ingredients
                        </h3>
                      </div>
                      <ul className="space-y-4">
                        {selectedGuide.ingredients?.map((ing: any, i: number) => (
                          <li
                            key={i}
                            className="flex justify-between items-start gap-4"
                          >
                            <span className="text-sm font-semibold text-[var(--dark-grey)]">
                              {ing.name}
                            </span>
                            <span className="text-xs font-bold text-[var(--foreground)] text-right">
                              {ing.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Instructions */}
                  <div className="w-full lg:w-7/12">
                    <div className="bg-[var(--white)] rounded-sm p-6 sm:p-8 border border-[var(--dark-grey)]/10 shadow-sm h-full">
                      <div className="flex items-center gap-2 mb-8 pb-4 border-b border-[var(--dark-grey)]/10">
                        <ChefHat className="w-5 h-5 text-[var(--olive)]" />
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">
                          Preparation Method
                        </h3>
                      </div>
                      <div className="space-y-8">
                        {selectedGuide.instructions?.map((step: string, i: number) => (
                          <div key={i} className="flex gap-5 group">
                            <div className="flex flex-col items-center shrink-0 pt-0.5">
                              <span className="w-7 h-7 rounded-sm bg-[var(--olive)]/10 text-[var(--olive-dark)] flex items-center justify-center font-bold text-xs border border-[var(--olive)]/20 transition-colors group-hover:bg-[var(--olive)] group-hover:text-[var(--white)]">
                                {i + 1}
                              </span>
                            </div>
                            <p className="text-[var(--dark-grey)] text-sm md:text-base leading-relaxed pb-2 group-hover:text-[var(--foreground)] transition-colors">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Mark */}
                <div className="flex items-center justify-center pt-16 pb-4 opacity-30">
                  <div className="h-px bg-[var(--dark-grey)]/40 flex-1"></div>
                  <CheckCircle2 className="w-6 h-6 text-[var(--dark-grey)] mx-6" />
                  <div className="h-px bg-[var(--dark-grey)]/40 flex-1"></div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
