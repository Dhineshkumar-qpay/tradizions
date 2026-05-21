"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  Award,
  Globe,
  Truck,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Gift,
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
import { API_ROUTES } from "@/routes/api_routes";
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

export default function CorporateOrdersPage() {
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

  const handleBuyNow = async (
    item: CorporateProductModel,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.dispatchEvent(new Event("openLoginSidebar"));
      return;
    }

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
  };

  const heroRef = useInView();
  const benefitsRef = useInView();
  const productsRef = useInView();
  const formRef = useInView();

  return (
    <main className="min-h-screen bg-[var(--site-bg)] overflow-x-hidden">
      {/* ── HERO SECTION ── */}
      <section
        ref={heroRef.ref}
        className="relative pt-32 pb-24 lg:pt-40 lg:pb-40 overflow-hidden flex items-center justify-center bg-[#0a0a0a] text-white"
      >
        {/* Background Image/Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2001&auto=format&fit=crop"
            fill
            alt="Corporate Gifting Background"
            className="object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/60" />
        </div>

        {/* Floating shapes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[var(--olive)]/20 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[var(--orange)]/10 rounded-full blur-[120px] animate-float delay-700 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-white border border-white/20 text-[11px] font-bold tracking-[0.25em] uppercase mb-8 shadow-sm transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Briefcase className="w-4 h-4 text-[var(--orange)]" />
            {t.corporate_orders.solutions}
          </div>

          <h1
            className={`text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-[1.05] tracking-tight mb-8 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.corporate_orders.elevate} <br />
            <span className="text-[var(--orange)]">
              {t.corporate_orders.relationships}
            </span>
          </h1>

          <p
            className={`text-md md:text-md text-white/60 leading-relaxed font-light max-w-3xl mx-auto transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.corporate_orders.hero_desc}
          </p>

          <div
            className={`mt-12 transition-all duration-1000 delay-600 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <button
              onClick={() =>
                document
                  .getElementById("corporate-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-10 py-4 rounded-full bg-[var(--olive)] text-white font-seminbold text-xs tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[var(--olive)]/20 cursor-pointer"
            >
              {t.corporate_orders.get_quote}
            </button>
          </div>
        </div>
      </section>

      {/* ── BENEFITS SECTION ── */}
      <section ref={benefitsRef.ref} className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Award,
                title: t.corporate_orders.benefit1_title,
                desc: t.corporate_orders.benefit1_desc,
              },
              {
                icon: Globe,
                title: t.corporate_orders.benefit2_title,
                desc: t.corporate_orders.benefit2_desc,
              },
              {
                icon: Users,
                title: t.corporate_orders.benefit3_title,
                desc: t.corporate_orders.benefit3_desc,
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center space-y-6 transition-all duration-1000 ${benefitsRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--olive)] shadow-inner">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 font-light leading-relaxed max-w-xs">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT LISTING SECTION ── */}
      <section ref={productsRef.ref} className="py-32 bg-[var(--site-bg)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <p className="text-[12px] font-normal text-[var(--olive)] tracking-[0.3em] uppercase">
              {t.corporate_orders.collection}
            </p>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
              {t.corporate_orders.popular_choices}{" "}
              <span className="gradient-text">
                {t.corporate_orders.choices}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {corporateProducts.map((item, i) => {
              const itemImage = item.productimage?.startsWith("http")
                ? item.productimage
                : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${item.productimage}`;

              return (
                <Link
                  href={`/gift-detail/${item.productid}`}
                  key={i}
                  className={`group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-700 ${productsRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={itemImage || "/placeholder.png"}
                      alt={item.productname}
                      className=" h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                        {item.productname}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">
                        ₹
                        {item.sellingprice > 0
                          ? item.sellingprice.toLocaleString()
                          : item.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Starting from
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="pt-2 mt-auto">
                      <button
                        disabled={isAddingToCart === item.productid}
                        onClick={(e) => handleBuyNow(item, e)}
                        className="w-full bg-[#FCFBF9] border border-gray-100 text-gray-900 py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all duration-300 group/btn cursor-pointer disabled:opacity-50"
                      >
                        <span>
                          {isAddingToCart === item.productid
                            ? "PROCESSING..."
                            : "BUY NOW"}
                        </span>
                        <ShoppingCart className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INQUIRY FORM SECTION ── */}
      <section id="corporate-form" className="py-32 bg-[var(--site-bg)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Reduced Premium Contact Card - Above Form */}
            <div
              className={`mb-16 transition-all duration-1000 ${formRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <div className="premium-card bg-white rounded-[1rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group max-w-3xl mx-auto">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--olive)]/5 rounded-bl-full -z-10 group-hover:bg-[var(--olive)]/10 transition-colors" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <h3 className="text-[10px] font-bold text-[var(--olive)] tracking-[0.3em] uppercase">
                      {t.contact_us.connect}
                    </h3>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                      {t.corporate_orders.custom_quote_heading}{" "}
                      <span className="gradient-text">
                        {t.corporate_orders.custom_quote_sub}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-400 font-light max-w-md">
                      {t.corporate_orders.custom_quote_desc}{" "}
                      <span className="font-bold text-gray-900">
                        {t.corporate_orders.hours_24}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 shrink-0 w-full md:w-auto">
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--olive)] flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 group-hover/item:bg-[var(--olive)] group-hover/item:text-white">
                        <Mail className="w-5 h-5" />
                      </div>
                      <a
                        href="mailto:qpay@tradizions.com"
                        className="text-md font-bold text-gray-900 hover:text-[var(--olive)] transition-colors"
                      >
                        qpay@tradizions.com
                      </a>
                    </div>

                    <div className="flex items-center gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--orange)] flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 group-hover/item:bg-[var(--orange)] group-hover/item:text-white">
                        <Phone className="w-5 h-5" />
                      </div>
                      <a
                        href="tel:+919940620019"
                        className="text-md font-bold text-gray-900 hover:text-[var(--olive)] transition-colors"
                      >
                        +91 9940620019
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form below */}
            <div
              ref={formRef.ref}
              className={`transition-all duration-1000 delay-300 max-w-3xl mx-auto ${formRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <div className="bg-white rounded-[1rem] p-8 md:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.1)] border border-gray-100 relative min-h-[500px] flex flex-col justify-center">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-50 text-[var(--olive)] rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-sm animate-scale-in">
                      <CheckCircle2 className="w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                      Inquiry Submitted Successfully!
                    </h3>
                    <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed font-light">
                      Thank you for your corporate query. We have received your
                      request and our team will get back to you soon!
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-3.5 rounded-xl bg-[var(--olive)] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all shadow-lg cursor-pointer hover:-translate-y-0.5"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          {t.corporate_orders.company_name}
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Tradizions Inc."
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          {t.corporate_orders.contact_person}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          {t.corporate_orders.work_email}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@company.com"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Phone / Mobile
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9025821501"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          {t.corporate_orders.quantity}
                        </label>
                        <div className="relative">
                          <select
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium appearance-none"
                          >
                            <option value="10 - 50">10 - 50</option>
                            <option value="50 - 200">50 - 200</option>
                            <option value="200 - 500">200 - 500</option>
                            <option value="500+">500+</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        {t.corporate_orders.tell_us}
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Special packaging, event date, etc."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium resize-none"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 rounded-2xl bg-[var(--olive)] text-white font-bold text-[12px] tracking-[0.25em] shadow-xl shadow-[var(--olive)]/20 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all uppercase cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "SUBMITTING..."
                        : t.corporate_orders.submit_inquiry}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      {/* <section className="py-20 bg-[var(--site-bg)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <span className="text-xl font-bold tracking-widest">
              TRUSTED BY
            </span>
            <span className="text-xl font-black tracking-tighter italic">
              CORP-X
            </span>
            <span className="text-xl font-black tracking-tighter italic">
              TECH-GLOBAL
            </span>
            <span className="text-xl font-black tracking-tighter italic">
              VITALITY
            </span>
            <span className="text-xl font-black tracking-tighter italic">
              HERITAGE-CO
            </span>
          </div>
        </div>
      </section> */}
    </main>
  );
}
