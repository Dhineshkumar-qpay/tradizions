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

export default function ContactUsPage() {
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
        className="relative pt-40 lg:pt-48 pb-32 overflow-hidden flex items-center justify-center bg-white"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--olive)]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--orange)]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Floating shapes */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-emerald-100 rounded-full blur-xl animate-float opacity-50" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-amber-100 rounded-full blur-xl animate-float delay-700 opacity-50" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20 text-[11px] font-bold tracking-[0.25em] uppercase mb-8 shadow-sm transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <MessageSquare className="w-4 h-4" />
            {t.contact_us.connect}
          </div>

          <h1
            className={`text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {t.contact_us.hear_from_you.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="gradient-text">
              {t.contact_us.hear_from_you.split(" ").slice(-2).join(" ")}
            </span>
          </h1>

          <p
            className={`text-md md:text-md text-gray-500 leading-relaxed font-light max-w-2xl mx-auto transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
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

            {/* Headquarters Card - Redesigned */}
            <div className="group relative bg-white rounded-[2rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(85,107,47,0.1)]">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-[var(--olive)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--olive)]/20 transition-transform duration-500 group-hover:rotate-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {t.contact_us.office_hours}
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    09:30 AM — 06:30 PM
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {t.contact_us.hq}
                  </h4>
                  <div className="w-12 h-1 bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] rounded-full mb-4" />
                </div>

                <p className="text-gray-500 leading-relaxed font-light text-md">
                  <span className="text-gray-900 font-bold block mb-1">
                    Tradizions.
                  </span>
                  {t.address}
                </p>

                <div className="pt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t.contact_us.active_hub}
                    </span>
                  </div>
                  <button className="text-[10px] font-bold text-[var(--olive)] uppercase tracking-widest hover:text-[var(--orange)] transition-colors">
                    {t.contact_us.view_map} →
                  </button>
                </div>
              </div>
            </div>

            {/* Support & Relations - Redesigned to be more compact and premium */}
            <div className="grid grid-cols-1 gap-5">
              <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:bg-gray-50/50 group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-[var(--olive)]/10 group-hover:text-[var(--olive)] transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
                      Email Support
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      qpay@tradizions.com
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:bg-gray-50/50 group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-[var(--whatsapp)]/10 group-hover:text-[var(--whatsapp)] transition-all">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
                      WhatsApp Support
                    </p>
                    <a
                      href="https://wa.me/919940620019"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-gray-900"
                    >
                      +91 9940620019
                    </a>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_30px_70px_rgba(0,0,0,0.05)] transition-all duration-500 hover:border-[var(--olive)]/30 overflow-hidden">
              {/* Decorative Geometric Shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--olive)]/5 rounded-bl-full transition-transform duration-700 group-hover:scale-110" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-[var(--olive)]/10 text-[var(--olive)] rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-all duration-500">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[var(--olive)] opacity-60">
                      {t.corporate}
                    </span>
                    <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {t.contact_us.enterprise}
                    </h4>
                  </div>
                </div>

                <p className="text-gray-500 leading-relaxed font-light mb-10 text-md max-w-sm">
                  {t.contact_us.enterprise_desc}
                </p>

                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-[var(--orange)] group-hover/item:text-white transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Email Inquiries
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        partners@tradizions.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-[var(--orange)] group-hover/item:text-white transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Contact Number
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        99406 20018
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Accent */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--orange)]/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* ── RIGHT SIDE: Contact Form ── */}
          <div
            ref={formRef.ref}
            className={`w-full lg:w-7/12 transition-all duration-1000 delay-300 ${formRef.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_30px_70px_rgba(85,107,47,0.08)] border border-gray-100 relative min-h-[500px] flex flex-col justify-center">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-50 text-[var(--olive)] rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-sm animate-scale-in">
                    <CheckCircle2 className="w-10 h-10 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed font-light">
                    Thank you for reaching out. We have received your inquiry and our team will get back to you soon!
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-8 py-3.5 rounded-xl bg-[var(--olive)] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all shadow-lg cursor-pointer hover:-translate-y-0.5"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  {/* Form Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t.contact_us.send_message.split(" ")[0]}{" "}
                      {t.contact_us.send_message.split(" ")[1]}{" "}
                      <span className="text-[var(--olive)]">
                        {t.contact_us.send_message.split(" ").slice(2).join(" ")}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      {t.contact_us.form_desc}
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="name"
                          className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase ml-1"
                        >
                          {t.contact_us.full_name}
                        </label>
                        <input
                          type="text"
                          id="name"
                          placeholder="e.g. Aditi Sharma"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="mobile"
                          className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase ml-1"
                        >
                          {t.contact_us.mobile}
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          placeholder="+91 00000 00000"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label
                        htmlFor="email"
                        className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase ml-1"
                      >
                        {t.contact_us.email}
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="aditi@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label
                        htmlFor="message"
                        className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase ml-1"
                      >
                        {t.contact_us.help_text}
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Describe your inquiry in detail..."
                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300 resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full py-5 rounded-2xl bg-[var(--olive)] text-white font-bold text-[12px] tracking-[0.25em] shadow-xl shadow-[var(--olive)]/20 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 uppercase disabled:opacity-50"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {isSubmitting ? "SENDING..." : t.contact_us.submit}
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--olive-dark)] to-[var(--olive)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Trust badges below form */}
              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                    {t.contact_us.response_24h.split(" ")[0]} <br />{" "}
                    {t.contact_us.response_24h.split(" ").slice(1).join(" ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Heart className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
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
        <div className="relative h-[300px] w-full rounded-[1rem] overflow-hidden shadow-2xl group border border-white">
          <Image
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2033&auto=format&fit=crop"
            fill
            alt="Map location"
            className="object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          <div className="absolute bottom-10 left-10 p-8 glass rounded-[2rem] border border-white/20 shadow-2xl max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--orange)] flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {t.contact_us.visit_hub}
              </h4>
            </div>
            <p className="text-white/80 font-light text-sm leading-relaxed mb-6">
              {t.contact_us.visit_desc}
            </p>
            <button
              className="flex items-center gap-2 text-xs font-bold text-[var(--orange)] uppercase tracking-widest group-hover:gap-4 transition-all cursor-pointer"
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
