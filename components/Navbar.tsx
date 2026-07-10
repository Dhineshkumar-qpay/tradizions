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
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { ResponseModel, VerifyOTPModel } from "@/models/auth_model";

// Import language JSON files
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import ProductCard from "@/components/ProductCard";

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

  // Cart & Quantity States for Search Results
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingToCartId, setAddingToCartId] = useState<string | number | null>(
    null,
  );

  const handleQuantityChange = (productId: string | number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = current + delta;
      return { ...prev, [productId]: Math.max(1, next) };
    });
  };

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

        console.log(`--------------------------${response.data}`);

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
      image: null,
    },
    {
      name: t.sections.millets,
      href: "/shop?category=Millets",
      desc: t.millets_desc,
      icon: <Leaf className="w-5 h-5" />,
      image: null,
    },
    {
      name: t.health_malts,
      href: "/shop?category=Malts",
      desc: t.malts_desc,
      icon: <Coffee className="w-5 h-5" />,
      image: null,
    },
    {
      name: t.gift,
      href: "/shop?category=Gifts",
      desc: t.gifts_menu_desc,
      icon: <Gift className="w-5 h-5" />,
      image: null,
    },
    {
      name: t.pooja,
      href: "/shop?category=Pooja",
      desc: t.pooja_desc_menu,
      icon: <Star className="w-5 h-5" />,
      image: null,
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
        image: cat.categoryimage || cat.image || null,
      }))
      : staticCategories;

  const navItems = [
    { name: t.home, href: "/" },
    { name: t.shop, href: "/shop" },
    { name: "🎁Build Your Gift", href: "/custom-hamper" },
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
        <div className="w-full bg-[var(--olive-dark)] text-white text-[10px] md:text-[11px] font-bold py-0.5 text-center tracking-widest uppercase">
          {/* Powered By-TRADIZIONS. Freshness Delivered Daily! | Free Shipping on Orders ₹999+ | 100% Natural, No Preservatives! */}
        </div>

        <nav className="w-full h-[80px] bg-[var(--olive-dark)] border-b border-white/10 shadow-sm px-6 lg:px-12 flex items-center justify-between pointer-events-auto relative">
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-14">
            {/* Logo Section */}
            <div className="flex-shrink-0 z-10">
              <Link href="/" className="block">
                <div className="relative overflow-hidden transition-transform duration-500 hover:scale-105">
                  <Image
                    src="/app-logo.png"
                    alt="Logo"
                    width={115}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-7 z-0 pt-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 text-[11px] tracking-[0.1em] font-bold uppercase transition-colors duration-300 whitespace-nowrap ${isActive ? "text-white" : "text-white/80 hover:text-white"}`}
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[2px] bg-white transform origin-left transition-transform duration-300 ease-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                );
              })}



              <Link
                href="/gifts"
                className={`group relative py-2 text-[11px] tracking-[0.1em] font-bold uppercase transition-colors duration-300 whitespace-nowrap ${pathname === "/gifts" ? "text-white" : "text-white/80 hover:text-white"}`}
              >
                {t.gifting || "Gifts"}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-white transform origin-left transition-transform duration-300 ease-out ${pathname === "/gifts" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
              </Link>
              <Link
                href="/corporate-orders"
                className={`group relative py-2 text-[11px] tracking-[0.1em] font-bold uppercase transition-colors duration-300 whitespace-nowrap ${pathname === "/corporate-orders" ? "text-white" : "text-white/80 hover:text-white"}`}
              >
                {t.corporate || "Corporate Orders"}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-white transform origin-left transition-transform duration-300 ease-out ${pathname === "/corporate-orders" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
              </Link>

              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 text-[11px] tracking-[0.1em] font-bold uppercase transition-colors duration-300 whitespace-nowrap ${isActive ? "text-white" : "text-white/80 hover:text-white"}`}
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[2px] bg-white transform origin-left transition-transform duration-300 ease-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Right Section */}
          <div className="flex items-center gap-3 lg:gap-5 flex-1 justify-end z-10">
            {/* Professional Language Selection */}
            <div className="hidden md:block relative group/langdrop">
              <button className="group flex items-center h-10 gap-2 px-4 rounded-sm bg-white/10 border border-white/20 hover:border-white/50 hover:bg-white/20 transition-all cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/90 group-hover:text-white transition-colors">
                  {selectedLang}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
              </button>

              {/* Stylish Dropdown Card */}
              <div className="absolute top-full right-0 pt-2 opacity-0 translate-y-1 pointer-events-none group-hover/langdrop:opacity-100 group-hover/langdrop:translate-y-0 group-hover/langdrop:pointer-events-auto transition-all duration-200 z-50">
                <div className="w-40 bg-white border border-stone-200 shadow-sm relative">
                  <div className="p-2 relative z-10 flex flex-col gap-1">
                    {languages.map((lang) => {
                      const isActive = selectedLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLangChange(lang.code)}
                          className={`relative w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-sm ${isActive
                              ? "bg-[var(--olive-dark)] text-white"
                              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                            }`}
                        >
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
                className="flex items-center justify-center w-10 h-10 rounded-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/50 transition-all"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            <button onClick={() => window.dispatchEvent(new Event("openCartSidebar"))} className="relative cursor-pointer border-none bg-transparent outline-none">
              <div className="flex items-center justify-center w-10 h-10 rounded-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/50 transition-all">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-sm bg-white text-[9px] font-bold text-[var(--olive-dark)] shadow-sm border border-[var(--olive-dark)]">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>

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
                className="flex items-center justify-center w-10 h-10 rounded-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/50 transition-all"
              >
                <User className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/50 transition-all"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Persistent Categories Bar (Desktop & Mobile) */}
        <div className="w-full bg-[var(--olive-dark)] px-2 py-2 shadow-md">
          <div className="flex gap-4 overflow-x-auto category-scrollbar items-center justify-start md:justify-center px-2 pb-1">
            {displayCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex-shrink-0 flex items-center w-auto h-[48px] md:h-[56px] px-3 md:px-4 gap-2 md:gap-3 rounded-[0.2rem] bg-white hover:bg-stone-50 transition-all shadow-sm hover:shadow border border-transparent"
              >
                <div className="w-7 h-7 md:w-9 md:h-9 flex-shrink-0 flex items-center justify-center text-[var(--olive-dark)] scale-110 hover:scale-125 transition-transform duration-300">
                  {cat.image ? (
                    <img 
                      src={cat.image.startsWith('http') ? cat.image : `${IMAGE_URL || ""}${cat.image}`} 
                      alt={cat.name} 
                      className="w-full h-full object-contain drop-shadow-sm"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    cat.icon
                  )}
                </div>
                <span className="text-[10px] md:text-[11px] font-bold text-stone-700 whitespace-nowrap leading-none">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto mx-4 md:mx-8 ${open ? "max-h-screen shadow-sm mt-2 rounded-sm border border-stone-200" : "max-h-0"}`}
        >
          <div className="bg-white px-6 py-8 overflow-y-auto max-h-[85vh] space-y-5">
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
              <Link
                href="/custom-hamper"
                className="text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                🎁Build Your Gift
              </Link>



              {/* Mobile Gifting Links */}
              <Link
                href="/gifts"
                className="block text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.gifting || "Gifts"}
              </Link>
              <Link
                href="/corporate-orders"
                className="block text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.corporate || "Corporate Orders"}
              </Link>

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
                    <p className="text-sm font-medium text-gray-500">
                      {t.navbar?.searching || "Searching..."}
                    </p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-400 w-full">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">
                      {t.navbar?.no_products || "No products found"}
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8">
                    {/* Products Grid */}
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-[16px]">
                          Products
                        </h3>
                        <Link
                          href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSuggestions([]);
                          }}
                          className="text-[13px] text-[var(--olive)] font-bold hover:text-blue-800 underline"
                        >
                          View all products
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {suggestions.map((product) => {
                          const mappedProduct = {
                            id: product.productid,
                            name: product.productname,
                            price: product.price,
                            sellingprice: product.sellingprice,
                            image: product.productimage,
                            category: product.category,
                            categoryid: product.categoryid,
                            itemtype: product.itemtype,
                            desc:
                              product.description ||
                              product.desc ||
                              product.brandname,
                            availablestock:
                              product.availablestock !== undefined &&
                                product.availablestock !== null
                                ? product.availablestock
                                : product.stock !== undefined &&
                                  product.stock !== null
                                  ? product.stock
                                  : 1,
                            stock: product.stock,
                            bid: product.bid || 1,
                          };

                          return (
                            <ProductCard
                              key={mappedProduct.id}
                              product={mappedProduct}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSuggestions([]);
                              }}
                            />
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
