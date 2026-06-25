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
        className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[var(--site-bg)] z-10"
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

      {/* ── THE TRADIZIONS ADVANTAGE (Professional Details) ── */}
      <section className="py-24 bg-[var(  --beige)] text-white relative z-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-30"
          style={{ backgroundColor: "#FFDAB9" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[100px] opacity-30"
          style={{ backgroundColor: "#FFCBA4" }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-black">
                {t.corporate_orders.prof_title || "Corporate Gifting,"} <br />
                <span className="text-[var(--orange)]">
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
                      "Dedicated Account Manager",
                    desc:
                      t.corporate_orders.prof_feature1_desc ||
                      "A single point of contact for end-to-end seamless execution.",
                  },
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/3112/3112946.png",
                    title:
                      t.corporate_orders.prof_feature2_title ||
                      "Bespoke Curation",
                    desc:
                      t.corporate_orders.prof_feature2_desc ||
                      "Tailored hampers designed to fit your precise budget and health goals.",
                  },
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/726/726455.png",
                    title:
                      t.corporate_orders.prof_feature3_title ||
                      "White-Glove Delivery",
                    desc:
                      t.corporate_orders.prof_feature3_desc ||
                      "Secure, reliable, and trackable multi-point dispatch.",
                  },
                  {
                    icon: "https://cdn-icons-png.flaticon.com/128/5517/5517030.png",
                    title:
                      t.corporate_orders.prof_feature4_title ||
                      "Tax Compliant Invoicing",
                    desc:
                      t.corporate_orders.prof_feature4_desc ||
                      "GST-ready corporate billing for hassle-free accounting.",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="relative bg-white/40 backdrop-blur-xl border border-white/80 rounded-3xl p-6 hover:bg-white hover:border-[var(--orange)]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--orange)]/5 rounded-bl-full -z-10 group-hover:bg-[var(--orange)]/10 transition-colors duration-500" />
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--orange)]/0 via-[var(--orange)] to-[var(--orange)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-[var(--orange)]/30 transition-all duration-500">
                        <img src={Icon} alt="icons" height={25} width={25} />
                      </div>

                      <h3 className="text-sm font-extrabold text-gray-900 tracking-tight mb-2 group-hover:text-[var(--orange)] transition-colors duration-500">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative hidden lg:block group">
              {/* Animated Glow Background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--orange)] to-emerald-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

              {/* Image Card */}
              <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="/corporate.jpeg"
                  alt="Professional Business"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--olive-dark)]/80 via-[var(--olive-dark)]/20 to-transparent mix-blend-multiply" />

                {/* Floating Glass Badge */}
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                  <p className="text-lg font-medium text-white italic leading-relaxed shadow-sm">
                    "Elevate your corporate relationships with premium wellness
                    gifting."
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
                <br />
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
                  className={`group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col ${productsRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Image Area */}
                  <Link
                    href={`/gift-detail/${item.productid}`}
                    className="relative aspect-square overflow-hidden bg-gray-100 block"
                  >
                    <img
                      src={itemImage || "/placeholder.png"}
                      alt={item.productname}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Hover Add button for desktop */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 px-4">
                      <button
                        disabled={isAddingToCart === item.productid}
                        onClick={(e) => handleBuyNow(item, e)}
                        className="w-full bg-white/95 backdrop-blur text-gray-900 py-3 px-4 rounded-xl font-extrabold text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--olive)] hover:text-white transition-all shadow-lg disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isAddingToCart === item.productid ? (
                          <div className="w-4 h-4 border-2 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            BUY NOW <ShoppingCart className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </Link>

                  {/* Details Area */}
                  <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
                    <h3 className="text-base font-extrabold text-gray-900 line-clamp-1 mb-1 group-hover:text-[var(--olive)] transition-colors">
                      {item.productname}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4 flex-1 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                          Starting At
                        </p>
                        <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                          ₹
                          {item.sellingprice > 0
                            ? item.sellingprice.toLocaleString()
                            : item.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Mobile add button (always visible) */}
                      <button
                        onClick={(e) => handleBuyNow(item, e)}
                        disabled={isAddingToCart === item.productid}
                        className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-[var(--olive)] hover:text-white transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
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
            className={`bg-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row transition-all duration-1000 ${formRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* Left Info Side - Enhanced Premium Card */}
            <div className="lg:w-2/5 relative overflow-hidden flex flex-col justify-between p-10 lg:p-14 group/connect">
              {/* Premium Backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--olive-dark)] via-[var(--olive)] to-[#4a5c28] z-0" />
              <img
                src="https://images.unsplash.com/photo-1702566038578-7139b3b6a738?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Connect"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 group-hover/connect:scale-110 transition-transform duration-[2000ms] z-0"
              />

              {/* Abstract decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orange)]/20 rounded-bl-[100px] z-0 blur-xl group-hover/connect:bg-[var(--orange)]/30 transition-colors duration-700" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-tr-[100px] z-0 blur-2xl" />

              <div className="relative z-10 space-y-6 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[var(--orange)] animate-pulse" />
                  <h3 className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-white">
                    {t.contact_us.connect || "Connect With Us"}
                  </h3>
                </div>

                <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                  Let's Discuss Your <br />
                  <span className="text-[var(--orange)]">Gifting Needs</span>
                </h2>

                <div className="w-12 h-1 bg-gradient-to-r from-[var(--orange)] to-transparent rounded-full" />

                <p className="text-sm font-medium text-white/90 leading-relaxed max-w-sm drop-shadow-sm">
                  {t.corporate_orders.custom_quote_desc ||
                    "Fill out the form with your requirements and our corporate sales team will get back to you within 24 hours."}
                </p>
              </div>

              <div className="relative z-10 space-y-4">
                {/* Glassmorphic Contact Item 1 */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group/contact hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-white text-[var(--olive)] flex items-center justify-center shadow-lg group-hover/contact:scale-110 transition-transform duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-0.5">
                      Email Us
                    </p>
                    <a
                      href="mailto:tradizions@gmail.com"
                      className="text-[15px] font-bold text-white hover:text-[var(--orange)] transition-colors drop-shadow-sm"
                    >
                      tradizions@gmail.com
                    </a>
                  </div>
                </div>

                {/* Glassmorphic Contact Item 2 */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group/contact hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-white text-[var(--olive)] flex items-center justify-center shadow-lg group-hover/contact:scale-110 transition-transform duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-0.5">
                      Call Us
                    </p>
                    <a
                      href="tel:+919940620019"
                      className="text-[15px] font-bold text-white hover:text-[var(--orange)] transition-colors drop-shadow-sm"
                    >
                      +91 9940620019
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Side */}
            <div className="lg:w-3/5 p-10 lg:p-14 bg-white flex items-center">
              {isSubmitted ? (
                <div className="w-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
                  <div className="w-24 h-24 bg-emerald-50 text-[var(--olive)] rounded-full flex items-center justify-center mb-8 border border-emerald-100 shadow-inner">
                    <CheckCircle2 className="w-12 h-12 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Inquiry Received!
                  </h3>
                  <p className="text-gray-500 text-sm font-medium max-w-md mx-auto mb-10 leading-relaxed">
                    Thank you for reaching out. Our dedicated corporate team is
                    reviewing your requirements and will contact you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-8 py-4 rounded-2xl bg-gray-900 text-white text-[11px] font-extrabold tracking-[0.2em] uppercase hover:bg-gray-800 transition-all shadow-lg cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form className="w-full space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                        {t.corporate_orders.company_name || "Company Name"} *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Tradizions Inc."
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--olive)]/10 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 shadow-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                        {t.corporate_orders.contact_person || "Contact Person"}{" "}
                        *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--olive)]/10 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                        {t.corporate_orders.work_email || "Work Email"} *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--olive)]/10 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 shadow-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                        Phone / Mobile *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9025821501"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--olive)]/10 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                      {t.corporate_orders.quantity || "Expected Quantity"} *
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--olive)]/10 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium text-gray-700 shadow-sm appearance-none"
                      required
                    >
                      <option value="10 - 50">10 - 50 Units</option>
                      <option value="50 - 200">50 - 200 Units</option>
                      <option value="200 - 500">200 - 500 Units</option>
                      <option value="500+">500+ Units</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                      {t.corporate_orders.tell_us || "Additional Requirements"}{" "}
                      *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Special packaging, event date, budget constraints..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--olive)]/10 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 shadow-sm resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-[var(--orange)] text-white font-extrabold text-[12px] tracking-[0.2em] shadow-[0_10px_30px_rgba(255,140,0,0.25)] hover:shadow-[0_15px_40px_rgba(255,140,0,0.35)] hover:-translate-y-1 active:scale-[0.98] transition-all uppercase cursor-pointer disabled:opacity-50 mt-4"
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
