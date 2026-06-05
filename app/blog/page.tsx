"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, X, Share2, Heart, ArrowUpRight, Leaf, Sparkles, ChevronLeft, Copy, Check } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Healthy Snacking Made Easy: Why Nuts and Dry Fruits Are a Smart Choice",
    excerpt: "Nuts and dry fruits are packed with essential nutrients, vitamins, and minerals that help keep your body energized throughout the day.",
    content: "In today's busy lifestyle, healthy snacking is more important than ever. Nuts and dry fruits are packed with essential nutrients, vitamins, and minerals that help keep your body energized throughout the day.\n\nAlmonds, cashews, walnuts, dates, raisins, and pistachios are not only delicious but also support overall health. They can be enjoyed as a quick snack, added to breakfast, or used in desserts and recipes.\n\n### Simple Steps to Health\nChoosing healthy snacks is a simple step towards a healthier lifestyle for the whole family.",
    category: "NUTRITION",
    date: "Oct 12, 2026",
    readTime: "3 min",
    image: "https://media.istockphoto.com/id/183803376/photo/mixed-nuts-and-dried-fruits.jpg?s=612x612&w=0&k=20&c=C7BlDHRlNQMTCMrAWcCg59PaA18bAuGXVcU0estWhGY=",
  },
  {
    id: 2,
    title: "Millets: The Traditional Grain for Modern Living",
    excerpt: "Millets are making a strong comeback as people look for healthier food options. Rich in fiber and nutrients, they are a great alternative to refined grains.",
    content: "Millets are making a strong comeback as people look for healthier food options. Rich in fiber and nutrients, millets are a great alternative to refined grains.\n\nFrom breakfast dishes to dinner recipes, millets can be used in many ways. They provide steady energy, support digestion, and fit well into a balanced diet.\n\n### Traditional Goodness\nIncluding millets in your meals is a simple way to enjoy traditional goodness with modern health benefits.",
    category: "WELLNESS",
    date: "Oct 05, 2026",
    readTime: "4 min",
    image: "https://experiencelife.lifetime.life/wp-content/uploads/2005/07/great-grains-1557875324.jpg",
  },
  {
    id: 3,
    title: "Gift Hampers: A Thoughtful Gift for Every Occasion",
    excerpt: "Finding the perfect gift can sometimes be difficult. Gift hampers make gifting simple, elegant, and meaningful for any occasion.",
    content: "Finding the perfect gift can sometimes be difficult. Gift hampers make gifting simple, elegant, and meaningful.\n\nWhether it's a birthday, anniversary, festival, corporate event, or special celebration, a carefully selected hamper filled with premium products is always appreciated.\n\n### Meaningful Gifting\nGift hampers can be customized to suit different occasions, making them a convenient and memorable gifting option.",
    category: "GIFTING",
    date: "Sep 28, 2026",
    readTime: "3 min",
    image: "https://www.thedailynutco.com/cdn/shop/files/IMG_0012_1_530x@2x.jpg?v=1752435807",
  },
  {
    id: 4,
    title: "Essential Pooja Items for a Peaceful and Spiritual Home",
    excerpt: "Pooja is an important part of many households. Having the right pooja items helps create a meaningful spiritual experience.",
    content: "Pooja is an important part of many households, bringing positivity and peace to daily life. Having the right pooja items helps create a meaningful spiritual experience.\n\nFrom lamps and incense to kumkum, turmeric, wicks, and other traditional essentials, every item plays a special role in worship.\n\n### Spiritual Readiness\nKeeping quality pooja items at home ensures you are always prepared for daily prayers, festivals, and special occasions.",
    category: "LIFESTYLE",
    date: "Sep 20, 2026",
    readTime: "3 min",
    image: "https://athulyaa.com/wp-content/uploads/2025/09/diwali-hampers-2-800x800.jpg",
  },
];

import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const categoryColors: Record<string, string> = {
  WELLNESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  GIFTING: "bg-amber-50 text-amber-700 border-amber-200",
  NUTRITION: "bg-sky-50 text-sky-700 border-sky-200",
  LIFESTYLE: "bg-rose-50 text-rose-700 border-rose-200",
  CORPORATE: "bg-violet-50 text-violet-700 border-violet-200",
};

import { useRouter } from "next/navigation";

export default function BlogPage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("EN");
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = localStorage.getItem("preferredLang") || "EN";
    setSelectedLang(lang);
    
    const handleLangChange = (e: any) => {
      setSelectedLang(e.detail.lang);
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  const t = translations[selectedLang] || en;

  // Track scroll progress in sidebar
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el || !selectedPost) return;
    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setReadProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [selectedPost]);

  // Reset progress when sidebar closes
  useEffect(() => {
    if (!selectedPost) setReadProgress(0);
  }, [selectedPost]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--site-bg)] relative overflow-hidden">

      {/* ──── Hero / Header ──── */}
      <section className="relative pt-36 md:pt-44 pb-12 px-6 sm:px-12 lg:px-20 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--orange)] mb-3 animate-fade-in-up">
            {t.blog?.journal || "The Journal"}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-black leading-[1.1] mb-5 animate-fade-in-up delay-100">
            {t.blog?.thoughts_on || "Thoughts on"} <span className="font-normal">{t.blog?.wellness || "Wellness"}</span> &amp; <span className="font-normal">{t.blog?.tradition || "Tradition"}</span>
          </h1>
          <p className="text-[var(--dark-grey)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t.blog?.subtitle || "A collection of stories exploring ancient nutrition, mindful gifting, and the rituals that enrich our everyday lives."}
          </p>
        </div>
      </section>

      {/* ──── Posts Grid ──── */}
      <section className="px-6 sm:px-12 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <Sparkles className="w-5 h-5 text-[var(--orange)]" />
            <h2 className="text-xl md:text-2xl font-bold text-[var(--dark-brown)]">{t.blog?.latest_articles || "Latest Articles"}</h2>
            <div className="flex-1 h-px bg-[var(--olive)]/10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`group cursor-pointer animate-fade-in-up delay-${(i % 3 + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] uppercase rounded-md border ${categoryColors[post.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {post.category}
                  </span>
                  <span className="text-[var(--dark-grey)]/60 text-xs flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[var(--dark-brown)] leading-snug mb-2 group-hover:text-[var(--olive)] transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[var(--dark-grey)] leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Footer: Date & Read More */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs text-[var(--dark-grey)]/50 font-medium">{post.date}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                    }}
                    className="text-xs font-bold text-[var(--olive)] uppercase tracking-widest hover:text-[var(--dark-brown)] transition-colors flex items-center gap-1 group/btn"
                  >
                    Read More <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Overlay ──── */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-all duration-500 ${selectedPost ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelectedPost(null)}
      />

      {/* ──── Sidebar Reader ──── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[44rem] bg-white z-[100] shadow-[-20px_0_60px_rgba(0,0,0,0.12)] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${selectedPost ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Reading progress bar */}
        <div className="fixed top-0 right-0 w-full max-w-[44rem] h-[3px] z-[110] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {selectedPost && (
          <div className="min-h-full">

            {/* ── Sidebar Hero Image ── */}
            <div className="relative w-full h-[50vh] min-h-[360px]">
              <Image
                src={selectedPost.image}
                alt={selectedPost.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />

              {/* Back button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-[var(--dark-brown)] text-sm font-bold shadow-lg hover:bg-white transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Category pill on image */}
              <div className="absolute top-6 right-6 z-10">
                <span className={`px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border backdrop-blur-md ${categoryColors[selectedPost.category] || "bg-white/80 text-gray-700 border-white/40"}`}>
                  {selectedPost.category}
                </span>
              </div>
            </div>

            {/* ── Article Content ── */}
            <div className="px-8 sm:px-14 -mt-16 relative z-10">
              {/* Title card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-10 border border-gray-100">
                <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-[var(--dark-brown)] leading-[1.15] mb-6">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--olive)] to-[var(--orange)] flex items-center justify-center text-white font-bold text-sm shadow-md">
                      T
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--dark-brown)] leading-tight">Tradizions</p>
                      <p className="text-[11px] text-[var(--dark-grey)]">Health &amp; Wellness</p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-gray-200" />

                  <span className="text-xs text-[var(--dark-grey)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--orange)]" /> {selectedPost.date}
                  </span>
                  <span className="text-xs text-[var(--dark-grey)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--orange)]" /> {selectedPost.readTime}
                  </span>
                </div>
              </div>

              {/* Body text */}
              <article className="max-w-none mb-16">
                {/* First paragraph with drop cap */}
                <p className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-8 first-letter:text-6xl first-letter:font-bold first-letter:text-[var(--olive)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]">
                  {selectedPost.content.split("\n\n")[0]}
                </p>

                {/* Remaining paragraphs */}
                {selectedPost.content.split("\n\n").slice(1).map((para, idx) => {
                  if (para.startsWith("###")) {
                    return (
                      <h3
                        key={idx}
                        className="text-2xl font-bold text-[var(--dark-brown)] mt-14 mb-5 flex items-center gap-3"
                      >
                        <span className="w-8 h-[3px] rounded-full bg-gradient-to-r from-[var(--olive)] to-[var(--orange)]" />
                        {para.replace("###", "").trim()}
                      </h3>
                    );
                  }
                  return (
                    <p key={idx} className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-7">
                      {para}
                    </p>
                  );
                })}
              </article>

              {/* CTA */}
              <div className="mb-20 rounded-2xl overflow-hidden bg-[var(--site-bg)] border border-[var(--olive)]/10">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--olive)] to-[var(--orange)] flex items-center justify-center shrink-0 shadow-lg">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h4 className="text-xl font-bold text-[var(--dark-brown)] mb-2">
                      Explore Our Collections
                    </h4>
                    <p className="text-sm text-[var(--dark-grey)] leading-relaxed">
                      Experience the benefits of traditional wellness with our curated hampers and products.
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push("/shop")}
                    className="btn-standard rounded-full whitespace-nowrap shrink-0"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
