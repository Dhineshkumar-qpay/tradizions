"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Search,
  X,
  Plus,
  Minus,
  Star,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { ShopProductModel, Product } from "@/models/shop_product_model";
import ProductCard from "@/components/ProductCard";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const cleanedBase = IMAGE_URL.endsWith("/") ? IMAGE_URL.slice(0, -1) : IMAGE_URL;
  const cleanedPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;
  return `${cleanedBase}/${cleanedPath}`;
};

const NoResultsFound = ({ onClear, t }: { onClear: () => void; t: any }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-[3rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
      <Search className="w-8 h-8 text-stone-300" />
    </div>
    <h3 className="text-xl font-bold text-stone-900 mb-2">
      {t.no_items?.title || t.no_results || "No items found"}
    </h3>
    <p className="text-sm text-stone-400 max-w-xs mb-8">
      {t.no_items?.description ||
        t.no_results_desc ||
        "We couldn't find any items matching your current filters."}
    </p>
    <button
      onClick={onClear}
      className="px-8 py-3 rounded-[1rem] bg-[var(--olive)] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all shadow-lg active:scale-95 cursor-pointer"
    >
      {t.no_items?.clear_filters || t.clear_filters || "Clear Filters"}
    </button>
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col animate-pulse h-full shadow-sm">
    <div className="aspect-[4/3] bg-stone-200" />
    <div className="p-4 space-y-3 flex flex-col flex-1">
      <div className="space-y-2">
        <div className="h-4 bg-stone-200 rounded-md w-3/4" />
        <div className="h-3 bg-stone-100 rounded-md w-5/6" />
      </div>
      <div className="h-5 bg-stone-200 rounded-md w-1/3 mt-2" />
      <div className="h-10 bg-stone-200 rounded-xl w-full mt-auto" />
    </div>
  </div>
);



export default function GiftsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Gifts");
  const [categories, setCategories] = useState<any[]>([]);

  const handleActionWithLogin = (action: () => void) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.dispatchEvent(new Event("openLoginSidebar"));
      const handleLoginSuccess = () => {
        action();
        window.removeEventListener("loginSuccess", handleLoginSuccess);
      };
      window.addEventListener("loginSuccess", handleLoginSuccess);
    } else {
      action();
    }
  };

  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [updatingCartId, setUpdatingCartId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const fetchCart = async () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      try {
        const response = await API.post(API_ROUTES.GETCART);
        if (response.status === 200) {
          setCartItems(response.data?.data?.cart || []);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    } else {
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("loginSuccess", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("loginSuccess", handleCartUpdate);
    };
  }, []);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);

  const fetchFavourites = async () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      try {
        const response = await API.post(API_ROUTES.GETFAVOURITE);
        if (response.status === 200) {
          const list = response.data?.data || [];
          setFavouriteProductIds(list.map((fav: any) => fav.productid));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchFavourites();
    window.addEventListener("favoritesUpdated", fetchFavourites);
    return () => window.removeEventListener("favoritesUpdated", fetchFavourites);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(""); // "" | "lowToHigh" | "highToLow"
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    categoryid: 0,
    subcategoryid: 0,
    pricerange: "",
    weight: 0,
    sortby: "",
    page: 1,
    itemtype: "gift",
  });

  const [selectedLang, setSelectedLang] = useState("EN");

  useEffect(() => {
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

  useEffect(() => {
    const fetchCategoriesAndInit = async () => {
      try {
        const response = await API.post(API_ROUTES.CATEGORIES,{type: "gift"});
        if (response.status === 200) {
          const allCats = response.data["data"] || [];

          setCategories(response.data["data"] || []);

          const giftCat = allCats.find(
            (cat: any) =>
              cat.categoryname.toLowerCase().includes("gift") ||
              cat.categoryname.toLowerCase().includes("hamper"),
          );
          if (giftCat) {
            setSelectedCategory(giftCat.categoryname);
            setActiveFilters((prev) => ({
              ...prev,
              categoryid: giftCat.categoryid,
              page: 1,
            }));
          } else if (allCats.length > 0) {
            setSelectedCategory(allCats[0].categoryname);
            setActiveFilters((prev) => ({
              ...prev,
              categoryid: allCats[0].categoryid,
              page: 1,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategoriesAndInit();
  }, []);

  // Fetch subcategories when activeFilters.categoryid changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (activeFilters.categoryid > 0) {
        try {
          const response = await API.post(API_ROUTES.SUBCATEGORIES, {
            categoryid: activeFilters.categoryid,
          });
          if (response.status === 200) {
            setSubcategories(response.data["data"] || []);
          } else {
            setSubcategories([]);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      } else {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [activeFilters.categoryid]);

  // Fetch products/gifts from the API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(API_ROUTES.PRODUCTS, activeFilters);
      if (response.status === 200) {
        const model: ShopProductModel = response.data;
        setProducts(model.data?.products || []);
        setTotalPages(model.data?.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeFilters]);

  const clearAllFilters = () => {
    const giftCat = categories.find(
      (cat: any) =>
        cat.categoryname.toLowerCase().includes("gift") ||
        cat.categoryname.toLowerCase().includes("hamper"),
    );
    setSelectedCategory(giftCat ? giftCat.categoryname : "All Gifts");
    setActiveFilters({
      categoryid: giftCat ? giftCat.categoryid : 0,
      subcategoryid: 0,
      pricerange: "",
      weight: 0,
      sortby: "",
      page: 1,
      itemtype: "gift",
    });
    setSearchQuery("");
    setSortBy("");
  };

  // Map API fields to UI component schema
  const mappedProducts = products.map((p: Product) => ({
    id: p.productid,
    name: p.productname || "",
    image: p.productimage
      ? p.productimage.startsWith("http")
        ? p.productimage
        : `${IMAGE_URL || ""}${p.productimage}`
      : "/placeholder.png",
    price: p.sellingprice || p.price || 0,
    originalPrice:
      p.price !== undefined &&
      p.sellingprice !== undefined &&
      p.price > p.sellingprice
        ? p.price
        : null,
    category: p.categoryname || "",
    subcategory: p.subcategoryname || "",
    isNew: p.isFeatured,
    desc: p.description,
    weight: p.weight,
    unit: p.unit,
    bid: p.bid,
    availablestock: p.availablestock || 0,
    itemtype: "gift",
  }));

  const searchedProducts = mappedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedProducts = searchedProducts;

  const FilterContent = () => (
    <div className="divide-y divide-stone-100">
      <div className="px-4 py-4">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
          {t.gifts_filters?.categories || "Categories"}
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              setSelectedCategory("All Gifts");
              setActiveFilters((prev: any) => ({
                ...prev,
                categoryid: 0,
                subcategoryid: 0,
                page: 1,
              }));
              if (isMobileFilterOpen) setIsMobileFilterOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
              selectedCategory === "All Gifts"
                ? "bg-[var(--orange)]/5 border-[var(--orange)] text-[var(--orange)] shadow-sm scale-[1.02]"
                : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
            }`}
          >
            <span className="text-[11px] font-bold">{t.gifts_filters?.all_gifts || "All Gifts"}</span>
            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCategory === "All Gifts" ? "border-[var(--orange)]" : "border-stone-200"}`}>
              {selectedCategory === "All Gifts" && <div className="w-1.5 h-1.5 bg-[var(--orange)] rounded-full"></div>}
            </div>
          </button>
          
          <div className="pl-4 space-y-2 mt-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.categoryname;
              return (
                <button
                  key={cat.categoryid}
                  onClick={() => {
                    setSelectedCategory(cat.categoryname);
                    setActiveFilters((prev: any) => ({
                      ...prev,
                      categoryid: cat.categoryid,
                      subcategoryid: 0,
                      page: 1,
                    }));
                    if (isMobileFilterOpen) setIsMobileFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--orange)]/5 border-[var(--orange)] text-[var(--orange)] shadow-sm scale-[1.02]"
                      : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                  }`}
                >
                  <span className="text-[11px] font-bold">{cat.categoryname}</span>
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-[var(--orange)]" : "border-stone-200"}`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-[var(--orange)] rounded-full"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeFilters.categoryid > 0 && subcategories.length > 0 && (
        <details className="group" open>
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors list-none select-none">
            <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">
              {t.gifts_filters?.subcategories || "Subcategories"}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 space-y-2">
            {subcategories.map((sub: any) => {
              const isSelected = activeFilters.subcategoryid === sub.subcategoryid;
              return (
                <button
                  key={sub.subcategoryid}
                  onClick={() => {
                    setActiveFilters((prev: any) => ({
                      ...prev,
                      subcategoryid: prev.subcategoryid === sub.subcategoryid ? 0 : sub.subcategoryid,
                      page: 1,
                    }));
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--orange)]/5 border-[var(--orange)] text-[var(--orange)] shadow-sm scale-[1.02]"
                      : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                  }`}
                >
                  <span className="text-[11px] font-bold">{sub.subcategoryname}</span>
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-[var(--orange)]" : "border-stone-200"}`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-[var(--orange)] rounded-full"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </details>
      )}

      <details className="group" open>
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors list-none select-none">
          <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">
            {t.gifts_filters?.price_range || "Price Range"}
          </span>
          <ChevronDown className="w-3 h-3 text-stone-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-4 pb-4 space-y-2">
          {[
            { label: "Under 1000", value: "0-1000" },
            { label: "1000-2500", value: "1000-2500" },
            { label: "Above 2500", value: "above-2500" },
          ].map((range) => {
            const isSelected = activeFilters.pricerange === range.value;
            return (
              <button
                key={range.value}
                onClick={() => {
                  setActiveFilters((prev: any) => ({
                    ...prev,
                    pricerange: prev.pricerange === range.value ? "" : range.value,
                    page: 1,
                  }));
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--orange)]/5 border-[var(--orange)] text-[var(--orange)] shadow-sm scale-[1.02]"
                    : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                }`}
              >
                <span className="text-[11px] font-bold">{range.label}</span>
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-[var(--orange)]" : "border-stone-200"}`}>
                  {isSelected && <div className="w-1.5 h-1.5 bg-[var(--orange)] rounded-full"></div>}
                </div>
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#faf9f6] ">
      {/* ──── Gifts Hero / Header ──── */}
      <section className="relative pt-24 pb-20 px-6 sm:px-12 lg:px-20 overflow-hidden bg-[var(--dark-brown)] border-b border-[var(--olive-dark)]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=2000"
            alt="Corporate Gifting Banner"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--dark-brown)] via-[var(--dark-brown)]/80 to-[var(--olive-dark)]/30" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col justify-center min-h-[200px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">{t.gifting || "Gifting"}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                {t.gifts_headline || "Corporate Gifting"}
              </h1>
              <p className="text-sm md:text-base text-stone-300 font-medium leading-relaxed">
                {t.gifts_desc || "Curated gift hampers crafted with love — perfect for clients, teams, and premium events."}
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 md:justify-end shrink-0 pb-2">
              {[
                { icon: "Gift", label: "Executive Ready" },
                { icon: "Sparkles", label: "Premium Packing" },
                { icon: "Flower", label: "Handcrafted" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm bg-white/5 backdrop-blur-md border border-[var(--olive)]/30 text-xs font-bold text-white tracking-wide uppercase shadow-sm"
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 md:py-10 pb-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 bg-white border border-stone-200 shadow-sm rounded-sm">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 rounded-t-sm">
                <h3 className="text-xs font-bold text-stone-900 tracking-widest uppercase">
                  {t.gifts_filters?.title || "Filters"}
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-stone-400 hover:text-[var(--orange)] transition-colors uppercase tracking-tight cursor-pointer"
                >
                  {t.gifts_filters?.clear_all || "Clear All"}
                </button>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-sm text-xs font-bold text-stone-900 shadow-sm hover:border-stone-400 transition-colors uppercase tracking-widest"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {/* Custom Sort By Dropdown */}
                <div className="relative z-30 min-w-[160px] sm:min-w-[190px]">
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    onBlur={() =>
                      setTimeout(() => setIsSortDropdownOpen(false), 200)
                    }
                    className="flex items-center justify-between w-full bg-white border border-stone-200 rounded-sm shadow-sm px-4 py-3 text-xs font-bold text-stone-900 hover:border-stone-400 transition-all duration-300 cursor-pointer select-none uppercase tracking-widest"
                  >
                    <span className="flex items-center gap-1.5">
                      {sortBy === "" && "Sort: Default"}
                      {sortBy === "lowToHigh" && "Price: Low to High"}
                      {sortBy === "highToLow" && "Price: High to Low"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180 text-[var(--olive)]" : ""}`}
                    />
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-stone-200 rounded-sm shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="py-1 text-xs">
                        <button
                          onClick={() => {
                            setSortBy("");
                            setActiveFilters((prev: any) => ({
                              ...prev,
                              sortby: "",
                              page: 1,
                            }));
                            setIsSortDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left font-bold transition-colors cursor-pointer ${
                            sortBy === ""
                              ? "bg-stone-50 text-[var(--olive)]"
                              : "text-stone-600 hover:bg-stone-50/80 hover:text-stone-900"
                          }`}
                        >
                          Sort: Default
                          {sortBy === "" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("lowToHigh");
                            setActiveFilters((prev: any) => ({
                              ...prev,
                              sortby: "price-low-high",
                              page: 1,
                            }));
                            setIsSortDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left font-bold transition-colors cursor-pointer ${
                            sortBy === "lowToHigh"
                              ? "bg-stone-50 text-[var(--olive)]"
                              : "text-stone-600 hover:bg-stone-50/80 hover:text-stone-900"
                          }`}
                        >
                          Price: Low to High
                          {sortBy === "lowToHigh" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("highToLow");
                            setActiveFilters((prev: any) => ({
                              ...prev,
                              sortby: "price-high-low",
                              page: 1,
                            }));
                            setIsSortDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left font-bold transition-colors cursor-pointer ${
                            sortBy === "highToLow"
                              ? "bg-stone-50 text-[var(--olive)]"
                              : "text-stone-600 hover:bg-stone-50/80 hover:text-stone-900"
                          }`}
                        >
                          Price: High to Low
                          {sortBy === "highToLow" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full sm:max-w-xs flex items-center bg-white border border-stone-200 rounded-sm shadow-sm px-4 py-3 transition-all hover:border-stone-400">
                <Search className="h-4 w-4 text-stone-400 mr-3" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder || "Search..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="bg-transparent text-xs font-bold text-stone-900 outline-none w-full placeholder:text-stone-400 uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))
              ) : (
                <NoResultsFound onClear={clearAllFilters} t={t} />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-16">
                <button
                  disabled={activeFilters.page === 1}
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  className="px-6 py-3 rounded-full border border-gray-100 bg-white text-[10px] font-bold tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> PREVIOUS
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setActiveFilters((prev) => ({ ...prev, page: i + 1 }))
                      }
                      className={`w-10 h-10 rounded-full font-bold text-[10px] transition-all border ${activeFilters.page === i + 1 ? "bg-[var(--olive)] text-white border-[var(--olive)] shadow-lg shadow-emerald-900/10" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={activeFilters.page === totalPages}
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      page: Math.min(totalPages, prev.page + 1),
                    }))
                  }
                  className="px-6 py-3 rounded-full border border-gray-100 bg-white text-[10px] font-bold tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  NEXT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-[300px] bg-white h-full shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-stone-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <FilterContent />
            <div className="p-6">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-4 bg-[var(--olive)] text-white font-bold text-xs tracking-widest rounded-xl shadow-lg shadow-emerald-900/10"
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
