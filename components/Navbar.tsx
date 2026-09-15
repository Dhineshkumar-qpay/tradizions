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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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
  const [email, setEmail] = useState("");
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

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userMobile");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsProfileMenuOpen(false);
    window.dispatchEvent(new Event("cartUpdated"));
    router.push("/");
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post<ResponseModel>(API_ROUTES.SENDOTP, {
        email: email.trim(),
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
        email: email.trim(),
        otp: Number(enteredOtp),
      });
      if (response.status === 200 && response.data.data?.token) {
        const token = response.data.data.token;
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
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
      : [];

  const navItems = [
    { name: t.home, href: "/" },
    { name: t.shop, href: "/shop" },
    { name: t.gifting || "Gifting", href: "/gifts" },
  ];

  const secondaryNavItems = [{ name: t.contactUs, href: "/contact-us" }];

  const languages = [
    { code: "EN", name: "English" },
    { code: "TA", name: "Tamil" },
    { code: "HI", name: "Hindi" },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 transition-all duration-300 pointer-events-none">
        {/* Top Announcement Bar */}
        <div className="w-full bg-[var(--olive-dark)] text-white/90 text-[10px] md:text-[11px] font-medium py-1.5 text-center tracking-widest uppercase pointer-events-auto">
          {/* Powered By-TRADIZIONS. Freshness Delivered Daily! | Free Shipping on Orders ₹999+ | 100% Natural, No Preservatives! */}
        </div>

        <nav className="w-full h-[70px] lg:h-[80px] bg-white/95 backdrop-blur-lg border-b border-gray-100 px-4 lg:px-8 flex items-center justify-between pointer-events-auto relative z-50 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4 lg:gap-8 xl:gap-12">
            {/* Logo Section */}
            <div className="flex-shrink-0 z-20">
              <Link href="/" className="group block">
                <div className="relative flex items-center justify-center">
                  {/* Clean Seamless Logo */}
                  <div className="relative h-10 w-32 lg:h-12 lg:w-36 transition-all duration-500 group-hover:-translate-y-1 flex items-center justify-center">
                    <Image
                      src="/app-logo.png"
                      alt="Logo"
                      width={140}
                      height={45}
                      className="object-fit-cover object-center transition-transform duration-700 group-hover:scale-105 drop-shadow-lg"
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5 z-0 pt-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 px-1 text-[11px] xl:text-[12px] tracking-wide font-semibold transition-all duration-300 whitespace-nowrap ${isActive ? "text-[var(--olive)]" : "text-gray-600 hover:text-[var(--olive)]"}`}
                  >
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-t-md bg-[var(--olive)] transform origin-left transition-transform duration-300 ease-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                );
              })}

              {/* Categories Dropdown */}
              <div className="relative group/catdrop h-full flex items-center">
                <button className="group relative py-2 px-1 text-[11px] xl:text-[12px] tracking-wide font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 text-gray-600 hover:text-[var(--olive)]">
                  {t.categories || "CATEGORIES"}
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover/catdrop:-rotate-180" />
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] rounded-t-md bg-[var(--olive)] transform origin-left transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100" />
                </button>

                <div className="absolute top-[100%] left-0 pt-6 opacity-0 translate-y-2 pointer-events-none group-hover/catdrop:opacity-100 group-hover/catdrop:translate-y-0 group-hover/catdrop:pointer-events-auto transition-all duration-300 z-50">
                  <div className="min-w-[220px] bg-white border border-gray-100 shadow-lg relative rounded-md overflow-hidden ring-1 ring-black/5">
                    <div className="flex flex-col py-2">
                      {displayCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="px-5 py-3 text-[11px] font-medium text-gray-600 hover:text-[var(--olive)] hover:bg-gray-50 transition-all duration-200 tracking-wider whitespace-nowrap flex items-center gap-3 border-b border-gray-50 last:border-0 group/item"
                        >
                          <span className="transform transition-transform duration-300 group-hover/item:translate-x-1">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/custom-hamper"
                className={`group relative py-2 px-1 text-[11px] xl:text-[12px] tracking-wide font-semibold transition-all duration-300 whitespace-nowrap ${pathname === "/custom-hamper" ? "text-[var(--olive)]" : "text-gray-600 hover:text-[var(--olive)]"}`}
              >
                {t.custom_gift?.title || "Build Your Gift"}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-t-md bg-[var(--olive)] transform origin-left transition-transform duration-300 ease-out ${pathname === "/custom-hamper" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
              </Link>
              <Link
                href="/corporate-orders"
                className={`group relative py-2 px-1 text-[11px] xl:text-[12px] tracking-wide font-semibold transition-all duration-300 whitespace-nowrap ${pathname === "/corporate-orders" ? "text-[var(--olive)]" : "text-gray-600 hover:text-[var(--olive)]"}`}
              >
                {t.corporate || "Corporate Orders"}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-t-md bg-[var(--olive)] transform origin-left transition-transform duration-300 ease-out ${pathname === "/corporate-orders" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
              </Link>

              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 px-1 text-[11px] xl:text-[12px] tracking-wide font-semibold transition-all duration-300 whitespace-nowrap ${isActive ? "text-[var(--olive)]" : "text-gray-600 hover:text-[var(--olive)]"}`}
                  >
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-t-md bg-[var(--olive)] transform origin-left transition-transform duration-300 ease-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Right Section */}
          <div className="flex items-center gap-2 lg:gap-3 flex-1 justify-end z-10">
            {/* Professional Language Selection */}
            <div className="hidden md:block relative group/langdrop">
              <button className="group flex items-center h-10 gap-2 px-4 rounded-md bg-gray-50 border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                <Globe className="w-4 h-4 text-gray-500 group-hover:text-gray-800 transition-colors" />
                <span className="text-[11px] font-medium tracking-wide text-gray-600 group-hover:text-gray-900 transition-colors">
                  {selectedLang}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-800 transition-all group-hover/langdrop:rotate-180" />
              </button>

              {/* Stylish Dropdown Card */}
              <div className="absolute top-full right-0 pt-7 opacity-0 translate-y-2 pointer-events-none group-hover/langdrop:opacity-100 group-hover/langdrop:translate-y-0 group-hover/langdrop:pointer-events-auto transition-all duration-300 z-50">
                <div className="w-40 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl relative rounded-xl overflow-hidden ring-1 ring-black/5">
                  <div className="p-2 relative z-10 flex flex-col gap-1">
                    {languages.map((lang) => {
                      const isActive = selectedLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLangChange(lang.code)}
                          className={`relative w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 rounded-lg group/langbtn ${
                            isActive
                              ? "bg-[var(--orange)] text-white shadow-md"
                              : "text-stone-500 hover:bg-orange-50 hover:text-[var(--orange)]"
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
                className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-50 hover:text-[var(--olive)] transition-all duration-200 group"
                aria-label="Search"
              >
                <Search className="w-5 h-5 group-hover:scale-105 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => window.dispatchEvent(new Event("openCartSidebar"))}
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-50 hover:text-[var(--olive)] transition-all duration-200 group border-none bg-transparent outline-none cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--olive)] text-[9px] font-bold text-white shadow-sm border-[1.5px] border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    setIsProfileMenuOpen((isOpen) => !isOpen);
                  } else {
                    setShouldRedirectToAccount(true);
                    setIsDrawerOpen(true);
                  }
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-50 hover:text-[var(--olive)] transition-all duration-200 group"
              >
                <User className="w-5 h-5 group-hover:scale-105 transition-transform" />
              </button>
              {isLoggedIn && isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-44 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
                  <Link
                    href="/my-account"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[var(--olive)]"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.my_account?.logout || "Logout"}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-50 hover:text-[var(--olive)] transition-all duration-200 group"
            >
              {open ? (
                <X className="w-5 h-5 group-hover:scale-105 transition-transform" />
              ) : (
                <Menu className="w-5 h-5 group-hover:scale-105 transition-transform" />
              )}
            </button>
          </div>
        </nav>

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
                href="/gifts"
                className="text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.gifting || "Gifting"}
              </Link>

              {/* Mobile Gifting Links */}
              <Link
                href="/custom-hamper"
                className="block text-md font-semibold text-gray-900 border-b border-gray-50 pb-4"
                onClick={() => setOpen(false)}
              >
                {t.custom_gift?.title || "Build Your Gift"}
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
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none focus:border-[var(--olive)] transition-colors placeholder:text-gray-300 placeholder:font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs mt-2 font-bold animate-fade-in-up">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || !email.trim()}
                    className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t.sendOtp
                    )}
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
                        {email}
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
                      Change Email
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
          <div className="w-full bg-[var(--olive-dark)] py-4 px-4 sm:px-6 md:px-12 flex items-center justify-center shrink-0 border-b border-white/10 relative z-20">
            <div className="w-full max-w-4xl flex items-center gap-2 sm:gap-3">
              <div className="flex-1 bg-white/10 flex items-center h-12 px-4 rounded-md border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.16)] focus-within:bg-white/15 focus-within:border-[var(--orange)] focus-within:shadow-[0_8px_28px_rgba(0,0,0,0.24)] transition-all">
                <Search className="w-4 h-4 text-[var(--orange)] mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder={t.searchPlaceholder || "Search products"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none text-white placeholder:text-white/50"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="w-12 h-12 rounded-md border border-white/15 bg-[var(--orange)] text-white hover:bg-[var(--orange-dark)] transition-colors shrink-0 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
              >
                <X className="w-4 h-4 stroke-[2]" />
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
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
                            bid: product.bid || 2,
                          };

                          return (
                            <ProductCard
                              key={mappedProduct.id}
                              product={mappedProduct}
                              compact
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
