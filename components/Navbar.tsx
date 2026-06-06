"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronRight,
  Globe,
  Leaf,
  Gift,
  Star,
  Zap,
  Coffee,
  User,
  LogOut,
  MapPin,
  Settings,
  Heart,
  Loader2,
  Check,
} from "lucide-react";
import Image from "next/image";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { ResponseModel, VerifyOTPModel } from "@/models/auth_model";

// Import language JSON files
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileCatsOpen, setIsMobileCatsOpen] = useState(false);
  const [isMobileGiftingOpen, setIsMobileGiftingOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "true"
    ) {
      try {
        const response = await API.post(API_ROUTES.CARTCOUNT);
        if (response.status === 200) {
          setCartCount(response.data?.data || 0);
        }
      } catch (err) {
        console.error("Error fetching cart count:", err);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("loginSuccess", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, []);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);

  // Search States & Logic
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await API.post(API_ROUTES.SEARCHPRODUCTS, {
          search: searchQuery,
        });
        if (response.status === 200 && response.data?.data) {
          setSuggestions(response.data.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Language State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [shouldRedirectToAccount, setShouldRedirectToAccount] = useState(false);

  // Login States
  const [loginStep, setLoginStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");

  const pathname = usePathname();
  const router = useRouter();

  // Handle default language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang");
    if (savedLang && translations[savedLang]) {
      setSelectedLang(savedLang);
    }
  }, []);

  const t = translations[selectedLang] || translations["EN"];

  useEffect(() => {
    const handleOpenLogin = (e: any) => {
      setShouldRedirectToAccount(e.detail?.redirect ?? false);
      setIsDrawerOpen(true);
    };
    window.addEventListener(
      "openLoginSidebar",
      handleOpenLogin as EventListener,
    );
    return () =>
      window.removeEventListener(
        "openLoginSidebar",
        handleOpenLogin as EventListener,
      );
  }, []);

  useEffect(() => {
    // Load logged in state
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
      const savedMobile = localStorage.getItem("userMobile");
      if (savedMobile) setMobile(savedMobile);
    }

    let interval: NodeJS.Timeout;
    if (loginStep === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [loginStep, timer]);

  const handleLangChange = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem("selectedLang", code);
    window.dispatchEvent(new Event("languageChange"));
    setIsLangOpen(false);
  };

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit number.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post<ResponseModel>(API_ROUTES.SENDOTP, {
        phone: mobile,
      });
      if (response.status === 200) {
        setLoginStep("otp");
        setTimer(30);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(
        err?.response?.data?.message || "Error sending OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter complete OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post<VerifyOTPModel>(API_ROUTES.VERIFYOTP, {
        phone: mobile,
        otp: Number(enteredOtp),
      });
      if (response.status === 200 && response.data.data?.token) {
        const token = response.data.data.token;
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userMobile", mobile);
        localStorage.setItem("token", token);
        setLoginStep("mobile");
        setOtp(["", "", "", "", "", ""]);
        setIsDrawerOpen(false);

        // Dispatch dynamic success indicator event so other pages execute their queued actions
        window.dispatchEvent(new Event("loginSuccess"));

        if (shouldRedirectToAccount) {
          router.push("/my-account");
        }
      } else {
        setError("Invalid OTP or server error. Please try again.");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(
        err?.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [apiCategories, setApiCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await API.post(API_ROUTES.CATEGORIES, { type: "all" });
        if (response.status === 200) {
          setApiCategories(response.data["data"] || []);
        }
      } catch (err) {
        console.error("Error fetching categories for navbar:", err);
      }
    };
    fetchCats();
  }, []);

  const staticCategories = [
    {
      name: t.sections.nuts,
      href: "/shop?category=Dry Fruits",
      desc: t.dry_fruits_desc,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      name: t.sections.millets,
      href: "/shop?category=Millets",
      desc: t.millets_desc,
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      name: t.health_malts,
      href: "/shop?category=Malts",
      desc: t.malts_desc,
      icon: <Coffee className="w-5 h-5" />,
    },
    {
      name: t.gift,
      href: "/shop?category=Gifts",
      desc: t.gifts_menu_desc,
      icon: <Gift className="w-5 h-5" />,
    },
    {
      name: t.pooja,
      href: "/shop?category=Pooja",
      desc: t.pooja_desc_menu,
      icon: <Star className="w-5 h-5" />,
    },
  ];

  const iconList = [
    <Zap className="w-5 h-5" key="zap" />,
    <Leaf className="w-5 h-5" key="leaf" />,
    <Coffee className="w-5 h-5" key="coffee" />,
    <Gift className="w-5 h-5" key="gift" />,
    <Star className="w-5 h-5" key="star" />,
  ];

  const displayCategories =
    apiCategories.length > 0
      ? apiCategories.map((cat, idx) => ({
        name: cat.categoryname,
        href: `/shop?category=${encodeURIComponent(cat.categoryname)}`,
        desc: cat.description || "Explore premium organic products",
        icon: iconList[idx % iconList.length],
      }))
      : staticCategories;

  const navItems = [
    { name: t.home, href: "/" },
    { name: t.shop, href: "/shop" },
  ];

  const secondaryNavItems = [{ name: t.contactUs, href: "/contact-us" }];

  const languages = [
    { code: "EN", name: "English" },
    { code: "TA", name: "Tamil" },
    { code: "HI", name: "Hindi" },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 transition-all duration-500">
        {/* Top Announcement Bar */}
        <div className="w-full bg-[var(--olive-dark)] text-white text-[11px] md:text-[13px] font-medium py-2 text-center tracking-wide">
          Powered By-TRADIZIONS. Freshness Delivered Daily! | Free Shipping on Orders ₹999+ | 100% Natural, No Preservatives!
        </div>

        <nav className="w-full h-[75px] bg-white border-b border-gray-100 shadow-sm px-6 lg:px-12 flex items-center justify-between pointer-events-auto relative">

          <div className="flex items-center gap-8 lg:gap-12">
            {/* Logo Section */}
            <div className="flex-shrink-0 z-10">
              <Link href="/" className="block">
                <div className="relative overflow-hidden transition-transform duration-500">
                  <Image
                    src="/app-logo.png"
                    alt="Logo"
                    width={110}
                    height={45}
                    className="object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 z-0 pt-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 text-[12.5px] tracking-[0.1em] font-medium uppercase transition-all duration-300 whitespace-nowrap ${isActive ? "text-[#1a1a1a]" : "text-[#4a4a4a] hover:text-[#1a1a1a]"}`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#1a1a1a]" />
                    )}
                  </Link>
                );
              })}

              {/* Categories Megamenu Dropdown */}
              <div className="relative group/mega">
                <button className="flex items-center gap-1 py-2 text-[12.5px] tracking-[0.1em] font-medium uppercase text-[#4a4a4a] hover:text-[#1a1a1a] transition-all duration-300 whitespace-nowrap">
                  {t.categories}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/mega:rotate-180" />
                </button>

                {/* Redesigned Premium Dropdown */}
                <div className="absolute top-full -left-4 pt-5 opacity-0 translate-y-2 pointer-events-none group-hover/mega:opacity-100 group-hover/mega:translate-y-0 group-hover/mega:pointer-events-auto transition-all duration-300">
                  <div className="w-56 bg-[#faf8f3] backdrop-blur-xl rounded-2xl shadow-[0_16px_48px_rgba(85,107,47,0.14)] border border-[#e8dfc8] py-2 overflow-hidden">
                    <div className="px-4 py-2 mb-1 border-b border-[#e8dfc8]">
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase text-[var(--olive)]/60">{t.categories}</span>
                    </div>
                    {displayCategories.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="flex items-center gap-3 mx-2 px-3 py-2.5 text-[11px] font-semibold text-[#5a5248] hover:bg-[var(--olive)]/8 hover:text-[var(--olive)] rounded-xl transition-all duration-200 group/item"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]/30 group-hover/item:bg-[var(--olive)] transition-colors flex-shrink-0" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gifting Dropdown */}
              <div className="relative group/gifting">
                <button className="flex items-center gap-1 py-2 text-[12.5px] tracking-[0.1em] font-medium uppercase text-[#4a4a4a] hover:text-[#1a1a1a] transition-all duration-300 whitespace-nowrap">
                  {t.gifting}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/gifting:rotate-180" />
                </button>

                <div className="absolute top-full left-0 pt-5 opacity-0 translate-y-2 pointer-events-none group-hover/gifting:opacity-100 group-hover/gifting:translate-y-0 group-hover/gifting:pointer-events-auto transition-all duration-300">
                  <div className="w-48 bg-[#faf8f3] backdrop-blur-xl rounded-2xl shadow-[0_16px_48px_rgba(85,107,47,0.14)] border border-[#e8dfc8] py-2 overflow-hidden">
                    <div className="px-4 py-2 mb-1 border-b border-[#e8dfc8]">
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase text-[var(--olive)]/60">{t.gifting}</span>
                    </div>
                    <Link
                      href="/gifts"
                      className="flex items-center gap-3 mx-2 px-3 py-2.5 text-[11px] font-semibold text-[#5a5248] hover:bg-[var(--olive)]/8 hover:text-[var(--olive)] rounded-xl transition-all duration-200 group/item"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]/30 group-hover/item:bg-[var(--olive)] transition-colors flex-shrink-0" />
                      {t.occasional}
                    </Link>
                    <Link
                      href="/corporate-orders"
                      className="flex items-center gap-3 mx-2 px-3 py-2.5 text-[11px] font-semibold text-[#5a5248] hover:bg-[var(--olive)]/8 hover:text-[var(--olive)] rounded-xl transition-all duration-200 group/item"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]/30 group-hover/item:bg-[var(--olive)] transition-colors flex-shrink-0" />
                      {t.corporate}
                    </Link>
                  </div>
                </div>
              </div>

              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 text-[12.5px] tracking-[0.1em] font-medium uppercase transition-all duration-300 whitespace-nowrap ${isActive ? "text-[#1a1a1a]" : "text-[#4a4a4a] hover:text-[#1a1a1a]"}`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#1a1a1a]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Right Section */}
          <div className="flex items-center gap-3 lg:gap-5 flex-1 justify-end z-10">
            {/* Professional Language Selection */}
            <div className="hidden md:block relative group/langdrop">
              <button
                className="group flex items-center h-10 gap-2 px-4 rounded-full bg-white/70 backdrop-blur-md border border-[#e0d4b7] hover:border-[var(--olive)] hover:shadow-md transition-all duration-500 cursor-default"
              >
                <Globe
                  className="w-[15px] h-[15px] text-[#6b6455] group-hover:text-[var(--olive)] transition-colors duration-300"
                />
                <span className="text-[11px] font-black tracking-[0.2em] uppercase text-[#4a4438] group-hover:text-[var(--olive)] transition-colors duration-300">
                  {selectedLang}
                </span>
                <ChevronDown
                  className="w-3 h-3 text-[#9e9080] group-hover:rotate-180 transition-transform duration-300"
                />
              </button>

              {/* Stylish Dropdown Card */}
              <div className="absolute top-full right-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/langdrop:opacity-100 group-hover/langdrop:translate-y-0 group-hover/langdrop:pointer-events-auto transition-all duration-300 z-50">
                <div className="w-40 bg-white/95 backdrop-blur-2xl border border-white/40 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--olive)]/5 to-[var(--orange)]/5 pointer-events-none" />
                  <div className="p-2 relative z-10 flex flex-col gap-1">
                    {languages.map((lang) => {
                      const isActive = selectedLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLangChange(lang.code)}
                          className={`relative w-full flex items-center justify-between px-4 py-2.5 rounded-[1rem] text-[10px] font-black tracking-widest uppercase transition-all duration-300 overflow-hidden group/item ${isActive
                            ? "text-white shadow-md"
                            : "text-stone-500 hover:text-[var(--olive)] hover:bg-white/80"
                            }`}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--olive)] to-[#6b853b] -z-10" />
                          )}
                          <span className="relative z-10">{lang.name}</span>
                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-white relative z-10" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-[#e8dfc8] bg-white/70 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all duration-300 shadow-sm"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <Link href="/cart" className="relative">
              <div className="relative group p-2.5 rounded-full border border-[#e8dfc8] bg-white/70 hover:bg-[var(--olive)] hover:border-[var(--olive)] transition-all duration-300 cursor-pointer block shadow-sm">
                <ShoppingCart className="w-[18px] h-[18px] text-[var(--olive)] group-hover:text-white transition-colors duration-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--orange)] text-[9px] font-black text-white ring-2 ring-[#faf8f3]">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            <div className="relative">
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    router.push("/my-account");
                  } else {
                    setShouldRedirectToAccount(true);
                    setIsDrawerOpen(true);
                  }
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-[#e8dfc8] bg-white/70 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all duration-300 shadow-sm hover:shadow-[0_6px_20px_rgba(85,107,47,0.25)]"
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2.5 rounded-full border border-[#e8dfc8] bg-white/70 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all duration-300 shadow-sm"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out pointer-events-auto mx-4 md:mx-8 ${open ? "max-h-screen shadow-xl mt-2 rounded-[2rem] border border-stone-200/80" : "max-h-0"}`}
        >
          <div className="bg-[#faf8f3]/98 backdrop-blur-md px-6 py-8 overflow-y-auto max-h-[85vh] space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <Link
                href="/"
                className="text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.home}
              </Link>
              <Link
                href="/shop"
                className="text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.shop}
              </Link>

              {/* Mobile Categories Collapsible */}
              <div className="space-y-4">
                <button
                  onClick={() => setIsMobileCatsOpen(!isMobileCatsOpen)}
                  className="w-full flex items-center justify-between text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                >
                  {t.categories}
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${isMobileCatsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${isMobileCatsOpen ? "max-h-[600px] mb-4" : "max-h-0"}`}
                >
                  <div className="grid grid-cols-1 gap-4 pl-4 pt-2">
                    {displayCategories.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="flex items-center gap-3 py-2 text-gray-600 font-medium"
                        onClick={() => setOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Gifting Collapsible */}
              <div className="space-y-4">
                <button
                  onClick={() => setIsMobileGiftingOpen(!isMobileGiftingOpen)}
                  className="w-full flex items-center justify-between text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                >
                  {t.gifting}
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${isMobileGiftingOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${isMobileGiftingOpen ? "max-h-[200px] mb-4" : "max-h-0"}`}
                >
                  <div className="grid grid-cols-1 gap-2 pl-4 pt-2">
                    <Link
                      href="/gifts"
                      className="py-2 text-gray-600 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {t.occasional}
                    </Link>
                    <Link
                      href="/corporate-orders"
                      className="py-2 text-gray-600 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {t.corporate}
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/contact-us"
                className="text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.contactUs}
              </Link>

              {/* Mobile Language Selection */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  {t.preferredLang}
                </p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`flex-1 py-3 rounded-xl border text-[11px] font-bold tracking-widest transition-all ${selectedLang === lang.code
                        ? "bg-[var(--olive)] text-white border-[var(--olive)] shadow-lg shadow-[var(--olive)]/20"
                        : "bg-white text-gray-500 border-[#e0d4b7] hover:bg-gray-50"
                        }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="block w-full py-3.5 text-center rounded-2xl bg-[var(--cream)] text-[var(--olive)] border border-gray-100 font-bold tracking-widest text-[12px] shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                setOpen(false);
                if (isLoggedIn) {
                  router.push("/my-account");
                } else {
                  setShouldRedirectToAccount(true);
                  setIsDrawerOpen(true);
                }
              }}
            >
              {t.myAccount}
            </button>
          </div>
        </div>
      </div>

      {/* --- Overlay --- */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* --- Right Side Drawer --- */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 bg-white/50 backdrop-blur-sm transition-colors z-20"
          >
            <X
              className={`w-5 h-5 ${isLoggedIn ? "text-white" : "text-gray-500"}`}
            />
          </button>

          {/* We only render the Drawer content for Login flow. */}
          {!isLoggedIn && (
            // --- LOGIN FLOW ---
            <div className="flex-1 flex flex-col px-10 py-20 animate-fade-in-right">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                  {t.welcomeBack}
                </h2>
                <p className="text-gray-500 text-sm">{t.signIn}</p>
              </div>

              {loginStep === "mobile" ? (
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                      {t.mobileNumber}
                    </label>
                    <div className="flex group focus-within:ring-2 focus-within:ring-[var(--olive)]/20 rounded-xl transition-all">
                      <div className="flex items-center justify-center px-4 border border-gray-200 border-r-0 rounded-l-xl bg-gray-50 text-gray-500 font-medium text-sm group-focus-within:border-[var(--olive)]">
                        +91
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="Enter 10 digit number"
                        className="w-full border border-gray-200 rounded-r-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none group-focus-within:border-[var(--olive)] transition-colors placeholder:text-gray-300 placeholder:font-medium"
                        value={mobile}
                        onChange={(e) =>
                          setMobile(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-xs mt-2 font-bold animate-fade-in-up">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || mobile.length < 10}
                    className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t.sendOtp
                    )}
                  </button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
                      <span className="bg-white px-4 text-gray-400">
                        {t.orContinueWith}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-[13px] tracking-wide hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      />
                    </svg>
                    <span>{t.loginGoogle}</span>
                  </button>
                  <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed px-4">
                    {t.termsText} <br />{" "}
                    <Link
                      href="/policies/terms-and-conditions"
                      onClick={() => {
                        setIsDrawerOpen(false);
                      }}
                      className="underline hover:text-[var(--olive)]"
                    >
                      {t.termsLink}
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/policies/privacy-policy"
                      onClick={() => {
                        setIsDrawerOpen(false);
                      }}
                      className="underline hover:text-[var(--olive)]"
                    >
                      {t.privacyLink}
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 animate-fade-in-right">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                      {t.enterOtp}
                    </label>
                    <p className="text-xs text-gray-500 mb-6">
                      {t.sentCodeTo}{" "}
                      <span className="font-bold text-gray-900">
                        +91 {mobile}
                      </span>
                    </p>

                    <div className="flex justify-between gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={`otp-${idx}`}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          className="w-12 h-14 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:outline-none focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/20 transition-all bg-gray-50 focus:bg-white"
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const newOtp = [...otp];
                            newOtp[idx] = val;
                            setOtp(newOtp);
                            if (val && idx < 5) {
                              document
                                .getElementById(`otp-${idx + 1}`)
                                ?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                              document
                                .getElementById(`otp-${idx - 1}`)
                                ?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    {error && (
                      <p className="text-red-500 text-xs mt-3 font-bold animate-fade-in-up">
                        {error}
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--orange)] mt-2 font-bold bg-orange-50 w-fit px-2 py-1 rounded-md border border-orange-100">
                      Hint: Use 123456
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setLoginStep("mobile");
                        setOtp(["", "", "", "", "", ""]);
                        setError("");
                      }}
                      className="text-[11px] font-bold tracking-wide text-gray-500 hover:text-[var(--olive)] transition-colors"
                    >
                      {t.changeNumber}
                    </button>
                    <button
                      disabled={timer > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="text-[11px] font-bold tracking-wide text-[var(--orange)] disabled:text-gray-400 transition-colors"
                    >
                      {timer > 0
                        ? `${t.resendIn} 00:${timer.toString().padStart(2, "0")}`
                        : t.resendOtp}
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.join("").length < 6}
                    className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t.verifyLogin
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col animate-fade-in-up">
          {/* Top Search Bar */}
          <div className="w-full bg-white py-4 px-6 md:px-12 flex items-center justify-center shrink-0 shadow-sm relative z-20">
            <div className="w-full max-w-[1400px] flex items-center gap-4">
              <div className="flex-1 bg-white flex items-center px-4 py-3 border border-gray-200 focus-within:border-gray-300 transition-colors">
                <Search className="w-5 h-5 text-gray-500 mr-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder={t.searchPlaceholder || "Search products"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-[16px] bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
              >
                <X className="w-7 h-7 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Body Area */}
          <div className="flex-1 relative w-full flex justify-center bg-transparent min-h-0">
            {/* Dark background when empty */}
            {searchQuery.trim() === "" && (
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" 
                onClick={() => setIsSearchOpen(false)}
              />
            )}

            {/* Results Container */}
            {searchQuery.trim() !== "" && (
              <div className="absolute inset-0 z-10 w-full bg-[#fcfcfc] flex justify-center overflow-y-auto">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-32 text-[var(--olive)] w-full">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-medium text-gray-500">{t.navbar?.searching || "Searching..."}</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-400 w-full">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">{t.navbar?.no_products || "No products found"}</p>
                  </div>
                ) : (
                  <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8">
                    {/* Products Grid */}
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-[16px]">Products</h3>
                        <Link 
                          href={`/shop?search=${encodeURIComponent(searchQuery)}`} 
                          onClick={() => { setIsSearchOpen(false); setSuggestions([]); }}
                          className="text-[13px] text-[var(--olive)] font-bold hover:text-blue-800 underline"
                        >
                          View all products
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {suggestions.map((product) => {
                          const isGift =
                            product.categoryid === 4 ||
                            product.categoryid === 5 ||
                            product.itemtype === "gift" ||
                            (product.category && product.category.toLowerCase().includes("gift"));
                          const detailUrl = isGift
                            ? `/gift-detail/${product.productid}?productid=${product.productid}&bid=1`
                            : `/product-detail/${product.productid}?productid=${product.productid}&bid=1`;

                          const finalPrice = product.sellingprice === 0 || product.sellingprice == null
                            ? product.price
                            : product.sellingprice;

                          return (
                            <Link
                              key={product.productid}
                              href={detailUrl}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSuggestions([]);
                              }}
                              className="group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/60"
                            >
                              <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                <img
                                  src={IMAGE_URL + (product.productimage || "/placeholder.jpg")}
                                  alt={product.productname}
                                  className={`w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110 ${(product.stock <= 0 || product.availablestock <= 0) ? "grayscale opacity-60" : ""}`}
                                />
                                {(() => {
                                  const origPrice = product.price || 0;
                                  const salePrice = product.sellingprice === 0 || product.sellingprice == null ? origPrice : product.sellingprice;
                                  const discountPercent = origPrice > salePrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;
                                  if (discountPercent > 0 && product.stock > 0 && product.availablestock > 0) {
                                    return (
                                      <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
                                        {discountPercent}% OFF
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                                {(product.stock <= 0 || product.availablestock <= 0) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                                    <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
                                      OUT OF STOCK
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="p-4 flex flex-col flex-1 space-y-3">
                                <div className="space-y-1">
                                  <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                                    {product.productname}
                                  </h3>
                                  <p className="text-[12px] text-gray-400 font-medium line-clamp-1 flex-1">
                                    {product.description || product.desc || product.brandname || product.category || "Premium dry fruits gift hamper packed with..."}
                                  </p>
                                </div>
                                
                                <div className="flex items-baseline gap-2 pt-1">
                                  <span className="text-[20px] font-black text-gray-900">
                                    ₹{finalPrice?.toLocaleString()}
                                  </span>
                                  {product.price > finalPrice && (
                                    <span className="text-[13px] text-gray-400 line-through font-medium">
                                      ₹{product.price?.toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                <div className="pt-2 mt-auto">
                                  <div className={`w-full py-3 px-4 rounded-xl font-bold text-[11px] tracking-widest flex items-center justify-between transition-colors duration-300 group/btn ${(product.stock <= 0 || product.availablestock <= 0)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-[#f4f6f1] text-[#4b553e] hover:bg-[#e8ece1] cursor-pointer"
                                    }`}
                                  >
                                    <span>
                                      {(product.stock <= 0 || product.availablestock <= 0)
                                        ? "OUT OF STOCK"
                                        : "ADD TO CART"}
                                    </span>
                                    <ShoppingCart className="w-4 h-4 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
