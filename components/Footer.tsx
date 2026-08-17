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
    <footer className="bg-stone-50 border-t border-stone-200 pt-20 pb-10 relative mt-20">
      {/* Subtle Corporate Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--olive)] via-[var(--orange)] to-[var(--olive)]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 mb-16">

          {/* Brand & Contact (Span 4) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col">
            <Link href="/" className="inline-block mb-6">
              <Image src="/app-logo-new.png" alt="Tradizions" width={140} height={42} className="object-contain" />
            </Link>
            <p className="text-sm text-stone-600 leading-relaxed mb-8 max-w-sm">
              {t.footer_description}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <MapPin className="w-4 h-4 text-[var(--olive)]" />
                <span>{t.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Phone className="w-4 h-4 text-[var(--olive)]" />
                <a href="tel:+919940620019" className="hover:text-[var(--olive)] transition-colors">+91 99406 20019</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Mail className="w-4 h-4 text-[var(--olive)]" />
                <a href="mailto:tradizions@gmail.com" className="hover:text-[var(--olive)] transition-colors">tradizions@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Quick Links (Span 2) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-6">{t.quick_links}</h4>
            <ul className="space-y-4">
              {[
                { name: t.aboutUs, path: "/about-us" },
                { name: t.contactUs, path: "/contact-us" },
                { name: t.myAccount, path: "/my-account" },
                { name: t.blog || "Blog", path: "/blog" },
                { name: t.nutritionGuides || "Guides & Nutrition", path: "/nutrition-guides" },
              ].map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-sm text-stone-500 hover:text-[var(--olive)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies (Span 2) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-6">{t.policies}</h4>
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
                    <Link href={policy.path} className="text-sm text-stone-500 hover:text-[var(--olive)] transition-colors">
                      {policy.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter (Span 4) */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-6">{t.newsletter}</h4>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Subscribe to our corporate newsletter for exclusive gifting guides, bulk order discounts, and industry trends.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                placeholder={t.contact_us?.email || "Email address"}
                className="w-full bg-white border border-stone-200 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:border-[var(--olive)] focus:ring-1 focus:ring-[var(--olive)] transition-all text-sm font-medium placeholder-stone-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 w-8 h-8 rounded-md bg-[var(--olive)] text-white flex items-center justify-center hover:bg-[var(--olive-dark)] transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>

            <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.2em] mb-4">Connect With Us</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:border-[var(--olive)] hover:shadow-sm transition-all group"
                >
                  <img src={icon} alt="Social Icon" className="w-4 h-4 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
            © {currentYear} TRADIZIONS. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase">
              {t.purely_traditional || "Purely Traditional"}
            </span>
          </div>

          <p className="text-[11px] font-semibold text-stone-500">
            Designed for Corporate Excellence
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 text-[13px] font-bold tracking-wide ${toastMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {toastMessage.text}
          </div>
        </div>
      )}
    </footer>
  );
}

