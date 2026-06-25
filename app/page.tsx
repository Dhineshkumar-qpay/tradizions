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
  ChevronLeft,
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
  Minus,
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

  const cleanedBase = IMAGE_URL.endsWith("/")
    ? IMAGE_URL.slice(0, -1)
    : IMAGE_URL;
  const cleanedPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;

  return `${cleanedBase}/${cleanedPath}`;
};

function ImageComparisonBanner() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: any) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  return (
    <section className="w-full relative h-[400px] md:h-[600px] overflow-hidden select-none bg-[#f4ece3] my-10">
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-ew-resize group"
        onMouseMove={handleMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* Underneath image (Right side) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/nuts-slide.jpg"
            alt="Authentic Tradizions Products"
            className="w-full h-full object-cover object-center pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Overlay image (Left side) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden border-r-[3px] border-white z-10 shadow-[2px_0_15px_rgba(0,0,0,0.1)]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="absolute top-0 left-0 w-[100vw] h-full">
            <img
              src="/millets-slide.jpeg"
              alt="Organic Millets"
              className="w-full h-full object-cover object-center pointer-events-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 z-20 cursor-ew-resize pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 24px)` }}
        >
          <div className="flex gap-0.5 items-center justify-center text-stone-400">
            <ChevronRight className="w-4 h-4 rotate-180 -mr-1" />
            <ChevronRight className="w-4 h-4 -ml-1" />
          </div>
        </div>
      </div>
    </section>
  );
}

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
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1649103989985-e8d5b778f5c7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-8 z-10">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">
              {t.banner_title || "Pure Nutrition, Rooted in Tradition"}
            </h2>
            <p className="text-base md:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md">
              {t.banner_subtitle ||
                "Elevate your daily wellness with our premium, carefully sourced natural ingredients. Good for you, and good for your family."}
            </p>
          </div>
          <a
            href="/shop"
            className="bg-[var(--olive)] text-white px-10 py-3 text-sm md:text-base font-semibold tracking-[0.2em] uppercase rounded-full hover:bg-[var(--olive-dark)] transition-all duration-500 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1"
          >
            {t.shop_now || "Shop Now"}
          </a>
        </div>
      </section>

      <FeaturedSection t={t} products={featuredProducts} />
      <NewArrivalsSection t={t} products={newArrivalsProducts} />
      <ImageComparisonBanner />
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const benefitsMap: Record<string, any[]> = {
    nuts: t.health_benefits_data?.nuts || [],
    millets: t.health_benefits_data?.millets || [],
    spices: t.health_benefits_data?.spices || [],
  };

  const categoryMeta: Record<string, { emoji: string }> = {
    nuts: { emoji: "https://cdn-icons-png.flaticon.com/128/7451/7451659.png" },
    millets: { emoji: "https://cdn-icons-png.flaticon.com/128/616/616428.png" },
    spices: {
      emoji: "https://cdn-icons-png.flaticon.com/128/9273/9273863.png",
    },
  };

  const activeBenefits = benefitsMap[activeCategory];
  const meta = categoryMeta[activeCategory];

  const categories: Array<"nuts" | "millets" | "spices"> = [
    "nuts",
    "millets",
    "spices",
  ];

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
      setScrollProgress(0);
    }
  }, [activeCategory]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const slide = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="pt-24 pb-28 relative overflow-hidden bg-gradient-to-br from-[#ffffff] via-[#f4f8f0] to-[#eee6da]">
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-0 transform">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#ffffff]"></path>
        </svg>
      </div>

      {/* Subtle organic noise texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0 transform rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#ffffff]"></path>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* --- Header Section (Centered) --- */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5  mb-6">
            <span className="text-[16px] font-bold tracking-[0.15em] uppercase text-[var(--olive)]">
              {t.health_advantage || "HEALTH BENEFITS"}
            </span>
          </div>

          {/* Title (App Dynamic Style) */}

          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.health_advantage_headline_1}
            <span className="gradient-text">
              {t.health_advantage_headline_2} {t.health_advantage_headline_3}
            </span>
          </h2>

          {/* Category Tabs */}
          <div className="flex gap-3 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeCategory === cat
                    ? "bg-[var(--orange-dark)] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-white/80 backdrop-blur-sm text-stone-500 border border-stone-200 hover:border-[var(--olive)] hover:text-[var(--olive)] shadow-sm"
                  }`}
              >
                {t.sections?.[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Sliding Cards (Image Style) --- */}
        <div className="relative group mt-6">
          {/* Left Arrow */}
          <button
            onClick={() => slide("left")}
            className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white text-stone-600 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-stone-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] opacity-0 group-hover:opacity-100 hidden sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => slide("right")}
            className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white text-stone-600 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-stone-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] opacity-0 group-hover:opacity-100 hidden sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
          </button>

          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-8 pt-4 px-2"
          >
            <style
              dangerouslySetInnerHTML={{
                __html: `
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `,
              }}
            />

            {activeBenefits.map((benefit: any, idx: number) => (
              <div
                key={benefit.name + idx}
                className="flex-shrink-0 w-[240px] md:w-[260px] snap-start bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 flex flex-col items-center text-center transition-all duration-400 hover:shadow-[0_20px_40px_rgba(85,107,47,0.12)] hover:-translate-y-2 group/card relative overflow-hidden"
              >
                {/* Circle Icon */}
                <div className="w-16 h-16 rounded-full bg-[var(--olive)] flex items-center justify-center mb-6 shadow-inner relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                  <img
                    src={meta.emoji}
                    alt="icons"
                    height={30}
                    width={30}
                    className="objectfit-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-extrabold text-stone-800 mb-3 leading-tight min-h-[40px] flex items-center justify-center relative z-10 group-hover/card:text-[var(--olive)] transition-colors duration-300">
                  {benefit.name}
                </h3>

                {/* Description */}
                <p className="text-[12px] text-stone-500 leading-relaxed font-medium mb-6 flex-grow relative z-10">
                  {benefit.desc}
                </p>

                {/* Decorative Divider */}
                <div className="flex items-center w-16 justify-center opacity-40 mt-auto relative z-10 group-hover/card:opacity-100 transition-opacity duration-300">
                  <div className="h-px bg-[var(--olive)] w-full transition-all duration-500 group-hover/card:w-[150%]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] mx-1 shrink-0"></div>
                  <div className="h-px bg-[var(--olive)] w-full transition-all duration-500 group-hover/card:w-[150%]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slider Progress indicator */}
        <div className="max-w-md mx-auto w-full h-1 bg-stone-200/60 rounded-full overflow-hidden mt-2 mb-16 relative">
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[var(--olive)] to-emerald-600 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.max(15, scrollProgress)}%` }}
          />
        </div>
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
          src="/home-banner.jpeg"
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20 pb-20">
        <div className="max-w-2xl space-y-7">
          {/* Headline */}
          <h1 className="text-4xl sm:text-4xl md:text-4xl font-black text-white leading-[1.1] tracking-tight">
            {t.hero_title_1} <br />
            <span className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                {t.hero_title_2}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-white/70 max-w-xl leading-relaxed font-medium">
            {t.hero_subtitle}
          </p>

          {/* CTA Buttons & Social Proof */}
          <div className="space-y-6 pt-4">
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="group relative flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--olive)] to-emerald-600 text-white font-bold text-xs tracking-widest uppercase overflow-hidden shadow-[0_10px_30px_rgba(85,107,47,0.3)] hover:shadow-[0_15px_40px_rgba(85,107,47,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                <span className="relative z-10">{t.shop}</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>

              <Link
                href="/gifts"
                className="group relative flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-xs tracking-widest uppercase hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span className="relative z-10">{t.gifting}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side floating glass orbs and constellation lines */}
      <div className="mt-5 hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 w-[450px] h-[450px] items-center justify-center pointer-events-none z-10">
        {/* Ambient glow */}
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[var(--olive)]/30 to-[var(--orange)]/20 rounded-full blur-[80px] animate-pulse" />

        {/* Decorative constellation lines connecting orbs */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0"
          viewBox="0 0 450 450"
        >
          <path
            d="M 225 225 L 350 110"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 225 225 L 360 340"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 225 225 L 110 320"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Central Logo Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center animate-float z-30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full" />
          <img
            src="/app-logo.png"
            alt="logo"
            className="h-24 object-contain drop-shadow-2xl relative z-10 brightness-0 invert"
          />
          {/* Echo rings */}
          <div className="absolute inset-[-20px] border border-white/20 rounded-full" />
          <div className="absolute inset-[-44px] border border-white/10 rounded-full border-dashed" />
        </div>

        {/* Top Right Orb */}
        <div className="absolute top-10 right-10 w-28 h-28 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1.5 animate-float delay-300 z-20">
          <Wheat className="w-6 h-6 text-amber-300" />
          <span className="text-white text-[9px] font-black tracking-widest uppercase text-center leading-tight">
            100%
            <br />
            Organic
          </span>
        </div>

        {/* Bottom Right Orb */}
        <div className="absolute bottom-12 right-6 w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1 animate-float delay-700 z-20">
          <Shield className="w-5 h-5 text-emerald-300" />
          <span className="text-white text-[8px] font-black tracking-widest uppercase text-center leading-tight">
            Premium
            <br />
            Quality
          </span>
        </div>

        {/* Bottom Left Orb */}
        <div className="absolute bottom-20 left-8 w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1.5 animate-float delay-1000 z-20">
          <Award className="w-7 h-7 text-[var(--orange)]" />
          <span className="text-white text-[10px] font-black tracking-widest uppercase text-center leading-tight">
            Certified
            <br />
            Pure
          </span>
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

  const cleanedBase = IMAGE_URL.endsWith("/")
    ? IMAGE_URL.slice(0, -1)
    : IMAGE_URL;
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
  const [quantity, setQuantity] = useState(1);

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
      className="group relative bg-white border border-stone-200/75 hover:border-[var(--olive)]/50 rounded-[1.25rem] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(85,107,47,0.08)] p-2.5 h-full"
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 justify-center items-center flex">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${(product.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
        />

        {/* Elegant Dark Vignette Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {(product.availablestock ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10">
            <span className="bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] shadow-lg uppercase">
              Out Of Stock
            </span>
          </div>
        )}

        {/* Top Left Discount Badge */}
        {originalPrice && originalPrice > price && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-gradient-to-r from-[var(--orange)] to-[var(--orange-dark)] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(255,140,0,0.25)] tracking-wider">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Top Right Favourite Button */}
        <div className="absolute top-2.5 right-2.5 z-20">
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
            className={`w-8 h-8 rounded-full shadow-md border flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer ${isFav
                ? "bg-rose-50 border-rose-200 text-rose-500"
                : "bg-white/80 backdrop-blur-sm border-white/60 text-stone-400 hover:text-rose-500 hover:bg-white"
              }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${isFav ? "fill-rose-500 text-rose-500" : ""
                }`}
            />
          </button>
        </div>

        {/* Quick View Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-white/50 text-stone-900 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] text-[10px] font-bold py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 tracking-widest uppercase">
          Quick View
        </div>
      </div>

      {/* Content Area */}
      <div className="px-1.5 pt-3.5 pb-1 flex flex-col flex-1">
        {/* Subcategory & Title */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold text-[var(--orange)] uppercase tracking-widest">
              {product.category || "Organic"}
            </span>
            {product.weight && (product.unit || product.unitname) && (
              <span className="bg-[var(--beige)] text-[var(--olive-dark)] px-2 py-0.5 rounded-md text-[9px] font-extrabold border border-[var(--olive)]/15">
                {product.weight} {product.unit || product.unitname}
              </span>
            )}
          </div>
          <h3 className="text-[14px] font-bold text-stone-900 group-hover:text-[var(--olive)] transition-colors duration-350 line-clamp-1 leading-tight">
            {name}
          </h3>
        </div>

        {/* Ratings & Stock Status Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[10px] text-stone-500 font-medium line-clamp-2 leading-relaxed flex-1 pr-2">
            {product.desc ||
              product.description ||
              "Tradizions premium selection for health. Discover natural goodness."}
          </p>

          {/* Stock Pill Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${(product.availablestock ?? 0) > 0
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-rose-50 text-rose-700 border-rose-200/60"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${(product.availablestock ?? 0) > 0
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500"
                }`}
            />
            {(product.availablestock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        {/* Price Details */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[18px] font-black text-stone-900">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && (
            <>
              <span className="text-[12px] text-stone-400 line-through font-medium">
                ₹{originalPrice.toLocaleString()}
              </span>
              {originalPrice > price && (
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-100">
                  {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                  OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Add to Cart Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-stone-100">
          {/* Quantity Stepper */}
          <div
            className="flex items-center border border-stone-200 rounded-[5px] bg-stone-50 overflow-hidden h-8 shrink-0 shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-2 text-stone-500 hover:text-stone-800 transition-colors hover:bg-stone-100 h-full flex items-center cursor-pointer font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[12px] font-extrabold text-stone-800 w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-2 text-stone-500 hover:text-stone-800 transition-colors hover:bg-stone-100 h-full flex items-center cursor-pointer font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add To Cart CTA */}
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
                    quantity: quantity,
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
            className={`flex-1 min-w-[120px] h-8 rounded-[5px] font-bold text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${(product.availablestock ?? 0) <= 0
                ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                : "bg-[var(--olive)] hover:bg-[var(--olive-dark)] text-white shadow-[0_6px_20px_rgba(85,107,47,0.25)] hover:shadow-[0_8px_25px_rgba(85,107,47,0.4)] hover:-translate-y-0.5 cursor-pointer"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdding ? (
              <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            <span>
              {(product.availablestock ?? 0) <= 0
                ? "Sold Out"
                : isAdding
                  ? "Adding..."
                  : "Add to Cart"}
            </span>
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
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-white to-[#fdfbf6] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          {/* Left Side: Elegant Arch Image */}
          <div
            className={`w-full lg:w-5/12 relative transition-all duration-700 opacity-100 translate-x-0`}
          >
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
                  <h4 className="text-[15px] font-black text-[#2b3513] leading-none mb-1">
                    100% Pure
                  </h4>
                  <p className="text-[10px] text-[#556b2f] font-bold uppercase tracking-widest">
                    Organic Certified
                  </p>
                </div>
              </div>
            </div>
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#e4dec2]/40 to-[#f6f2dd]/50 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right Side: Content & Features */}
          <div
            className={`w-full lg:w-7/12 space-y-12 transition-all duration-700 delay-200 opacity-100 translate-x-0`}
          >
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
      className="py-12 relative z-30 overflow-hidden bg-[#fafaf9] flex justify-center"
    >
      <div className="max-w-2xl w-full px-6">
        <div className="relative group mx-auto w-full animate-float">
          {/* Animated gradient border glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-[var(--olive)] rounded-[2rem] blur opacity-20 group-hover:opacity-60 transition duration-1000 animate-pulse" />

          {/* The Card */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-stone-200/60 flex flex-col items-center text-center overflow-hidden transition-transform duration-500 group-hover:-translate-y-2 z-10">
            {/* Light Based Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/kural-book.jpg"
                alt="kural"
                className="w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90" />
            </div>

            {/* Top decorative element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 z-10 rounded-b-full" />

            {/* Icon */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 flex items-center justify-center mb-6 group-hover:rotate-[360deg] transition-transform duration-1000 shadow-md">
              <ScrollText className="w-6 h-6 text-amber-600" />
              <Quote className="absolute -bottom-1 -right-2 w-7 h-7 text-amber-300 drop-shadow-sm" />
            </div>

            {/* Title */}
            <div className="relative z-10 flex items-center gap-4 mb-5">
              <span className="w-8 h-px bg-amber-300" />
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-[0.35em] leading-none drop-shadow-sm">
                {t.kural_title}
              </span>
              <span className="w-8 h-px bg-amber-300" />
            </div>

            {/* Kural Text */}
            <div className="relative z-10 text-base md:text-lg font-extrabold text-stone-900 leading-[1.9] tracking-tight mb-7 w-full drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
              {formatKural(kuraldata?.kural)}
            </div>

            {/* Meaning */}
            {kuraldata?.meaning && (
              <div className="relative z-10 text-xs md:text-sm text-stone-700 font-bold leading-relaxed bg-white/70 backdrop-blur-md p-5 rounded-2xl border-l-[4px] border-l-amber-400 border-y border-r border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-full group-hover:bg-amber-50/60 transition-colors duration-500 text-left">
                {kuraldata.meaning}
              </div>
            )}
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
  const defaultIcons = [Activity, Scale, Baby];

  return (
    <section ref={ref} className="py-24 bg-[#fafaf9] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
              {t.health_goals_title?.split(" ").slice(0, 2).join(" ") ||
                "Health"}{" "}
              <span className="gradient-text">
                {t.health_goals_title?.split(" ").slice(2).join(" ") || "Goals"}
              </span>
            </h2>
            <p className="text-base font-medium text-stone-500 max-w-lg">
              {t.health_goals_desc}
            </p>
          </div>
        </div>

        {displayGoals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-stone-200">
            <p className="text-stone-500 font-medium text-sm">
              No health goals found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayGoals.map((goal, idx) => {
              const Icon = defaultIcons[idx % defaultIcons.length];
              const image = getImageUrl(goal.goalimage);

              return (
                <Link
                  href={`/health-goal-products?goalid=${goal.goalid}`}
                  key={goal.goalid || idx}
                  className="group relative flex flex-col sm:flex-row bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(85,107,47,0.15)] hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Image Section (Left) */}
                  <div className="relative w-full sm:w-[45%] h-[240px] sm:h-auto overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={image}
                      alt={goal.goalname || ""}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 mix-blend-multiply" />

                    {/* Floating Icon over Image */}
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-[var(--olive)] group-hover:bg-[var(--orange)] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content Section (Right) */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center relative">
                    {/* Subtle Number background */}
                    <div className="absolute top-4 right-6 text-[80px] font-black text-stone-50 leading-none pointer-events-none select-none transition-transform duration-700 group-hover:-translate-y-2 group-hover:text-stone-100/50">
                      0{idx + 1}
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight transition-colors duration-300 mb-3 pr-10">
                        {goal.goalname}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed line-clamp-3 mb-6">
                        {goal.description}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-stone-100 flex items-center justify-center group-hover:border-[var(--orange)] group-hover:bg-[var(--orange-dark)] transition-all duration-300">
                          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 group-hover:text-[var(--olive)] transition-colors duration-300">
                          {t.explore_all || "Explore"}
                        </span>
                      </div>
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
          API.post(API_ROUTES.CALCULATORPRODUCTS, {
            categoryid: 1,
            bid: 1,
          }).catch(() => ({ data: { data: [] } })),
          API.post(API_ROUTES.CALCULATORPRODUCTS, {
            categoryid: 2,
            bid: 1,
          }).catch(() => ({ data: { data: [] } })),
          API.post(API_ROUTES.CALCULATORPRODUCTS, {
            categoryid: 3,
            bid: 1,
          }).catch(() => ({ data: { data: [] } })),
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
    <section
      ref={ref}
      className="pt-24 pb-28 bg-gradient-to-br from-[var(--olive)]/20 via-[#f2efe6] to-[var(--orange)]/20 relative overflow-hidden"
    >
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-0 transform">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#ffffff]"></path>
        </svg>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0 transform rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#ffffff]"></path>
        </svg>
      </div>

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
                "A balanced mix for kids, adults, and elders",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white/80 p-5 rounded-2xl shadow-sm border border-stone-100 hover:border-[var(--olive)]/30 transition-colors duration-300"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[var(--olive)]" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100 mb-8 relative z-10">
              <p className="text-sm text-gray-600 font-medium text-center leading-relaxed">
                Simply choose your preferred nuts, enter the number of family
                members, and get an instant estimate of quantity and price.
              </p>
            </div>

            <p className="text-[12px] font-black tracking-[0.3em] uppercase text-center relative z-10">
              <span className="text-gray-400">Eat healthy.</span>{" "}
              <span className="text-[var(--olive)] mx-2">Plan smart.</span>{" "}
              <span className="text-[var(--orange)]">Shop better.</span>
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
