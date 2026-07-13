"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Award,
  Truck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  ShoppingCart,
  Mail,
  Phone,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { CorporateProductModel } from "@/models/corporate_product_model";
import { useRouter } from "next/navigation";

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

export default function CorporateOrdersPageClient() {
  const [loaded, setLoaded] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("10 - 50");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const router = useRouter();
  const [corporateProducts, setCorporateProducts] = useState<
    CorporateProductModel[]
  >([]);

  useEffect(() => {
    const fetchCorporateProducts = async () => {
      try {
        const response = await API.post(API_ROUTES.GETCORPORATEPRODUCTS);
        if (response.status === 200) {
          setCorporateProducts(response.data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching corporate products:", err);
      }
    };
    fetchCorporateProducts();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await API.post(API_ROUTES.ADDCORPORATECONTACTUS, {
        name: name || companyName,
        email,
        phone,
        quantity,
        description,
      });
      if (response.status === 200) {
        setIsSubmitted(true);
        setCompanyName("");
        setName("");
        setEmail("");
        setPhone("");
        setQuantity("10 - 50");
        setDescription("");
      } else {
        alert("Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      console.error("Error submitting corporate inquiry:", err);
      alert(
        err?.response?.data?.message ||
        "An error occurred while submitting your inquiry.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

  const handleBuyNow = (item: CorporateProductModel, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    handleActionWithLogin(async () => {
      setIsAddingToCart(item.productid);
      try {
        const response = await API.post(API_ROUTES.ADDTOCART, {
          bid: item.bid || 1,
          productid: null,
          giftid: item.productid,
          quantity: 1,
          itemtype: "gift",
          isbuynow: true,
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
          router.push("/checkout");
        } else {
          alert("Failed to proceed to checkout.");
        }
      } catch (err: any) {
        console.error("Error adding to cart:", err);
        alert(
          err?.response?.data?.message ||
          "An error occurred while proceeding to checkout.",
        );
      } finally {
        setIsAddingToCart(null);
      }
    });
  };

  const heroRef = useInView();
  const benefitsRef = useInView();
  const productsRef = useInView();
  const formRef = useInView();

  return (
    <main className="min-h-screen bg-[var(--site-bg)] overflow-x-hidden ">
      {/* ── HERO SECTION (Light & Modern Split) ── */}
      <section
        ref={heroRef.ref}
        className="relative py-10 overflow-hidden bg-[var(--site-bg)] z-10"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-[var(--olive)]/10 to-transparent rounded-bl-[120px] -z-10" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--orange)]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left Content */}
            <div
              className={`flex-1 space-y-8 transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
            >
              <div className="inline-flex items-center gap-2 py-2 ">
                <span className="text-[16px] font-extrabold tracking-[0.2em] uppercase">
                  {t.corporate_orders.solutions || "Corporate Solutions"}
                </span>
              </div>

              <h1 className="text-4xl md:text-4xl lg:text-4xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                {t.corporate_orders.elevate || "Elevate Your"} <br />
                <span className="text-[var(--olive)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--orange-dark)] to-[var(--orange)]">
                  {t.corporate_orders.relationships || "Business Relationships"}
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                {t.corporate_orders.hero_desc ||
                  "Make a lasting impression with premium organic and traditional gifting solutions tailored for your corporate needs."}
              </p>

              <div className="pt-4 flex items-center gap-6">
                <button
                  onClick={() =>
                    document
                      .getElementById("corporate-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group px-8 py-4 rounded-sm bg-[var(--olive)] text-white font-extrabold text-xs tracking-widest uppercase hover:bg-[var(--olive-dark)] shadow-[0_10px_30px_rgba(85,107,47,0.25)] hover:shadow-[0_15px_40px_rgba(85,107,47,0.35)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center gap-3"
                >
                  {t.corporate_orders.get_quote || "Get Custom Quote"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Image/Graphic */}
            <div
              className={`flex-1 relative w-full max-w-lg lg:max-w-none transition-all duration-1000 delay-300 ease-out ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            >
              <div className="relative aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                <Image
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  fill
                  alt="Corporate Gifting"
                  className="object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--olive)]/30 to-transparent mix-blend-multiply" />
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute -bottom-8 -left-8 md:bottom-12 md:-left-12 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-[var(--orange)] shadow-inner">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/3908/3908418.png"
                      alt="premium"
                      height={30}
                      width={30}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-gray-900 tracking-tight">
                      Premium
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Quality Assured
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white animate-float delay-1000 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[var(--olive)] shadow-inner">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/11314/11314944.png"
                      alt="premium"
                      height={30}
                      width={30}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 tracking-tight">
                      100% Organic
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS SECTION (Modern Cards) ── */}
      <section ref={benefitsRef.ref} className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "https://cdn-icons-png.flaticon.com/128/3908/3908418.png",
                title: t.corporate_orders.benefit1_title || "Custom Branding",
                desc:
                  t.corporate_orders.benefit1_desc ||
                  "Personalize packaging with your company logo and custom messaging.",
                color: "var(--olive)",
                bg: "bg-emerald-50",
              },
              {
                icon: "https://cdn-icons-png.flaticon.com/128/166/166258.png",
                title: t.corporate_orders.benefit3_title || "Bulk Discounts",
                desc:
                  t.corporate_orders.benefit3_desc ||
                  "Enjoy exclusive pricing tiers tailored for large corporate orders.",
                color: "var(--orange)",
                bg: "bg-amber-50",
              },
              {
                icon: "https://cdn-icons-png.flaticon.com/128/726/726455.png",
                title: t.corporate_orders.benefit2_title || "Global Delivery",
                desc:
                  t.corporate_orders.benefit2_desc ||
                  "Seamless multi-address shipping directly to your clients or employees.",
                color: "var(--olive)",
                bg: "bg-emerald-50",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className={`bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-500 group ${benefitsRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${benefit.bg} flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500`}
                  style={{ color: benefit.color }}
                >
                  <img src={benefit.icon} alt="icons" height={35} width={35} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative z-20 overflow-hidden">
        {/* Soft background glow for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-[var(--olive)]/5 rounded-[100%] blur-[120px] pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Image 1 */}
            <div className="relative aspect-[4/3] rounded-[0rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 border-4 border-white group">
              <img
                src="https://m.media-amazon.com/images/I/A1VpOe56yCL.jpg"
                alt="Premium Gift Set"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Image 2 */}
            <div className="relative aspect-[4/3] rounded-[0rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 border-4 border-white group">
              <img
                src="https://www.omayfoods.com/cdn/shop/files/Nuts_Delights_1_1024x.png?v=1707999347"
                alt="Nut Delights"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Image 3 */}
            <div className="relative aspect-[4/3] rounded-[0rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 border-4 border-white group">
              <img
                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQPr92M7tc_wU803465wGPaftI9HsjKuriT3MdTYEDzWYF84zvY"
                alt="Corporate Hamper"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Image 4 */}
            <div className="relative aspect-[4/3] rounded-[0rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 border-4 border-white group">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_pKrj2QQfoqJJJZQpUnoeI6zbcbp-xYRWjUJXpfYJCyenQtB2"
                alt="Elegant Gifting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE TRADIZIONS ADVANTAGE (Professional Details) ── */}
      <section className="py-24 bg-[#FFF5EF] text-gray-900 relative z-20 overflow-hidden">
        {/* Subtle grid pattern for a corporate tech/structured feel */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Ambient glow using darker peach/orange */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FFDAB9]/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFCBA4]/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3">
                <span className="w-8 h-px bg-[var(--orange)]" />
                <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-[var(--olive)]">
                  The Tradizions Advantage
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
                {t.corporate_orders.prof_title || "Corporate Gifting,"} <br />
                <span className="text-[var(--orange)] font-light">
                  {t.corporate_orders.prof_subtitle || "Done Professionally."}
                </span>
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed max-w-lg font-medium">
                {t.corporate_orders.prof_desc ||
                  "We go beyond just sending a gift. We deliver a meticulously crafted experience that reflects your company's values and commitment to wellness."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 mt-8">
                {[
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/166/166258.png",
                    title:
                      t.corporate_orders.prof_feature1_title ||
                      "Dedicated Manager",
                    desc:
                      t.corporate_orders.prof_feature1_desc ||
                      "Single point of contact for end-to-end execution.",
                  },
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/3112/3112946.png",
                    title:
                      t.corporate_orders.prof_feature2_title ||
                      "Bespoke Curation",
                    desc:
                      t.corporate_orders.prof_feature2_desc ||
                      "Tailored hampers designed to fit precise budgets.",
                  },
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/726/726455.png",
                    title:
                      t.corporate_orders.prof_feature3_title ||
                      "White-Glove Delivery",
                    desc:
                      t.corporate_orders.prof_feature3_desc ||
                      "Secure, reliable, trackable multi-point dispatch.",
                  },
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/5517/5517030.png",
                    title:
                      t.corporate_orders.prof_feature4_title || "Tax Compliant",
                    desc:
                      t.corporate_orders.prof_feature4_desc ||
                      "GST-ready billing for hassle-free accounting.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-[#FFDAB9]/60 hover:bg-white hover:border-[var(--orange)]/40 hover:shadow-[0_20px_40px_rgba(255,140,0,0.08)] hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#FFF5EF] border border-[#FFDAB9] flex items-center justify-center mb-5 group-hover:border-[var(--orange)]/50 transition-colors shadow-sm">
                      <img
                        src={item.icon}
                        alt="icon"
                        height={24}
                        width={24}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{
                          filter:
                            "brightness(0) sepia(1) hue-rotate(340deg) saturate(5)",
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-extrabold text-gray-900 tracking-tight mb-2 group-hover:text-[var(--orange)] transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFDAB9] to-[#FFCBA4] rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              <div className="relative h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-white bg-white">
                <img
                  src="https://m.media-amazon.com/images/I/81UClRmEqML._AC_UF894,1000_QL80_.jpg"
                  alt="Professional Business"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3d4d22]/80 via-[#3d4d22]/20 to-transparent mix-blend-multiply" />

                <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100 shadow-xl">
                  <div className="w-8 h-1 bg-[var(--orange)] mb-4 rounded-full" />
                  <p className="text-lg font-medium text-gray-900 italic leading-relaxed">
                    "Elevate your corporate relationships with premium wellness
                    gifting tailored for excellence."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT LISTING (Glass UI) ── */}
      <section ref={productsRef.ref} className="py-24 bg-gray-50 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3">
              <p className="text-[10px] font-extrabold text-[var(--olive)] tracking-[0.3em] uppercase">
                {t.corporate_orders.collection || "Curated Collection"}
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {t.corporate_orders.popular_choices || "Popular Corporate"}{" "}
                <span className="text-[var(--orange)]">
                  {t.corporate_orders.choices || "Gifting Choices"}
                </span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {corporateProducts.map((item, i) => {
              const itemImage = item.productimage?.startsWith("http")
                ? item.productimage
                : `${IMAGE_URL || ""}${item.productimage}`;

              return (
                <div
                  key={i}
                  className={`group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-500 flex flex-col overflow-hidden ${productsRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Image Area */}
                  <Link
                    href={`/gift-detail/${item.productid}`}
                    className="relative aspect-[4/3] overflow-hidden bg-gray-50 block border-b border-gray-100"
                  >
                    <img
                      src={itemImage || "/placeholder.png"}
                      alt={item.productname}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Dark professional overlay on hover */}
                    <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <button
                        disabled={isAddingToCart === item.productid}
                        onClick={(e) => handleBuyNow(item, e)}
                        className="hidden lg:flex bg-white text-gray-900 py-3 px-6 rounded font-bold text-[11px] tracking-widest uppercase hover:bg-[var(--olive-dark)] hover:text-white transition-all shadow-lg disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed items-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-500"
                      >
                        {isAddingToCart === item.productid ? (
                          <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            BUY NOW <ShoppingCart className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </Link>

                  {/* Details Area */}
                  <div className="p-6 flex flex-col flex-1 bg-white relative z-10">
                    <h3 className="text-[15px] font-bold text-[var(--olive-dark)] line-clamp-1 mb-2 group-hover:text-[var(--orange)] transition-colors">
                      {item.productname}
                    </h3>
                    <p className="text-[13px] text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Starting At
                        </p>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                          ₹
                          {item.sellingprice > 0
                            ? item.sellingprice.toLocaleString()
                            : item.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Mobile add button */}
                      <button
                        onClick={(e) => handleBuyNow(item, e)}
                        disabled={isAddingToCart === item.productid}
                        className="lg:hidden w-10 h-10 rounded border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-[var(--olive-dark)] hover:text-white hover:border-[var(--olive-dark)] transition-colors"
                      >
                        {isAddingToCart === item.productid ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INQUIRY FORM (Split Layout) ── */}
      <section id="corporate-form" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            ref={formRef.ref}
            className={`bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col lg:flex-row transition-all duration-1000 ${formRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* Left Info Side - Corporate Professional */}
            <div className="lg:w-2/5 bg-[var(--olive-dark)] p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orange)] opacity-10 rounded-bl-full pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2">
                  <span className="w-6 h-1 bg-[var(--orange)]" />
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--cream)]/80">
                    {t.contact_us.connect || "Connect With Us"}
                  </h3>
                </div>

                <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
                  Let's Discuss Your <br />
                  <span className="text-[var(--orange)]">Gifting Needs</span>
                </h2>

                <p className="text-sm text-[var(--cream)]/80 leading-relaxed max-w-sm mt-4">
                  {t.corporate_orders.custom_quote_desc ||
                    "Fill out the form with your requirements and our corporate sales team will get back to you within 24 hours."}
                </p>
              </div>

              <div className="relative z-10 space-y-6 mt-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-[var(--olive)] flex items-center justify-center text-[var(--cream)]/80">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--cream)]/60 mb-1">
                      Email Us
                    </p>
                    <a
                      href="mailto:tradizions@gmail.com"
                      className="text-sm font-medium text-[var(--cream)] hover:text-[var(--orange)] transition-colors"
                    >
                      tradizions@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-[var(--olive)] flex items-center justify-center text-[var(--cream)]/80">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--cream)]/60 mb-1">
                      Call Us
                    </p>
                    <a
                      href="tel:+919940620019"
                      className="text-sm font-medium text-[var(--cream)] hover:text-[var(--orange)] transition-colors"
                    >
                      +91 9940620019
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Side - Clean Corporate Inputs */}
            <div className="lg:w-3/5 p-10 lg:p-14 bg-white flex items-center">
              {isSubmitted ? (
                <div className="w-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
                  <div className="w-16 h-16 bg-[var(--olive)]/10 text-[var(--olive)] rounded-full flex items-center justify-center mb-6 border border-[var(--olive)]/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Inquiry Received
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                    Thank you for reaching out. Our dedicated corporate team is
                    reviewing your requirements and will contact you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 rounded bg-[var(--olive-dark)] text-white text-xs font-bold tracking-wide uppercase hover:bg-[var(--olive)] transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form className="w-full space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--olive-dark)] uppercase tracking-wide">
                        {t.corporate_orders.company_name || "Company Name"} *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Tradizions Inc."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] outline-none text-sm transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--olive-dark)] uppercase tracking-wide">
                        {t.corporate_orders.contact_person || "Contact Person"}{" "}
                        *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] outline-none text-sm transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--olive-dark)] uppercase tracking-wide">
                        {t.corporate_orders.work_email || "Work Email"} *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] outline-none text-sm transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--olive-dark)] uppercase tracking-wide">
                        Phone / Mobile *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9025821501"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] outline-none text-sm transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--olive-dark)] uppercase tracking-wide">
                      {t.corporate_orders.quantity || "Expected Quantity"} *
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] outline-none text-sm transition-colors appearance-none"
                      required
                    >
                      <option value="10 - 50">10 - 50 Units</option>
                      <option value="50 - 200">50 - 200 Units</option>
                      <option value="200 - 500">200 - 500 Units</option>
                      <option value="500+">500+ Units</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--olive-dark)] uppercase tracking-wide">
                      {t.corporate_orders.tell_us || "Additional Requirements"}{" "}
                      *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Special packaging, event date, budget constraints..."
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] outline-none text-sm transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded bg-[var(--olive-dark)] text-white font-bold text-xs tracking-widest hover:bg-[var(--olive)] transition-colors uppercase disabled:opacity-50 mt-4"
                  >
                    {isSubmitting
                      ? "Sending Inquiry..."
                      : t.corporate_orders.submit_inquiry || "Submit Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
