"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
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
      <HeroSection t={t} featuredProducts={featuredProducts} />

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
      <section className="relative w-full h-[70vh] md:h-[90vh] min-h-[600px] overflow-hidden">
        {/* Top Wave (Seamless transition from HealthBenefitsSection) */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-[#eee6da]"
            ></path>
          </svg>
        </div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1675170636943-3bba5a9ff9d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDAzfHxudXRzJTIwYW5kJTIwc2VlZHN8ZW58MHx8MHx8fDA%3D')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-8 z-10">
          <div className="space-y-4 max-w-3xl mt-12">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg">
              {t.banner_title || "Pure Nutrition, Rooted in Tradition"}
            </h2>
            <p className="text-sm md:text-lg text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md">
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
    <section className="pt-24 pb-24 relative overflow-hidden bg-white border-b border-gray-100">
      {/* Subtle Corporate Grid Background */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              {t.health_advantage || "HEALTH BENEFITS"}
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {t.health_advantage_headline_1}{" "}
            <span className="text-[var(--orange)] font-light">
              {t.health_advantage_headline_2} {t.health_advantage_headline_3}
            </span>
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border ${
                  activeCategory === cat
                    ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[var(--orange)] hover:text-[var(--orange)] shadow-sm"
                }`}
              >
                {t.sections?.[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Sliding Cards (Corporate Style) --- */}
        <div className="relative group mt-8">
          {/* Left Arrow */}
          <button
            onClick={() => slide("left")}
            className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white text-[var(--olive-dark)] rounded border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-[var(--orange)] hover:text-white hover:border-[var(--orange)] opacity-0 group-hover:opacity-100 hidden sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => slide("right")}
            className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white text-[var(--olive-dark)] rounded border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-[var(--orange)] hover:text-white hover:border-[var(--orange)] opacity-0 group-hover:opacity-100 hidden sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </button>

          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-10 pt-4 px-2"
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
                className="flex-shrink-0 w-[260px] md:w-[280px] snap-start bg-white rounded border border-gray-200 p-8 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--orange)] group/card relative"
              >
                {/* Structural Icon Box */}
                <div className="w-12 h-12 rounded bg-[var(--cream)] border border-[var(--olive)]/20 flex items-center justify-center mb-6 group-hover/card:bg-[var(--orange)] group-hover/card:border-transparent transition-colors duration-300">
                  <img
                    src={meta.emoji}
                    alt="icons"
                    className="w-6 h-6 object-cover opacity-80 group-hover/card:opacity-100 group-hover/card:brightness-0 group-hover/card:invert transition-all"
                  />
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase mb-3 leading-snug group-hover/card:text-[var(--olive-dark)] transition-colors duration-300">
                  {benefit.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed font-medium mb-6 flex-grow">
                  {benefit.desc}
                </p>

                {/* Corporate Divider Line */}
                <div className="h-[2px] w-8 bg-gray-200 mt-auto group-hover/card:bg-[var(--orange)] group-hover/card:w-16 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Slider Progress indicator */}
        <div className="max-w-md mx-auto w-full h-[2px] bg-gray-100 rounded-none overflow-hidden mt-4 relative">
          <div
            className="absolute top-0 bottom-0 left-0 bg-[var(--olive-dark)] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, scrollProgress)}%` }}
          />
        </div>
      </div>
    </section>
  );
}

// -----------------------------------  HERO SECTION

function HeroSection({
  t,
  featuredProducts = [],
}: {
  t: any;
  featuredProducts?: any[];
}) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative w-full h-[95vh] min-h-[800px] flex flex-col justify-between overflow-hidden bg-black">
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <Image
          src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSO-MEYF6S4m4yNGAU1KoxpGjKhGp9YIt5V3GF2PD0BzC7Ks7JE"
          alt="Premium Artisanal Millet & Nut Gift Packs"
          fill
          priority
          className={`object-cover object-center transition-all duration-[2500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            loaded
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 scale-[1.03] blur-[2px]"
          }`}
        />

        {/* Soft Black Overlay */}
        <div className="absolute inset-0 bg-black/20 z-[5]" />

        {/* Top Gradient */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 via-transparent to-transparent z-[6]" />

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-[6]" />

        {/* Left Ambient Shadow */}
        <div className="absolute -left-40 top-1/3 w-[650px] h-[650px] rounded-full bg-black/15 blur-[160px] z-[6]" />

        {/* Right Ambient Shadow */}
        <div className="absolute -right-40 top-0 w-[700px] h-[700px] rounded-full bg-black/15 blur-[180px] z-[6]" />

        {/* Edge Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.18)_100%)] z-[6]" />
      </div>

      {/* ── Top Text Area ── */}
      <div className="relative z-20 w-full pt-32 px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="w-8 h-px bg-[var(--orange)]" />
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/80">
            Premium Wellness Gifting
          </span>
          <span className="w-8 h-px bg-[var(--orange)]" />
        </div>

        <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] max-w-5xl">
          ARTISANAL MILLET & <span className="text-[var(--orange)]">NUT</span>{" "}
          GIFT PACKS
        </h1>
      </div>

      {/* ── Bottom Content Area ── */}
      <div className="relative z-20 w-full pb-16 px-6 flex flex-col items-center text-center mt-auto">
        {/* Subheadline */}
        <p className="text-[13px] md:text-sm text-white/75 max-w-2xl mx-auto mb-10 font-medium leading-relaxed tracking-wide">
          Beautifully curated in traditional jute, elegant tin, and crafted MDF
          boxes. Health meets heritage.
        </p>

        {/* ── Product Slider in Banner ── */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div
            className="w-full max-w-5xl mx-auto mb-10 overflow-x-auto flex gap-4 px-2 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {featuredProducts.slice(0, 5).map((product, idx) => {
              const productId = product.productid || product.id;
              const bid = product.bid || 1;
              return (
                <div
                  key={idx}
                  className="flex-shrink-0 w-48 lg:w-56 bg-black/40 backdrop-blur-md rounded-sm border border-white/20 p-3 snap-center group cursor-pointer hover:bg-black/60 transition-all shadow-sm"
                  onClick={() =>
                    (window.location.href = `/product-detail/${productId}?productid=${productId}&bid=${bid}`)
                  }
                >
                  <div className="relative w-full aspect-square rounded-sm overflow-hidden mb-3 border border-white/10">
                    <img
                      src={getImageUrl(product.image || product.productimage)}
                      alt={product.name || product.productname}
                      // fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 w-full h-full"
                    />
                  </div>
                  <h3 className="text-white text-xs lg:text-sm font-bold truncate text-left">
                    {product.name || product.productname}
                  </h3>
                  <p className="text-[var(--orange)] font-bold text-xs lg:text-sm text-left mt-1">
                    ₹{product.sellingprice|| product.price }
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 border-t border-white/10 pt-10 w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm text-white group-hover:border-[var(--orange)] transition-colors duration-300">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-white uppercase leading-[1.4]">
              100%
              <br />
              Organic
            </span>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm text-white group-hover:border-[var(--orange)] transition-colors duration-300">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-white uppercase leading-[1.4]">
              Premium
              <br />
              Quality
            </span>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm text-white group-hover:border-[var(--orange)] transition-colors duration-300">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-white uppercase leading-[1.4]">
              Certified
              <br />
              Pure
            </span>
          </div>
        </div>
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
          <div className="inline-flex items-center gap-3 justify-center w-full mb-2">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Collections
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none text-center">
            {t.categories_title?.split(" ").slice(0, 2).join(" ") ||
              "Our Collections"}{" "}
            <span className="text-[var(--orange)] font-light">
              {t.categories_title?.split(" ").slice(2).join(" ") || ""}
            </span>
          </h2>
          <p className="text-sm font-medium text-gray-500 max-w-lg mx-auto">
            {t.categories_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {displayCategories.map((cat, idx) => {
            const imageUrl = getCategoryImageUrl(cat.categoryimage);

            return (
              <Link
                href={`/shop?category=${encodeURIComponent(cat.categoryname || "")}`}
                key={idx}
                className={`group relative h-[380px] rounded-sm overflow-hidden transition-all duration-700 opacity-100 translate-y-0`}
                style={{
                  transitionDelay: isVisible ? `${idx * 100}ms` : "0ms",
                }}
              >
                {/* Background Image */}
                <img
                  src={imageUrl}
                  alt={cat.categoryname || ""}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.08]"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#11100e] via-[#11100e]/30 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-500 z-10" />

                {/* Premium Content Overlay */}
                <div className="absolute inset-x-6 bottom-6 z-20 flex flex-col justify-end overflow-hidden">
                  <div className="transform transition-all duration-500 group-hover:-translate-y-0">
                    <p className="text-[10px] text-[#e5c158] font-bold uppercase tracking-[0.2em] mb-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      Explore Collection ({cat.products || 0})
                    </p>

                    <div className="flex items-end justify-between gap-4">
                      <h3 className="text-xl md:text-xl text-[#fdfbf7] leading-tight">
                        {cat.categoryname || ""}
                      </h3>
                      <div className="w-10 h-10 shrink-0 rounded-full border border-[#e5c158]/40 flex items-center justify-center text-[#e5c158] group-hover:bg-[#e5c158] group-hover:text-[#11100e] group-hover:border-[#e5c158] transition-all duration-500 shadow-[0_0_15px_rgba(229,193,88,0)] group-hover:shadow-[0_0_20px_rgba(229,193,88,0.3)]">
                        <ArrowRight
                          className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5"
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Animated Divider */}
                    <div className="h-[1px] w-0 bg-[#e5c158]/70 mt-5 transition-all duration-700 ease-out group-hover:w-full" />
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
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-3 mb-1">
              <span className="w-6 h-px bg-[var(--orange)]" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
                Highlights
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
              {t.featured_products.split(" ")[0]}{" "}
              <span className="text-[var(--orange)] font-light">
                {t.featured_products.split(" ")[1]}
              </span>
            </h2>
            <p className="text-sm font-medium text-gray-500 max-w-md">
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
              <div className="space-y-4 text-left">
                <div className="inline-flex items-center gap-3 mb-1">
                  <span className="w-6 h-px bg-[var(--orange)]" />
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
                    Curated Presents
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                  {t.gift.split(" ")[0]}{" "}
                  <span className="text-[var(--orange)] font-light">
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
    <section ref={ref} className="py-20 bg-stone-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          {/* Left Side: Elegant Sharp Image */}
          <div
            className={`w-full lg:w-5/12 relative transition-all duration-700 opacity-100 translate-x-0`}
          >
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-sm border border-stone-200 mx-auto max-w-sm group bg-white">
              <Image
                src="https://images.unsplash.com/photo-1626023873533-f5cc77cc2458?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Quality organic products"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-stone-900/10 opacity-100" />

              {/* Floating Stat Card inside Image */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white p-4 rounded-sm shadow-sm flex items-center gap-4 border border-stone-200 group-hover:-translate-y-1 transition-transform duration-500">
                <div className="w-12 h-12 rounded-sm bg-[var(--olive-dark)] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-stone-900 leading-none mb-1">
                    100% Pure
                  </h4>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                    Organic Certified
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Content & Features */}
          <div
            className={`w-full lg:w-7/12 space-y-12 transition-all duration-700 delay-200 opacity-100 translate-x-0`}
          >
            <div className="space-y-5 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-stone-900 leading-[1.15] tracking-tight">
                {t.why_choose.split(" ").slice(0, 1).join(" ")}
                <span className="text-[var(--olive-dark)]">
                  {" "}
                  {t.why_choose.split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p className="text-stone-600 text-sm md:text-[15px] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.why_desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {whyChooseUs.map((item, idx) => (
                <div key={idx} className="flex gap-5 group items-start">
                  <div className="flex-shrink-0 w-[60px] h-[60px] rounded-sm bg-white border border-stone-200 text-stone-900 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white group-hover:border-stone-900 transition-all duration-300 shadow-sm">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-[16px] font-bold text-stone-900 group-hover:text-[var(--olive-dark)] transition-colors">
                      {t.features[idx * 2]}
                    </h4>
                    <p className="text-[13px] text-stone-500 font-medium leading-snug">
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
    <section ref={ref} className="py-16 bg-[var(--site-bg)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`max-w-2xl mx-auto text-center space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <div className="inline-flex items-center gap-3 justify-center w-full mb-2">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Testimonials
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {t.loved.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="text-[var(--orange)] font-light">
              {t.loved.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto font-medium">
            {t.community_desc}
          </p>
        </div>

        {listToRender.length > 5 ? (
          /* AUTO-SCROLLING MARQUEE CONTAINER */
          <div className="relative w-full overflow-hidden group mt-10">
            {/* Gradient Overlays for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--site-bg)] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--site-bg)] to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee-slow whitespace-nowrap gap-6 py-6 px-6 hover:pause-animation">
              {[
                ...listToRender,
                ...listToRender,
                ...listToRender,
                ...listToRender,
              ].map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="w-[300px] md:w-[340px] flex-shrink-0 bg-white border border-gray-200 rounded-none p-8 shadow-sm hover:border-[var(--orange)] hover:shadow-md transition-all duration-500 flex flex-col justify-between group/card relative overflow-hidden whitespace-normal"
                  >
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--olive-dark)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                    <div className="space-y-5 relative z-10">
                      <div className="flex items-center gap-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm font-medium leading-relaxed italic line-clamp-5">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100 relative z-10">
                      <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-xs font-bold text-[var(--olive-dark)] border border-gray-200">
                        {item.avatar}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                          {item.name}
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-0.5">
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
          <div className="flex flex-row flex-wrap justify-center gap-6 py-10 px-6 mt-10">
            {listToRender.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="w-[300px] md:w-[340px] flex-shrink-0 bg-white border border-gray-200 rounded-none p-8 shadow-sm hover:border-[var(--orange)] hover:shadow-md transition-all duration-500 flex flex-col justify-between group/card relative overflow-hidden"
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--olive-dark)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                  <div className="space-y-5 relative z-10">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed italic line-clamp-5">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100 relative z-10">
                    <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-xs font-bold text-[var(--olive-dark)] border border-gray-200">
                      {item.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                        {item.name}
                      </h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-0.5">
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
          className={`mt-10 flex flex-col items-center gap-3 transition-all duration-500 delay-500 opacity-100`}
        >
          <div className="flex -space-x-3">
            {users.map((name, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-none border-2 border-white flex items-center justify-center text-[var(--olive-dark)] text-xs font-bold bg-gray-100"
              >
                {getInitials(name)}
              </div>
            ))}

            {/* Count */}
            <div className="w-10 h-10 rounded-none border-2 border-white bg-[var(--olive-dark)] flex items-center justify-center text-white text-[10px] font-bold">
              +2k
            </div>
          </div>

          <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">{t.trusted}</p>
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
      className="py-16 relative z-30 overflow-hidden bg-white border-y border-stone-200 flex justify-center"
    >
      <div className="max-w-xl w-full px-6">
        <div className="relative group mx-auto w-full">
          {/* The Card */}
          <div className="relative bg-white rounded-sm p-6 md:p-8 shadow-sm border border-stone-200 flex flex-col items-center text-center transition-colors duration-300 hover:border-stone-400 z-10">
            {/* Background Image (Subtle) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
              <img
                src="/kural-book.jpg"
                alt="kural"
                className="w-full h-full object-cover grayscale"
              />
            </div>

            {/* Icon */}
            <div className="relative z-10 w-14 h-14 rounded-sm bg-stone-100 border border-stone-200 flex items-center justify-center mb-6 shadow-sm text-[var(--olive-dark)] transition-transform duration-500 group-hover:scale-105">
              <ScrollText className="w-6 h-6" />
            </div>

            {/* Title */}
            <div className="relative z-10 flex items-center gap-4 mb-6 w-full justify-center">
              <span className="w-12 h-px bg-stone-300" />
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none">
                {t.kural_title}
              </span>
              <span className="w-12 h-px bg-stone-300" />
            </div>

            {/* Kural Text */}
            <div className="relative z-10 text-base md:text-lg font-bold text-stone-900 leading-[1.9] tracking-tight mb-8 w-full">
              {formatKural(kuraldata?.kural)}
            </div>

            {/* Meaning */}
            {kuraldata?.meaning && (
              <div className="relative z-10 text-sm text-stone-600 font-medium leading-relaxed bg-stone-50 p-6 rounded-sm border border-stone-200 w-full text-left">
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
    <section ref={ref} className="py-24 bg-[#FFF5EF] relative overflow-hidden">
      {/* Subtle Corporate Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-3">
              <span className="w-8 h-px bg-[var(--orange)]" />
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
                Targeted Nutrition
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {t.health_goals_title?.split(" ").slice(0, 2).join(" ") ||
                "Health"}{" "}
              <span className="text-[var(--orange)] font-light">
                {t.health_goals_title?.split(" ").slice(2).join(" ") || "Goals"}
              </span>
            </h2>
            <p className="text-base font-medium text-gray-600 max-w-lg leading-relaxed">
              {t.health_goals_desc ||
                "Discover precisely formulated nutrition tailored for your specific wellness objectives."}
            </p>
          </div>
        </div>

        {displayGoals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-white border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium text-sm">
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
                  className="group flex flex-col sm:flex-row bg-white overflow-hidden border border-gray-200 hover:border-[var(--orange)] shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  {/* Image Section (Left) */}
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={image}
                      alt={goal.goalname || ""}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[var(--olive-dark)]/10 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0" />
                  </div>

                  {/* Content Section (Right) */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded flex items-center justify-center bg-[var(--cream)] border border-[var(--olive)]/20 text-[var(--olive-dark)] group-hover:bg-[var(--orange)] group-hover:text-white group-hover:border-transparent transition-colors duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                        Goal 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 tracking-tight transition-colors duration-300 mb-2 group-hover:text-[var(--olive-dark)]">
                      {goal.goalname}
                    </h3>

                    <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2 mb-6">
                      {goal.description}
                    </p>

                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--olive-dark)] group-hover:text-[var(--orange)] transition-colors duration-300">
                        {t.explore_all || "Explore"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[var(--olive-dark)] group-hover:text-[var(--orange)] group-hover:translate-x-1 transition-all duration-300" />
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
      className="pt-24 pb-28 bg-[var(--cream)] relative overflow-hidden border-t border-gray-200"
    >
      {/* Subtle Corporate Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Main Calculator Header & Description */}
        <div className="text-center mb-10 space-y-6">
          <div className="inline-flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Budget & Planning
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Monthly Product{" "}
            <span className="text-[var(--orange)] font-light">Calculator</span>
          </h2>

          <div className="max-w-4xl mx-auto bg-white rounded border border-gray-200 p-8 md:p-12 shadow-sm text-left relative overflow-hidden">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 text-center tracking-tight">
              Strategic Nutrition Planning for Your Office or Home
            </h3>
            <p className="text-xs font-bold text-gray-400 mb-8 text-center uppercase tracking-[0.15em]">
              Estimate Requirements & Costs Instantly:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                "Calculate precise quantities based on headcount",
                "Estimate daily & monthly consumption in grams",
                "Forecast budget based on selected premium products",
                "Maintain a balanced inventory effortlessly",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-gray-50 p-5 rounded border border-gray-100 hover:border-[var(--orange)] transition-colors duration-300"
                >
                  <div className="w-8 h-8 rounded bg-[var(--cream)] border border-[var(--olive)]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[var(--olive-dark)]" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[var(--cream)]/50 rounded p-5 border border-[var(--olive)]/10 mb-8 text-center">
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                Choose your required products, input the number of members, and
                generate an instant procurement estimate.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Products */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-6 md:p-10 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="w-10 h-10 rounded bg-[var(--olive-dark)] text-white flex items-center justify-center font-black text-sm">
                  01
                </span>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                  Select Products
                </h2>
              </div>
              <p className="text-gray-500 font-medium ml-14 text-sm">
                Curate the selection for your monthly estimate.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="w-full pl-11 pr-4 py-3 rounded border border-gray-200 text-sm focus:outline-none focus:border-[var(--olive-dark)] focus:ring-1 focus:ring-[var(--olive-dark)] font-medium text-gray-800 transition-all bg-gray-50 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={scrollToCalculator}
                className="group flex items-center gap-2 whitespace-nowrap bg-[var(--olive-dark)] text-white px-6 py-3 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--orange)] transition-colors duration-300"
              >
                View Estimate{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Categories */}
            <div className="w-full lg:w-64 flex flex-col gap-3">
              <button
                onClick={() => setSelectedCategory(0)}
                className={`flex items-center justify-between p-4 rounded border transition-all ${selectedCategory === 0 ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white" : "bg-gray-50 border-gray-200 hover:border-[var(--olive-dark)] text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-wider">
                  <LayoutGrid
                    className={`w-4 h-4 ${selectedCategory === 0 ? "text-white" : "text-[var(--olive-dark)]"}`}
                  />{" "}
                  All Catalog
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded ${selectedCategory === 0 ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {allProducts.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory(1)}
                className={`flex items-center justify-between p-4 rounded border transition-all ${selectedCategory === 1 ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white" : "bg-gray-50 border-gray-200 hover:border-[var(--olive-dark)] text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-wider">
                  <Circle
                    className={`w-4 h-4 ${selectedCategory === 1 ? "text-white" : "text-[var(--olive-dark)]"}`}
                  />{" "}
                  Nuts
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded ${selectedCategory === 1 ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {nutsProducts.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory(2)}
                className={`flex items-center justify-between p-4 rounded border transition-all ${selectedCategory === 2 ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white" : "bg-gray-50 border-gray-200 hover:border-[var(--olive-dark)] text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-wider">
                  <Wheat
                    className={`w-4 h-4 ${selectedCategory === 2 ? "text-white" : "text-[var(--olive-dark)]"}`}
                  />{" "}
                  Millets
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded ${selectedCategory === 2 ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {milletsProducts.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory(3)}
                className={`flex items-center justify-between p-4 rounded border transition-all ${selectedCategory === 3 ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white" : "bg-gray-50 border-gray-200 hover:border-[var(--olive-dark)] text-gray-700"}`}
              >
                <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-wider">
                  <Flame
                    className={`w-4 h-4 ${selectedCategory === 3 ? "text-white" : "text-[var(--olive-dark)]"}`}
                  />{" "}
                  Spices
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded ${selectedCategory === 3 ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {spicesProducts.length}
                </span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="flex-1 border border-gray-200 bg-gray-50 rounded p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">
                  {selectedCategory === 0
                    ? "Complete Catalog"
                    : selectedCategory === 1
                      ? "Nuts Category"
                      : selectedCategory === 2
                        ? "Millets Category"
                        : "Spices Category"}
                  <span className="text-[var(--orange)] ml-2">
                    ({displayedProducts.length})
                  </span>
                </h3>
              </div>

              {displayedProducts.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center bg-white border border-dashed border-gray-300">
                  <Leaf className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    No products found in inventory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayedProducts.map((product) => {
                    const isSelected = !!selectedProducts.find(
                      (p) => p.productid === product.productid,
                    );
                    const price = product.sellingprice || product.price || 0;
                    return (
                      <div
                        key={product.productid}
                        onClick={() => handleToggleProduct(product)}
                        className={`group relative p-4 bg-white border-2 cursor-pointer transition-all duration-300 ${isSelected ? "border-[var(--olive-dark)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]" : "border-gray-200 hover:border-[var(--orange)] hover:shadow-md"}`}
                      >
                        <div
                          className={`absolute top-3 left-3 w-5 h-5 flex items-center justify-center transition-colors duration-300 border ${isSelected ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white" : "bg-gray-50 border-gray-300 group-hover:border-[var(--orange)] text-transparent"}`}
                        >
                          <Check
                            className={`w-3 h-3 ${isSelected ? "opacity-100" : "opacity-0"}`}
                            strokeWidth={3}
                          />
                        </div>
                        <div className="h-[80px] w-full relative mb-4 mt-6 bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                          <img
                            src={`${IMAGE_URL ?? ""}${product.productimage ?? ""}`}
                            alt={product.productname ?? "product image"}
                            className="object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500 w-full h-full absolute inset-0 p-2"
                          />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="font-bold text-[11px] uppercase tracking-wider text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--olive-dark)] transition-colors">
                            {product.productname}
                          </p>
                          <div className="inline-block px-3 py-1 bg-[var(--cream)] border border-[var(--olive)]/20">
                            <span className="text-xs font-black text-[var(--olive-dark)]">
                              ₹{price}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 ml-1 uppercase">
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
              <div className="mt-8 bg-[var(--olive-dark)] text-white rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3 font-bold text-sm tracking-widest uppercase">
                  <Check className="w-5 h-5 text-[var(--orange)]" />{" "}
                  {selectedProducts.length} Items Selected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Arrow */}
        <div className="flex justify-center -my-2 opacity-50">
          <ArrowDown className="w-6 h-6 text-[var(--olive-dark)]" />
        </div>

        {/* Step 2: Calculator */}
        <div
          id="calculator-section"
          className="bg-white rounded border border-gray-200 shadow-sm p-6 md:p-10 relative"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="w-10 h-10 rounded bg-[var(--olive-dark)] text-white flex items-center justify-center font-black text-sm">
                  02
                </span>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                  Estimate Generation
                </h2>
              </div>
              <p className="text-gray-500 font-medium ml-14 text-sm">
                Adjust parameters to forecast your monthly procurement budget.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 bg-white">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100 text-[10px] font-black text-[var(--olive-dark)] uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-4 py-4 text-center">Grams / Day</th>
                  <th className="px-4 py-4 text-center">Days</th>
                  <th className="px-4 py-4 text-center">Headcount</th>
                  <th className="px-4 py-4 text-center">Total (KG)</th>
                  <th className="px-4 py-4 text-center">Unit Price</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
                    >
                      Inventory empty. Select items to generate estimate.
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
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative bg-white border border-gray-200 flex-shrink-0 p-1">
                              <img
                                src={`${IMAGE_URL ?? ""}${product.productimage ?? ""}`}
                                alt={product.productname || ""}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                              {product.productname}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            className="w-20 px-2 py-2 rounded-none border border-gray-300 bg-white text-sm font-bold text-gray-900 text-center focus:border-[var(--olive-dark)] focus:ring-1 focus:ring-[var(--olive-dark)] outline-none transition-all"
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
                            className="w-20 px-2 py-2 rounded-none border border-gray-300 bg-white text-sm font-bold text-gray-900 text-center focus:border-[var(--olive-dark)] focus:ring-1 focus:ring-[var(--olive-dark)] outline-none transition-all"
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
                            className="w-20 px-2 py-2 rounded-none border border-gray-300 bg-white text-sm font-bold text-gray-900 text-center focus:border-[var(--olive-dark)] focus:ring-1 focus:ring-[var(--olive-dark)] outline-none transition-all"
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
                        <td className="px-4 py-4 text-center font-bold text-[var(--olive-dark)] text-sm">
                          {qty}{" "}
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            Kg
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-gray-600 text-sm">
                          ₹{displayPrice}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-gray-900 text-base">
                          ₹{price}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleRemoveItem(product.productid!)}
                            className="w-8 h-8 mx-auto border border-gray-300 text-gray-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
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

          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 relative border-t border-gray-200">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 border border-gray-300 text-gray-600 font-bold text-[11px] tracking-widest uppercase flex items-center gap-2 hover:bg-gray-100 transition-all"
            >
              Clear Estimate <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-10">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-1">
                  Estimated Total
                </p>
                <p className="text-4xl font-black text-[var(--olive-dark)] leading-none">
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
                className={`flex items-center justify-center gap-3 px-10 py-4 font-bold text-xs tracking-widest uppercase transition-all cursor-pointer ${selectedProducts.length > 0 ? "bg-[var(--orange)] text-white hover:bg-gray-900 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"} min-w-[200px]`}
              >
                {isBuying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    Proceed to Cart <ArrowRight className="w-4 h-4" />
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
    <section ref={ref} className="py-16 bg-[var(--site-bg)] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <div className="inline-flex items-center gap-3 justify-center w-full mb-2">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Membership
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {t.subscription.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="text-[var(--orange)] font-light">
              {t.subscription.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
            {t.subscription_desc}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`group relative bg-white rounded-none p-8 border transition-all duration-500 opacity-100 translate-y-0 ${plan.border} ${(plan as any).featured ? "border-[var(--olive-dark)] shadow-md scale-[1.02] z-10" : "border-gray-200 hover:border-[var(--orange)] hover:shadow-sm"}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {(plan as any).featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-none bg-[var(--olive-dark)] text-white text-[9px] font-bold tracking-[0.2em] uppercase shadow-sm z-20 whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="relative h-full flex flex-col">
                <div className="pb-6 space-y-4 border-b border-gray-100 mb-6 text-center">
                  <h3
                    className={`text-[11px] font-bold tracking-[0.2em] uppercase ${plan.accent}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[12px] font-bold text-gray-400">
                      ₹
                    </span>
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      / mo
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 h-10">
                    {plan.desc}
                  </p>
                </div>
                <div className="flex-1 space-y-6">
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
                <div className="pt-8">
                  <button className="w-full py-4 bg-[var(--olive-dark)] text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-[var(--orange)] transition-colors cursor-pointer">
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
            <div className="inline-flex items-center gap-3 mb-1">
              <span className="w-6 h-px bg-[var(--orange)]" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
                Latest Additions
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
              {t.new_arrivals.split(" ")[0]}{" "}
              <span className="text-[var(--orange)] font-light">
                {t.new_arrivals.split(" ")[1]}
              </span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md font-medium">
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
    <section className="py-16 bg-[var(--site-bg)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Centered Title Block */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-3 justify-center w-full mb-2">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Accreditations
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none text-center">
            Trusted <span className="text-[var(--orange)] font-light">Certifications</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Every grain and product at Tradizions is backed by absolute
            standards, natural processes, and government-approved accreditations
            to deliver uncompromising safety.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {certs.map((cert) => {
            const CardContent = (
              <div className="flex flex-col justify-between items-center h-full text-center p-8 bg-white border border-gray-200 shadow-sm hover:border-[var(--orange)] transition-all duration-500 hover:shadow-md group cursor-pointer relative overflow-hidden rounded-none">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--olive-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="h-20 flex items-center justify-center mb-6 relative z-10">
                  {cert.icon}
                </div>

                <div className="space-y-1.5 relative z-10 mt-auto">
                  <h4 className="text-[11px] font-bold text-gray-900 tracking-[0.2em] uppercase leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase leading-tight">
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
        
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-3 justify-center w-full mb-2">
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Real Stories
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none text-center">
            Video <span className="text-[var(--orange)] font-light">Testimonials</span>
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
      {/* Video testimonials section commented out */}
    </section>
  );
}

function SustainabilityAndPackagingSection() {
  return (
    <section className="py-16 bg-[var(--site-bg)] relative overflow-hidden border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: SECURE PAYMENTS */}
          <div className="flex flex-col justify-between p-8 md:p-10 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-500 hover:border-[var(--orange)] group relative overflow-hidden rounded-none">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--olive-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-gray-50 text-gray-800 flex items-center justify-center border border-gray-200 shadow-sm transition-transform duration-500">
                  <Shield className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase block">
                    Trust Shield
                  </span>
                  <h4 className="text-[14px] font-bold text-gray-900 tracking-widest uppercase leading-none">
                    Secure Payments
                  </h4>
                </div>
              </div>
              <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                Shop with complete peace of mind. We encrypt and safeguard every
                transaction with industry-standard 256-bit SSL technology.
              </p>
            </div>

            {/* Payment Logos with a luxurious border */}
            <div className="pt-8 relative z-10 mt-auto">
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-none shadow-sm relative z-10 justify-center">
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
          <div className="flex flex-col justify-between p-8 md:p-10 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-500 hover:border-[var(--orange)] group relative overflow-hidden rounded-none">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--olive-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-gray-50 text-gray-800 flex items-center justify-center border border-gray-200 shadow-sm transition-transform duration-500">
                  <Leaf className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase block">
                    Eco Stewardship
                  </span>
                  <h4 className="text-[14px] font-bold text-gray-900 tracking-widest uppercase leading-none">
                    Sustainability
                  </h4>
                </div>
              </div>
              <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                Caring for the planet and future generations is embedded in our
                DNA. We focus on low carbon outputs and support organic farming
                loops.
              </p>
            </div>

            {/* Checklist + Illustration */}
            <div className="flex items-center justify-between gap-4 pt-8 relative z-10 mt-auto">
              <ul className="space-y-3">
                {[
                  "Ethically Sourced",
                  "Eco Friendly Processes",
                  "Supporting Local Farmers",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-gray-700 tracking-wide uppercase"
                  >
                    <div className="w-4 h-4 rounded-none bg-[var(--olive-dark)] flex items-center justify-center text-white shadow-sm border border-[var(--olive-dark)]">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="flex-shrink-0 bg-gray-50 p-3 rounded-none border border-gray-200 shadow-sm">
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
          <div className="flex flex-col justify-between p-8 md:p-10 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-500 hover:border-[var(--orange)] group relative overflow-hidden rounded-none">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--olive-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-gray-50 text-gray-800 flex items-center justify-center border border-gray-200 shadow-sm transition-transform duration-500">
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
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase block">
                    Earth Safe
                  </span>
                  <h4 className="text-[14px] font-bold text-gray-900 tracking-widest uppercase leading-none">
                    Plastic-Free Packaging
                  </h4>
                </div>
              </div>
              <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                Our pledge is zero plastic. We pack exclusively in biodegradable
                cardboard, jute, and paper, so our shipments leave no toxic
                footprint.
              </p>
            </div>

            {/* Checklist + Illustration */}
            <div className="flex items-center justify-between gap-4 pt-8 relative z-10 mt-auto">
              <ul className="space-y-3">
                {[
                  "100% Eco Friendly",
                  "Fully Biodegradable",
                  "Better for Earth",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-gray-700 tracking-wide uppercase"
                  >
                    <div className="w-4 h-4 rounded-none bg-[var(--olive-dark)] flex items-center justify-center text-white shadow-sm border border-[var(--olive-dark)]">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="flex-shrink-0 bg-gray-50 p-3 rounded-none border border-gray-200 shadow-sm">
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
