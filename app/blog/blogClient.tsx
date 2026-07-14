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

export default function BlogPageClient() {
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
    <main className="min-h-screen bg-[var(--site-bg)] relative overflow-hidden">
      {/* ──── Hero / Header ──── */}
      <section className="relative pt-36 md:pt-16 pb-16 px-6 sm:px-12 lg:px-20 text-center border-b border-[var(--dark-grey)]/10 bg-[var(--white)]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--olive)] mb-3 animate-fade-in-up">
            {t.blog?.journal || "The Corporate Journal"}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] leading-[1.2] mb-6 animate-fade-in-up delay-100 tracking-tight">
            {t.blog?.thoughts_on || "Thoughts on"}{" "}
            <span className="text-[var(--dark-brown)]">
              {t.blog?.wellness || "Wellness"}
            </span>{" "}
            &amp;{" "}
            <span className="text-[var(--dark-brown)]">
              {t.blog?.tradition || "Tradition"}
            </span>
          </h1>
          <p className="text-[var(--dark-grey)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t.blog?.subtitle ||
              "A collection of professional stories exploring ancient nutrition, mindful corporate gifting, and the rituals that enrich our everyday lives."}
          </p>
        </div>
      </section>

      {/* ──── Posts Grid ──── */}
      <section className="px-6 sm:px-12 lg:px-20 py-20 bg-[var(--site-bg)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[var(--olive)]"></div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] uppercase tracking-wider">
                {t.blog?.latest_articles || "Latest Articles"}
              </h2>
            </div>
            <div className="hidden sm:block flex-1 h-px bg-[var(--dark-grey)]/10 ml-8" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post, i) => (
              <article
                key={post.blogid || i}
                onClick={() => setSelectedPost(post)}
                className={`group cursor-pointer animate-fade-in-up delay-${((i % 3) + 1) * 100} border border-[var(--dark-grey)]/10 bg-[var(--white)] hover:shadow-lg hover:border-[var(--olive)]/50 rounded-sm overflow-hidden transition-all duration-300 flex flex-col h-full`}
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[var(--cream)] border-b border-[var(--dark-grey)]/10">
                  {post.blogimage && (
                    <img
                      src={IMAGE_URL + post.blogimage}
                      alt={post.title || "Blog Image"}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-[var(--olive)] text-[var(--white)] rounded-sm"
                    >
                      INSIGHTS
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[var(--foreground)] leading-snug mb-3 group-hover:text-[var(--olive-dark)] transition-colors duration-300">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-[var(--dark-grey)] leading-relaxed line-clamp-3 mb-6">
                    {post.description}
                  </p>

                  {/* Footer: Date & Read More */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--dark-grey)]/10">
                    <span className="text-xs text-[var(--dark-grey)] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(post.createdAt)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                      className="text-xs font-bold text-[var(--olive)] uppercase tracking-widest hover:text-[var(--orange)] transition-colors flex items-center gap-1 group/btn"
                    >
                      Read More{" "}
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Overlay ──── */}
      <div
        className={`fixed inset-0 bg-[var(--foreground)]/60 backdrop-blur-sm z-[90] transition-all duration-500 ${selectedPost ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelectedPost(null)}
      />

      {/* ──── Sidebar Reader (Corporate Modals) ──── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[48rem] bg-[var(--white)] z-[100] shadow-2xl border-l border-[var(--dark-grey)]/20 transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${selectedPost ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Reading progress bar */}
        <div className="fixed top-0 right-0 w-full max-w-[48rem] h-[3px] z-[110] bg-transparent">
          <div
            className="h-full bg-[var(--orange)] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {selectedPost && (
          <div className="min-h-full flex flex-col bg-[var(--site-bg)]">
            {/* ── Sidebar Hero Image ── */}
            <div className="relative w-full h-[45vh] min-h-[300px] bg-[var(--cream)] border-b border-[var(--dark-grey)]/10">
              {selectedPost.blogimage && (
                <img
                  src={IMAGE_URL + selectedPost.blogimage}
                  alt={selectedPost.title || "Blog"}
                  className="object-cover w-full h-full"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--foreground)]/50 via-transparent to-[var(--site-bg)]" />

              {/* Back button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-sm bg-[var(--white)] text-[var(--foreground)] border border-[var(--dark-grey)]/20 text-sm font-bold shadow-sm hover:bg-[var(--site-bg)] hover:text-[var(--olive)] transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Articles
              </button>
            </div>

            {/* ── Article Content ── */}
            <div className="px-8 sm:px-16 -mt-20 relative z-10 pb-16 flex-1">
              {/* Title card */}
              <div className="bg-[var(--white)] rounded-sm shadow-md p-8 sm:p-12 mb-10 border border-[var(--dark-grey)]/10">
                <div className="mb-4">
                  <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-[var(--olive-dark)] text-[var(--white)] rounded-sm">
                    CORPORATE INSIGHTS
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-[1.2] mb-8 tracking-tight">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 py-4 border-t border-[var(--dark-grey)]/10">
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--olive-dark)] flex items-center justify-center text-[var(--white)] font-bold text-lg shadow-sm">
                      T
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--foreground)] leading-tight">
                        {selectedPost.author || "Tradizions Corporate"}
                      </p>
                      <p className="text-xs text-[var(--dark-grey)] mt-0.5">
                        Enterprise Division
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-10 bg-[var(--dark-grey)]/20" />

                  <span className="text-sm font-medium text-[var(--dark-grey)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--orange)]" />{" "}
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </div>
              </div>

              {/* Body text */}
              <article className="max-w-none bg-[var(--white)] p-8 sm:p-12 shadow-sm border border-[var(--dark-grey)]/10 rounded-sm mb-12">
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
                          <p className="text-[var(--dark-grey)] text-base md:text-lg leading-relaxed mb-8 first-letter:text-6xl first-letter:font-bold first-letter:text-[var(--olive)] first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.8] text-justify">
                            {p1}
                          </p>
                        )}
                        {p2 && (
                          <p className="text-[var(--dark-grey)] text-base md:text-lg leading-relaxed mb-8 text-justify">
                            {p2}
                          </p>
                        )}
                        {p3 && (
                          <p className="text-[var(--dark-grey)] text-base md:text-lg leading-relaxed text-justify">
                            {p3}
                          </p>
                        )}
                      </>
                    );
                  })()}
              </article>

              {/* CTA */}
              <div className="bg-[var(--white)] rounded-sm border-l-4 border-[var(--olive)] shadow-sm p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="w-14 h-14 rounded-full bg-[var(--site-bg)] border border-[var(--dark-grey)]/20 flex items-center justify-center shrink-0">
                    <Leaf className="w-6 h-6 text-[var(--olive-dark)]" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h4 className="text-xl font-bold text-[var(--foreground)] mb-2">
                      Professional Corporate Gifting
                    </h4>
                    <p className="text-sm text-[var(--dark-grey)] leading-relaxed">
                      Strengthen your business relationships with our premium, traditional wellness hampers designed for corporate excellence.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/corporate-orders")}
                    className="btn-standard rounded-sm whitespace-nowrap shrink-0 shadow-md font-semibold tracking-wide"
                  >
                    View Services
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

