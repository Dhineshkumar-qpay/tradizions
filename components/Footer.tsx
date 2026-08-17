"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

export default function Footer() {
  const socialLinks = [
    { icon: "https://cdn-icons-png.flaticon.com/128/145/145802.png", href: "#" },
    { icon: "https://cdn-icons-png.flaticon.com/128/3955/3955024.png", href: "#" },
    { icon: "https://cdn-icons-png.flaticon.com/128/2168/2168336.png", href: "#" },
    { icon: "https://cdn-icons-png.flaticon.com/128/3670/3670147.png", href: "#" },
  ];
  const currentYear = new Date().getFullYear();

  const [selectedLang, setSelectedLang] = useState("EN");
  const t = translations[selectedLang] || translations["EN"];

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setToastMessage(null);

    try {
      await API.post(API_ROUTES.NEWSLETTER, { email });
      setToastMessage({
        type: "success",
        text: "Successfully subscribed to newsletter!",
      });
      setEmail("");
    } catch (err: any) {
      console.log(err);
      if (err.response?.status === 400) {
        setToastMessage({
          type: "error",
          text:
            err.response?.data?.message ||
            "Invalid email or already subscribed.",
        });
      } else {
        setToastMessage({
          type: "error",
          text:
            err.response?.message ?? "Failed to subscribe. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  useEffect(() => {
    const updateLang = () => {
      const savedLang = localStorage.getItem("selectedLang");
      if (savedLang && translations[savedLang]) {
        setSelectedLang(savedLang);
      }
    };

    updateLang();
    window.addEventListener("languageChange", updateLang);
    return () => window.removeEventListener("languageChange", updateLang);
  }, []);

  return (
    <footer className="bg-gradient-to-br from-[var(--olive)] to-[var(--olive-dark)] text-white relative mt-20 rounded-t-[40px] md:rounded-t-[60px] overflow-hidden shadow-[0_-10px_40px_rgba(22,163,74,0.15)] border-t border-[var(--olive-dark)]/50">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[var(--olive)]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--orange)]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Newsletter Box (Span 8) */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 flex flex-col justify-between backdrop-blur-sm">
            <div className="max-w-xl mb-8">
              <h4 className="text-[12px] font-black tracking-[0.2em] uppercase text-[var(--orange)] mb-4">
                {t.newsletter}
              </h4>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{t.newsletter_text}</h2>
              <p className="text-white/60 text-[14px]">Join our community to get the latest updates, exclusive offers, and nutrition tips delivered directly to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="relative max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                placeholder={t.contact_us?.email || "Enter your email address"}
                className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-[var(--orange)] focus:bg-black/60 transition-all text-[14px] font-medium placeholder-white/40"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--orange)] flex items-center justify-center hover:bg-white hover:text-[var(--orange)] transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>

          {/* Contact Box (Span 4) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] text-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_40px_rgba(234,88,12,0.25)]">
            <h4 className="text-[12px] font-black tracking-[0.2em] uppercase text-white/90 mb-8">
              Get in Touch
            </h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-[14px] font-medium leading-relaxed mt-1">{t.address}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <a href="tel:+919940620019" className="text-[14px] font-medium hover:underline">
                  +91 99406 20019
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <a href="mailto:support@tradizions.com" className="text-[14px] font-medium hover:underline">
                  tradizions@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Brand Box (Span 4) */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <Link href="/" className="inline-block mb-8">
                <div className="p-4 bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/app-logo-new.png"
                    alt="Tradizions Logo"
                    width={140}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
              <p className="text-[14px] text-white/60 font-medium leading-relaxed mb-8">
                {t.footer_description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[var(--orange)] border border-white/5 flex items-center justify-center transition-all duration-300 group"
                >
                  <img src={icon} alt="Social Icon" className="w-5 h-5 object-contain transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links & Policies Box (Span 8) */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-12 backdrop-blur-sm">
            <div className="flex-1">
              <h4 className="text-[12px] font-black tracking-[0.2em] uppercase text-[var(--orange)] mb-8">
                {t.quick_links}
              </h4>
              <ul className="space-y-4">
                {[
                  { name: t.aboutUs, path: "/about-us" },
                  { name: t.contactUs, path: "/contact-us" },
                  { name: t.myAccount, path: "/my-account" },
                  { name: t.blog || "Blog", path: "/blog" },
                  { name: t.nutritionGuides || "Guides & Nutrition", path: "/nutrition-guides" },
                ].map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-[14px] font-medium text-white/60 hover:text-white flex items-center gap-3 group transition-colors duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <h4 className="text-[12px] font-black tracking-[0.2em] uppercase text-[var(--orange)] mb-8">
                {t.policies}
              </h4>
              <ul className="space-y-4">
                {[
                  { name: t.terms, path: "/policies/terms-and-conditions" },
                  { name: t.privacyPolicy, path: "/policies/privacy-policy" },
                  { name: t.faqs, path: "/policies/faqs" },
                  { name: t.shipping, path: "/policies/shipping-policy" },
                  { name: t.cancellation, path: "/policies/cancellation-policy" },
                ].map((policy) => {
                  if (!policy.name) return null;
                  return (
                    <li key={policy.path}>
                      <Link
                        href={policy.path}
                        className="text-[14px] font-medium text-white/60 hover:text-white flex items-center gap-3 group transition-colors duration-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{policy.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[12px] font-bold tracking-wider text-white/40 uppercase">
            © {currentYear} TRADIZIONS. All rights reserved.
          </p>

          <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/5">
            <span className="w-6 h-[2px] bg-[var(--orange)]" />
            <span className="text-[11px] font-black text-white/90 tracking-[0.3em] uppercase">
              {t.purely_traditional || "Purely Traditional"}
            </span>
            <span className="w-6 h-[2px] bg-[var(--orange)]" />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div
            className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-[13px] font-bold tracking-wide ${toastMessage.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
          >
            {toastMessage.text}
          </div>
        </div>
      )}
    </footer>
  );
}

