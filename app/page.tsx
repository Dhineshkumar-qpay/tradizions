"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import {
  HomeProductModel,
  ReviewModel,
  Review,
  KuralModel,
  KuralData,
} from "@/models/home_model";
import { img } from "framer-motion/m";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const featuredProducts = [
  {
    id: 1,
    name: "Premium Barnyard Millet Premium Barnyard Millet Premium Barnyard Millet Premium Barnyard Millet",
    price: 299,
    originalPrice: 399,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfBIYakTGLZHnzJqrGY_ax7uQfXVKUca48Rw&s",
    rating: 4.8,
    reviews: 124,
    badge: "Millets",
  },
  {
    id: 2,
    name: "Himalayan Walnut Kernels",
    price: 899,
    originalPrice: 1199,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRazhuxmy7XhgzVTcMWu3yjOkiMBYmfBxKew&s",
    rating: 4.9,
    reviews: 89,
    badge: "Nuts",
  },
  {
    id: 3,
    name: "Finger Millet (Ragi) Malt",
    price: 450,
    originalPrice: 599,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2FT49efQnnIWeAkVhYB4M2aHITRbY1rv5ww&s",
    rating: 4.7,
    reviews: 203,
    badge: "Millets",
  },
  {
    id: 4,
    name: "Organic Foxtail Millet",
    price: 250,
    originalPrice: 349,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3L2_MG4RRGC3w-XLNh2dOphIOfzSc6AHWKA&s",
    rating: 4.6,
    reviews: 156,
    badge: "Millets",
  },
];

const giftHampers = [
  {
    id: 101,
    name: "Festive Celebration Box",
    price: 2499,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-lo4Psnq5vDI61PzeMWKo2UlIv2_kyPnzBQ&s",
    desc: "A premium collection of organic millets, dry fruits & artisan sweets.",
  },
  {
    id: 102,
    name: "Wellness Nut Selection",
    price: 1899,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk7BJ2N2Wp2yYW6ApncUC_Eo_HNDzAcaKSQQ&s",
    desc: "Hand-picked premium nuts & nutritious millet treats for the health-conscious.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Health Enthusiast",
    text: "Tradizions has completely transformed our kitchen. The millets are incredibly fresh and the flavours remind me of my grandmother's cooking.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rajesh Kumar",
    role: "Corporate Gifting",
    text: "We ordered 50 gift hampers for Diwali. The presentation was stunning and every recipient was thrilled. Will definitely order again!",
    rating: 5,
    avatar: "RK",
  },
  {
    name: "Ananya Patel",
    role: "Yoga Practitioner",
    text: "The ragi malt is my go-to morning drink now. Pure, organic, and full of energy. Best quality I have found online.",
    rating: 5,
    avatar: "AP",
  },
];

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
    desc: "10,000+ happy households",
  },
  { icon: Zap, title: "Fast delivery", desc: "Quick turnaround time" },
];

const healthGoals = [
  {
    name: "Diabetes",
    image:
      "https://diabetesstrong.com/wp-content/uploads/2024/02/nuts-diabetes-featured.jpg",
    desc: "Low GI foods for sugar management",
    bg: "bg-blue-50",
    icon: Activity,
  },
  {
    name: "Weight Management",
    image:
      "https://milletmarket.com/cdn/shop/articles/millets-diet-for-weight-loss_46efcecf-3ee4-463a-9b21-04fcb1aff5e2.png?v=1758873537",
    desc: "Fiber-rich millets for healthy weight",
    bg: "bg-emerald-50",
    icon: Scale,
  },
  {
    name: "Kids Nutrition",
    image:
      "https://www.mevabite.com/cdn/shop/articles/1000191790.jpg?v=1731217074",
    desc: "Wholesome malts for growing kids",
    bg: "bg-orange-50",
    icon: Baby,
  },
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

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3003";
  const cleanedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
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
  const [kuralList, setKuralList] = useState<KuralData[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
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
    const response = await API.post(API_ROUTES.CATEGORIES);
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
    fetchUserReviews();
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
      <HealthGoalsSection t={t} />
      <HealthBenefitsSection t={t} />
      <FeaturedSection t={t} products={homeData?.data?.featured} />
      <NewArrivalsSection t={t} products={homeData?.data?.newarrivals} />
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

//  HEALTH BENEFITS SECTION (NEW)
//  ══════════════════════════════════════════════════════════════ */
const nutsBenefits = [
  {
    name: "Almond",
    desc: "Rich in healthy fats and vitamin E, supports brain function and heart health.",
  },
  {
    name: "Cashew",
    desc: "Provides essential minerals like magnesium and zinc, supports bone health.",
  },
  {
    name: "Pistachio",
    desc: "Helps in weight management and improves gut health.",
  },
  {
    name: "Walnut",
    desc: "High in omega-3 fatty acids, supports heart and brain health.",
  },
  {
    name: "Raisins",
    desc: "Aids digestion and provides natural energy.",
  },
  {
    name: "Dates",
    desc: "Rich in iron, boosts energy and supports digestion.",
  },
  {
    name: "Fig",
    desc: "High in fiber, helps regulate digestion and blood sugar levels.",
  },
  {
    name: "Apricot",
    desc: "Rich in antioxidants, supports eye and skin health.",
  },
];
const milletsBenefits = [
  {
    name: "Foxtail Millet",
    desc: "Low glycemic index, helps control blood sugar levels.",
  },
  {
    name: "Pearl Millet (Bajra)",
    desc: "Rich in fiber, supports digestion and heart health.",
  },
  {
    name: "Finger Millet (Ragi)",
    desc: "High in calcium, strengthens bones and teeth.",
  },
  {
    name: "Kodo Millet",
    desc: "Aids weight loss and improves digestion.",
  },
  {
    name: "Little Millet",
    desc: "Rich in iron, helps improve hemoglobin levels.",
  },
  {
    name: "Barnyard Millet",
    desc: "Low in calories, ideal for weight management and detox.",
  },
  {
    name: "Proso Millet",
    desc: "Supports metabolism and provides sustained energy.",
  },
  {
    name: "Sorghum (Jowar)",
    desc: "Rich in antioxidants, helps reduce inflammation and supports heart health.",
  },
  {
    name: "Millet Flour",
    desc: "Gluten-free, easy to digest and supports overall nutrition.",
  },
];

const spicesBenefits = [
  {
    name: "Turmeric",
    desc: "Contains curcumin that helps reduce inflammation and boosts immunity.",
  },
  {
    name: "Cinnamon",
    desc: "Helps control blood sugar levels and supports heart health.",
  },
  {
    name: "Black Pepper",
    desc: "Improves digestion and enhances nutrient absorption.",
  },
  {
    name: "Cardamom",
    desc: "Supports digestion and helps maintain fresh breath.",
  },
  {
    name: "Clove",
    desc: "Rich in antioxidants and helps improve oral health.",
  },
  {
    name: "Cumin",
    desc: "Boosts metabolism and supports healthy digestion.",
  },
  {
    name: "Ginger",
    desc: "Reduces nausea and helps relieve inflammation naturally.",
  },
  {
    name: "Nutmeg",
    desc: "Promotes better sleep and supports brain health.",
  },
  {
    name: "Fenugreek",
    desc: "Helps regulate blood sugar and improves digestion.",
  },
  {
    name: "Mustard Seeds",
    desc: "Contains antioxidants and helps reduce inflammation.",
  },
];

function HealthBenefitsSection({ t }: { t: any }) {
  const [activeCategory, setActiveCategory] = useState<
    "nuts" | "millets" | "spices"
  >("nuts");

  const benefitsMap = {
    nuts: nutsBenefits,
    millets: milletsBenefits,
    spices: spicesBenefits,
  };

  const activeBenefits = benefitsMap[activeCategory];

  return (
    <section className="py-24 bg-[#fafaf9] overflow-hidden">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.health_advantage?.split(" ")[0]}{" "}
            <span className="gradient-text">
              {t.health_advantage?.split(" ").slice(1).join(" ")}
            </span>
          </h2>

          {/* CATEGORY BUTTONS */}
          <div className="flex justify-center gap-4 mt-10 flex-wrap">
            <button
              onClick={() => setActiveCategory("nuts")}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer ${
                activeCategory === "nuts"
                  ? "bg-[var(--olive)] text-white shadow-lg shadow-[var(--olive)]/20 scale-105"
                  : "bg-white text-gray-400 hover:text-gray-600 border border-stone-100"
              }`}
            >
              {t.sections?.nuts || "Nuts"}
            </button>

            <button
              onClick={() => setActiveCategory("millets")}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer ${
                activeCategory === "millets"
                  ? "bg-[var(--olive)] text-white shadow-lg shadow-[var(--olive)]/20 scale-105"
                  : "bg-white text-gray-400 hover:text-gray-600 border border-stone-100"
              }`}
            >
              {t.sections?.millets || "Millets"}
            </button>

            <button
              onClick={() => setActiveCategory("spices")}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer ${
                activeCategory === "spices"
                  ? "bg-[var(--olive)] text-white shadow-lg shadow-[var(--olive)]/20 scale-105"
                  : "bg-white text-gray-400 hover:text-gray-600 border border-stone-100"
              }`}
            >
              {t.sections?.spices || "Spices"}
            </button>
          </div>
        </div>
      </div>

      {/* AUTO SCROLL CARDS */}
      <div className="relative group overflow-hidden">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {[...activeBenefits, ...activeBenefits].map((benefit, idx) => (
            <div
              key={benefit.name + idx}
              className="flex-shrink-0 w-[280px] md:w-[320px] mx-4 p-6 rounded-[2rem] bg-white border border-stone-300 hover:border-[var(--olive)]/20 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {benefit.name}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed font-normal">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>

        {/* LEFT GRADIENT */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fafaf9] to-transparent pointer-events-none" />

        {/* RIGHT GRADIENT */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#fafaf9] to-transparent pointer-events-none" />
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

          {/* Social Proof */}
          <div
            className={`flex items-center gap-6 pt-6 transition-all duration-500 delay-800 opacity-100 translate-y-0`}
          >
            <div className="flex -space-x-3">
              {["PS", "RK", "AP", "MG"].map((initials, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--olive)] to-emerald-700 border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
                <span className="text-white/80 font-semibold ml-1">4.9</span>
              </div>
              <p className="text-white/40 text-xs">
                Trusted by 10,000+ families
              </p>
            </div>
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

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3003";
  const cleanedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
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
    <section ref={ref} className="py-28 bg-white relative overflow-hidden">
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
  const displayProducts =
    products && products.length > 0 ? products : featuredProducts;

  return (
    <section
      ref={ref}
      className="py-28 bg-[var(--site-bg)] relative overflow-hidden"
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
            href="/shop"
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
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {displayProducts.map((product, idx) => (
            <div
              key={
                product.productid !== undefined ? product.productid : product.id
              }
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start flex-shrink-0"
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
            <div className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start flex-shrink-0 flex">
              <Link
                href="/shop"
                className="flex-1 group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/30 min-h-[350px]"
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

  return (
    <Link
      href={`/product-detail/${id}?productid=${id}&bid=${product.bid || 1}`}
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
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
            {product.desc || "Tradizions premium selection for health."}
          </p>
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
                    bid: 1,
                    productid: id,
                    giftid: null,
                    quantity: 1,
                    itemtype: "product",
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
            className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${
              (product.availablestock ?? 0) <= 0 
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-[#FCFBF9] border-gray-100 text-gray-900 hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
            } disabled:opacity-50`}
          >
            <span>{(product.availablestock ?? 0) <= 0 ? "OUT OF STOCK" : isAdding ? "ADDING..." : "ADD TO CART"}</span>
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
      : giftHampers;

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
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
                      href={id ? `/gift-detail/${id}?productid=${id}&bid=${item.bid || 1}` : "/gift-detail"}
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
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection({ t }: { t: any }) {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          {/* Left Side: Dynamic Image & Stats (5 columns) */}
          <div
            className={`lg:col-span-5 relative transition-all duration-500 opacity-100 translate-x-0`}
          >
            <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[16px] border-white">
              <Image
                src="/why-choose-us.jpg"
                alt="Quality organic products"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Certification Badge */}
              <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white p-2">
                <Shield className="w-6 h-6 mb-1 text-amber-400" />
                <span className="text-[7px] font-black uppercase tracking-widest text-center">
                  Certified Quality
                </span>
              </div>

              {/* Bottom Stat Card */}
              <div className="absolute bottom-8 inset-x-8 p-6 glass rounded-3xl border border-white/20 shadow-2xl">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl">
                    <BadgeCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        100%
                      </span>
                      <span className="text-xs font-bold text-white/70">
                        Pure
                      </span>
                    </div>
                    <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">
                      Organic Certified Sourcing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--olive)]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-100/30 rounded-full blur-[80px] -z-10" />
          </div>

          {/* Right Side: Content & Features (7 columns) */}
          <div
            className={`lg:col-span-7 space-y-12 transition-all duration-500 delay-300 opacity-100 translate-x-0`}
          >
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                {t.why_choose.split(" ").slice(0, 1).join(" ")}
                <span className="gradient-text">
                  {" "}
                  {t.why_choose.split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p className="text-gray-400 text-md font-normal leading-relaxed max-w-xl">
                {t.why_desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {whyChooseUs.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative p-8 rounded-[2.5rem] bg-stone-50 border border-stone-100 hover:bg-white hover:border-[var(--olive)]/20 transition-all duration-500 hover:shadow-xl"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--olive)] flex-shrink-0 group-hover:bg-[var(--olive)] group-hover:text-white transition-all duration-500">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-md font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors">
                        {t.features[idx * 2]}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-bold leading-snug">
                        {t.features[idx * 2 + 1]}
                      </p>
                    </div>
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
      : testimonials;

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`max-w-2xl mx-auto text-center mb-20 space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
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
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="w-72 aspect-square flex-shrink-0 bg-white border border-stone-100 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group/card hover:-translate-y-2"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                          />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-stone-100 fill-current group-hover/card:text-[var(--olive)]/10 transition-colors" />
                    </div>
                    <p className="text-stone-600 text-xs font-medium leading-relaxed whitespace-normal italic line-clamp-5">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-stone-50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--olive)] to-emerald-700 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-transform group-hover/card:scale-110">
                      {item.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="text-[9px] font-bold text-gray-900 group-hover/card:text-[var(--olive)] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* HORIZONTAL STATIC GRID */
          <div className="flex flex-row flex-wrap justify-center gap-6 py-10 px-6">
            {listToRender.map((item, idx) => (
              <div
                key={idx}
                className="w-72 aspect-square bg-white border border-stone-100 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group/card hover:-translate-y-2"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-stone-100 fill-current group-hover/card:text-[var(--olive)]/10 transition-colors" />
                  </div>
                  <p className="text-stone-600 text-xs font-medium leading-relaxed whitespace-normal italic line-clamp-5">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-stone-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--olive)] to-emerald-700 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-transform group-hover/card:scale-110">
                    {item.avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="text-[9px] font-bold text-gray-900 group-hover/card:text-[var(--olive)] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Rating Tag */}
        <div
          className={`mt-10 flex flex-col items-center gap-3 transition-all duration-500 delay-500 ${
            isVisible ? "opacity-100" : "opacity-0"
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

function HealthGoalsSection({ t }: { t: any }) {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.health_goals_title.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="gradient-text">
              {t.health_goals_title.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-sm font-normal text-gray-400 max-w-lg mx-auto">
            {t.health_goals_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {healthGoals.map((goal, idx) => (
            <Link
              href={`/shop?goal=${goal.name.toLowerCase()}`}
              key={idx}
              className={`group relative h-[400px] rounded-[2.5rem] overflow-hidden transition-all duration-500 opacity-100 translate-y-0`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <Image
                src={goal.image}
                alt={goal.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-x-8 bottom-8 space-y-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${goal.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
                >
                  <goal.icon className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {goal.name}
                  </h3>
                  <p className="text-sm text-white/70 font-light leading-relaxed">
                    {goal.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {t.explore_all} <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------  NUTRITION PLANNER (Nuts & Millets Calculator)

const initialMilletsData = [
  {
    name: "Barnyard Millet (Kuthiraivali)",
    tam: "குதிரைவாலி",
    hin: "सांवा",
    price: 160,
  },
  { name: "Finger Millet (Ragi)", tam: "கேழ்வரகு", hin: "रागी", price: 60 },
  { name: "Foxtail Millet (Thinai)", tam: "தினை", hin: "कंगनी", price: 150 },
  { name: "Kodo Millet (Varagu)", tam: "வரகு", hin: "कोदो", price: 170 },
  { name: "Little Millet (Saamai)", tam: "சாமை", hin: "குட்கி", price: 180 },
  { name: "Pearl Millet (Bajra/Kambu)", tam: "கம்பு", hin: "बाजरा", price: 70 },
  { name: "Sorghum (Jowar/Cholam)", tam: "சோளம்", hin: "ज्वார்", price: 80 },
];

const initialNutsData = [
  { name: "Almond (Badam)", tam: "பாதாம்", hin: "बादाम", price: 900 },
  { name: "Cashew (Munthiri)", tam: "முந்திரி", hin: "काजू", price: 850 },
  { name: "Walnut (Akroot)", tam: "அக்ரூட்", hin: "अخरोट", price: 1200 },
  { name: "Pistachio (Pista)", tam: "பிஸ்தா", hin: "पिस्ता", price: 1750 },
  {
    name: "Raisins (Ular Draksha)",
    tam: "உலர் திராட்சை",
    hin: "किशமिश",
    price: 500,
  },
  {
    name: "Dates (Pericham Pazham)",
    tam: "பேரிச்சம் பழம்",
    hin: "खजूर",
    price: 900,
  },
  { name: "Hazelnut", tam: "ஹேசல்நட்", hin: "हेज़लनट", price: 1500 },
];

const initialSpicesData = [
  {
    name: "Turmeric Powder",
    tam: "மஞ்சள் தூள்",
    hin: "हल्दी पाउडर",
    price: 400,
  },
  { name: "Black Pepper", tam: "மிளகு", hin: "काली मिर्च", price: 800 },
  { name: "Cumin Seeds", tam: "சீரகம்", hin: "जीरा", price: 600 },
  { name: "Cardamom", tam: "ஏலக்காய்", hin: "இலாयची", price: 3500 },
  { name: "Cloves", tam: "கிராம்பு", hin: "लौंग", price: 1200 },
  { name: "Cinnamon", tam: "பட்டை", hin: "दालचीनी", price: 500 },
];

function NutritionPlanner({ t }: { t: any }) {
  const { ref, isVisible } = useInView();
  const [activeTab, setActiveTab] = useState("millets");

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
  const [milletsPlanner, setMilletsPlanner] = useState(
    initialMilletsData.map((m) => ({ ...m, grams: 100, days: 30, members: 4 })),
  );
  const [nutsPlanner, setNutsPlanner] = useState(
    initialNutsData.map((n) => ({ ...n, grams: 20, days: 30, members: 4 })),
  );
  const [spicesPlanner, setSpicesPlanner] = useState(
    initialSpicesData.map((s) => ({ ...s, grams: 10, days: 30, members: 4 })),
  );

  const calculateRow = (row: any) => {
    const qtyPerPerson = (row.grams * row.days) / 1000;
    const totalPrice = qtyPerPerson * row.members * row.price;
    return { qty: qtyPerPerson.toFixed(2), price: Math.round(totalPrice) };
  };

  const currentPlanner =
    activeTab === "millets"
      ? milletsPlanner
      : activeTab === "nuts"
        ? nutsPlanner
        : spicesPlanner;

  const setPlanner =
    activeTab === "millets"
      ? setMilletsPlanner
      : activeTab === "nuts"
        ? setNutsPlanner
        : setSpicesPlanner;

  const grandTotal = currentPlanner.reduce(
    (acc, row) => acc + calculateRow(row).price,
    0,
  );

  return (
    <section ref={ref} className="py-20 bg-gray-50/30 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--olive)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-12 space-y-3 transition-all duration-500 opacity-100 translate-y-0`}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
            {t.planner.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="gradient-text">
              {t.planner.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <p className="text-xs font-normal text-gray-400 max-w-md mx-auto">
            {t.planner_desc}
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab("millets")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 cursor-pointer ${
              activeTab === "millets"
                ? "bg-[var(--olive)] text-white shadow-lg scale-105"
                : "bg-white text-gray-400 hover:text-[var(--olive)] border border-gray-100"
            }`}
          >
            {t.sections.millets.toUpperCase()}
          </button>
          <button
            onClick={() => setActiveTab("nuts")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 cursor-pointer ${
              activeTab === "nuts"
                ? "bg-[var(--olive)] text-white shadow-lg scale-105"
                : "bg-white text-gray-400 hover:text-[var(--olive)] border border-gray-100"
            }`}
          >
            {t.sections.nuts.toUpperCase()}
          </button>
          <button
            onClick={() => setActiveTab("spices")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 cursor-pointer ${
              activeTab === "spices"
                ? "bg-[var(--olive)] text-white shadow-lg scale-105"
                : "bg-white text-gray-400 hover:text-[var(--olive)] border border-gray-100"
            }`}
          >
            {t.sections.spices}
          </button>
        </div>

        <div
          className={`bg-white rounded-[1rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden transition-all duration-500 delay-200 opacity-100 translate-y-0`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-5">
                    {activeTab === "millets"
                      ? "Millet"
                      : activeTab === "nuts"
                        ? "Nut"
                        : "Spice"}{" "}
                    Item
                  </th>
                  <th className="px-4 py-5 text-center">Grams / Day</th>
                  <th className="px-4 py-5 text-center">Days / Month</th>
                  <th className="px-4 py-5 text-center">Family Members</th>
                  <th className="px-4 py-5">Qty / Person</th>
                  <th className="px-4 py-5">Price / Kg</th>
                  <th className="px-6 py-5 text-right">Total Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentPlanner.map((row, idx) => {
                  const { qty, price } = calculateRow(row);
                  return (
                    <tr
                      key={idx}
                      className="group hover:bg-gray-50/30 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--olive)] transition-colors">
                            {row.name}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium tracking-wide">
                            {row.tam} | {row.hin}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs font-bold text-gray-700 text-center focus:ring-2 focus:ring-[var(--olive)]/20 focus:bg-white outline-none transition-all"
                          value={row.grams}
                          onChange={(e) => {
                            const newPlanner = [...currentPlanner];
                            newPlanner[idx].grams = Number(e.target.value);
                            setPlanner(newPlanner);
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs font-bold text-gray-700 text-center focus:ring-2 focus:ring-[var(--olive)]/20 focus:bg-white outline-none transition-all"
                          value={row.days}
                          onChange={(e) => {
                            const newPlanner = [...currentPlanner];
                            newPlanner[idx].days = Number(e.target.value);
                            setPlanner(newPlanner);
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs font-bold text-gray-700 text-center focus:ring-2 focus:ring-[var(--olive)]/20 focus:bg-white outline-none transition-all"
                          value={row.members}
                          onChange={(e) => {
                            const newPlanner = [...currentPlanner];
                            newPlanner[idx].members = Number(e.target.value);
                            setPlanner(newPlanner);
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-400 text-xs">
                        {qty} <span className="text-[9px] font-bold">Kg</span>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-400 text-xs">
                        ₹{row.price}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[var(--olive)] text-sm">
                        ₹{price}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100">
            <button
              onClick={() =>
                handleActionWithLogin(() =>
                  alert("Added nutrition plan products to cart!"),
                )
              }
              className="btn-standard w-full md:w-auto rounded-xl font-bold text-[10px] tracking-[0.2em] active:scale-95 transition-all duration-500 cursor-pointer"
            >
              ADD TO CART
            </button>
            <div className="text-center md:text-right space-y-0.5">
              <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                Monthly Grand Total
              </p>
              <p className="text-lg font-black text-gray-900 tracking-tight">
                ₹{grandTotal.toLocaleString()}
              </p>
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
    <section ref={ref} className="py-24 bg-[#fafaf9] relative overflow-hidden">
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
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
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
            href="/shop"
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

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {displayProducts.map((product, idx) => {
            const id =
              product.productid !== undefined ? product.productid : product.id;
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
                className="w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)] snap-start flex-shrink-0"
              >
                <Link
                  href={detailUrl}
                  className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] h-full"
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
                        {product.desc ||
                          "Tradizions premium selection for health."}
                      </p>
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
                        disabled={(product.availablestock ?? 0) <= 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if ((product.availablestock ?? 0) <= 0) return;
                          handleActionWithLogin(() => alert("Added to cart!"));
                        }}
                        className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${
                          (product.availablestock ?? 0) <= 0 
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                            : "bg-[#FCFBF9] border-gray-100 text-gray-900 hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
                        } disabled:opacity-50`}
                      >
                        <span>{(product.availablestock ?? 0) <= 0 ? "OUT OF STOCK" : "ADD TO CART"}</span>
                        <ShoppingCart className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          {/* View All Card */}
          {displayProducts.length > 10 && (
            <div className="w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)] snap-start flex-shrink-0 flex">
              <Link
                href="/shop"
                className="flex-1 group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/30 min-h-[350px]"
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
    <section className="py-20 bg-gradient-to-b from-white to-[#FDFDFD] relative overflow-hidden">
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
          <div className="w-12 h-1 bg-[var(--orange)] rounded-full mx-auto mt-2" />
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
    <section className="py-24 bg-[#FAFBF9] border-t border-stone-200/50 relative overflow-hidden">
      {/* Decorative organic mesh pattern in background */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Centered Heading */}
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight leading-none">
            Video <span className="gradient-text">Testimonials</span>
          </h3>
        </div>

        {/* Left to right horizontal scroll track */}
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

                {/* Dark gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/40 to-transparent transition-all duration-500" />

                {/* Centered glassmorphic play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Outer pulsing gold glow */}
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

                {/* Info overlay (Name, status, duration) */}
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

                {/* Interactive bottom timeline bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-[var(--orange)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </div>
            </div>
          ))}

          {/* Greater than 10 show "Show All" card */}
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
      </div>
    </section>
  );
}

function SustainabilityAndPackagingSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-stone-200/50">
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
