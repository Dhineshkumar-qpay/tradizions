"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  ArrowRight,
  Star,
  ChevronRight,
  Leaf,
  Gift,
  Zap,
  Heart,
  Sparkles,
  Shield,
  Award,
  ChevronLeft,
  Check,
  BadgeCheck,
  Activity,
  Scale,
  Baby,
  ScrollText,
  Search,
  Trash2,
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
import { motion } from "framer-motion";

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

      {/* Trust Strip Section */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50">
        <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {[
              {
                key: "trust_point_1",
                label: "Carefully Sourced",
                color: "amber",
                iconBg: "bg-amber-100",
                iconText: "text-amber-700",
                hoverBg: "group-hover:bg-amber-500",
                line: "bg-amber-400",
                glow: "group-hover:shadow-amber-200",
              },
              {
                key: "trust_point_2",
                label: "Quality Checked",
                color: "blue",
                iconBg: "bg-blue-100",
                iconText: "text-blue-700",
                hoverBg: "group-hover:bg-blue-500",
                line: "bg-blue-400",
                glow: "group-hover:shadow-blue-200",
              },
              {
                key: "trust_point_3",
                label: "Hygienically Packed",
                color: "rose",
                iconBg: "bg-rose-100",
                iconText: "text-rose-700",
                hoverBg: "group-hover:bg-rose-500",
                line: "bg-rose-400",
                glow: "group-hover:shadow-rose-200",
              },
              {
                key: "trust_point_4",
                label: "Delivered to Your Door",
                color: "emerald",
                iconBg: "bg-emerald-100",
                iconText: "text-emerald-700",
                hoverBg: "group-hover:bg-emerald-500",
                line: "bg-emerald-400",
                glow: "group-hover:shadow-emerald-200",
              },
            ].map((item, index) => (
              <div
                key={item.key}
                className={`
            group relative flex items-center justify-center
            overflow-hidden px-4 py-6 sm:px-6 md:py-8
            transition-all duration-300
            hover:-translate-y-0.5 hover:bg-white/80
            ${index < 2 ? "border-b md:border-b-0" : ""}
            ${index % 2 === 0 ? "border-r" : ""}
            ${index < 3 ? "md:border-r md:border-stone-200" : ""}
            border-stone-200
          `}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span
                    className={`
                relative flex h-10 w-10 shrink-0 items-center justify-center
                rounded-2xl border border-white
                ${item.iconBg} ${item.iconText}
                shadow-md transition-all duration-300
                group-hover:scale-110 ${item.hoverBg}
                group-hover:text-white ${item.glow}
                group-hover:shadow-lg
              `}
                  >
                    <Check className="relative h-4 w-4 stroke-[3]" />
                  </span>

                  <div className="min-w-0">
                    <p
                      className="
                  whitespace-nowrap text-[10px] font-bold uppercase
                  tracking-[0.08em] text-[var(--dark-grey)]
                  transition-colors duration-300
                  sm:text-xs md:text-[13px]
                  group-hover:text-[var(--olive-dark)]
                "
                    >
                      {t[item.key] || item.label}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`
                    h-1 w-6 rounded-full ${item.line}
                    transition-all duration-300
                    group-hover:w-10
                  `}
                      />

                      <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-400 sm:text-[9px]">
                        Trusted Standard
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`
              absolute bottom-0 left-1/2 h-1 w-0
              -translate-x-1/2 rounded-full
              ${item.line}
              transition-all duration-300
              group-hover:w-20
            `}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <CategoriesSection t={t} categories={categories} />
      <KuralTrustRow t={t} kuraldata={dailyKural} />
      <FeaturedSection t={t} products={featuredProducts} />
      <GiftingSection
        t={t}
        giftHampers={homeData?.data?.gifthampers}
        poojaHampers={homeData?.data?.poojahampers}
      />
      <WhyChooseUsSection t={t} />
      <HealthGoalsSection t={t} goals={healthGoalsData} />
      <HealthBenefitsSection t={t} />
      {/* ──── Full Size Banner with Shop Button ──── */}
      <section className="group relative isolate w-full min-h-[560px] overflow-hidden bg-[#f5f1e8] md:min-h-[680px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 scale-105 bg-cover bg-[58%_center] bg-no-repeat transition-transform duration-[1600ms] ease-out group-hover:scale-110 md:bg-center"
          style={{
            backgroundImage: "url('home_bg.jpeg')",
          }}
        />

        {/* Overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#102d2a]/95 via-[#102d2a]/65 to-[#102d2a]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_18%_45%,rgba(255,255,255,0.14),transparent_34%)]" />

        {/* Top accent bar */}
        <div className="absolute left-0 top-0 z-20 h-1.5 w-full bg-gradient-to-r from-[var(--orange)] via-[#f0c477] to-transparent" />

        {/* Content */}
        <div className="relative z-30 mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-20 sm:px-10 md:min-h-[680px] md:px-12 lg:px-20">
          <div className="max-w-2xl border-l-2 border-[var(--orange)]/80 pl-6 text-left text-white sm:pl-8 md:pl-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/90 backdrop-blur-md sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange)]" />
              Natural Wellness Collection
            </div>

            <h2 className="max-w-xl text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
              {t.banner_title || "Pure Nutrition, Rooted in Tradition"}
            </h2>

            <p className="mt-6 max-w-lg text-sm font-medium leading-7 text-white/80 sm:text-base md:text-lg">
              {t.banner_subtitle ||
                "Discover premium natural ingredients carefully sourced to support a healthier lifestyle for you and your family."}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="/shop"
                className="group/cta inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--orange)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(217,119,54,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--orange-dark)] hover:shadow-[0_14px_35px_rgba(217,119,54,0.4)] sm:px-8"
              >
                {t.shop_now || "Shop Now"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <NewArrivalsSection t={t} products={newArrivalsProducts} />
      <NutritionPlanner t={t} />
      {/* <SubscriptionPlans t={t} /> */}
      <TestimonialsSection t={t} reviews={userReviews} />
      {/* <CertificationsSection t={t} /> */}
      {/* <VideoTestimonialsSection /> */}
      <SustainabilityAndPackagingSection t={t} />
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

  const categoryMeta: Record<
    string,
    {
      emoji: string;
      active: string;
      inactive: string;
      accent: string;
      softBg: string;
      border: string;
      text: string;
      iconBg: string;
      progress: string;
    }
  > = {
    nuts: {
      emoji: "https://cdn-icons-png.flaticon.com/128/7451/7451659.png",
      active: "bg-amber-400 border-amber-400 text-white shadow-amber-200/80",
      inactive:
        "bg-amber-50/70 border-amber-200 text-amber-700 hover:bg-amber-100",
      accent: "bg-amber-400",
      softBg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
      progress: "bg-amber-400",
    },
    millets: {
      emoji: "https://cdn-icons-png.flaticon.com/128/616/616428.png",
      active:
        "bg-emerald-400 border-emerald-400 text-white shadow-emerald-200/80",
      inactive:
        "bg-emerald-50/70 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
      accent: "bg-emerald-400",
      softBg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      progress: "bg-emerald-400",
    },
    spices: {
      emoji: "https://cdn-icons-png.flaticon.com/128/9273/9273863.png",
      active: "bg-rose-400 border-rose-400 text-white shadow-rose-200/80",
      inactive: "bg-rose-50/70 border-rose-200 text-rose-700 hover:bg-rose-100",
      accent: "bg-rose-400",
      softBg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      iconBg: "bg-rose-100",
      progress: "bg-rose-400",
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

      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-stone-100 bg-gradient-to-br from-white via-orange-50/30 to-emerald-50/40 py-24">
      {/* Soft decorative background */}
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-100/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {t.health_advantage || "HEALTH BENEFITS"}
          </div>

          <h2 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            {t.health_advantage_headline_1}{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.health_advantage_headline_2} {t.health_advantage_headline_3}
            </span>
          </h2>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const catMeta = categoryMeta[cat];
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    rounded-full border px-7 py-3.5
                    text-[11px] font-bold uppercase tracking-[0.18em]
                    transition-all duration-300
                    ${isActive
                      ? `${catMeta.active} shadow-lg`
                      : `${catMeta.inactive} shadow-sm`
                    }
                  `}
                >
                  {t.sections?.[cat] || cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slider */}
        <div className="group relative mx-auto max-w-6xl">
          <button
            onClick={() => slide("left")}
            aria-label="Previous benefits"
            className={`
              absolute -left-6 top-1/2 z-20 hidden h-12 w-12
              -translate-y-1/2 items-center justify-center
              rounded-full border border-amber-100 bg-white
              text-amber-600 shadow-lg
              transition-all duration-300
              hover:scale-110 hover:bg-amber-400 hover:text-white
              group-hover:opacity-100 sm:flex
              opacity-0
            `}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => slide("right")}
            aria-label="Next benefits"
            className={`
              absolute -right-6 top-1/2 z-20 hidden h-12 w-12
              -translate-y-1/2 items-center justify-center
              rounded-full border border-emerald-100 bg-white
              text-emerald-600 shadow-lg
              transition-all duration-300
              hover:scale-110 hover:bg-emerald-400 hover:text-white
              group-hover:opacity-100 sm:flex
              opacity-0
            `}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-10 pt-4"
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {activeBenefits.map((benefit: any, idx: number) => {
              const cardColors = [
                {
                  bg: "bg-gradient-to-br from-amber-50/90 to-white/40",
                  border: "border-amber-200/50",
                  iconBg: "bg-amber-100/80",
                  iconText: "text-amber-600",
                  accent: "bg-amber-400",
                },
                {
                  bg: "bg-gradient-to-br from-sky-50/90 to-white/40",
                  border: "border-sky-200/50",
                  iconBg: "bg-sky-100/80",
                  iconText: "text-sky-600",
                  accent: "bg-sky-400",
                },
                {
                  bg: "bg-gradient-to-br from-rose-50/90 to-white/40",
                  border: "border-rose-200/50",
                  iconBg: "bg-rose-100/80",
                  iconText: "text-rose-600",
                  accent: "bg-rose-400",
                },
                {
                  bg: "bg-gradient-to-br from-emerald-50/90 to-white/40",
                  border: "border-emerald-200/50",
                  iconBg: "bg-emerald-100/80",
                  iconText: "text-emerald-600",
                  accent: "bg-emerald-400",
                },
              ][idx % 4];

              return (
                <div
                  key={benefit.name + idx}
                  className={`
                    group/card relative flex w-[280px] shrink-0
                    snap-start flex-col overflow-hidden rounded-[32px]
                    border p-8 backdrop-blur-xl
                    ${cardColors.bg} ${cardColors.border}
                    shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all duration-500
                    hover:-translate-y-2 hover:bg-white
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-white
                    md:w-[340px] z-10
                  `}
                >
                  {/* Premium subtle inner glow */}
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

                  {/* Card decorative circle */}
                  <div
                    className={`
                      pointer-events-none absolute -right-12 -top-12
                      h-32 w-32 rounded-full blur-2xl
                      ${cardColors.accent} opacity-20
                      transition-transform duration-700
                      group-hover/card:scale-150 group-hover/card:opacity-30
                    `}
                  />

                  <div
                    className={`
                      relative mb-8 flex h-16 w-16 items-center justify-center
                      rounded-2xl border border-white/60 backdrop-blur-sm
                      ${cardColors.iconBg} ${cardColors.iconText}
                      shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-500
                      group-hover/card:scale-110 group-hover/card:-translate-y-1
                      group-hover/card:shadow-[0_10px_25px_rgba(0,0,0,0.1)]
                    `}
                  >
                    <img
                      src={meta.emoji}
                      alt={`${activeCategory} icon`}
                      className="h-8 w-8 object-contain transition-all duration-500 group-hover/card:rotate-12 group-hover/card:scale-110"
                    />
                  </div>

                  <h3 className="relative mb-4 text-[22px] font-extrabold tracking-tight text-[var(--foreground)] transition-colors duration-300 group-hover/card:text-[var(--olive-dark)]">
                    {benefit.name}
                  </h3>

                  <p className="relative mb-8 flex-grow text-[15px] font-medium leading-relaxed text-[var(--dark-grey)]">
                    {benefit.desc}
                  </p>

                  <div className="relative mt-auto flex items-center gap-2 transition-all duration-300 group-hover/card:gap-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.2em] ${meta.text}`}
                    >
                      Learn More
                    </span>

                    <ArrowRight
                      className={`h-4 w-4 ${meta.text} transition-all duration-300 group-hover/card:translate-x-1`}
                    />
                  </div>

                  {/* Bottom animated border */}
                  <span
                    className={`
                      absolute bottom-0 left-0 h-1.5 w-0 rounded-r-full
                      ${cardColors.accent} opacity-80
                      transition-all duration-500 ease-out
                      group-hover/card:w-full
                    `}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mx-auto mt-2 flex w-full max-w-md items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-amber-300" />

          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${meta.progress} transition-all duration-300 ease-out`}
              style={{ width: `${Math.max(10, scrollProgress)}%` }}
            />
          </div>

          <span className="h-2 w-2 rounded-full bg-emerald-300" />
        </div>
      </div>
    </section>
  );
}

// -----------------------------------  HERO SECTION

function HeroSection({ t }: { t: any }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative isolate mt-0 min-h-[760px] w-full overflow-hidden border-b border-stone-200 bg-[#FAF8F5] selection:bg-[var(--olive)] selection:text-white sm:min-h-[820px] md:-mt-12 md:h-[95vh] md:min-h-[750px]">
      {/* Background image */}
      <Image
        src="/bg_banner.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover object-[68%_center] transition-all duration-1000 ease-out md:object-contain md:object-center ${loaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
      />

      {/* Soft overlays for better text contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/95 via-[#FAF8F5]/75 to-transparent md:from-[#FAF8F5]/90 md:via-[#FAF8F5]/45 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/80 via-transparent to-transparent md:hidden" />

      {/* Background accents */}
      <div className="pointer-events-none absolute -right-32 -top-20 h-[420px] w-[420px] rounded-full bg-[var(--olive)]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[500px] w-[500px] rounded-full bg-[var(--orange)]/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[8%] top-[18%] hidden h-3 w-3 animate-pulse rounded-full bg-[var(--orange)]/70 md:block" />
      <div className="pointer-events-none absolute right-[18%] top-[30%] hidden h-2 w-2 animate-pulse rounded-full bg-[var(--olive)]/60 [animation-delay:700ms] md:block" />

      {/* Content area */}
      <div className="relative z-20 mx-auto grid min-h-[760px] w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 mt-20 sm:min-h-[820px] md:min-h-0 md:grid-cols-2 md:px-12 md:py-0 lg:gap-20">
        {/* Left: Text content */}
        <div className="flex h-full max-w-2xl flex-col justify-center text-left md:translate-y-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-4"
          >
            <span className="h-[2px] w-8 bg-[var(--orange)] sm:w-12" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--olive-dark)] sm:text-[11px] sm:tracking-[0.3em]">
              {t.hero_subheadline_new ||
                "Wholesome Millets. Premium Nuts. Thoughtful Gifts."}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="max-w-xl text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--foreground)] sm:text-3xl md:text-4xl lg:text-4xl"
          >
            {t.hero_headline_new || "Traditional Goodness, Made for Today"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-6 max-w-lg text-sm font-medium leading-7 text-[var(--dark-grey)] sm:text-base md:text-lg"
          >
            {t.hero_supporting_text_new ||
              "Carefully selected everyday essentials for your family, and beautifully curated gifts for every occasion."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <Link
              href="/shop"
              className="group inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--olive)] px-7 py-4 font-bold text-white shadow-lg shadow-[var(--olive)]/15 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--olive-dark)] hover:shadow-xl hover:shadow-[var(--olive)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--olive)] focus-visible:ring-offset-2 sm:px-8"
            >
              <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] sm:text-[12px]">
                {t.hero_btn_shop_home_new || "SHOP FOR HOME"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/gifts"
              className="group inline-flex min-h-14 items-center justify-center rounded-full border-2 border-[var(--olive)]/25 bg-white/30 px-7 py-4 font-bold text-[var(--olive-dark)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--olive)] hover:bg-[var(--olive)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--olive)] focus-visible:ring-offset-2 sm:px-8"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] sm:text-[12px]">
                {t.hero_btn_explore_gifts_new || "EXPLORE GIFTS"}
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--olive-dark)]/60 md:flex"
      >
        <span>Scroll to explore</span>
        <span className="h-8 w-px bg-[var(--olive)]/40" />
      </motion.div>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Collections
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            {t.categories_title?.split(" ").slice(0, 2).join(" ") ||
              "Our Collections"}{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.categories_title?.split(" ").slice(2).join(" ") || ""}
            </span>
          </h2>
          <p className="text-sm font-medium text-[var(--dark-grey)] max-w-lg mx-auto">
            {t.categories_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {displayCategories.map((cat, idx) => {
            const imageUrl = getCategoryImageUrl(cat.categoryimage);

            return (
              <Link
                href={`/shop?category=${encodeURIComponent(cat.categoryname || "")}`}
                key={idx}
                className="group flex flex-col bg-white border border-stone-100 hover:border-[var(--olive)] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] overflow-hidden p-3"
                style={{
                  transitionDelay: isVisible ? `${idx * 100}ms` : "0ms",
                }}
              >
                <div className="relative w-full aspect-[4/3.5] overflow-hidden rounded-[16px] bg-[#FAF8F5]">
                  <img
                    src={imageUrl}
                    alt={cat.categoryname || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Decorative Item Count Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] text-[var(--olive-dark)] uppercase shadow-sm">
                    {cat.products || 0} Items
                  </div>

                  {/* Subtle Image Overlay */}
                  <div className="absolute inset-0 bg-[var(--olive)]/0 group-hover:bg-[var(--olive)]/10 transition-colors duration-500 z-10 pointer-events-none" />
                </div>

                <div className="pt-5 pb-3 px-3 flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--olive-dark)] transition-colors duration-300">
                    {cat.categoryname || ""}
                  </h3>

                  <div className="mt-4 flex items-center justify-between w-full px-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore
                    </span>
                    <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-[var(--orange)] group-hover:bg-[var(--orange)] group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Highlights
            </div>
            <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px]">
              {t.featured_products.split(" ")[0]}{" "}
              <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {t.featured_products.split(" ")[1]}
              </span>
            </h2>
            <p className="text-sm font-medium text-[var(--dark-grey)] max-w-md">
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
            <p className="text-[var(--dark-grey)] font-medium text-sm">
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
                    <ArrowRight className="w-6 h-6 text-[var(--dark-grey)] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--olive)] transition-colors">
                    {t.explore_all || "View All"}
                  </h3>
                  <p className="text-xs text-[var(--dark-grey)] mt-2 font-medium">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Curated Presents
                </div>
                <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px]">
                  {t.gift.split(" ")[0]}{" "}
                  <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
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
                <p className="text-[var(--dark-grey)] font-medium text-sm">
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
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[var(--dark-grey)] group-hover:text-[var(--orange)] transition-colors shadow-sm">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="space-y-3 px-2 pb-2">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-lg font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                              {name}
                            </h4>
                          </div>
                          <p className="text-xs text-[var(--dark-grey)] leading-relaxed font-medium line-clamp-2">
                            {desc}
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-lg font-black text-[var(--foreground)]">
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
                        <ArrowRight className="w-6 h-6 text-[var(--dark-grey)] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--olive)] transition-colors">
                        {t.view_all || "View All"}
                      </h3>
                      <p className="text-xs text-[var(--dark-grey)] mt-2 font-medium">
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

  const featureStyles = [
    {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      hoverBg: "group-hover:bg-amber-500",
      border: "border-amber-200",
      glow: "group-hover:shadow-amber-200/70",
      accent: "bg-amber-400",
    },
    {
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      hoverBg: "group-hover:bg-sky-500",
      border: "border-sky-200",
      glow: "group-hover:shadow-sky-200/70",
      accent: "bg-sky-400",
    },
    {
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      hoverBg: "group-hover:bg-rose-500",
      border: "border-rose-200",
      glow: "group-hover:shadow-rose-200/70",
      accent: "bg-rose-400",
    },
    {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      hoverBg: "group-hover:bg-emerald-500",
      border: "border-emerald-200",
      glow: "group-hover:shadow-emerald-200/70",
      accent: "bg-emerald-400",
    },
  ];

  return (
    <section
      ref={ref}
      className="
        relative overflow-hidden bg-gradient-to-br
        from-amber-50 via-white to-emerald-50
        py-20 md:py-24
      "
    >
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-rose-100/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-24">
          {/* Left Side: Colorful Image Card */}
          <div
            className={`
              w-full max-w-sm lg:w-5/12
              transition-all duration-700
              ${isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
              }
            `}
          >
            <div className="relative mx-auto">
              {/* Colorful frame */}
              <div className="absolute -inset-3 rotate-2 rounded-[2rem] bg-gradient-to-br from-amber-300 via-rose-300 to-emerald-300 opacity-70 blur-[1px]" />
              <div className="absolute -inset-1 -rotate-1 rounded-[1.6rem] bg-white shadow-xl" />

              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl">
                <img
                  src="why_us.jpeg"
                  alt="Quality organic products"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-amber-900/10" />

                {/* Decorative corner label */}
                <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--olive-dark)] shadow-lg backdrop-blur-sm">
                  Naturally Better
                </div>

                {/* Floating stat card */}
                <div className="absolute bottom-5 left-1/2 flex w-[88%] -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--olive-dark)] to-emerald-600 text-white shadow-lg">
                    <BadgeCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <h4 className="mb-1 text-[15px] font-bold leading-none text-[var(--foreground)]">
                      Taste. Health. Tradition.
                    </h4>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Content and Features */}
          <div
            className={`
              w-full lg:w-7/12
              transition-all delay-200 duration-700
              ${isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
              }
            `}
          >
            <div className="mb-12 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Why choose us
              </div>

              <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px]">
                {t.why_choose.split(" ").slice(0, 1).join(" ")}
                <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  {" "}
                  {t.why_choose.split(" ").slice(1).join(" ")}
                </span>
              </h2>

              <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-[var(--dark-grey)] md:text-[15px] lg:mx-0">
                {t.why_desc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {whyChooseUs.map((item, idx) => {
                const style = featureStyles[idx % featureStyles.length];

                return (
                  <div
                    key={idx}
                    className={`
                      group relative overflow-hidden rounded-2xl
                      border bg-white/80 p-5
                      ${style.border}
                      shadow-sm backdrop-blur-sm
                      transition-all duration-300
                      hover:-translate-y-1 hover:bg-white
                      hover:shadow-xl ${style.glow}
                    `}
                  >
                    <div
                      className={`
                        absolute right-0 top-0 h-20 w-20
                        -translate-y-8 translate-x-8 rounded-full
                        ${style.accent} opacity-10
                        transition-transform duration-500
                        group-hover:scale-150
                      `}
                    />

                    <div className="relative flex items-start gap-4">
                      <div
                        className={`
                          flex h-14 w-14 shrink-0 items-center justify-center
                          rounded-2xl border
                          ${style.iconBg} ${style.iconColor} ${style.border}
                          transition-all duration-300
                          ${style.hoverBg}
                          group-hover:scale-105 group-hover:text-white
                        `}
                      >
                        <item.icon className="h-6 w-6" />
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-[16px] font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--olive-dark)]">
                          {t.features[idx * 2]}
                        </h4>

                        <p className="text-[13px] font-medium leading-snug text-[var(--dark-grey)]">
                          {t.features[idx * 2 + 1]}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`
                        absolute bottom-0 left-5 h-1 w-8 rounded-full
                        ${style.accent}
                        transition-all duration-300
                        group-hover:w-16
                      `}
                    />
                  </div>
                );
              })}
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
    <section
      ref={ref}
      className="py-16 bg-[var(--site-bg)] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`max-w-2xl mx-auto text-center space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Testimonials
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            {t.loved.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.loved.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-[var(--dark-grey)] text-sm max-w-lg mx-auto font-medium">
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
                      <p className="text-[var(--dark-grey)] text-sm font-medium leading-relaxed  line-clamp-5">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100 relative z-10">
                      <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-xs font-bold text-[var(--olive-dark)] border border-gray-200">
                        {item.avatar}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">
                          {item.name}
                        </h4>
                        <p className="text-[9px] font-bold text-[var(--dark-grey)] tracking-[0.2em] uppercase mt-0.5">
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
                    <p className="text-[var(--dark-grey)] text-sm font-medium leading-relaxed  line-clamp-5">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100 relative z-10">
                    <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-xs font-bold text-[var(--olive-dark)] border border-gray-200">
                      {item.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">
                        {item.name}
                      </h4>
                      <p className="text-[9px] font-bold text-[var(--dark-grey)] tracking-[0.2em] uppercase mt-0.5">
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

          <p className="text-[10px] font-bold text-[var(--dark-grey)] tracking-[0.2em] uppercase">
            {t.trusted}
          </p>
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
  if (!kuraldata || !kuraldata.kural) return null;

  const formatKural = (kuralText: string | undefined | null) => {
    if (!kuralText) return "";

    // Ignore any existing breaks and force a strict 4-word and 3-word split
    const cleanText = kuralText
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const words = cleanText.split(" ");

    return (
      <>
        <p className="whitespace-nowrap leading-relaxed">
          {words.slice(0, 4).join(" ")}
        </p>
        <p className="whitespace-nowrap leading-relaxed">
          {words.slice(4, 7).join(" ")}
        </p>
      </>
    );
  };

  return (
    <section className="relative w-full bg-[#344b2b] overflow-hidden py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-4 items-center">
        {/* Left Image */}
        <div className="hidden lg:flex justify-center lg:justify-end">
          <div className="relative w-[220px] aspect-[4/4.5] lg:aspect-[4/5] max-w-[220px]">
            <div className="absolute inset-0 -translate-x-3 translate-y-3 border-[1.5px] border-[#59784b] rounded-t-[200px] rounded-b-[20px] pointer-events-none" />
            <div className="relative w-full h-full rounded-t-[200px] rounded-b-[20px] overflow-hidden z-10">
              <img
                src="https://images.unsplash.com/photo-1710149468014-3d0eb40caaeb?q=80&w=700&auto=format&fit=crop"
                alt="Hands holding grains"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Center Text */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-[5px] h-[5px] rounded-full bg-[#e09133]" />
            <span className="w-[5px] h-[5px] rounded-full bg-[#e09133]" />
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-[#e09133] ml-2">
              {t.kural_title || "THE VERSE WE LIVE BY"}
            </span>
          </div>

          <div className="text-sm sm:text-base md:text-[12px] lg:text-[13px] font-bold text-white leading-[1.8] mb-8 space-y-2">
            {formatKural(kuraldata.kural)}
          </div>

          {kuraldata.meaning && (
            <div className="text-[12px] md:text-[12px] text-[#a9bca1] leading-[1.8] mb-10 max-w-lg font-medium">
              {kuraldata.meaning}
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="w-8 h-[2px] bg-[#e09133]" />
            <span className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-[#e09133]">
              THIRUKKURAL • KURAL {kuraldata.kuralid || ""}
            </span>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex justify-center lg:justify-start">
          <div className="relative w-[220px] aspect-[4/4.5] lg:aspect-[4/5] max-w-[220px]">
            <div className="absolute inset-0 -translate-x-3 translate-y-3 border-[1.5px] border-[#59784b] rounded-t-[200px] rounded-b-[20px] pointer-events-none" />
            <div className="relative w-full h-full rounded-t-[200px] rounded-b-[20px] overflow-hidden z-10">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop"
                alt="Hand touching wheat field"
                className="w-full h-full object-cover"
              />
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
  const defaultIcons = [Activity, Scale, Baby];

  return (
    <section
      ref={ref}
      className="py-24 bg-white relative border-t border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Minimalist Professional Header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Targeted Nutrition
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.health_goals_title || "Shop by Health Goals"}
            </span>
          </h2>
          <p className="text-[14px] text-stone-500 max-w-xl leading-relaxed mt-2">
            {t.health_goals_desc ||
              "Discover precisely formulated nutrition tailored for your specific wellness objectives."}
          </p>
        </div>

        {displayGoals.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center bg-stone-50 border border-stone-200">
            <p className="text-stone-500 font-medium text-sm">
              No health goals found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {displayGoals.map((goal, idx) => {
              const Icon = defaultIcons[idx % defaultIcons.length];
              const image = getImageUrl(goal.goalimage);

              return (
                <Link
                  href={`/health-goal-products?goalid=${goal.goalid}`}
                  key={goal.goalid || idx}
                  className="group relative flex min-h-[360px] overflow-hidden rounded-[24px] border border-stone-200 bg-stone-900 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[var(--olive)] hover:shadow-[0_20px_45px_rgba(18,48,45,0.18)]"
                >
                  <div className="absolute inset-0 overflow-hidden bg-stone-100">
                    <img
                      src={image}
                      alt={goal.goalname || ""}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--olive-dark)] via-[var(--olive-dark)]/45 to-black/5" />
                  </div>

                  <span className="absolute right-5 top-5 flex h-8 min-w-8 items-center justify-center rounded-full border border-white/40 bg-black/15 px-2 text-[10px] font-bold tracking-[0.18em] text-white backdrop-blur-md">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10 mt-auto p-6 text-white md:p-7">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white backdrop-blur-md transition-all duration-500 group-hover:border-[var(--orange)] group-hover:bg-[var(--orange)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold tracking-tight text-white md:text-2xl">
                      {goal.goalname}
                    </h3>
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-white/75">
                      {goal.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
                      Explore Range
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
            categoryid: 3,
            bid: 2,
          }).catch(() => ({ data: { data: [] } })),
          API.post(API_ROUTES.CALCULATORPRODUCTS, {
            categoryid: 4,
            bid: 2,
          }).catch(() => ({ data: { data: [] } })),
          API.post(API_ROUTES.CALCULATORPRODUCTS, {
            categoryid: 6,
            bid: 2,
          }).catch(() => ({ data: { data: [] } })),
        ]);

        const nuts = (resNuts.data?.data || [])
          .filter((p: any) => Number(p.weight) === 1)
          .map((p: any) => ({
            ...p,
            categoryid: 1,
          }));
        const millets = (resMillets.data?.data || [])
          .filter((p: any) => Number(p.weight) === 1)
          .map((p: any) => ({
            ...p,
            categoryid: 2,
          }));
        const spices = (resSpices.data?.data || [])
          .filter((p: any) => Number(p.weight) === 1)
          .map((p: any) => ({
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
      className="relative overflow-hidden border-t border-stone-200 bg-gradient-to-br from-[#FAF8F5] via-white to-emerald-50/40 px-0 pb-16 pt-12 md:pt-16"
    >
      {/* Subtle Corporate Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#204E4A_1px,transparent_1px),linear-gradient(to_bottom,#204E4A_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.035]" />
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-20 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        {/* Main Calculator Header & Description */}
        <div className="mb-12 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {t.budget_planning || "Budget & Planning"}
          </div>

          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            {t.monthly_product || "Monthly Product"}{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.calculator || "Calculator"}
            </span>
          </h2>

          <div className="group relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[var(--olive)]/15 bg-white/90 p-7 text-left shadow-[0_20px_55px_rgba(18,48,45,0.08)] backdrop-blur-sm md:p-10">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[var(--olive)]/5 blur-[80px] transition-colors duration-700 group-hover:bg-[var(--olive)]/10" />
            <div className="relative z-10 mb-8 flex items-center gap-3 border-b border-stone-100 pb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--olive-dark)] text-white shadow-md">
                <Leaf className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-[var(--foreground)] md:text-2xl">
                  {t.strategic_nutrition || "Strategic Nutrition Planning"}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--orange)]">
                  {t.estimate_requirements ||
                    "Estimate Requirements & Costs Instantly"}
                </p>
              </div>
            </div>

            <div className="relative z-10 mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                t.calc_req_1 ||
                "Calculate precise quantities based on headcount",
                t.calc_req_2 || "Estimate daily & monthly consumption in grams",
                t.calc_req_3 ||
                "Forecast budget based on selected premium products",
                t.calc_req_4 || "Maintain a balanced inventory effortlessly",
              ].map((item, i) => (
                <div
                  key={i}
                  className="group/item flex items-start gap-3 rounded-2xl border border-stone-100 bg-[#FAF8F5] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--olive)]/30 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-stone-100 bg-white shadow-sm transition-colors group-hover/item:bg-emerald-50">
                    <Check
                      className="w-4 h-4 text-[var(--olive-dark)]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="pt-1 text-[12px] font-medium leading-relaxed text-[var(--dark-grey)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 rounded-2xl border border-[var(--olive)]/10 bg-[var(--olive)]/5 p-5 text-center">
              <p className="text-[13px] font-bold leading-relaxed text-[var(--olive-dark)]">
                {t.choose_required_products ||
                  "Choose your required products, input the number of members, and generate an instant procurement estimate."}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Products */}
        <div className="relative overflow-hidden rounded-[28px] border border-stone-200 bg-white/95 p-6 shadow-[0_20px_55px_rgba(18,48,45,0.07)] backdrop-blur-sm md:p-10">
          <div className="relative z-10 mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--orange)] text-sm font-black text-white shadow-lg shadow-orange-200/50">
                  01
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight">
                  {t.select_products || "Select Products"}
                </h2>
              </div>
              <p className="text-[var(--dark-grey)] font-medium ml-16 text-sm">
                {t.curate_selection ||
                  "Curate the selection for your monthly estimate."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[var(--dark-grey)] absolute left-5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.search_inventory || "Search inventory..."}
                  className="w-full pl-12 pr-5 py-3.5 rounded-full border border-stone-200 text-sm focus:outline-none focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 font-medium text-[var(--foreground)] transition-all bg-[#FAF8F5] focus:bg-white placeholder-stone-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={scrollToCalculator}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 whitespace-nowrap bg-[var(--olive-dark)] text-white px-8 py-3.5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[var(--orange)] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {t.view_estimate || "View Estimate"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row">
            {/* Sidebar Categories */}
            <div className="flex w-full flex-col gap-2 lg:w-64">
              {[
                {
                  id: 0,
                  icon: LayoutGrid,
                  label: t.all_catalog || "All Catalog",
                  count: allProducts.length,
                },
                {
                  id: 1,
                  icon: Circle,
                  label: t.nuts || "Nuts",
                  count: nutsProducts.length,
                },
                {
                  id: 2,
                  icon: Wheat,
                  label: t.millets || "Millets",
                  count: milletsProducts.length,
                },
                {
                  id: 3,
                  icon: Flame,
                  label: t.spices || "Spices",
                  count: spicesProducts.length,
                },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all duration-300 ${selectedCategory === cat.id
                      ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white shadow-md -translate-y-0.5"
                      : "bg-[#FAF8F5] border-stone-100 hover:border-[var(--olive)]/50 hover:bg-white text-[var(--dark-grey)]"
                    }`}
                >
                  <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-widest">
                    <cat.icon
                      className={`w-4 h-4 ${selectedCategory === cat.id ? "text-[var(--orange)]" : "text-[var(--olive-dark)]"}`}
                    />
                    {cat.label}
                  </div>
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-white text-[var(--dark-grey)] border border-stone-200"}`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="flex-1 rounded-[24px] border border-stone-100 bg-[#FAF8F5]/70 p-5 md:p-7">
              <div className="mb-7 flex items-center justify-between">
                <h3 className="font-bold text-[var(--foreground)] uppercase tracking-widest text-[11px]">
                  {selectedCategory === 0
                    ? t.complete_catalog || "Complete Catalog"
                    : selectedCategory === 1
                      ? t.nuts_category || "Nuts Category"
                      : selectedCategory === 2
                        ? t.millets_category || "Millets Category"
                        : t.spices_category || "Spices Category"}
                  <span className="text-[var(--orange)] ml-2 bg-white px-2 py-1 rounded-full shadow-sm">
                    {displayedProducts.length} items
                  </span>
                </h3>
              </div>

              {displayedProducts.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center bg-white border border-dashed border-stone-200 rounded-[20px]">
                  <Leaf className="w-10 h-10 text-stone-300 mb-4" />
                  <p className="text-[var(--dark-grey)] font-medium text-sm">
                    {t.no_products_inventory ||
                      "No products found in inventory."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                  {displayedProducts.map((product) => {
                    const isSelected = !!selectedProducts.find(
                      (p) => p.productid === product.productid,
                    );
                    const price = product.sellingprice || product.price || 0;
                    return (
                      <div
                        key={product.productid}
                        onClick={() => handleToggleProduct(product)}
                        className={`group relative rounded-[20px] border bg-white p-4 cursor-pointer transition-all duration-300 ${isSelected
                            ? "border-[var(--olive-dark)] shadow-[0_8px_25px_rgba(0,0,0,0.08)] ring-1 ring-[var(--olive-dark)] -translate-y-1"
                            : "border-stone-100 hover:border-[var(--orange)] hover:shadow-lg hover:-translate-y-1"
                          }`}
                      >
                        <div
                          className={`absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 ${isSelected
                              ? "bg-[var(--olive-dark)] border-[var(--olive-dark)] text-white"
                              : "bg-white border-stone-200 group-hover:border-[var(--orange)]"
                            }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"} transition-all duration-300`}
                            strokeWidth={3}
                          />
                        </div>

                        <div className="relative mb-4 mt-4 flex h-[92px] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[#FAF8F5] transition-colors group-hover:bg-[var(--orange)]/5">
                          <img
                            src={`${IMAGE_URL ?? ""}${product.productimage ?? ""}`}
                            alt={product.productname ?? "product image"}
                            className="object-contain mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-700 w-full h-full absolute inset-0 p-3"
                          />
                        </div>

                        <div className="text-center space-y-3">
                          <p className="h-8 line-clamp-2 text-[10px] font-bold uppercase leading-snug tracking-wider text-[var(--foreground)] transition-colors group-hover:text-[var(--olive-dark)]">
                            {product.productname}
                          </p>
                          <div className="inline-block px-3 py-1.5 bg-white border border-stone-100 rounded-full shadow-sm">
                            <span className="text-[11px] font-black text-[var(--olive-dark)]">
                              ₹{price}
                            </span>
                            <span className="text-[9px] font-bold text-[var(--dark-grey)] ml-1 uppercase">
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
              <div className="mt-8 bg-[var(--olive-dark)] text-white rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3 font-bold text-[11px] tracking-widest uppercase">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[var(--orange)]" />
                  </div>
                  <span>
                    {selectedProducts.length}{" "}
                    {t.items_selected || "Items Selected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="flex justify-center my-6 relative z-10">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-[var(--olive-dark)] animate-bounce" />
          </div>
        </div>

        {/* Step 2: Calculator */}
        <div
          id="calculator-section"
          className="bg-white rounded-[32px] border border-stone-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orange)]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[var(--olive-dark)] border border-stone-100 flex items-center justify-center font-black text-sm shadow-sm">
                  02
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight">
                  {t.estimate_generation || "Estimate Generation"}
                </h2>
              </div>
              <p className="text-[var(--dark-grey)] font-medium ml-16 text-sm">
                {t.adjust_parameters ||
                  "Adjust parameters to forecast your monthly procurement budget."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-100 rounded-[24px] bg-white relative z-10 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#FAF8F5] text-[10px] font-black text-[var(--olive-dark)] uppercase tracking-[0.15em] border-b border-stone-100">
                  <th className="px-6 py-5 rounded-tl-[24px]">
                    {t.product_name || "Product Name"}
                  </th>
                  <th className="px-4 py-5 text-center">
                    {t.grams_per_day || "Grams / Day"}
                  </th>
                  <th className="px-4 py-5 text-center">{t.days || "Days"}</th>
                  <th className="px-4 py-5 text-center">
                    {t.headcount || "Headcount"}
                  </th>
                  <th className="px-4 py-5 text-center">
                    {t.total_kg || "Total (KG)"}
                  </th>
                  <th className="px-4 py-5 text-center">
                    {t.unit_price || "Unit Price"}
                  </th>
                  <th className="px-6 py-5 text-right">
                    {t.subtotal || "Subtotal"}
                  </th>
                  <th className="px-6 py-5 text-center rounded-tr-[24px]">
                    {t.action || "Action"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {selectedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-20 text-center text-[var(--dark-grey)] font-bold uppercase tracking-widest text-xs bg-white"
                    >
                      {t.inventory_empty ||
                        "Inventory empty. Select items to generate estimate."}
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
                        className="hover:bg-stone-50/50 transition-colors bg-white"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-stone-100 flex-shrink-0 p-2 shadow-sm">
                              <img
                                src={`${IMAGE_URL ?? ""}${product.productimage ?? ""}`}
                                alt={product.productname || ""}
                                className="object-contain w-full h-full mix-blend-multiply"
                              />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                              {product.productname}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <input
                            type="number"
                            className="w-20 px-3 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm font-black text-[var(--foreground)] text-center focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 outline-none transition-all shadow-inner"
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
                        <td className="px-4 py-5 text-center">
                          <input
                            type="number"
                            className="w-20 px-3 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm font-black text-[var(--foreground)] text-center focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 outline-none transition-all shadow-inner"
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
                        <td className="px-4 py-5 text-center">
                          <input
                            type="number"
                            className="w-20 px-3 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm font-black text-[var(--foreground)] text-center focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 outline-none transition-all shadow-inner"
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
                        <td className="px-4 py-5 text-center font-black text-[var(--olive-dark)] text-sm">
                          {qty}{" "}
                          <span className="text-[10px] uppercase font-bold text-[var(--dark-grey)]">
                            Kg
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center font-bold text-[var(--dark-grey)] text-xs">
                          <span className="bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-stone-100">
                            ₹{displayPrice}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-[var(--foreground)] text-[15px]">
                          ₹{price}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleRemoveItem(product.productid!)}
                            className="w-9 h-9 mx-auto rounded-full bg-white border border-stone-200 text-stone-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
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

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 relative border-t border-stone-100 z-10">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 rounded-full border border-stone-200 text-[var(--dark-grey)] font-bold text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all bg-white shadow-sm"
            >
              {t.clear_estimate || "Clear Estimate"}{" "}
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 w-full md:w-auto">
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black text-[var(--orange)] tracking-[0.2em] uppercase mb-1">
                  {t.estimated_total || "Estimated Total"}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-[var(--olive-dark)] tracking-tight">
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
                            bid: p.bid || 2,
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
                className={`flex items-center justify-center gap-3 px-8 sm:px-12 py-4 rounded-full font-bold text-[11px] tracking-[0.2em] uppercase transition-all shadow-[0_8px_25px_rgba(0,0,0,0.12)] ${selectedProducts.length > 0
                    ? "bg-[var(--olive-dark)] text-white hover:bg-[var(--orange)] hover:-translate-y-1"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                  } w-full sm:w-auto min-w-[220px]`}
              >
                {isBuying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t.proceed_to_cart || "Proceed to Cart"}{" "}
                    <ArrowRight className="w-4 h-4" />
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
      accent: "text-[var(--foreground)]",
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
    <section
      ref={ref}
      className="py-16 bg-[var(--site-bg)] relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Membership
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            {t.subscription.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.subscription.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-[var(--dark-grey)] text-sm max-w-md mx-auto font-medium">
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
                    <span className="text-[12px] font-bold text-[var(--dark-grey)]">
                      ₹
                    </span>
                    <span className="text-4xl font-black text-[var(--foreground)] tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--dark-grey)] uppercase tracking-widest ml-1">
                      / mo
                    </span>
                  </div>
                  <p className="text-xs text-[var(--dark-grey)] font-medium leading-relaxed line-clamp-2 h-10">
                    {plan.desc}
                  </p>
                </div>
                <div className="flex-1 space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-3 text-[11px] font-bold text-[var(--dark-grey)]"
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
                  <button className="w-full py-4 bg-[var(--olive-dark)] text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-[var(--orange-dark)] transition-colors cursor-pointer">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Latest Additions
            </div>
            <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px]">
              {t.new_arrivals.split(" ")[0]}{" "}
              <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {t.new_arrivals.split(" ")[1]}
              </span>
            </h2>
            <p className="text-[var(--dark-grey)] text-sm max-w-md font-medium">
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
            <p className="text-[var(--dark-grey)] font-medium text-sm">
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
                    <ArrowRight className="w-6 h-6 text-[var(--dark-grey)] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--olive)] transition-colors">
                    View all
                  </h3>
                  <p className="text-xs text-[var(--dark-grey)] mt-2 font-medium">
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

function CertificationsSection({ t }: { t: any }) {
  const certs = [
    {
      id: "fssai",
      title: "FSSAI CERTIFIED",
      desc: "Lic No. 22426189000450",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/FSSAI_logo.png/250px-FSSAI_logo.png"
          alt="Fssai"
          className="object-contain w-full h-full"
        />
      ),
    },
    {
      id: "udyam",
      title: "UDYAM REGISTERED",
      desc: "UDYAM-TN-20-0244563",
      icon: (
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvgDZjcJqhXh0OupnW63EpQExEgKU9WtkSRHfi6dSmNg&s=10"
          alt="UDYAM"
          className="object-contain w-full h-full mix-blend-multiply"
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
          className="object-contain w-full h-full mix-blend-multiply"
        />
      ),
    },
    {
      id: "temple",
      title: "TEMPLE PURITY",
      desc: "Sacred Preparation",
      icon: (
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXeNOEa13cQBn9f-8AGTanzzu5f4LhWC2eUQ&s"
          alt="TEMPLE"
          className="object-contain w-full h-full mix-blend-multiply"
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
          className="object-contain w-full h-full mix-blend-multiply"
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
          className="object-contain w-full h-full opacity-80"
        />
      ),
      clickable: true,
    },
  ];

  return (
    <section className="py-24 bg-[#FAF8F5] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--olive)]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {t.accreditations || "Accreditations"}
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            {t.trusted || "Trusted"}{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.certifications || "Certifications"}
            </span>
          </h2>
          <p className="text-sm text-[var(--dark-grey)] font-medium max-w-xl mx-auto leading-relaxed">
            {t.certifications_desc ||
              "Every grain and product is backed by absolute standards, natural processes, and government-approved accreditations."}
          </p>
        </div>

        {/* Unified Premium Container */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--orange)]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6 relative z-10 lg:divide-x divide-stone-100/50">
            {certs.map((cert) => {
              const Content = (
                <div className="flex flex-col items-center text-center group cursor-pointer px-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 mb-5 relative flex items-center justify-center">
                    {/* Subtle glow behind icon */}
                    <div className="absolute inset-0 bg-[var(--olive)]/0 group-hover:bg-[var(--olive)]/10 rounded-full transition-colors duration-500 blur-xl" />
                    <div className="relative w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-sm">
                      {cert.icon}
                    </div>
                  </div>
                  <h4 className="text-[10px] md:text-[11px] font-bold text-[var(--foreground)] tracking-[0.2em] uppercase leading-snug group-hover:text-[var(--olive-dark)] transition-colors mb-1">
                    {cert.title}
                  </h4>
                  <p className="text-[9px] md:text-[10px] font-semibold text-[var(--dark-grey)] uppercase tracking-widest">
                    {cert.desc}
                  </p>
                </div>
              );

              if (cert.clickable) {
                return (
                  <Link key={cert.id} href="/shop" className="block h-full">
                    {Content}
                  </Link>
                );
              }

              return (
                <div key={cert.id} className="h-full">
                  {Content}
                </div>
              );
            })}
          </div>
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
    <section className="py-24 bg-white relative overflow-hidden border-t border-stone-100">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FAF8F5] rounded-l-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Real Stories
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            Video{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>
          <p className="text-sm text-[var(--dark-grey)] font-medium max-w-xl mx-auto leading-relaxed mt-4">
            Hear directly from our community about their experiences and
            journeys with our products.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {videoReviews.map((video, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-700 cursor-pointer"
            >
              <img
                src={video.cover}
                alt={video.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 filter brightness-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500 z-10" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute -inset-4 bg-[var(--orange)]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transition-all duration-500 shadow-xl group-hover:bg-[var(--orange)] group-hover:border-transparent">
                    <svg
                      className="w-6 h-6 fill-current ml-1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white z-20">
                <div className="space-y-1">
                  <span className="text-[14px] font-black tracking-widest uppercase leading-none block group-hover:text-[var(--orange)] transition-colors">
                    {video.name}
                  </span>
                  <p className="text-[10px] text-white/80 font-medium tracking-wide">
                    Verified Customer
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-widest text-white">
                  {video.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SustainabilityAndPackagingSection({ t }: { t: any }) {
  return (
    <section className="pt-12 pb-24 bg-[#FAF8F5] relative overflow-hidden border-t border-stone-100">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--olive)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--orange)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-4 mx-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Our Commitment
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[var(--foreground)] md:text-4xl lg:text-[42px] text-center">
            Purity &{" "}
            <span className="bg-gradient-to-r from-[var(--olive-dark)] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Planet
            </span>
          </h2>
          <p className="text-sm text-[var(--dark-grey)] font-medium max-w-xl mx-auto leading-relaxed mt-4">
            We believe in creating products that are as good for the earth as
            they are for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {/* Card 1: SECURE PAYMENTS */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-stone-200 border-t-4 border-t-[var(--orange)] bg-white/90 p-8 shadow-[0_12px_30px_rgba(31,41,55,0.05)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-[var(--orange)]/40 hover:shadow-[0_24px_50px_rgba(31,41,55,0.12)] lg:p-9">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--orange)]/5 rounded-full group-hover:bg-[var(--orange)]/10 transition-colors duration-500 blur-2xl" />
            <span className="absolute right-7 top-7 text-[10px] font-black tracking-[0.2em] text-[var(--orange)]/50">01</span>

            <div className="space-y-6 relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 text-[var(--orange-dark)] shadow-sm ring-1 ring-orange-200/60 transition-all duration-500 group-hover:rotate-3 group-hover:bg-[var(--orange)] group-hover:text-white">
                <Shield className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--orange)] uppercase block">
                  {t.trust_shield || "Trust Shield"}
                </span>
                <h4 className="text-xl font-bold text-[var(--foreground)] tracking-tight group-hover:text-[var(--olive-dark)] transition-colors duration-300">
                  {t.secure_payments || "Secure Payments"}
                </h4>
              </div>

              <p className="text-[13px] font-medium text-[var(--dark-grey)] leading-relaxed">
                {t.secure_payments_desc ||
                  "Shop with complete peace of mind. We encrypt and safeguard every transaction with industry-standard 256-bit SSL technology."}
              </p>
            </div>

            <div className="pt-8 relative z-10 mt-auto">
              <div className="flex items-center justify-center p-4 bg-[#FAF8F5] rounded-2xl border border-stone-100 shadow-sm">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dF5Nw5vpBW8gqDSjtXyCr3vMzWn5slCTlg&s"
                  alt="Secure Payments"
                  className="h-8 object-contain opacity-80 mix-blend-multiply"
                />
              </div>
            </div>
          </div>

          {/* Card 2: SUSTAINABILITY */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-stone-200 border-t-4 border-t-[var(--olive)] bg-[#f7faf7] p-8 shadow-[0_12px_30px_rgba(31,41,55,0.05)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-[var(--olive)]/40 hover:shadow-[0_24px_50px_rgba(31,41,55,0.12)] lg:p-9">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--olive)]/5 rounded-full group-hover:bg-[var(--olive)]/10 transition-colors duration-500 blur-2xl" />
            <span className="absolute right-7 top-7 text-[10px] font-black tracking-[0.2em] text-[var(--olive)]/50">02</span>

            <div className="space-y-6 relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 text-[var(--olive)] shadow-sm ring-1 ring-emerald-200/60 transition-all duration-500 group-hover:-rotate-3 group-hover:bg-[var(--olive)] group-hover:text-white">
                <Leaf className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--olive)] uppercase block">
                  {t.eco_stewardship || "Eco Stewardship"}
                </span>
                <h4 className="text-xl font-bold text-[var(--foreground)] tracking-tight group-hover:text-[var(--olive-dark)] transition-colors duration-300">
                  {t.sustainability || "Sustainability"}
                </h4>
              </div>

              <p className="text-[13px] font-medium text-[var(--dark-grey)] leading-relaxed">
                {t.sustainability_desc ||
                  "Caring for the planet and future generations is embedded in our DNA. We focus on low carbon outputs and support organic farming loops."}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-8 relative z-10 mt-auto">
              <ul className="space-y-3">
                {[
                  t.ethically_sourced || "Ethically Sourced",
                  t.eco_friendly_processes || "Eco Friendly Processes",
                  t.supporting_local_farmers || "Supporting Local Farmers",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-[var(--dark-grey)] tracking-wide uppercase"
                  >
                    <div className="w-4 h-4 rounded-full bg-[var(--olive-dark)] flex items-center justify-center text-white shadow-sm">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 3: PLASTIC-FREE PACKAGING */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-stone-200 border-t-4 border-t-[var(--orange)] bg-white/90 p-8 shadow-[0_12px_30px_rgba(31,41,55,0.05)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-[var(--orange)]/40 hover:shadow-[0_24px_50px_rgba(31,41,55,0.12)] lg:p-9">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--orange)]/5 rounded-full group-hover:bg-[var(--orange)]/10 transition-colors duration-500 blur-2xl" />
            <span className="absolute right-7 top-7 text-[10px] font-black tracking-[0.2em] text-[var(--orange)]/50">03</span>

            <div className="space-y-6 relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 text-[var(--orange-dark)] shadow-sm ring-1 ring-orange-200/60 transition-all duration-500 group-hover:rotate-3 group-hover:bg-[var(--orange)] group-hover:text-white">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--orange)] uppercase block">
                  {t.earth_safe || "Earth Safe"}
                </span>
                <h4 className="text-xl font-bold text-[var(--foreground)] tracking-tight group-hover:text-[var(--olive-dark)] transition-colors duration-300">
                  {t.plastic_free_packaging || "Plastic-Free Packaging"}
                </h4>
              </div>

              <p className="text-[13px] font-medium text-[var(--dark-grey)] leading-relaxed">
                {t.plastic_free_desc ||
                  "Our pledge is zero plastic. We pack exclusively in biodegradable cardboard, jute, and paper, so our shipments leave no toxic footprint."}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-8 relative z-10 mt-auto">
              <ul className="space-y-3">
                {[
                  t.eco_friendly_100 || "100% Eco Friendly",
                  t.fully_biodegradable || "Fully Biodegradable",
                  t.better_for_earth || "Better for Earth",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-[var(--dark-grey)] tracking-wide uppercase"
                  >
                    <div className="w-4 h-4 rounded-full bg-[var(--olive-dark)] flex items-center justify-center text-white shadow-sm">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
