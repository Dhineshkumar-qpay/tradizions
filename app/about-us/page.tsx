"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  Droplets,
  Nut,
  CheckCircle2,
  HeartHandshake,
  Sprout,
  Target,
  Award,
  Users,
  ShieldCheck,
  ChevronRight,
  Globe,
  Sparkles,
  Package,
  Soup,
  Star,
  Video,
  Upload,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

/* ── Intersection Observer Hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function AboutUsPage() {
  const [loaded, setLoaded] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // New Tabs and Video Upload States
  const [activeTab, setActiveTab] = useState<"text" | "video">("text");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoEmail, setVideoEmail] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isVideoSubmitting, setIsVideoSubmitting] = useState(false);
  const [isVideoSubmitted, setIsVideoSubmitted] = useState(false);

  const handleActionWithLogin = (action: () => void) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.dispatchEvent(new Event("openLoginSidebar"));
      const handleLoginSuccess = () => {
        action();
        window.removeEventListener("loginSuccess", handleLoginSuccess);
      };
      window.addEventListener("loginSuccess", handleLoginSuccess);
    } else {
      action();
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    handleActionWithLogin(async () => {
      setIsSubmitting(true);
      try {
        const response = await API.post(API_ROUTES.ADDAPPREVIEW, {
          username: name,
          email,
          rating,
          review,
        });
        if (response.status === 200) {
          setIsSubmitted(true);
          setName("");
          setEmail("");
          setReview("");
          setRating(0);
        } else {
          alert("Failed to submit feedback. Please try again.");
        }
      } catch (err: any) {
        console.error("Error submitting app review:", err);
        alert(
          err?.response?.data?.message ||
            "An error occurred while submitting feedback.",
        );
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleSubmitVideoReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Please upload a video file.");
      return;
    }
    if (videoFile.size > 10 * 1024 * 1024) {
      alert(
        "Video file size exceeds the 10MB limit. Please upload a smaller video.",
      );
      return;
    }
    handleActionWithLogin(async () => {
      setIsVideoSubmitting(true);
      try {
        // Simulate video upload
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsVideoSubmitted(true);
        setVideoTitle("");
        setVideoEmail("");
        setVideoDesc("");
        setVideoFile(null);
      } catch (err: any) {
        console.error("Error submitting video review:", err);
        alert("An error occurred while uploading video.");
      } finally {
        setIsVideoSubmitting(false);
      }
    });
  };

  useEffect(() => {
    setLoaded(true);
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

  const heroRef = useInView();
  const storyRef = useInView();
  const valuesRef = useInView();
  const missionRef = useInView();
  const offerRef = useInView();

  const promises = [
    {
      icon: ShieldCheck,
      title: "Quality First",
      desc: "Sourced from trusted farmers and suppliers.",
      color: "emerald",
    },
    {
      icon: Droplets,
      title: "Freshness Guaranteed",
      desc: "Packed to retain natural taste and nutrition.",
      color: "amber",
    },
    {
      icon: Award,
      title: "Tradition & Purity",
      desc: "Authentic products you can trust.",
      color: "olive",
    },
    {
      icon: Users,
      title: "Customer First",
      desc: "Your satisfaction is our priority.",
      color: "emerald",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--site-bg)] overflow-x-hidden">
      {/* ── HERO SECTION ── */}
      <section
        ref={heroRef.ref}
        className="relative pt-32 pb-24 lg:pt-40 lg:pb-40 overflow-hidden flex items-center justify-center bg-white"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[var(--olive)]/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[var(--orange)]/5 rounded-full blur-[120px] translate-y-1/3 translate-x-1/3 pointer-events-none" />

        {/* Floating shapes */}
        <div className="absolute top-1/4 right-10 w-24 h-24 bg-amber-100 rounded-full blur-xl animate-float opacity-50" />
        <div className="absolute bottom-1/4 left-10 w-32 h-32 bg-emerald-100 rounded-full blur-xl animate-float delay-700 opacity-50" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20 text-[11px] font-bold tracking-[0.25em] uppercase mb-8 shadow-sm transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Leaf className="w-4 h-4" />
            {t.about_us.heritage}
          </div>

          <h1
            className={`text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.about_us.welcome}
            <span className="gradient-text"> {t.about_us.brand}</span>
          </h1>

          <p
            className={`text-md md:text-md text-gray-500 leading-relaxed font-light max-w-3xl mx-auto transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.about_us.welcome}{" "}
            <span className="font-semibold text-gray-900">
              {t.about_us.brand.replace(".", "")}
            </span>
            –{t.about_us.tagline1}
          </p>

          <p
            className={`text-md md:text-md text-gray-500 leading-relaxed font-light max-w-3xl mx-auto mt-4 transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.about_us.tagline2}
          </p>

          <div
            className={`mt-12 flex justify-center gap-4 transition-all duration-1000 delay-600 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="w-1 h-20 bg-gradient-to-b from-[var(--olive)] to-transparent rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section ref={storyRef.ref} className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div
              className={`w-full lg:w-1/2 relative transition-all duration-1000 ${storyRef.isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
            >
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl z-10">
                <Image
                  src="https://ayoubs.ca/cdn/shop/articles/Keeping_Nuts_Fresh_1_0392edc0-a2f5-4141-ad20-eba7fde1a2c7_460x@2x.png?v=1750113836"
                  fill
                  alt="Our agricultural roots"
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-10 left-10 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-[2px] bg-[var(--orange)]" />
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/80">
                      {t.about_us.heritage}
                    </p>
                  </div>
                  <p className="text-5xl font-black italic">1995</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--olive)]/10 rounded-full -z-10 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 organic-shape bg-amber-500/10 -z-10 blur-3xl animate-float" />

              {/* Floating Badge */}
              <div className="absolute -right-8 top-1/4 glass p-6 rounded-3xl border border-white/20 shadow-2xl z-20 max-w-[200px] animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-100">
                    {t.about_us.org_cert.split(" ")[0]}
                  </p>
                </div>
                <p className="text-xs font-medium text-white leading-relaxed">
                  Trusted by over 100+ health-conscious families.
                </p>
              </div>
            </div>

            <div
              className={`w-full lg:w-1/2 space-y-10 transition-all duration-1000 delay-300 ${storyRef.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            >
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-[var(--olive)] tracking-[0.3em] uppercase">
                  {t.about_us.story_title}
                </h2>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {t.about_us.story_heading.split(",")[0]}, <br />
                  <span className="gradient-text">
                    {t.about_us.story_heading.split(",")[1]}
                  </span>
                </h3>
                <div className="w-20 h-1.5 bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] rounded-full" />
              </div>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                <p>{t.about_us.story_desc1}</p>
                <p>{t.about_us.story_desc2}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">30+</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t.about_us.exp_years}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t.about_us.org_cert}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE MISSION CARD ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-[var(--orange)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="group relative bg-white rounded-[3rem] p-12 md:p-16 border border-[#e0d4b7] shadow-[0_50px_100px_-30px_rgba(85,107,47,0.08)] overflow-hidden transition-all duration-700 hover:shadow-[0_60px_120px_-30px_rgba(85,107,47,0.12)]">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-[var(--olive)]/5 opacity-30 pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                <HeartHandshake className="w-8 h-8" />
              </div>

              <div className="space-y-8">
                <div className="flex justify-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[var(--olive)] animate-pulse" />
                  <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[var(--olive)] to-transparent" />
                </div>

                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-relaxed italic tracking-wide">
                  “{t.about_us.mission_quote}”
                </h2>

                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="w-16 h-[1px] bg-gray-200" />
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[var(--olive)] opacity-60">
                    {t.about_us.mission_title}
                  </p>
                </div>
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--olive)]/5 rounded-full blur-2xl group-hover:bg-[var(--olive)]/10 transition-colors duration-700" />
          </div>
        </div>
      </section>

      {/* ── OUR PROMISE ── */}
      <section ref={valuesRef.ref} className="py-32 bg-[var(--site-bg)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <p className="text-sm font-bold text-[var(--olive)] tracking-[0.3em] uppercase">
              {t.about_us.promise_title}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {t.about_us.promise_heading.split(" ")[0]}{" "}
              {t.about_us.promise_heading.split(" ")[1]}{" "}
              <span className="gradient-text">
                {t.about_us.promise_heading.split(" ").slice(2).join(" ")}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {promises.map((v, i) => (
              <div
                key={i}
                className={`premium-card bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center transition-all duration-700 ${valuesRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${v.color === "emerald" ? "bg-emerald-50 text-emerald-600" : v.color === "amber" ? "bg-amber-50 text-amber-600" : "bg-olive-50 text-[var(--olive)]"}`}
                >
                  <v.icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  {t.about_us.promises?.[i]?.title || v.title}
                </h4>
                <p className="text-sm text-gray-500 font-light leading-relaxed">
                  {t.about_us.promises?.[i]?.desc || v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEBSITE RATING & REVIEWS FORM ── */}
      <section
        ref={offerRef.ref}
        className="py-32 bg-white relative overflow-hidden"
      >
        {/* Background Texture & Ornaments */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[var(--olive)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--olive)] bg-[var(--olive)]/10 px-4 py-1.5 rounded-full inline-block">
              {t.about_us.feedback_badge || "We Value Your Feedback"}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mt-4">
              {t.about_us.rate_your || "Rate Your"}{" "}
              <span className="gradient-text">
                {t.about_us.experience || "Experience"}
              </span>
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto mt-4">
              {t.about_us.feedback_desc ||
                "Your feedback helps us improve and deliver the best possible traditional wellness experience."}
            </p>
          </div>

          <div
            className={`bg-white rounded-[1rem] shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-stone-100 p-8 md:p-14 relative overflow-hidden transition-all duration-700 min-h-[400px] flex flex-col justify-center ${offerRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
          >
            {/* Form decorative corner */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--olive)]/5 rounded-full blur-2xl" />

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-emerald-50 text-[var(--olive)] rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-sm animate-scale-in">
                  <CheckCircle2 className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  Feedback Submitted Successfully!
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed font-light">
                  Thank you for sharing your experience. Your review helps us
                  continue to improve our traditional wellness portal!
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-8 py-3.5 rounded-xl bg-[var(--olive)] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all shadow-lg cursor-pointer hover:-translate-y-0.5"
                >
                  Write Another Review
                </button>
              </div>
            ) : (
              <form
                className="space-y-8 relative z-10 animate-fade-in"
                onSubmit={handleSubmitReview}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)]"></span>{" "}
                      {t.about_us.your_name || "Your Name"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        t.about_us.enter_name || "Enter your full name"
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none transition-all text-[13px] font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium shadow-inner"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]"></span>{" "}
                      {t.about_us.email_address || "Email Address"}
                    </label>
                    <input
                      type="email"
                      placeholder={t.about_us.enter_email || "Enter your email"}
                      className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none transition-all text-[13px] font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium shadow-inner"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Rating Star */}
                <div className="space-y-4 pt-4 pb-4 border-y border-stone-100">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{" "}
                    {t.about_us.overall_rating || "Overall Rating"}
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-2xl border border-stone-100 w-fit">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-2 rounded-xl transition-all hover:bg-white hover:shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Star
                            className={`w-8 h-8 transition-all duration-300 ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                                : "fill-stone-200 text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-800">
                        {rating === 0
                          ? t.about_us.select_rating || "Select your rating"
                          : rating === 5
                            ? t.about_us.rating_5 || "Excellent experience!"
                            : rating === 4
                              ? t.about_us.rating_4 || "Very good service"
                              : rating === 3
                                ? t.about_us.rating_3 || "It was okay"
                                : rating === 2
                                  ? t.about_us.rating_2 || "Could be better"
                                  : t.about_us.rating_1 || "Disappointing"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {rating > 0
                          ? `${t.about_us.rated_text || "You rated us"} ${rating} ${t.about_us.out_of_5 || "out of 5 stars"}`
                          : t.about_us.tap_star || "Tap a star to rate"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>{" "}
                    {t.about_us.your_review || "Your Review"}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      t.about_us.review_placeholder ||
                      "Tell us what you loved or what we can improve..."
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none transition-all text-[13px] font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium shadow-inner resize-none"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[var(--olive)] text-white font-black text-[11px] tracking-[0.2em] uppercase transition-all duration-500 hover:shadow-[0_20px_40px_rgba(85,107,47,0.3)] hover:-translate-y-1 active:scale-95 overflow-hidden relative cursor-pointer disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {isSubmitting
                        ? "Submitting..."
                        : t.about_us.submit_review || "Submit Review"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--olive-dark)] to-[var(--olive)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CheckCircle2 className="w-4 h-4 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
