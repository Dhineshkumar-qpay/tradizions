"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Briefcase,
  MessageSquare,
  Heart,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";

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

export default function ContactUsPageClient() {
  const [loaded, setLoaded] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
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
      const response = await API.post(API_ROUTES.ADDNORMALCONTACTUS, {
        name,
        phone: mobile,
        email,
        description: message,
      });
      console.log(response.data);
      
      if (response.status === 200) {
        setIsSubmitted(true);
        setName("");
        setMobile("");
        setEmail("");
        setMessage("");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("Error sending contact message:", err);
      alert(
        err?.response?.data?.message ||
          "An error occurred while sending your message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerRef = useInView();
  const infoRef = useInView();
  const formRef = useInView();

  return (
    <main className="min-h-screen bg-[var(--site-bg)] overflow-x-hidden">
      {/* ── HERO SECTION ── */}
      <section
        ref={headerRef.ref}
        className="relative py-16 overflow-hidden flex items-center justify-center bg-[var(--site-bg)] border-b border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div
            className={`inline-flex items-center gap-3 justify-center w-full mb-6 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <span className="w-8 h-px bg-[var(--orange)]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--olive)] flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              {t.contact_us.connect}
            </span>
            <span className="w-8 h-px bg-[var(--orange)]" />
          </div>

          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.contact_us.hear_from_you.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-[var(--orange)] font-light">
              {t.contact_us.hear_from_you.split(" ").slice(-2).join(" ")}
            </span>
          </h1>

          <p
            className={`text-sm md:text-md text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.contact_us.desc}
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* ── LEFT SIDE: Contact Info ── */}
          <div
            ref={infoRef.ref}
            className={`w-full lg:w-5/12 space-y-10 transition-all duration-1000 ${infoRef.isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-[1px] bg-[var(--olive)]" />
                <h2 className="text-[11px] font-bold text-[var(--olive)] tracking-[0.4em] uppercase">
                  {t.contact_us.hub}
                </h2>
              </div>
              <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {t.contact_us.comm.split(" ")[0]} <br />
                <span className="gradient-text">
                  {t.contact_us.comm.split(" ").slice(1).join(" ")}
                </span>
              </h3>
            </div>

            {/* Headquarters Card - Corporate */}
            <div className="corporate-card group p-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-gray-50 text-[var(--olive)] rounded-[var(--radius-sm)] border border-gray-100 flex items-center justify-center transition-transform duration-500 group-hover:bg-[var(--olive)] group-hover:text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    {t.contact_us.office_hours}
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    09:30 AM — 06:30 PM
                  </p>
                </div>
              </div>

              <div className="space-y-6 flex-grow">
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    {t.contact_us.hq}
                  </h4>
                </div>

                <p className="text-gray-500 leading-relaxed font-medium text-sm">
                  <span className="text-gray-900 uppercase tracking-widest font-bold block mb-1 text-xs">
                    Tradizions.
                  </span>
                  {t.address}
                </p>
              </div>

              <div className="pt-8 mt-8 border-t border-gray-100 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--olive)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--olive)]"></span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {t.contact_us.active_hub}
                  </span>
                </div>
                <button className="text-[10px] font-bold text-[var(--olive)] uppercase tracking-widest hover:text-[var(--orange)] transition-colors">
                  {t.contact_us.view_map} →
                </button>
              </div>
            </div>

            {/* Support & Relations */}
            <div className="grid grid-cols-1 gap-5">
              <div className="corporate-card flex items-center justify-between p-6 group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded border border-gray-100 flex items-center justify-center group-hover:bg-[var(--olive)] group-hover:text-white transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-0.5">
                      {t.contact_us.email_support}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      tradizions@gmail.com
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-[var(--orange)]" />
                </div>
              </div>

              <div className="corporate-card flex items-center justify-between p-6 group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded border border-gray-100 flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-0.5">
                      {t.contact_us.whatsapp_support}
                    </p>
                    <a
                      href="https://wa.me/919940620019"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-gray-900"
                    >
                      +91 99406 20019
                    </a>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-[#25D366]" />
                </div>
              </div>
            </div>

            <div className="corporate-card group p-10 overflow-hidden mt-5">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-[var(--olive)] rounded flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--olive)] group-hover:text-white">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500 block mb-1">
                      {t.corporate}
                    </span>
                    <h4 className="text-xl font-extrabold text-gray-900 tracking-tight">
                      {t.contact_us.enterprise}
                    </h4>
                  </div>
                </div>

                <p className="text-gray-500 leading-relaxed font-medium mb-8 text-sm max-w-sm">
                  {t.contact_us.enterprise_desc}
                </p>

                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover/item:bg-[var(--olive)] group-hover/item:text-white transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {t.contact_us.email_inquiries}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        partners@tradizions.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover/item:bg-[var(--olive)] group-hover/item:text-white transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {t.contact_us.contact_number}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        99406 20018
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE: Contact Form ── */}
          <div
            ref={formRef.ref}
            className={`w-full lg:w-7/12 transition-all duration-1000 delay-300 ${formRef.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            <div className="corporate-card p-8 md:p-12 min-h-[500px] flex flex-col justify-center">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-gray-50 text-[var(--olive)] rounded border border-gray-100 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    {t.contact_us.message_sent}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed font-medium">
                    {t.contact_us.message_sent_desc}
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-standard uppercase"
                  >
                    {t.contact_us.send_another}
                  </button>
                </div>
              ) : (
                <>
                  {/* Form Header */}
                  <div className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
                      {t.contact_us.send_message.split(" ")[0]}{" "}
                      {t.contact_us.send_message.split(" ")[1]}{" "}
                      <span className="text-[var(--orange)] font-light">
                        {t.contact_us.send_message.split(" ").slice(2).join(" ")}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      {t.contact_us.form_desc}
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase"
                        >
                          {t.contact_us.full_name}
                        </label>
                        <input
                          type="text"
                          id="name"
                          placeholder="e.g. Aditi Sharma"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="mobile"
                          className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase"
                        >
                          {t.contact_us.mobile}
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          placeholder="+91 00000 00000"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase"
                      >
                        {t.contact_us.email}
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="aditi@example.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase"
                      >
                        {t.contact_us.help_text}
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Describe your inquiry in detail..."
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--olive)] focus:border-[var(--olive)] transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-standard w-full py-4 uppercase"
                      >
                        {isSubmitting ? "SENDING..." : t.contact_us.submit}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Trust badges below form */}
              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-[var(--olive)]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
                    {t.contact_us.response_24h.split(" ")[0]} <br />{" "}
                    {t.contact_us.response_24h.split(" ").slice(1).join(" ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-[var(--orange)]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
                    {t.contact_us.expert_cons.split(" ")[0]} <br />{" "}
                    {t.contact_us.expert_cons.split(" ").slice(1).join(" ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP SECTION ── */}
      <section className="py-20 max-w-7xl mx-auto px-6 pb-32">
        <div className="relative h-[300px] w-full rounded-none overflow-hidden shadow-sm group border border-gray-200">
          <Image
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2033&auto=format&fit=crop"
            fill
            alt="Map location"
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
          />
          <div className="absolute inset-0 bg-gray-900/10 pointer-events-none" />

          <div className="absolute bottom-10 left-10 p-8 bg-white rounded-none border border-gray-200 shadow-sm max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-none bg-[var(--olive-dark)] flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                {t.contact_us.visit_hub}
              </h4>
            </div>
            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
              {t.contact_us.visit_desc}
            </p>
            <button
              className="flex items-center gap-2 text-xs font-bold text-[var(--olive-dark)] uppercase tracking-widest group-hover:text-[var(--orange)] transition-colors cursor-pointer"
              onClick={() =>
                window.open("https://www.google.com/maps", "_blank")
              }
            >
              {t.contact_us.directions} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
