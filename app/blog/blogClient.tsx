"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  ArrowUpRight,
  Leaf,
  ChevronLeft,
  Share2,
  Star
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

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "Recent";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function BlogPageClient() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("EN");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
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
    <main className="min-h-screen bg-[var(--site-bg)] relative overflow-hidden font-sans">
      {/* ──── Hero / Header ──── */}
      <section className="relative pt-16 pb-10 px-6 sm:px-12 lg:px-20 text-center bg-gradient-to-b from-[var(--cream)] to-[var(--site-bg)] border-b border-[var(--dark-grey)]/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--olive)]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-[var(--orange)]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto flex flex-col items-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--white)] border border-[var(--olive)]/20 shadow-sm mb-6 animate-fade-in-up">
            <Star className="w-4 h-4 text-[var(--orange)]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--olive)]">
              {t.blog?.journal || "The Journal"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-[1.15] mb-6 animate-fade-in-up delay-100 tracking-tight font-serif">
            Stories of <span className="text-[var(--olive)] italic">Tradition</span> & <span className="text-[var(--orange)] italic">Wellness</span>
          </h1>
          <p className="text-[var(--dark-grey)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t.blog?.subtitle ||
              "Explore ancient nutrition, mindful gifting, and rituals that enrich our everyday lives. A curated collection for a healthier tomorrow."}
          </p>
        </div>
      </section>

      {/* ──── Posts Grid ──── */}
      <section className="px-6 sm:px-12 lg:px-20 py-20 bg-[var(--site-bg)] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--olive)]/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[var(--olive)]" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--foreground)] font-serif">
                {t.blog?.latest_articles || "Latest Articles"}
              </h2>
            </div>
            <div className="hidden md:flex flex-1 items-center ml-8">
              <div className="h-px bg-gradient-to-r from-[var(--dark-grey)]/20 to-transparent flex-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {blogs.map((post, i) => (
              <article
                key={post.blogid || i}
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer flex flex-col h-full bg-[var(--white)] rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-2 border border-[var(--dark-grey)]/10 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${((i % 3) + 1) * 100}ms` }}
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--cream)] border-b border-[var(--dark-grey)]/5">
                  {post.blogimage ? (
                    <img
                      src={IMAGE_URL + post.blogimage}
                      alt={post.title || "Blog Image"}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="w-12 h-12 text-[var(--olive)]/20" />
                    </div>
                  )}
                  {/* Floating Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/90 backdrop-blur-md text-[var(--olive)] rounded-full shadow-sm">
                      Insights
                    </span>
                  </div>
                  {/* Overlay for hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-center gap-2 mb-4 text-xs text-[var(--dark-grey)] font-medium">
                    <Calendar className="w-4 h-4 text-[var(--olive)]/70" />
                    {formatDate(post.createdAt)}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)] font-serif leading-snug mb-3 group-hover:text-[var(--olive)] transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-sm md:text-base text-[var(--dark-grey)] leading-relaxed line-clamp-3 mb-8">
                    {post.description}
                  </p>

                  <div className="mt-auto pt-5 border-t border-[var(--dark-grey)]/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest group-hover:text-[var(--orange)] transition-colors">Read Article</span>
                    <div className="w-8 h-8 rounded-full bg-[var(--site-bg)] group-hover:bg-[var(--orange)] flex items-center justify-center transition-colors duration-300 transform group-hover:scale-110">
                      <ArrowUpRight className="w-4 h-4 text-[var(--foreground)] group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Overlay ──── */}
      <div
        className={`fixed inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm z-[90] transition-all duration-500 ${selectedPost ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelectedPost(null)}
      />

      {/* ──── Sidebar Reader ──── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[90vw] md:w-[75vw] lg:w-[60vw] max-w-[55rem] bg-[var(--white)] z-[100] shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${selectedPost ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Reading progress bar */}
        <div className="sticky top-0 left-0 w-full h-1 z-[110] bg-[var(--site-bg)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {selectedPost && (
          <div className="min-h-full flex flex-col bg-[var(--white)] pb-24 relative">
            
            {/* Header Actions */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
              <button
                onClick={() => setSelectedPost(null)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-[var(--foreground)] shadow-sm hover:scale-110 transition-transform"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleCopy}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-[var(--foreground)] shadow-sm hover:scale-110 transition-transform relative"
              >
                <Share2 className="w-4 h-4" />
                {copied && (
                  <span className="absolute top-12 right-0 px-2 py-1 text-[10px] font-bold text-white bg-[var(--foreground)] rounded whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>

            {/* ── Sidebar Hero ── */}
            <div className="w-full h-[40vh] min-h-[300px] bg-[var(--cream)] relative">
              {selectedPost.blogimage && (
                <img
                  src={IMAGE_URL + selectedPost.blogimage}
                  alt={selectedPost.title}
                  className="object-cover w-full h-full"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white" />
            </div>

            {/* ── Article Content ── */}
            <div className="px-8 sm:px-16 max-w-4xl mx-auto w-full -mt-10 relative z-10">
              
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-12 border border-[var(--dark-grey)]/10 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--foreground)] leading-[1.2] mb-6">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-sm text-[var(--dark-grey)]">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(selectedPost.createdAt)}</span>
                </div>
              </div>

              <article className={`prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[var(--foreground)] prose-p:text-[var(--dark-grey)] prose-p:leading-relaxed`}>
                <div className="space-y-6 text-lg text-justify">
                  {selectedPost.description && selectedPost.description.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </article>

              {/* Author Footer */}
              <div className="mt-16 pt-8 border-t border-[var(--dark-grey)]/10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[var(--olive)]/10 flex items-center justify-center text-[var(--olive)] font-serif font-bold text-2xl">
                  {selectedPost.author ? selectedPost.author.charAt(0) : "T"}
                </div>
                <div>
                  <p className="text-sm text-[var(--dark-grey)] uppercase tracking-widest font-bold mb-1">Written By</p>
                  <p className="text-xl font-serif font-bold text-[var(--foreground)]">{selectedPost.author || "Tradizions Team"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
