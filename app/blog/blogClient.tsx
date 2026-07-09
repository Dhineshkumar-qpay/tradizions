"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  ArrowUpRight,
  Leaf,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { API } from "@/service/api_service";
import { BlogData } from "@/models/guide_blog_model";
import { IMAGE_URL } from "@/routes/api_routes";
import { useRouter } from "next/navigation";

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
  BLOG: "bg-orange-50 text-orange-700 border-orange-200",
};

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "Recent";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function BlogPageClinet() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("EN");
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogData | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = localStorage.getItem("preferredLang") || "EN";
    setSelectedLang(lang);

    const handleLangChange = (e: any) => {
      if (e && e.detail && e.detail.lang) {
        setSelectedLang(e.detail.lang);
      }
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await API.post("/blog/get-blogs");
        if (response.data && response.data.data) {
          setBlogs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      }
    };
    fetchBlogs();
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
    <main className="min-h-screen bg-stone-50 relative overflow-hidden">
      {/* ──── Hero / Header ──── */}
      <section className="relative pt-36 md:pt-44 pb-12 px-6 sm:px-12 lg:px-20 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 mb-3 animate-fade-in-up">
            {t.blog?.journal || "The Journal"}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-stone-900 leading-[1.1] mb-5 animate-fade-in-up delay-100">
            {t.blog?.thoughts_on || "Thoughts on"}{" "}
            <span className="font-normal">
              {t.blog?.wellness || "Wellness"}
            </span>{" "}
            &amp;{" "}
            <span className="font-normal">
              {t.blog?.tradition || "Tradition"}
            </span>
          </h1>
          <p className="text-[var(--dark-grey)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t.blog?.subtitle ||
              "A collection of stories exploring ancient nutrition, mindful gifting, and the rituals that enrich our everyday lives."}
          </p>
        </div>
      </section>

      {/* ──── Posts Grid ──── */}
      <section className="px-6 sm:px-12 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <Sparkles className="w-5 h-5 text-[var(--olive-dark)]" />
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 uppercase tracking-widest">
              {t.blog?.latest_articles || "Latest Articles"}
            </h2>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post, i) => (
              <article
                key={post.blogid || i}
                onClick={() => setSelectedPost(post)}
                className={`group cursor-pointer animate-fade-in-up delay-${((i % 3) + 1) * 100} border border-stone-200 bg-white hover:shadow-sm hover:border-stone-400 rounded-sm p-4 transition-all duration-300 flex flex-col h-full`}
              >
                {/* Image */}
                <div className="relative w-full aspect-[3/2] rounded-sm overflow-hidden mb-5 bg-stone-100">
                  {post.blogimage && (
                    <img
                      src={IMAGE_URL + post.blogimage}
                      alt={post.title || "Blog Image"}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-sm border bg-stone-50 border-stone-200 text-stone-600`}
                  >
                    BLOG
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[var(--dark-brown)] leading-snug mb-2 group-hover:text-[var(--olive)] transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[var(--dark-grey)] leading-relaxed line-clamp-2 mb-4">
                  {post.description}
                </p>

                {/* Footer: Date & Read More */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs text-[var(--dark-grey)]/50 font-medium">
                    {formatDate(post.createdAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                    }}
                    className="text-xs font-bold text-[var(--olive)] uppercase tracking-widest hover:text-[var(--dark-brown)] transition-colors flex items-center gap-1 group/btn"
                  >
                    Read More{" "}
                    <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Overlay ──── */}
      <div
        className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[90] transition-all duration-500 ${selectedPost ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelectedPost(null)}
      />

      {/* ──── Sidebar Reader ──── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[44rem] bg-white z-[100] shadow-xl border-l border-stone-200 transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
          selectedPost ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Reading progress bar */}
        <div className="fixed top-0 right-0 w-full max-w-[44rem] h-[3px] z-[110] bg-transparent">
          <div
            className="h-full bg-[var(--olive-dark)] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {selectedPost && (
          <div className="min-h-full">
            {/* ── Sidebar Hero Image ── */}
            <div className="relative w-full h-[50vh] min-h-[360px] bg-stone-100">
              {selectedPost.blogimage && (
                <img
                  src={IMAGE_URL + selectedPost.blogimage}
                  alt={selectedPost.title || "Blog"}
                  className="object-cover w-full h-full"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />

              {/* Back button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-sm bg-white text-stone-900 border border-stone-200 text-sm font-bold shadow-sm hover:bg-stone-50 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Category pill on image */}
              <div className="absolute top-6 right-6 z-10">
                <span
                  className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-sm border bg-stone-900 text-white border-stone-800`}
                >
                  BLOG
                </span>
              </div>
            </div>

            {/* ── Article Content ── */}
            <div className="px-8 sm:px-14 -mt-16 relative z-10">
              {/* Title card */}
              <div className="bg-white rounded-sm shadow-sm p-8 sm:p-10 mb-10 border border-stone-200">
                <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-stone-900 leading-[1.15] mb-6">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[var(--olive-dark)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      T
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900 leading-tight">
                        {selectedPost.author || "Tradizions"}
                      </p>
                      <p className="text-[11px] text-[var(--dark-grey)]">
                        Health &amp; Wellness
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-gray-200" />

                  <span className="text-xs text-[var(--dark-grey)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--orange)]" />{" "}
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </div>
              </div>

              {/* Body text */}
              <article className="max-w-none mb-16">
                {selectedPost.description &&
                  (() => {
                    const desc = selectedPost.description;
                    const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];

                    // Split into 3 parts
                    let p1 = desc,
                      p2 = "",
                      p3 = "";

                    if (sentences.length >= 3) {
                      const third = Math.ceil(sentences.length / 3);
                      p1 = sentences.slice(0, third).join(" ").trim();
                      p2 = sentences
                        .slice(third, third * 2)
                        .join(" ")
                        .trim();
                      p3 = sentences
                        .slice(third * 2)
                        .join(" ")
                        .trim();
                    } else if (desc.length > 90) {
                      // Split raw string roughly into 3
                      const thirdLen = Math.floor(desc.length / 3);
                      const space1 = desc.indexOf(" ", thirdLen);
                      const space2 = desc.indexOf(" ", thirdLen * 2);

                      if (space1 !== -1 && space2 !== -1) {
                        p1 = desc.substring(0, space1).trim();
                        p2 = desc.substring(space1 + 1, space2).trim();
                        p3 = desc.substring(space2 + 1).trim();
                      } else if (space1 !== -1) {
                        p1 = desc.substring(0, space1).trim();
                        p2 = desc.substring(space1 + 1).trim();
                      }
                    } else if (sentences.length === 2) {
                      p1 = sentences[0].trim();
                      p2 = sentences[1].trim();
                    }

                    return (
                      <>
                        {p1 && (
                          <p className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-8 first-letter:text-6xl first-letter:font-bold first-letter:text-[var(--olive)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8] text-justify">
                            {p1}
                          </p>
                        )}
                        {p2 && (
                          <p className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-7 text-justify">
                            {p2}
                          </p>
                        )}
                        {p3 && (
                          <p className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-7 text-justify">
                            {p3}
                          </p>
                        )}
                      </>
                    );
                  })()}
              </article>

              {/* CTA */}
              <div className="mb-20 rounded-sm overflow-hidden bg-stone-50 border border-stone-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">
                  <div className="w-16 h-16 rounded-sm bg-[var(--olive-dark)] flex items-center justify-center shrink-0 shadow-sm">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h4 className="text-xl font-bold text-stone-900 mb-2">
                      Explore Our Collections
                    </h4>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Experience the benefits of traditional wellness with our
                      curated hampers and products.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/shop")}
                    className="btn-standard rounded-sm whitespace-nowrap shrink-0 border border-transparent"
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
