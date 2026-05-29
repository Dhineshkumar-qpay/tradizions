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
import { API_ROUTES } from "@/routes/api_routes";
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
      window.removeEventListener("loginSuccess", fetchCartCount);
    };
  }, []);

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
    window.addEventListener("openLoginSidebar", handleOpenLogin as EventListener);
    return () =>
      window.removeEventListener("openLoginSidebar", handleOpenLogin as EventListener);
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
        const response = await API.post(API_ROUTES.CATEGORIES);
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
      <nav className="fixed top-0 left-0 w-full z-40 transition-all duration-500 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:bg-white/80 ">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo Section */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/app-logo.png"
                alt="Logo"
                width={90}
                height={40}
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center px-6 py-2 space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative text-[13px] tracking-widest font-semibold transition-all duration-300 whitespace-nowrap ${isActive ? "text-[var(--orange)]" : "text-gray-600 hover:text-[var(--olive)]"}`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] transition-all duration-300 bg-[var(--orange)] rounded-full ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </Link>
              );
            })}

            {/* Categories Megamenu Dropdown */}
            <div className="relative group/mega">
              <button className="flex items-center gap-1.5 text-[13px] tracking-widest font-semibold text-gray-500 hover:text-[var(--olive)] transition-all duration-300 whitespace-nowrap">
                {t.categories}
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/mega:rotate-180" />
              </button>

              {/* Redesigned Premium Dropdown */}
              <div className="absolute top-full -left-4 pt-4 opacity-0 translate-y-4 pointer-events-none group-hover/mega:opacity-100 group-hover/mega:translate-y-0 group-hover/mega:pointer-events-auto transition-all duration-500">
                <div className="w-56 bg-white/95 backdrop-blur-xl rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e0d4b7] p-2 space-y-1">
                  {displayCategories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--olive)] rounded-lg transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Gifting Dropdown */}
            <div className="relative group/gifting">
              <button className="flex items-center gap-1.5 text-[13px] tracking-widest font-semibold text-gray-500 hover:text-[var(--olive)] transition-all duration-300 whitespace-nowrap">
                {t.gifting}
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/gifting:rotate-180" />
              </button>

              <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-4 pointer-events-none group-hover/gifting:opacity-100 group-hover/gifting:translate-y-0 group-hover/gifting:pointer-events-auto transition-all duration-500">
                <div className="w-44 bg-white/95 backdrop-blur-xl  shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e0d4b7] p-2 space-y-1">
                  <Link
                    href="/gifts"
                    className="block px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--olive)] rounded-lg transition-all"
                  >
                    {t.occasional}
                  </Link>
                  <Link
                    href="/corporate-orders"
                    className="block px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--olive)] rounded-lg transition-all"
                  >
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
                  className={`group relative text-[13px] tracking-widest font-semibold transition-all duration-300 whitespace-nowrap ${isActive ? "text-[var(--orange)]" : "text-gray-500 hover:text-[var(--olive)]"}`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] transition-all duration-300 bg-[var(--orange)] rounded-full ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 lg:gap-6 ml-auto">
            {/* Professional Language Selection */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                onBlur={() => setTimeout(() => setIsLangOpen(false), 200)}
                className={`flex items-center h-10 gap-2 px-4 rounded-full border transition-all duration-300 ${
                  isLangOpen
                    ? "bg-white border-[var(--olive)] shadow-[0_2px_15px_rgba(85,107,47,0.12)]"
                    : "bg-white/60 border-[#e0d4b7]/60 hover:bg-white hover:border-[#e0d4b7] shadow-sm"
                }`}
              >
                <Globe
                  className={`w-4 h-4 transition-colors duration-300 ${
                    isLangOpen ? "text-[var(--olive)]" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${
                    isLangOpen ? "text-[var(--olive)]" : "text-gray-700"
                  }`}
                >
                  {selectedLang}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    isLangOpen ? "rotate-180 text-[var(--olive)]" : "text-gray-400"
                  }`}
                />
              </button>

              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-white/95 backdrop-blur-xl border border-[#e0d4b7]/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-1.5 space-y-0.5">
                    {languages.map((lang) => {
                      const isActive = selectedLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLangChange(lang.code)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-200 ${
                            isActive
                              ? "bg-[var(--olive)]/10 text-[var(--olive)]"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {lang.name}
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] shadow-[0_0_8px_rgba(85,107,47,0.6)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Professional Dynamic Searchbar */}
            <div className="relative group flex items-center">
              <div
                className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full border bg-white/80 backdrop-blur-md overflow-hidden ${
                  isSearchOpen
                    ? "w-48 md:w-72 border-[var(--olive)] shadow-[0_4px_20px_rgba(85,107,47,0.15)] ring-4 ring-[var(--olive)]/10"
                    : "w-10 h-10 border-[#e0d4b7] shadow-sm hover:shadow-md hover:border-[var(--olive)]/50"
                }`}
              >
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`flex-shrink-0 h-10 w-10 flex items-center justify-center transition-colors duration-300 ${
                    isSearchOpen
                      ? "text-[var(--olive)] pointer-events-none"
                      : "text-gray-500 hover:text-[var(--olive)]"
                  }`}
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>

                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-transparent py-2 pr-2 text-[13px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none transition-all duration-500 ${
                    isSearchOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4 pointer-events-none"
                  }`}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className={`flex-shrink-0 h-8 w-8 mr-1 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-gray-100 text-gray-400 hover:text-gray-600 ${
                    isSearchOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-50 pointer-events-none"
                  }`}
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Absolutely positioned Suggestions Dropdown */}
              {isSearchOpen && searchQuery.trim() !== "" && (
                <div className="absolute top-full right-0 mt-2 w-72 md:w-85 bg-white/95 backdrop-blur-xl border border-[#e0d4b7] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-fade-in-up">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8 text-stone-400 gap-2.5 text-xs font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--olive)]" />
                      <span>{t.navbar?.searching || "Searching..."}</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-stone-400 text-xs font-semibold">
                      {t.navbar?.no_products || "No products found"}
                    </div>
                  ) : (
                    <>
                      {/* Header title */}
                      <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                        <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
                          {t.navbar?.suggested || "Suggested Products"}
                        </span>
                        <span className="text-[9px] font-black text-[var(--olive)] bg-[var(--olive)]/10 px-2.5 py-0.5 rounded-full border border-[var(--olive)]/10">
                          {suggestions.length} {t.navbar?.found || "Found"}
                        </span>
                      </div>

                      {/* Suggestions list */}
                      <div className="max-h-[340px] overflow-y-auto divide-y divide-stone-50 p-1.5">
                        {suggestions.slice(0, 5).map((product) => {
                          const isGift =
                            product.categoryid === 4 ||
                            product.categoryid === 5;
                          const detailUrl = isGift
                            ? `/gift-detail/${product.productid}`
                            : `/product-detail/${product.productid}`;

                          return (
                            <Link
                              key={product.productid}
                              href={detailUrl}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSuggestions([]);
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50/80 transition-all duration-300 group relative border border-transparent hover:border-stone-100"
                            >
                              {/* Left line accent on hover */}
                              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--olive)] rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />

                              <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 border border-stone-100/80 bg-stone-50 shadow-sm transition-transform duration-300 group-hover:scale-102">
                                <img
                                  src={
                                    process.env.NEXT_PUBLIC_IMAGE_URL +
                                      product.productimage || "/placeholder.jpg"
                                  }
                                  alt={product.productname}
                                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 || product.availablestock <= 0 ? "grayscale opacity-60" : ""}`}
                                />
                                {(product.stock <= 0 ||
                                  product.availablestock <= 0) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] z-10">
                                    <span className="bg-red-500/90 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-wider shadow-sm text-center leading-none">
                                      {t.navbar?.out_of_stock || "OUT OF STOCK"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-xs font-bold truncate group-hover:text-[var(--olive)] transition-colors leading-snug ${product.stock <= 0 || product.availablestock <= 0 ? "text-gray-400" : "text-gray-800"}`}
                                >
                                  {product.productname}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 leading-none">
                                  <span
                                    className={`text-xs font-black ${product.stock <= 0 || product.availablestock <= 0 ? "text-gray-400" : "text-gray-900"}`}
                                  >
                                    ₹
                                    {product.selllingprice !== 0
                                      ? product.sellingprice?.toLocaleString()
                                      : product.price.toLocaleString()}
                                  </span>
                                  {product.price != null &&
                                    product.sellingprice != null &&
                                    product.price > 0 &&
                                    product.sellingprice > 0 &&
                                    product.price > product.sellingprice && (
                                      <>
                                        <span className="text-[10px] font-bold text-stone-300 line-through">
                                          ₹{product.price.toLocaleString()}
                                        </span>

                                        {!(
                                          product.stock <= 0 ||
                                          product.availablestock <= 0
                                        ) && (
                                          <span className="text-[8px] font-black bg-[var(--orange)] text-white px-1.5 py-0.5 rounded-sm tracking-wider shadow-sm">
                                            {Math.round(
                                              ((product.price -
                                                product.sellingprice) /
                                                product.price) *
                                                100,
                                            )}
                                            % {t.navbar?.off || "OFF"}
                                          </span>
                                        )}
                                      </>
                                    )}
                                </div>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 opacity-0 group-hover:opacity-100 group-hover:bg-[var(--olive)]/10 group-hover:text-[var(--olive)] transition-all duration-300">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Footer shortcuts */}
                      <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/50 flex items-center justify-center">
                        <Link
                          href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSuggestions([]);
                          }}
                          className="text-[10px] font-black text-[var(--olive)] hover:text-[var(--orange)] tracking-widest uppercase flex items-center gap-1.5 transition-colors duration-300"
                        >
                          {t.navbar?.view_all || "View all results in shop"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/cart" className="relative">
              <div className="relative group p-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer hidden md:block">
                <ShoppingCart className="w-5 h-5 text-[var(--olive)] group-hover:text-[var(--orange)] transition-colors duration-300" />
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--orange)] text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              </div>
            </Link>

            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    router.push("/my-account");
                  } else {
                    setShouldRedirectToAccount(true);
                    setIsDrawerOpen(true);
                  }
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white transition-all duration-500 shadow-[0_4px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(85,107,47,0.2)]"
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2.5 rounded-full bg-gray-50 text-[var(--olive)] hover:bg-gray-100 transition-colors"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${open ? "max-h-screen border-t border-gray-100 shadow-2xl" : "max-h-0"}`}
        >
          <div className="bg-white/95 backdrop-blur-md px-6 py-10 overflow-y-auto max-h-[85vh] space-y-6">
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
                      className={`flex-1 py-3 rounded-xl border text-[11px] font-bold tracking-widest transition-all ${
                        selectedLang === lang.code
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
      </nav>

      {/* --- Overlay --- */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* --- Right Side Drawer --- */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
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
    </>
  );
}