"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight, Leaf } from "lucide-react";

import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaTwitter as Twitter,
  FaYoutube as Youtube,
} from "react-icons/fa";
import { useEffect, useState } from "react";

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
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
  ];
  const currentYear = new Date().getFullYear();

  const [selectedLang, setSelectedLang] = useState("EN");
  const t = translations[selectedLang] || translations["EN"];

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
    <footer className="bg-[var(--olive-dark)] text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--orange)]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-white rounded-2xl transition-transform duration-500 group-hover:scale-110 shadow-xl">
                <Image
                  src="/app-logo.png"
                  alt="Tradizions Logo"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </div>
            </Link>

            <p className="text-sm text-white/70 font-light leading-relaxed max-w-sm">
             {t.footer_description}
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  className="p-3 rounded-full bg-white/10 hover:bg-[var(--orange)] transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--orange)]">
              {t.quick_links}
            </h4>
            <ul className="space-y-4 text-sm">
              {[
                { name: t.aboutUs, path: "/about-us" },
                { name: t.contactUs, path: "/contact-us" },
                { name: t.myAccount, path: "/my-account" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-white/60 hover:text-white flex items-center gap-2 group transition"
                  >
                    <span className="w-0 h-px bg-[var(--orange)] group-hover:w-4 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--orange)]">
              {t.policies}
            </h4>
            <ul className="space-y-4 text-sm">
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
                      className="text-white/60 hover:text-white flex items-center gap-2 group transition"
                    >
                      <span className="w-0 h-px bg-[var(--orange)] group-hover:w-4 transition-all duration-300" />
                      {policy.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="lg:col-span-4 space-y-10">
            {/* Newsletter */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--orange)]">
                {t.newsletter}
              </h4>

              <p className="text-white/60 text-sm">
                {t.newsletter_text}
              </p>

              <div className="relative">
                <input
                  type="email"
                  placeholder={t.contact_us?.email || "Your Email Address"}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/30"
                />

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--orange)] rounded-xl hover:bg-[#e67e00] transition"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4 text-white/70">
              <div className="flex items-start gap-4">
                <MapPin className="w-4 h-4 text-[var(--orange)] mt-1" />
                <span className="text-sm leading-relaxed">
                 {t.address}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="w-4 h-4 text-[var(--orange)]" />
                <a href="tel:+919940620019" className="text-sm">
                  +91 99406 20019
                </a>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-4 h-4 text-[var(--orange)]" />
                <a href="mailto:support@tradizions.com" className="text-sm">
                  support@tradizions.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-white/40">
            © {currentYear} TRADIZIONS. All rights reserved.
          </p>

          <div className="flex items-center gap-8">
            {[
              { name: t.aboutUs, path: "/about-us" },
              { name: t.contactUs, path: "/contact-us" },
              { name: t.myAccount, path: "/my-account" },
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-[10px] font-bold tracking-widest text-white/40 hover:text-white uppercase"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Leaf className="w-3 h-3 text-[var(--orange)]" />
            <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">
              {t.purely_traditional || "Purely Traditional"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
