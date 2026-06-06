"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Star,
  ChevronRight,
  Leaf,
  Gift,
  Zap,
  Heart,
  Droplets,
  Sparkles,
  Shield,
  Truck,
  Award,
  Quote,
  Check,
  BadgeCheck,
  Lock,
  Activity,
  Scale,
  Baby,
  ScrollText,
  Search,
  Trash2,
  Plus,
  ArrowDown,
  LayoutGrid,
  Wheat,
  Flame,
  Circle,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import {
  HomeProductModel,
  ReviewModel,
  Review,
  KuralModel,
  KuralData,
  CalculatorProducts,
} from "@/models/home_model";
import { HealthGoalsData } from "@/models/product_detail_model";
import { img } from "framer-motion/m";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const whyChooseUs = [
  {
    icon: Star,
    title: "Quality products",
    desc: "Premium grade organic selection",
  },
  {
    icon: Sparkles,
    title: "Fresh packing",
    desc: "Packed with care for longevity",
  },
  {
    icon: Heart,
    title: "Trusted by families",
    desc: "100+ happy households",
  },
  { icon: Zap, title: "Fast delivery", desc: "Quick turnaround time" },
];

/* ── Intersection Observer Hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

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

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const cleanedBase = IMAGE_URL.endsWith("/") ? IMAGE_URL.slice(0, -1) : IMAGE_URL;
  const cleanedPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;

  return `${cleanedBase}/${cleanedPath}`;
};

/* ── Main Page ── */
export default function Home() {
  const [selectedLang, setSelectedLang] = useState("EN");
  const [categories, setCategories] = useState<any[]>([]);
  const [homeData, setHomeData] = useState<HomeProductModel | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<any[]>([]);
  const [kuralList, setKuralList] = useState<KuralData[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);
  const [healthGoalsData, setHealthGoalsData] = useState<HealthGoalsData[]>([]);

  const fetchHealthGoals = async () => {
    try {
      const response = await API.post(API_ROUTES.HEALTHGOALS);
      if (response.status === 200) {
        setHealthGoalsData(response.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching health goals:", err);
    }
  };

  const fetchFavourites = async () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      try {
        const response = await API.post(API_ROUTES.GETFAVOURITE);
        if (response.status === 200) {
          const list = response.data?.data || [];
          setFavouriteProductIds(list.map((fav: any) => fav.productid));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setFavouriteProductIds([]);
    }
  };

  const fetchKural = async () => {
    try {
      const response = await API.post(API_ROUTES.GETKURAL);
      if (response.status === 200) {
        console.log("Fetched kural:", response.data);
        const kuralModel: KuralModel = response.data;
        setKuralList(kuralModel.data ?? []);
      } else {
        setKuralList([]);
      }
    } catch (error) {
      console.error("Error fetching kural:", error);
      setKuralList([]);
    }
  };

  useEffect(() => {
    fetchFavourites();
    window.addEventListener("favoritesUpdated", fetchFavourites);
    window.addEventListener("loginSuccess", fetchFavourites);
    return () => {
      window.removeEventListener("favoritesUpdated", fetchFavourites);
      window.removeEventListener("loginSuccess", fetchFavourites);
    };
  }, []);

  // Fetch categories on mount

  const fetchCategories = async () => {
    const response = await API.post(API_ROUTES.CATEGORIES, { type: "all" });
    if (response.status === 200) {
      console.log("Fetched categories:", response.data);
      setCategories(response.data["data"] || []);
    } else {
      setCategories([]);
    }
  };

  const fetchHomeProducts = async () => {
    try {
      const response = await API.post(API_ROUTES.HOMEPRODUCTS);
      if (response.status === 200) {
        console.log("Fetched home products:", response.data);
        setHomeData(response.data);
      }
    } catch (err) {
      console.error("Error fetching home products:", err);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await API.post(API_ROUTES.FEATURED, {
        page: 1,
        limit: 20,
      });
      if (response.data && response.data.success) {
        setFeaturedProducts(response.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching featured products:", err);
    }
  };

  const fetchNewArrivalsProducts = async () => {
    try {
      const response = await API.post(API_ROUTES.NEWARRIVALS, {
        page: 1,
        limit: 20,
      });
      if (response.data && response.data.success) {
        setNewArrivalsProducts(response.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching new arrivals products:", err);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await API.post(API_ROUTES.GETALLUSERREVIEWS);
      if (response.status === 200) {
        console.log("Fetched user reviews:", response.data);
        const reviewModel: ReviewModel = response.data;
        setUserReviews(reviewModel.data || []);
      }
    } catch (err) {
      console.error("Error fetching user reviews:", err);
    }
  };

  useEffect(() => {
    fetchKural();
    fetchCategories();
    fetchHomeProducts();
    fetchFeaturedProducts();
    fetchNewArrivalsProducts();
    fetchUserReviews();
    fetchHealthGoals();
  }, []);

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

  let dailyKural: KuralData | null = null;
  if (kuralList && kuralList.length > 0) {
    const dayIndex =
      Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % kuralList.length;
    dailyKural = kuralList[dayIndex];
  }

  return (
    <div className="min-h-screen bg-[var(--site-bg)] overflow-x-hidden">
      <HeroSection t={t} />

      {/* Brand Promise Section */}
      <section className="py-8 md:py-10 bg-white relative overflow-hidden border-b border-stone-50">
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-base md:text-lg font-medium text-gray-700 leading-relaxed italic">
            "{t.home_tagline}"
          </h2>
        </div>
        {/* Subtle decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </section>

      <KuralTrustRow t={t} kuraldata={dailyKural} />
      <CategoriesSection t={t} categories={categories} />
      <HealthGoalsSection t={t} goals={healthGoalsData} />
      <HealthBenefitsSection t={t} />

      {/* ──── Full Size Banner with Shop Button ──── */}
      <section className="relative w-full h-[60vh] md:h-[80vh] min-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1649103989985-e8d5b778f5c7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-8 z-10">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">
              {t.banner_title || "Pure Nutrition, Rooted in Tradition"}
            </h2>
            <p className="text-base md:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md">
              {t.banner_subtitle || "Elevate your daily wellness with our premium, carefully sourced natural ingredients. Good for you, and good for your family."}
            </p>
          </div>
          <a href="/shop" className="bg-[var(--olive)] text-white px-10 py-3 text-sm md:text-base font-semibold tracking-[0.2em] uppercase rounded-full hover:bg-[var(--olive-dark)] transition-all duration-500 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1">
            {t.shop_now || "Shop Now"}
          </a>
        </div>
      </section>

      <FeaturedSection t={t} products={featuredProducts} />
      <NewArrivalsSection t={t} products={newArrivalsProducts} />
      <WhyChooseUsSection t={t} />
      <GiftingSection
        t={t}
        giftHampers={homeData?.data?.gifthampers}
        poojaHampers={homeData?.data?.poojahampers}
      />
      <NutritionPlanner t={t} />
      <SubscriptionPlans t={t} />
      <TestimonialsSection t={t} reviews={userReviews} />
      <CertificationsSection />
      {/* <VideoTestimonialsSection /> */}
      <SustainabilityAndPackagingSection />
    </div>
  );
}

//  HEALTH BENEFITS SECTION (REDESIGNED)
//  ══════════════════════════════════════════════════════════════ */
function HealthBenefitsSection({ t }: { t: any }) {
  const [activeCategory, setActiveCategory] = useState<
    "nuts" | "millets" | "spices"
  >("nuts");

  const benefitsMap: Record<string, any[]> = {
    nuts: t.health_benefits_data?.nuts || [],
    millets: t.health_benefits_data?.millets || [],
    spices: t.health_benefits_data?.spices || [],
  };

  const categoryMeta: Record<string, { emoji: string; color: string; accent: string; stat: string; label: string; lightGradient: string }> = {
    nuts: { emoji: "🧆", color: "from-amber-700 to-amber-500", accent: "bg-amber-500", stat: "18g", label: "Avg. Protein / 100g", lightGradient: "from-amber-50 to-orange-50/30" },
    millets: { emoji: "🌾", color: "from-[var(--olive-dark)] to-[var(--olive)]", accent: "bg-[var(--olive)]", stat: "72%", label: "Fibre Rich Varieties", lightGradient: "from-[var(--olive)]/10 to-[var(--beige)]/30" },
    spices: { emoji: "🫚", color: "from-orange-700 to-[var(--orange)]", accent: "bg-[var(--orange)]", stat: "3x", label: "More Antioxidants", lightGradient: "from-rose-50 to-orange-50/40" },
  };

  const activeBenefits = benefitsMap[activeCategory];
  const meta = categoryMeta[activeCategory];

  const categories: Array<"nuts" | "millets" | "spices"> = ["nuts", "millets", "spices"];

  return (
    <section className="py-16 bg-[#fafaf9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Top Row: Label + Headline ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--olive)]/8 border border-[var(--olive)]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--olive)]">
                {t.health_advantage || "The Health Advantage"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--dark-brown)] leading-tight">
              {t.health_advantage_headline_1 || "Nature's finest, "}{" "}
              <span className="gradient-text">{t.health_advantage_headline_2 || "science-backed"}</span>{" "}
              {t.health_advantage_headline_3 || "nutrition"}
            </h2>
            <p className="text-sm text-[var(--dark-grey)] font-medium leading-relaxed max-w-md">
              {t.health_advantage_desc || "Every ingredient is hand-selected from certified farms and packed fresh to preserve maximum nutritional value."}
            </p>
          </div>

          {/* ── Stat Pill ── */}
          <div className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br ${meta.color} text-white shadow-lg transition-all duration-500`}>
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <p className="text-3xl font-black leading-none">{meta.stat}</p>
              <p className="text-[10px] font-bold opacity-80 tracking-widest uppercase mt-0.5">{meta.label}</p>
            </div>
          </div>
        </div>

        {/* ── Category Tabs (inline pill style) ── */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-6 py-2.5 rounded-xl text-[11px] font-black tracking-[0.18em] uppercase transition-all duration-400 cursor-pointer ${activeCategory === cat
                ? "bg-[var(--olive)] text-white shadow-md"
                : "bg-white text-stone-500 border border-stone-150 hover:border-[var(--olive)] hover:text-[var(--olive)]"
                }`}
            >
              {activeCategory === cat && (
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white`} />
              )}
              <span className={activeCategory === cat ? "pl-3" : ""}>{t.sections?.[cat] || cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrolling Cards Strip (Redesigned) ── */}
      <div className="relative group overflow-hidden mt-6">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] py-8">
          {[...activeBenefits, ...activeBenefits].map((benefit: any, idx: number) => {
            return (
              <div
                key={benefit.name + idx}
                className="flex-shrink-0 w-[280px] md:w-[320px] mx-4 min-h-[190px] relative overflow-hidden rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 group/card flex flex-col p-7"
              >
                {/* Elegant glow effect behind the card */}
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${meta.color} opacity-20 rounded-full blur-2xl transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div className="shrink-0 w-12 h-12 rounded-[14px] bg-white shadow-md border border-stone-100 flex items-center justify-center relative overflow-hidden transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-10 transition-opacity duration-300`} />
                    <span className="text-xl scale-110 transition-transform duration-300">{meta.emoji}</span>
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-white border border-stone-200 opacity-100 transition-all duration-300`}>
                    <Check className={`w-3.5 h-3.5 text-[var(--olive)] transition-colors`} strokeWidth={3} />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-[16px] font-black text-[var(--olive)] leading-tight mb-2 transition-colors duration-300">
                    {benefit.name}
                  </h3>
                  <p className="text-[12px] text-stone-500 leading-relaxed font-medium line-clamp-3">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seamless Fade edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fafaf9] via-[#fafaf9]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fafaf9] via-[#fafaf9]/80 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}

// -----------------------------------  HERO SECTION

function HeroSection({ t }: { t: any }) {
  const [loaded, setLoaded] = useState(true);
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home-banner.png"
          alt="Premium Tradizions - Organic Millets & Traditional Wellness"
          fill
          className={`object-cover transition-all duration-[2000ms] ${loaded ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
          priority
        />
        {/* Premium Multi-layered Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/20" />
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-14 right-20 w-80 h-80 bg-[var(--orange)]/10 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] animate-float delay-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 pb-20">
        <div className="max-w-3xl space-y-8">
          {/* Headline */}
          <h1
            className={`text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-extrabold text-white leading-[0.95] tracking-wide transition-all duration-500 delay-200 opacity-100 translate-y-0`}
          >
            {t.hero_title_1} <br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-300 tracking-wider">
                {t.hero_title_2}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-md md:text-md text-white/60 max-w-1xl leading-relaxed font-light transition-all duration-500 delay-400 opacity-100 translate-y-0`}
          >
            {t.hero_subtitle}
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-3 pt-4 transition-all duration-500 delay-600 opacity-100 translate-y-0`}
          >
            <Link
              href="/shop"
              className="btn-standard group relative flex items-center gap-2 rounded-full font-semibold text-xs tracking-[0.12em] transition-all duration-500 hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">{t.shop} </span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/gifts"
              className="btn-standard group flex items-center gap-2 rounded-full font-semibold text-xs tracking-[0.12em] transition-all duration-500 hover:-translate-y-1 active:scale-95"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <Gift className="w-4 h-4" />
              {t.gifting}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 z-10">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

// ----------------------------------- CATEGORIES

const getCategoryImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const cleanedBase = IMAGE_URL.endsWith("/") ? IMAGE_URL.slice(0, -1) : IMAGE_URL;
  const cleanedPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;

  return `${cleanedBase}/${cleanedPath}`;
};

function CategoriesSection({ t, categories }: { t: any; categories: any[] }) {
  const { ref, isVisible } = useInView();
  const displayCategories =
    categories && categories.length > 0 ? categories : [];

  return (
    <section ref={ref} className="py-16 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-20 space-y-5 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.categories_title?.split(" ").slice(0, 2).join(" ") ||
              "Our Collections"}{" "}
            <span className="gradient-text">
              {t.categories_title?.split(" ").slice(2).join(" ") || ""}
            </span>
          </h2>
          <p className="text-sm font-normal text-gray-400 font-light max-w-lg mx-auto">
            {t.categories_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayCategories.map((cat, idx) => {
            const imageUrl = getCategoryImageUrl(cat.categoryimage);

            return (
              <Link
                href={`/shop?category=${encodeURIComponent(cat.categoryname || "")}`}
                key={idx}
                className={`group relative h-[250px] rounded-[1rem] overflow-hidden transition-all duration-500 opacity-100 translate-y-0`}
                style={{
                  transitionDelay: isVisible ? `${idx * 100}ms` : "0ms",
                }}
              >
                {/* Background Image */}
                <img
                  src={imageUrl}
                  alt={cat.categoryname || ""}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-6 bottom-8 text-center space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white transition-all duration-500 group-hover:translate-y-1">
                      {cat.categoryname || ""}
                    </h3>
                    <p className="text-xs text-white/60 font-medium mt-1 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      ({cat.products || 0} products)
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------  FEATURED PRODUCTS

function FeaturedSection({ t, products }: { t: any; products?: any[] }) {
  const { ref, isVisible } = useInView();
  const displayProducts = products && products.length > 0 ? products : [];

  return (
    <section
      ref={ref}
      className="py-16 bg-[var(--site-bg)] relative overflow-hidden"
    >
      {/* Organic Background Blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[var(--olive)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-[var(--orange)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <div className="space-y-5">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
              {t.featured_products.split(" ")[0]}{" "}
              <span className="gradient-text">
                {t.featured_products.split(" ")[1]}
              </span>
            </h2>
            <p className="text-sm font-medium text-gray-400 max-w-md">
              {t.featured_desc}
            </p>
          </div>
          <Link
            href="/featured"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--olive)] relative"
          >
            <span className="relative">
              {t.explore_all}

              {/* Animated underline */}
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[var(--olive)] transition-all duration-300 group-hover:w-full"></span>
            </span>

            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[var(--olive)]" />
          </Link>
        </div>

        {/* Product Horizontal Scroll */}
        {displayProducts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Leaf className="w-8 h-8 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              No products found.
            </p>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 md:gap-6 pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {displayProducts.map((product, idx) => (
              <div
                key={
                  product.productid !== undefined
                    ? product.productid
                    : product.id
                }
                className="w-[60vw] sm:w-[calc(50%-0.25rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start flex-shrink-0"
              >
                <ProductCard
                  product={product}
                  isVisible={isVisible}
                  delay={idx * 150}
                  t={t}
                />
              </div>
            ))}
            {/* View All Card */}
            {displayProducts.length > 10 && (
              <div className="w-[60vw] sm:w-[calc(50%-0.25rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start flex-shrink-0 flex">
                <Link
                  href="/featured"
                  className="flex-1 group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/50 min-h-[350px]"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[var(--olive)] transition-colors duration-300 shadow-sm group-hover:shadow-md">
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors">
                    {t.explore_all || "View All"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Explore more products
                  </p>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  isVisible,
  delay,
  t,
}: {
  product: any;
  isVisible: boolean;
  delay: number;
  t: any;
}) {
  const id = product.productid !== undefined ? product.productid : product.id;
  const name = product.productname || product.name;
  const price = product.sellingprice || product.price || 0;
  const originalPrice =
    product.price !== undefined &&
      product.sellingprice !== undefined &&
      product.price > product.sellingprice
      ? product.price
      : null;
  const image = product.productimage
    ? getImageUrl(product.productimage)
    : product.image || "/placeholder.png";

  const [isAdding, setIsAdding] = useState(false);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);

  const fetchFavourites = async () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      try {
        const response = await API.post(API_ROUTES.GETFAVOURITE);
        if (response.status === 200) {
          const list = response.data?.data || [];
          setFavouriteProductIds(list.map((fav: any) => fav.productid));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setFavouriteProductIds([]);
    }
  };

  useEffect(() => {
    fetchFavourites();
    window.addEventListener("favoritesUpdated", fetchFavourites);
    window.addEventListener("loginSuccess", fetchFavourites);
    return () => {
      window.removeEventListener("favoritesUpdated", fetchFavourites);
      window.removeEventListener("loginSuccess", fetchFavourites);
    };
  }, []);

  const isFav = id !== undefined && favouriteProductIds.includes(id);

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

  const isGiftOrPooja =
    product.categoryid === 4 ||
    product.categoryid === 5 ||
    product.itemtype === "gift" ||
    (product.category && product.category.toLowerCase().includes("gift"));
  const detailUrl = isGiftOrPooja
    ? `/gift-detail/${id}?productid=${id}&bid=${product.bid || 1}`
    : `/product-detail/${id}?productid=${id}&bid=${product.bid || 1}`;

  return (
    <Link
      href={detailUrl}
      className="group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110 ${(product.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
        />

        {(product.availablestock ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
            <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Floating Actions */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActionWithLogin(async () => {
                if (id === undefined) return;
                try {
                  const response = await API.post(API_ROUTES.ADDFAVOURITE, {
                    productid: id,
                  });
                  if (response.status === 200) {
                    window.dispatchEvent(new Event("favoritesUpdated"));
                  }
                } catch (err) {
                  console.error("Error adding to wishlist:", err);
                }
              });
            }}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>

        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {originalPrice && originalPrice > price && (
            <span className="px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[8px] font-black text-[var(--olive)] tracking-widest shadow-sm">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
            {product.description || "Tradizions premium selection for health."}
          </p>
          {product.weight && product.unit && (
            <span className="inline-block mt-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-stone-200">
              {product.weight} {product.unit}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-gray-900">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-gray-400 line-through font-medium">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="pt-2 mt-auto">
          <button
            disabled={isAdding || (product.availablestock ?? 0) <= 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if ((product.availablestock ?? 0) <= 0) return;
              handleActionWithLogin(async () => {
                setIsAdding(true);
                try {
                  const response = await API.post(API_ROUTES.ADDTOCART, {
                    bid: product.bid || 1,
                    productid: product.itemtype === "gift" ? null : id,
                    giftid: product.itemtype === "gift" ? id : null,
                    quantity: 1,
                    itemtype: product.itemtype || "product",
                  });
                  if (response.status === 200) {
                    window.dispatchEvent(new Event("cartUpdated"));
                  } else {
                    alert("Failed to add product to cart. Please try again.");
                  }
                } catch (err: any) {
                  console.error("Error adding to cart:", err);
                  alert(
                    err?.response?.data?.message ||
                    "An error occurred while adding to cart.",
                  );
                } finally {
                  setIsAdding(false);
                }
              });
            }}
            className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${(product.availablestock ?? 0) <= 0
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[var(--olive)]/10 border-[var(--olive)]/20 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
              } disabled:opacity-50`}
          >
            <span>
              {(product.availablestock ?? 0) <= 0
                ? "OUT OF STOCK"
                : isAdding
                  ? "ADDING..."
                  : "ADD TO CART"}
            </span>
            {isAdding ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

// -----------------------------------  GIFT & POOJA SECTION

function GiftingSection({
  t,
  giftHampers: apiGiftHampers,
  poojaHampers: apiPoojaHampers,
}: {
  t: any;
  giftHampers?: any[];
  poojaHampers?: any[];
}) {
  const { ref, isVisible } = useInView();
  const displayHampers =
    apiGiftHampers && apiGiftHampers.length > 0
      ? [...apiGiftHampers, ...(apiPoojaHampers || [])]
      : [];

  return (
    <section ref={ref} className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-20">
          {/* ── Artisanal Gift Hampers ── */}
          <div
            className={`space-y-10 transition-all duration-500 opacity-100 translate-x-0`}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-100 pb-8">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                  {t.gift.split(" ")[0]}{" "}
                  <span className="gradient-text">
                    {t.gift.split(" ").slice(1).join(" ")}
                  </span>
                </h2>
              </div>
              <Link
                href="/gifts"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--olive)] relative"
              >
                <span className="relative">
                  {t.view_all}

                  {/* Animated underline */}
                  <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[var(--olive)] transition-all duration-300 group-hover:w-full"></span>
                </span>

                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[var(--olive)]" />
              </Link>
            </div>

            {displayHampers.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Gift className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm">
                  No gifts found.
                </p>
              </div>
            ) : (
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {displayHampers.map((item, idx) => {
                  const id =
                    item.productid !== undefined ? item.productid : item.id;
                  const name = item.productname || item.name;
                  const price = item.sellingprice || item.price || 0;
                  const originalPrice =
                    item.price !== undefined &&
                      item.sellingprice !== undefined &&
                      item.price > item.sellingprice
                      ? item.price
                      : null;
                  const image = item.productimage
                    ? getImageUrl(item.productimage)
                    : item.image || "/placeholder.png";
                  const desc =
                    item.desc ||
                    "Tradizions premium traditional wellness hamper.";

                  return (
                    <div
                      key={id}
                      className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] snap-start flex-shrink-0"
                    >
                      <Link
                        href={
                          id
                            ? `/gift-detail/${id}?productid=${id}&bid=${item.bid || 1}`
                            : "/gifts"
                        }
                        className="group relative block bg-[#faf9f6] rounded-[2rem] p-4 border border-transparent hover:border-stone-100 hover:bg-white transition-all duration-500 hover:shadow-xl h-full"
                      >
                        <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-6">
                          <img
                            src={image}
                            alt={name}
                            className={`h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 ${(item.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
                          />
                          {(item.availablestock ?? 0) <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                              <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
                                OUT OF STOCK
                              </span>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-400 group-hover:text-[var(--orange)] transition-colors shadow-sm">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="space-y-3 px-2 pb-2">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                              {name}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium line-clamp-2">
                            {desc}
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-lg font-black text-gray-900">
                              ₹{price.toLocaleString()}
                            </span>
                            {originalPrice && originalPrice > price && (
                              <span className="text-[10px] font-bold text-stone-300 line-through">
                                ₹{originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
                {/* View All Card */}
                {displayHampers.length > 10 && (
                  <div className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] snap-start flex-shrink-0 flex">
                    <Link
                      href="/gifts"
                      className="flex-1 group relative bg-[#faf9f6] rounded-[2rem] p-4 border border-transparent hover:border-stone-100 hover:bg-white transition-all duration-500 hover:shadow-xl flex flex-col items-center justify-center min-h-[300px]"
                    >
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:bg-[var(--olive)] transition-colors duration-300">
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors">
                        {t.view_all || "View All"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        Explore more hampers
                      </p>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection({ t }: { t: any }) {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-[#fdfbf6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          {/* Left Side: Elegant Arch Image */}
          <div className={`w-full lg:w-5/12 relative transition-all duration-700 opacity-100 translate-x-0`}>
            <div className="relative aspect-[3/4] rounded-t-full rounded-b-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(85,107,47,0.2)] border-[10px] border-white mx-auto max-w-sm group">
              <Image
                src="https://images.unsplash.com/photo-1626023873533-f5cc77cc2458?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Quality organic products"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--olive-dark)]/60 via-transparent to-transparent opacity-90" />

              {/* Floating Stat Card inside Image */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white/95 backdrop-blur-md p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-white/50 group-hover:-translate-y-1 transition-transform duration-500">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#556b2f] to-[#3a4a20] flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                  <BadgeCheck className="w-6 h-6 drop-shadow-sm" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-[#2b3513] leading-none mb-1">100% Pure</h4>
                  <p className="text-[10px] text-[#556b2f] font-bold uppercase tracking-widest">Organic Certified</p>
                </div>
              </div>
            </div>
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#e4dec2]/40 to-[#f6f2dd]/50 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right Side: Content & Features */}
          <div className={`w-full lg:w-7/12 space-y-12 transition-all duration-700 delay-200 opacity-100 translate-x-0`}>
            <div className="space-y-5 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#2b3513] leading-[1.15] tracking-tight">
                {t.why_choose.split(" ").slice(0, 1).join(" ")}
                <span className="text-[var(--olive)]">
                  {" "}
                  {t.why_choose.split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p className="text-[#6b6455] text-sm md:text-[15px] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.why_desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {whyChooseUs.map((item, idx) => (
                <div key={idx} className="flex gap-5 group items-start">
                  <div className="flex-shrink-0 w-[60px] h-[60px] rounded-[1.5rem] bg-[#f4ecd9] border border-[#e8dfc8] text-[#556b2f] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#556b2f] group-hover:to-[#3a4a20] group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[0_10px_20px_rgba(85,107,47,0.2)] transition-all duration-500">
                    <item.icon className="w-7 h-7 drop-shadow-sm" />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-[16px] font-black text-[#2b3513] group-hover:text-[var(--olive)] transition-colors">
                      {t.features[idx * 2]}
                    </h4>
                    <p className="text-[13px] text-[#6b6455] font-medium leading-snug">
                      {t.features[idx * 2 + 1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------  TESTIMONIALS

function TestimonialsSection({ t, reviews }: { t: any; reviews?: Review[] }) {
  const { ref, isVisible } = useInView();

  const users = [
    "Ravi Kumar",
    "Anita Sharma",
    "Suresh Babu",
    "Priya Nair",
    "Karthik Raj",
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) || "";
    const last = parts[1]?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const listToRender =
    reviews && reviews.length > 0
      ? reviews.map((r) => ({
        name: r.username || "Anonymous User",
        role: "Verified Buyer",
        text: r.review || "",
        rating: Math.round(r.rating || 5),
        avatar: getInitials(r.username || "Anonymous"),
      }))
      : [];

  if (listToRender.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`max-w-2xl mx-auto text-center space-y-2 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.loved.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="gradient-text">
              {t.loved.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-gray-400 font-light text-sm max-w-lg mx-auto leading-relaxed">
            {t.community_desc}
          </p>
        </div>

        {listToRender.length > 5 ? (
          /* AUTO-SCROLLING MARQUEE CONTAINER */
          <div className="relative w-full overflow-hidden group">
            {/* Gradient Overlays for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee-slow whitespace-nowrap gap-6 py-10 px-6 hover:pause-animation">
              {[
                ...listToRender,
                ...listToRender,
                ...listToRender,
                ...listToRender,
              ].map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="w-[300px] md:w-[340px] flex-shrink-0 bg-white border border-[#e4dec2] rounded-[1.5rem] p-8 shadow-[0_4px_15px_rgba(85,107,47,0.03)] hover:shadow-[0_20px_40px_rgba(85,107,47,0.08)] hover:border-[#d4cda9] transition-all duration-500 flex flex-col justify-between group/card hover:-translate-y-2 relative overflow-hidden"
                  >
                    {/* Subtle top accent line */}
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                    {/* Large Watermark Quote */}
                    <Quote className="absolute -top-2 -right-2 w-24 h-24 text-[var(--olive)] opacity-[0.03] rotate-12 group-hover/card:opacity-[0.06] group-hover/card:scale-110 transition-all duration-500" />

                    <div className="space-y-5 relative z-10">
                      <div className="flex items-center gap-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-sm"
                          />
                        ))}
                      </div>
                      <p className="text-[#6b6455] text-[13.5px] font-medium leading-relaxed italic line-clamp-5">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-6 mt-4 border-t border-stone-100 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f4ecd9] to-[#e8dfc8] flex items-center justify-center text-[15px] font-black text-[#556b2f] shadow-inner border-[2px] border-white">
                        {item.avatar}
                      </div>
                      <div className="text-left">
                        <h4 className="text-[13px] font-black text-[#2b3513]">
                          {item.name}
                        </h4>
                        <p className="text-[10px] font-bold text-[#7a8a55] tracking-[0.15em] uppercase mt-0.5">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* HORIZONTAL STATIC GRID */
          <div className="flex flex-row flex-wrap justify-center gap-6 py-10 px-6">
            {listToRender.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="w-[300px] md:w-[340px] flex-shrink-0 bg-white border border-[#e4dec2] rounded-[1.5rem] p-8 shadow-[0_4px_15px_rgba(85,107,47,0.03)] hover:shadow-[0_20px_40px_rgba(85,107,47,0.08)] hover:border-[#d4cda9] transition-all duration-500 flex flex-col justify-between group/card hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Subtle top accent line */}
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                  {/* Large Watermark Quote */}
                  <Quote className="absolute -top-2 -right-2 w-24 h-24 text-[var(--olive)] opacity-[0.03] rotate-12 group-hover/card:opacity-[0.06] group-hover/card:scale-110 transition-all duration-500" />

                  <div className="space-y-5 relative z-10">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-sm"
                        />
                      ))}
                    </div>
                    <p className="text-[#6b6455] text-[13.5px] font-medium leading-relaxed italic line-clamp-5">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 mt-4 border-t border-stone-100 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f4ecd9] to-[#e8dfc8] flex items-center justify-center text-[15px] font-black text-[#556b2f] shadow-inner border-[2px] border-white">
                      {item.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="text-[13px] font-black text-[#2b3513]">
                        {item.name}
                      </h4>
                      <p className="text-[10px] font-bold text-[#7a8a55] tracking-[0.15em] uppercase mt-0.5">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Rating Tag */}
        <div
          className={`mt-10 flex flex-col items-center gap-3 transition-all duration-500 delay-500 ${isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="flex -space-x-3">
            {users.map((name, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-br from-[#588157] to-[#3a5a40]"
              >
                {getInitials(name)}
              </div>
            ))}

            {/* Count */}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-[var(--orange)] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              +2k
            </div>
          </div>

          <p className="text-xs font-medium text-gray-800">{t.trusted}</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

// -----------------------------------  KURAL & TRUST ROW (Premium Look)

function KuralTrustRow({
  t,
  kuraldata,
}: {
  t: any;
  kuraldata: KuralData | null;
}) {
  const { ref, isVisible } = useInView();

  const formatKural = (kuralText: string | undefined | null) => {
    if (!kuralText) return "";

    // Normalize line breaks
    const normalized = kuralText
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\r\n/g, "\n");
    if (normalized.includes("\n")) {
      return normalized.split("\n").map((line, index) => (
        <span key={index} className="block">
          {line.trim()}
        </span>
      ));
    }

    const words = normalized.trim().split(/\s+/);
    if (words.length === 7) {
      const line1 = words.slice(0, 4).join(" ");
      const line2 = words.slice(4).join(" ");
      return (
        <>
          <span className="block">{line1}</span>
          <span className="block mt-1">{line2}</span>
        </>
      );
    }

    if (words.length > 4) {
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");
      return (
        <>
          <span className="block">{line1}</span>
          <span className="block mt-1">{line2}</span>
        </>
      );
    }

    return normalized;
  };

  return (
    <section
      ref={ref}
      className="bg-[#fafaf9] border-y border-stone-200/60 py-6 relative z-30 overflow-hidden"
    >
      {/* Subtle Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div
          className={`flex flex-col xl:flex-row items-stretch justify-between gap-6 transition-all duration-500 opacity-100 translate-y-0`}
        >
          {/* Left Side: Premium Kural Card */}
          <div className="flex-1 relative group">
            <div className="h-full bg-white rounded-2xl p-4 md:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100 flex flex-col justify-center transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50 group-hover:rotate-6 transition-transform duration-500">
                    <ScrollText className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-px bg-amber-200" />
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.3em] leading-none">
                      {t.kural_title}
                    </span>
                  </div>
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-3 w-5 h-5 text-stone-100/80 -z-10 rotate-180" />
                    <div className="text-sm md:text-base font-bold text-stone-800 leading-snug tracking-tight">
                      {formatKural(kuraldata?.kural)}
                    </div>
                    {kuraldata?.meaning && (
                      <p className="text-stone-500 text-[11px] md:text-xs font-medium mt-1 leading-relaxed">
                        {kuraldata.meaning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------  HEALTH GOALS SECTION

function HealthGoalsSection({ t, goals }: { t: any; goals: any[] }) {
  const { ref, isVisible } = useInView();

  const displayGoals = goals && goals.length > 0 ? goals : [];
  const defaultBgs = ["bg-blue-50", "bg-emerald-50", "bg-orange-50"];
  const defaultIcons = [Activity, Scale, Baby];

  return (
    <section ref={ref} className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.health_goals_title?.split(" ").slice(0, 2).join(" ") || "Health"}{" "}
            <span className="gradient-text">
              {t.health_goals_title?.split(" ").slice(2).join(" ") || "Goals"}
            </span>
          </h2>
          <p className="text-sm font-normal text-gray-400 max-w-lg mx-auto">
            {t.health_goals_desc}
          </p>
        </div>

        {displayGoals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium text-sm">
              No health goals found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayGoals.map((goal, idx) => {
              const bg = defaultBgs[idx % defaultBgs.length];
              const Icon = defaultIcons[idx % defaultIcons.length];
              const image = getImageUrl(goal.goalimage);

              return (
                <Link
                  href={`/health-goal-products?goalid=${goal.goalid}`}
                  key={goal.goalid || idx}
                  className="group block bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(85,107,47,0.12)] hover:-translate-y-2 transition-all duration-500 relative"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  {/* Image Section */}
                  <div className="relative h-[240px] overflow-hidden bg-stone-50">
                    <img
                      src={image}
                      alt={goal.goalname || ""}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                  </div>

                  {/* Overlapping Floating Icon */}
                  <div className="absolute top-[215px] right-8 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[var(--olive)] group-hover:-translate-y-1 group-hover:text-white group-hover:bg-[var(--olive)] transition-all duration-500 border border-stone-100">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content Section */}
                  <div className="pt-8 pb-8 px-8">
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight group-hover:text-[var(--olive)] transition-colors duration-300 pr-12">
                      {goal.goalname}
                    </h3>
                    <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {goal.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 pt-4 border-t border-stone-100">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 group-hover:text-[var(--olive)] transition-colors duration-300">
                        {t.explore_all || "Explore"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--olive)] group-hover:translate-x-2 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function NutritionPlanner({ t }: { t: any }) {
  const { ref, isVisible } = useInView();
  const [nutsProducts, setNutsProducts] = useState<CalculatorProducts[]>([]);
  const [milletsProducts, setMilletsProducts] = useState<CalculatorProducts[]>(
    [],
  );
  const [spicesProducts, setSpicesProducts] = useState<CalculatorProducts[]>(
    [],
  );
  const [allProducts, setAllProducts] = useState<CalculatorProducts[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    CalculatorProducts[]
  >([]);
  const [plannerData, setPlannerData] = useState<
    Record<number, { grams: number; days: number; members: number }>
  >({});
  const [isBuying, setIsBuying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [resNuts, resMillets, resSpices] = await Promise.all([
          API.post(API_ROUTES.CALCULATORPRODUCTS, { categoryid: 1, bid: 1 }).catch(() => ({ data: { data: [] } })),
          API.post(API_ROUTES.CALCULATORPRODUCTS, { categoryid: 2, bid: 1 }).catch(() => ({ data: { data: [] } })),
          API.post(API_ROUTES.CALCULATORPRODUCTS, { categoryid: 3, bid: 1 }).catch(() => ({ data: { data: [] } })),
        ]);

        const nuts = (resNuts.data?.data || []).map((p: any) => ({
          ...p,
          categoryid: 1,
        }));
        const millets = (resMillets.data?.data || []).map((p: any) => ({
          ...p,
          categoryid: 2,
        }));
        const spices = (resSpices.data?.data || []).map((p: any) => ({
          ...p,
          categoryid: 3,
        }));

        setNutsProducts(nuts);
        setMilletsProducts(millets);
        setSpicesProducts(spices);
        setAllProducts([...nuts, ...millets, ...spices]);
      } catch (err) {
        console.error("Error fetching calculator products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleToggleProduct = (product: CalculatorProducts) => {
    if (selectedProducts.find((p) => p.productid === product.productid)) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p.productid !== product.productid),
      );
      setPlannerData((prev) => {
        const newData = { ...prev };
        delete newData[product.productid!];
        return newData;
      });
    } else {
      setSelectedProducts((prev) => [...prev, product]);
      setPlannerData((prev) => ({
        ...prev,
        [product.productid!]: { grams: 20, days: 30, members: 4 },
      }));
    }
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
    setPlannerData({});
  };

  const handleRemoveItem = (productid: number) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productid !== productid),
    );
    setPlannerData((prev) => {
      const newData = { ...prev };
      delete newData[productid];
      return newData;
    });
  };

  const calculateRow = (product: CalculatorProducts) => {
    const data = plannerData[product.productid!] || {
      grams: 0,
      days: 0,
      members: 0,
    };
    const qtyPerPerson = (data.grams * data.days) / 1000;
    const price = product.sellingprice || product.price || 0;
    const totalPrice = qtyPerPerson * data.members * price;
    return { qty: qtyPerPerson.toFixed(2), price: Math.round(totalPrice) };
  };

  const grandTotal = selectedProducts.reduce(
    (acc, row) => acc + calculateRow(row).price,
    0,
  );

  const displayedProducts = allProducts.filter((p) => {
    if (selectedCategory !== 0 && p.categoryid !== selectedCategory)
      return false;
    if (
      searchQuery &&
      !p.productname?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const scrollToCalculator = () => {
    const el = document.getElementById("calculator-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-[var(--olive)]/20 via-[#f2efe6] to-[var(--orange)]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Main Calculator Header & Description */}
        <div className="text-center mb-10 space-y-6">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Monthly <span className="gradient-text">Product Calculator</span>
          </h2>

          <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-left relative overflow-hidden">
            {/* Decorative background in the card */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--olive)]/10 rounded-full blur-2xl"></div>

            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 text-center relative z-10">
              Planning healthy snacks for your family just got easier!
            </h3>
            <p className="text-[11px] font-black text-gray-400 mb-8 text-center uppercase tracking-[0.2em] relative z-10">
              Use our smart calculator to find out:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative z-10">
              {[
                "The right quantity of nuts & dry fruits, millets based on your family size",
                "Approximate daily or monthly consumption in grams",
                "Estimated cost based on your selected products",
                "A balanced mix for kids, adults, and elders"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/80 p-5 rounded-2xl shadow-sm border border-stone-100 hover:border-[var(--olive)]/30 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[var(--olive)]" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100 mb-8 relative z-10">
              <p className="text-sm text-gray-600 font-medium text-center leading-relaxed">
                Simply choose your preferred nuts, enter the number of family members, and get an instant estimate of quantity and price.
              </p>
            </div>

            <p className="text-[12px] font-black tracking-[0.3em] uppercase text-center relative z-10">
              <span className="text-gray-400">Eat healthy.</span> <span className="text-[var(--olive)] mx-2">Plan smart.</span> <span className="text-[var(--orange)]">Shop better.</span>
            </p>
          </div>
        </div>

        {/* Step 1: Select Products You Want */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 p-6 md:p-10 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-[var(--olive)] text-white flex items-center justify-center font-bold text-sm shadow-md">
                  1
                </span>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Select Products You Want
                </h2>
              </div>
              <p className="text-stone-500 font-medium ml-11">
                Choose the products you want to include in your monthly
                calculation.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 font-medium text-stone-800 transition-all bg-stone-50 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={scrollToCalculator}
                className="btn-standard flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm shadow-md"
              >
                View Calculator <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Categories */}
            <div className="w-full lg:w-64 flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory(0)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCategory === 0 ? "bg-[var(--olive)]/20 border-[var(--olive)]/50 text-[var(--olive)]" : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <LayoutGrid
                    className={`w-5 h-5 ${selectedCategory === 0 ? "text-[var(--olive)]" : "text-gray-400"}`}
                  />{" "}
                  All Products
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === 0 ? "bg-[var(--olive)]/20 text-[var(--olive)]" : "bg-gray-100 text-gray-500"}`}
                >
                  {allProducts.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory(1)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCategory === 1 ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <Circle
                    className={`w-5 h-5 ${selectedCategory === 1 ? "text-green-600" : "text-gray-400"}`}
                  />{" "}
                  Nuts
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === 1 ? "bg-green-200/50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {nutsProducts.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory(2)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCategory === 2 ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <Wheat
                    className={`w-5 h-5 ${selectedCategory === 2 ? "text-yellow-600" : "text-gray-400"}`}
                  />{" "}
                  Millets
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === 2 ? "bg-yellow-200/50 text-yellow-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {milletsProducts.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory(3)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCategory === 3 ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <Flame
                    className={`w-5 h-5 ${selectedCategory === 3 ? "text-orange-600" : "text-gray-400"}`}
                  />{" "}
                  Spices
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === 3 ? "bg-orange-200/50 text-orange-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {spicesProducts.length}
                </span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">
                  {selectedCategory === 0
                    ? "All Products"
                    : selectedCategory === 1
                      ? "Nuts"
                      : selectedCategory === 2
                        ? "Millets"
                        : "Spices"}
                  <span className="text-gray-400 ml-2 font-normal">
                    ({displayedProducts.length})
                  </span>
                </h3>
              </div>

              {displayedProducts.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <Leaf className="w-8 h-8 text-stone-300 mb-3" />
                  <p className="text-stone-500 font-medium text-sm">
                    No products found matching your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {displayedProducts.map((product) => {
                    const isSelected = !!selectedProducts.find(
                      (p) => p.productid === product.productid,
                    );
                    const price = product.sellingprice || product.price || 0;
                    return (
                      <div
                        key={product.productid}
                        onClick={() => handleToggleProduct(product)}
                        className={`group relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? "border-[var(--olive)] bg-[var(--olive)]/5 shadow-sm" : "border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5"}`}
                      >
                        <div
                          className={`absolute top-2 left-2 w-4 h-4 rounded flex items-center justify-center transition-colors duration-300 ${isSelected ? "bg-[var(--olive)] text-white" : "bg-gray-100 border border-gray-200 group-hover:border-gray-300 text-transparent"}`}
                        >
                          <Check
                            className={`w-3 h-3 ${isSelected ? "opacity-100" : "opacity-0"}`}
                            strokeWidth={3}
                          />
                        </div>
                        <div className="h-[60px] w-full relative mb-3 mt-4 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
                          <img
                            src={`${IMAGE_URL ?? ""}${product.productimage ?? ""}`}
                            alt={product.productname ?? "product image"}
                            className="object-contain mix-blend-multiply opacity-80 group-hover:scale-110 transition-transform duration-500 w-full h-full absolute inset-0 p-1"
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-bold text-[11px] md:text-xs text-gray-900 line-clamp-2 leading-tight group-hover:text-[var(--olive)] transition-colors">
                            {product.productname}
                          </p>
                          <div className="inline-block px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                            <span className="text-[11px] font-extrabold text-[var(--olive)]">
                              ₹{price}
                            </span>
                            <span className="text-[9px] font-medium text-gray-500 ml-0.5">
                              / Kg
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selection Summary */}
              <div className="mt-6 bg-[var(--olive)]/5 border border-[var(--olive)]/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[var(--olive)] font-semibold text-sm">
                  <Check className="w-5 h-5 text-[var(--olive)]" />{" "}
                  {selectedProducts.length} products selected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Arrow */}
        <div className="flex justify-center -my-2">
          <ArrowDown className="w-8 h-8 text-[var(--olive)] animate-bounce" />
        </div>

        {/* Step 2: Calculator */}
        <div
          id="calculator-section"
          className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 p-6 md:p-10 relative overflow-hidden"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-[var(--olive)] text-white flex items-center justify-center font-bold text-sm shadow-md">
                  2
                </span>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Your Monthly Calculation
                </h2>
              </div>
              <p className="text-stone-500 font-medium ml-11">
                Set your requirements and calculate the monthly budget for
                selected products.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-100 rounded-2xl shadow-sm bg-white relative z-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-stone-50/80 text-[10px] font-black text-stone-500 uppercase tracking-widest border-b border-stone-100">
                  <th className="px-6 py-5">Product</th>
                  <th className="px-4 py-5 text-center">Grams / Day</th>
                  <th className="px-4 py-5 text-center">Days</th>
                  <th className="px-4 py-5 text-center">Family Members</th>
                  <th className="px-4 py-5 text-center">KG / Person</th>
                  <th className="px-4 py-5 text-center">Price / KG</th>
                  <th className="px-6 py-5 text-right">Total Budget</th>
                  <th className="px-4 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {selectedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-stone-400 font-medium"
                    >
                      No products selected. Please select products from the list
                      above.
                    </td>
                  </tr>
                ) : (
                  selectedProducts.map((product) => {
                    const data = plannerData[product.productid!];
                    const { qty, price } = calculateRow(product);
                    const displayPrice =
                      product.sellingprice || product.price || 0;

                    return (
                      <tr
                        key={product.productid}
                        className="hover:bg-stone-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-xl bg-stone-50 border border-stone-100 overflow-hidden flex-shrink-0">
                              <img
                                src={`${IMAGE_URL ?? ""}${product.productimage ?? ""}`}
                                alt={product.productname || ""}
                                className="object-cover p-1"
                              />
                            </div>
                            <p className="text-sm font-bold text-stone-800 leading-tight">
                              {product.productname}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            className="w-16 px-2 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-800 text-center focus:bg-white focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 outline-none transition-all shadow-sm"
                            value={data.grams}
                            onChange={(e) =>
                              setPlannerData((prev) => ({
                                ...prev,
                                [product.productid!]: {
                                  ...data,
                                  grams: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            className="w-16 px-2 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-800 text-center focus:bg-white focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 outline-none transition-all shadow-sm"
                            value={data.days}
                            onChange={(e) =>
                              setPlannerData((prev) => ({
                                ...prev,
                                [product.productid!]: {
                                  ...data,
                                  days: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            className="w-16 px-2 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-800 text-center focus:bg-white focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 outline-none transition-all shadow-sm"
                            value={data.members}
                            onChange={(e) =>
                              setPlannerData((prev) => ({
                                ...prev,
                                [product.productid!]: {
                                  ...data,
                                  members: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-stone-500 text-sm">
                          {qty}{" "}
                          <span className="text-[10px] font-medium text-stone-400">
                            Kg
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-stone-500 text-sm">
                          ₹{displayPrice}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-stone-900 text-base">
                          ₹{price}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleRemoveItem(product.productid!)}
                            className="w-9 h-9 mx-auto rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-stone-100 pt-8 relative z-10">
            <button
              onClick={handleClearAll}
              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm flex items-center gap-2 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
            >
              Clear All Items <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-stone-400 tracking-[0.1em] uppercase mb-1">
                  Monthly Grand Total
                </p>
                <p className="text-3xl font-black text-stone-900 leading-none">
                  ₹{grandTotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() =>
                  handleActionWithLogin(async () => {
                    setIsBuying(true);
                    try {
                      const payload = {
                        products: selectedProducts.map((p) => {
                          const d = plannerData[p.productid!];
                          return {
                            bid: p.bid || 1,
                            productid: p.productid,
                            gramsperday: d.grams,
                            dayspermonth: d.days,
                            familymembers: d.members,
                          };
                        }),
                      };
                      const response = await API.post(
                        API_ROUTES.ADDCALCULATORCART,
                        payload,
                      );
                      if (response.status === 200) {
                        router.push("/monthly-cart");
                      } else {
                        alert("Failed to add to monthly cart.");
                      }
                    } catch (err: any) {
                      console.error("Error adding to monthly cart", err);
                      alert(
                        err?.response?.data?.message ||
                        "An error occurred while adding to monthly cart.",
                      );
                    } finally {
                      setIsBuying(false);
                    }
                  })
                }
                disabled={selectedProducts.length === 0 || isBuying}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer ${selectedProducts.length > 0 ? "bg-[var(--olive)] text-white hover:bg-[var(--olive-dark)] shadow-lg shadow-green-900/20 active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"} min-w-[140px]`}
              >
                {isBuying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Buy Now <ShoppingCart className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscriptionPlans({ t }: { t: any }) {
  const { ref, isVisible } = useInView();
  const plans = [
    {
      name: "Heritage Basic",
      price: "1,499",
      desc: "Perfect for small families starting their wellness journey.",
      features: [
        "Monthly Millet Box (2kg)",
        "Essential Nut Pack (500g)",
        "Standard Eco-Packaging",
        "Community Access",
      ],
      excluded: [
        "Nutritionist Advice",
        "Priority Shipping",
        "Sacred Pooja Kit",
      ],
      color: "bg-stone-800",
      accent: "text-stone-800",
      border: "border-stone-100",
    },
    {
      name: "Wellness Standard",
      price: "2,999",
      desc: "Our most loved plan for balanced daily nutrition.",
      features: [
        "Monthly Millet Box (5kg)",
        "Premium Nut Pack (1kg)",
        "Handcrafted Jute Packaging",
        "Nutritionist Advice",
        "Priority Shipping",
      ],
      excluded: ["Sacred Pooja Kit", "Recipe eBooks"],
      color: "bg-[var(--olive)]",
      accent: "text-[var(--olive)]",
      featured: true,
      border: "border-[var(--olive)]/20",
    },
    {
      name: "Royal Premium",
      price: "4,999",
      desc: "The ultimate tradition-to-wellness experience.",
      features: [
        "Bulk Millet Supply (10kg)",
        "Luxury Nut & Berry Box",
        "Sacred Pooja Kit (Monthly)",
        "Premium Recipe eBooks",
        "Dedicated Wellness Concierge",
        "VIP Event Access",
      ],
      excluded: [],
      color: "bg-[var(--orange)]",
      accent: "text-[var(--orange)]",
      border: "border-[var(--orange)]/20",
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-[#fafaf9] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.subscription.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="gradient-text">
              {t.subscription.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-gray-400 text-[11px] max-w-md mx-auto font-medium">
            {t.subscription_desc}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`group relative bg-white rounded-[2rem] p-1.5 border transition-all duration-500 opacity-100 translate-y-0 ${plan.border} ${(plan as any).featured ? "shadow-[0_30px_60px_-10px_rgba(85,107,47,0.12)] scale-[1.02] z-10" : "hover:shadow-xl hover:-translate-y-1"}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {(plan as any).featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--olive)] to-emerald-700 text-white text-[9px] font-black tracking-[0.2em] uppercase shadow-lg z-20 whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="relative h-full rounded-[1.75rem] overflow-hidden flex flex-col">
                <div className="p-7 pb-4 space-y-3">
                  <h3
                    className={`text-[10px] font-black tracking-[0.2em] uppercase ${plan.accent}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400">
                      ₹
                    </span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      / mo
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                    {plan.desc}
                  </p>
                </div>
                <div className="flex-1 p-7 pt-2 space-y-6">
                  <div className="w-full h-px bg-gray-50" />
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-3 text-[11px] font-bold text-gray-600"
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-md ${plan.accent} bg-stone-50 flex items-center justify-center border border-current/5`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                    {plan.excluded?.map((feature, fIdx) => (
                      <li
                        key={"ex" + fIdx}
                        className="flex items-center gap-3 text-[11px] font-bold text-gray-300 line-through opacity-50"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-md bg-stone-50 flex items-center justify-center text-red-200 border border-gray-50">
                          <span className="text-[8px] font-black">✕</span>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-7 pt-0">
                  <button className="btn-standard w-full rounded-xl text-[11px] font-black front-normal tracking-[0.1em] transition-all duration-500 shadow-lg cursor-pointer active:scale-95">
                    {t.subscribe}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// -----------------------------------  NEW ARRIVALS SECTION (Shop Style)

function NewArrivalsSection({ t, products }: { t: any; products?: any[] }) {
  const { ref, isVisible } = useInView();
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  const fetchFavourites = async () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      try {
        const response = await API.post(API_ROUTES.GETFAVOURITE);
        if (response.status === 200) {
          const list = response.data?.data || [];
          setFavouriteProductIds(list.map((fav: any) => fav.productid));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setFavouriteProductIds([]);
    }
  };

  useEffect(() => {
    fetchFavourites();
    window.addEventListener("favoritesUpdated", fetchFavourites);
    window.addEventListener("loginSuccess", fetchFavourites);
    return () => {
      window.removeEventListener("favoritesUpdated", fetchFavourites);
      window.removeEventListener("loginSuccess", fetchFavourites);
    };
  }, []);

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

  const displayProducts = products && products.length > 0 ? products : [];

  return (
    <section ref={ref} className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`flex flex-col md:flex-row items-end justify-between mb-16 gap-6 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <div className="space-y-4 text-left">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
              {t.new_arrivals.split(" ")[0]}{" "}
              <span className="gradient-text">
                {t.new_arrivals.split(" ")[1]}
              </span>
            </h2>
            <p className="text-gray-400 text-sm max-w-md font-light">
              {t.new_arrivals_desc}
            </p>
          </div>
          <Link
            href="/new-arrivals"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--olive)] relative"
          >
            <span className="relative">
              {t.explore_all}

              {/* Animated underline */}
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[var(--olive)] transition-all duration-300 group-hover:w-full"></span>
            </span>

            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[var(--olive)]" />
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Leaf className="w-8 h-8 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              No products found.
            </p>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 md:gap-6 pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {displayProducts.map((product, idx) => {
              const id =
                product.productid !== undefined
                  ? product.productid
                  : product.id;
              const name = product.productname || product.name;
              const price = product.sellingprice || product.price || 0;
              const originalPrice =
                product.price !== undefined &&
                  product.sellingprice !== undefined &&
                  product.price > product.sellingprice
                  ? product.price
                  : null;
              const image = product.productimage
                ? getImageUrl(product.productimage)
                : product.image || "/placeholder.png";
              const categoryid = product.categoryid;
              const isGiftOrPooja =
                categoryid === 4 ||
                categoryid === 5 ||
                (product.category &&
                  product.category.toLowerCase().includes("gift"));
              const detailUrl = isGiftOrPooja
                ? `/gift-detail/${id}?productid=${id}&bid=${product.bid || 1}`
                : `/product-detail/${id}?productid=${id}&bid=${product.bid || 1}`;

              return (
                <div
                  key={id}
                  className="w-[60vw] sm:w-[calc(50%-0.25rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start flex-shrink-0"
                >
                  <Link
                    href={detailUrl}
                    className="group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] h-full"
                    style={{
                      transitionDelay: isVisible ? `${idx * 150}ms` : "0ms",
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <img
                        src={image}
                        alt={name}
                        className={`h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110 ${(product.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
                      />

                      {(product.availablestock ?? 0) <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                          <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}

                      {/* Floating Actions */}
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleActionWithLogin(async () => {
                              if (id === undefined) return;
                              try {
                                const response = await API.post(
                                  API_ROUTES.ADDFAVOURITE,
                                  { productid: id },
                                );
                                if (response.status === 200) {
                                  window.dispatchEvent(
                                    new Event("favoritesUpdated"),
                                  );
                                }
                              } catch (err) {
                                console.error("Error adding to wishlist:", err);
                              }
                            });
                          }}
                          className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${id !== undefined && favouriteProductIds.includes(id) ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </button>
                      </div>

                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {originalPrice && originalPrice > price && (
                          <span className="px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
                            {Math.round(
                              ((originalPrice - price) / originalPrice) * 100,
                            )}
                            % OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                          {name}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                          {product.description ||
                            "Tradizions premium selection for health."}
                        </p>
                        {product.weight &&
                          (product.unit || product.unitname) && (
                            <span className="inline-block mt-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-stone-200">
                              {product.weight}{" "}
                              {product.unit || product.unitname}
                            </span>
                          )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-gray-900">
                          ₹{price.toLocaleString()}
                        </span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-xs text-gray-400 line-through font-medium">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <div className="pt-2 mt-auto">
                        <button
                          disabled={
                            addingToCartId === id ||
                            (product.availablestock ?? 0) <= 0
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if ((product.availablestock ?? 0) <= 0) return;
                            handleActionWithLogin(async () => {
                              setAddingToCartId(id);
                              try {
                                const response = await API.post(
                                  API_ROUTES.ADDTOCART,
                                  {
                                    bid: product.bid || 1,
                                    productid: isGiftOrPooja ? null : id,
                                    giftid: isGiftOrPooja ? id : null,
                                    quantity: 1,
                                    itemtype: isGiftOrPooja
                                      ? "gift"
                                      : "product",
                                  },
                                );
                                if (response.status === 200) {
                                  window.dispatchEvent(
                                    new Event("cartUpdated"),
                                  );
                                } else {
                                  alert("Failed to add product to cart.");
                                }
                              } catch (err: any) {
                                console.error("Error adding to cart:", err);
                                alert(
                                  err?.response?.data?.message ||
                                  "An error occurred.",
                                );
                              } finally {
                                setAddingToCartId(null);
                              }
                            });
                          }}
                          className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${(product.availablestock ?? 0) <= 0
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[var(--olive)]/10 border-[var(--olive)]/20 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
                            } disabled:opacity-50`}
                        >
                          <span>
                            {(product.availablestock ?? 0) <= 0
                              ? "OUT OF STOCK"
                              : addingToCartId === id
                                ? "ADDING..."
                                : "ADD TO CART"}
                          </span>
                          {addingToCartId === id ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
            {/* View All Card */}
            {displayProducts.length > 10 && (
              <div className="w-[60vw] sm:w-[calc(50%-0.25rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start flex-shrink-0 flex">
                <Link
                  href="/new-arrivals"
                  className="flex-1 group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/50 min-h-[350px]"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[var(--olive)] transition-colors duration-300 shadow-sm group-hover:shadow-md">
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors">
                    {t.explore_all || "View All"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Explore new arrivals
                  </p>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── NEW AESTHETIC TRUST, CERTIFICATIONS, TESTIMONIALS & BRANDS SECTION ──

function CertificationsSection() {
  const certs = [
    {
      id: "fssai",
      title: "FSSAI CERTIFIED",
      desc: "Lic No. 12421012000315",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/FSSAI_logo.png/250px-FSSAI_logo.png"
          alt="Fssai"
          height={80}
          width={80}
        />
      ),
    },
    {
      id: "organic",
      title: "ORGANIC CERTIFIED",
      desc: "100% Organic USDA",
      icon: (
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1ifz3iX9oeiQcRzLs682dy3pu5qc1Z19ung&s"
          alt="ORGANIC"
          height={80}
          width={80}
        />
      ),
    },
    {
      id: "temple",
      title: "TEMPLE PURITY",
      desc: "Sacred Preparation",
      icon: (
        <img
          src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXeNOEa13cQBn9f-8AGTanzzu5f4LhWC2eUQ&s"
          alt="TEMPLE"
          height={80}
          width={80}
        />
      ),
    },
    {
      id: "lab",
      title: "LAB TESTED",
      desc: "Purity & Quality Verified",
      icon: (
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr8HSqIlEzBDL1dun3R9_0CHjfSqP9dK0Ncg&s"
          alt="LAB"
          height={80}
          width={80}
        />
      ),
    },
    {
      id: "reports",
      title: "LAB REPORTS",
      desc: "Download PDFs",
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/256/4726/4726010.png"
          alt="PDF"
          height={60}
          width={60}
          className="object-cover"
        ></img>
      ),
      clickable: true,
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#FDFDFD] relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--olive)]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--orange)]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Centered Title Block */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight leading-none text-center">
            Trusted <span className="gradient-text">Certifications</span>
          </h2>
          <p className="text-sm text-stone-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Every grain and product at Tradizions is backed by absolute
            standards, natural processes, and government-approved accreditations
            to deliver uncompromising safety.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {certs.map((cert) => {
            const CardContent = (
              <div className="flex flex-col justify-between items-center h-full text-center p-6 bg-white rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] border border-stone-200/50 hover:border-[var(--olive)]/40 transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(85,107,47,0.08)] hover:-translate-y-1.5 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--olive)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-stone-50 group-hover:bg-[var(--olive)]/10 rounded-bl-2xl transition-colors" />

                <div className="h-20 flex items-center justify-center mb-4 relative z-10">
                  {cert.icon}
                </div>

                <div className="space-y-1 relative z-10 mt-auto">
                  <h4 className="text-[10px] font-black text-gray-950 tracking-[0.15em] leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-[9px] font-bold text-stone-400 tracking-wide leading-tight">
                    {cert.desc}
                  </p>
                </div>
              </div>
            );

            if (cert.clickable) {
              return (
                <Link key={cert.id} href="/shop" className="block h-full">
                  {CardContent}
                </Link>
              );
            }

            return (
              <div key={cert.id} className="h-full">
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VideoTestimonialsSection() {
  const videoReviews = [
    {
      name: "Sravani",
      duration: "0:45",
      cover:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Karthik",
      duration: "0:58",
      cover:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Deepika",
      duration: "0:50",
      cover:
        "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400",
    },
  ];

  return (
    <section className="py-16 bg-[#FAFBF9] border-t border-stone-200/50 relative overflow-hidden">
      {/* <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight leading-none">
            Video <span className="gradient-text">Testimonials</span>
          </h3>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {videoReviews.map((video, idx) => (
            <div
              key={idx}
              className="w-[220px] md:w-[250px] snap-start flex-shrink-0"
            >
              <div className="group relative aspect-square rounded-[1rem] overflow-hidden border border-stone-200/30 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer">
                <img
                  src={video.cover}
                  alt={video.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105 filter brightness-95"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/40 to-transparent transition-all duration-500" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-amber-500/25 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-[var(--olive)] shadow-xl relative z-10">
                      <svg
                        className="w-4.5 h-4.5 fill-current ml-0.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white z-10">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black tracking-widest uppercase leading-none block">
                      {video.name}
                    </span>
                    <p className="text-[8.5px] text-stone-300 font-medium">
                      Family Member
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-[8px] font-black tracking-widest text-white/90">
                    {video.duration}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-[var(--orange)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </div>
            </div>
          ))}

          {videoReviews.length > 10 && (
            <div className="w-[220px] md:w-[250px] snap-start flex-shrink-0 flex">
              <Link
                href="/about-us"
                className="flex-1 group relative bg-white border border-stone-200/40 rounded-[1rem] overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/30 aspect-square"
              >
                <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mb-4 group-hover:bg-[var(--olive)] transition-colors duration-300 shadow-sm group-hover:shadow-md">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-md font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors">
                  Show All Cards
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                  Explore full video diaries
                </p>
              </Link>
            </div>
          )}
        </div>
      </div> */}

      <div
        style={{
          width: "100%",
          border: "1px grey",
          background: "white",
          boxShadow: "inset 0 0 10px #000000",
        }}
      >
        <p className="text-center text-sm text-stone-500 font-medium py-12">
          Hello Dhinesh 👋
        </p>
      </div>
    </section>
  );
}

function SustainabilityAndPackagingSection() {
  return (
    <section className="py-16 bg-white relative overflow-hidden border-t border-stone-200/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Subtle, beautiful grid of 3 premium container blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: SECURE PAYMENTS */}
          <div className="flex flex-col justify-between p-8 md:p-10 bg-white border border-stone-200/50 rounded-[2.5rem] shadow-[0_10px_35px_-5px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 hover:border-[var(--olive)]/15 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-sm transition-transform duration-500 group-hover:scale-105">
                  <Shield className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black tracking-widest text-[var(--orange)] uppercase">
                    Trust Shield
                  </span>
                  <h4 className="text-[14px] font-black text-gray-950 tracking-[0.1em] uppercase leading-none">
                    Secure Payments
                  </h4>
                </div>
              </div>
              <p className="text-xs font-semibold text-stone-500 leading-relaxed">
                Shop with complete peace of mind. We encrypt and safeguard every
                transaction with industry-standard 256-bit SSL technology.
              </p>
            </div>

            {/* Payment Logos with a luxurious border */}
            <div className="pt-8">
              <div className="flex flex-wrap items-center gap-3 p-4 bg-[#FAFBF9] border border-stone-100 rounded-[1.75rem] shadow-inner relative z-10">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dF5Nw5vpBW8gqDSjtXyCr3vMzWn5slCTlg&s"
                  alt="logo-"
                  height={100}
                  width={100}
                />
              </div>
            </div>
          </div>

          {/* Card 2: SUSTAINABILITY */}
          <div className="flex flex-col justify-between p-8 md:p-10 bg-white border border-stone-200/50 rounded-[2.5rem] shadow-[0_10px_35px_-5px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 hover:border-[var(--olive)]/15 group relative overflow-hidden lg:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-sm transition-transform duration-500 group-hover:scale-105">
                  <Leaf className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black tracking-widest text-[var(--orange)] uppercase">
                    Eco Stewardship
                  </span>
                  <h4 className="text-[14px] font-black text-gray-950 tracking-[0.1em] uppercase leading-none">
                    Sustainability
                  </h4>
                </div>
              </div>
              <p className="text-xs font-semibold text-stone-500 leading-relaxed">
                Caring for the planet and future generations is embedded in our
                DNA. We focus on low carbon outputs and support organic farming
                loops.
              </p>
            </div>

            {/* Checklist + Illustration */}
            <div className="flex items-center justify-between gap-4 pt-8 relative z-10">
              <ul className="space-y-3">
                {[
                  "Ethically Sourced",
                  "Eco Friendly Processes",
                  "Supporting Local Farmers",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-stone-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-200/40">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="flex-shrink-0 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm transition-transform duration-500 ">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzLHYU8RaSU1ayRH9Lw_67vEs3Vz7Wct_PRQ&s"
                  alt="sustainability"
                  height={100}
                  width={100}
                  className="p-2"
                />
              </div>
            </div>
          </div>

          {/* Card 3: PLASTIC-FREE PACKAGING */}
          <div className="flex flex-col justify-between p-8 md:p-10 bg-white border border-stone-200/50 rounded-[2.5rem] shadow-[0_10px_35px_-5px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 hover:border-[var(--olive)]/15 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 shadow-sm transition-transform duration-500 group-hover:scale-105">
                  <svg
                    className="w-5.5 h-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black tracking-widest text-[var(--orange)] uppercase">
                    Earth Safe
                  </span>
                  <h4 className="text-[14px] font-black text-gray-950 tracking-[0.1em] uppercase leading-none">
                    Plastic-Free Packaging
                  </h4>
                </div>
              </div>
              <p className="text-xs font-semibold text-stone-500 leading-relaxed">
                Our pledge is zero plastic. We pack exclusively in biodegradable
                cardboard, jute, and paper, so our shipments leave no toxic
                footprint.
              </p>
            </div>

            {/* Checklist + Illustration */}
            <div className="flex items-center justify-between gap-4 pt-8 relative z-10">
              <ul className="space-y-3">
                {[
                  "100% Eco Friendly",
                  "Fully Biodegradable",
                  "Better for Earth",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-stone-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm border border-amber-200/40">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="flex-shrink-0 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm transition-transform duration-500 group-hover:scale-105">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/025/400/219/non_2x/plastic-free-icon-bpa-free-warranty-packaging-sign-for-graphic-design-logo-website-social-media-mobile-app-ui-illustration-vector.jpg"
                  alt="Plastic free"
                  height={100}
                  width={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}