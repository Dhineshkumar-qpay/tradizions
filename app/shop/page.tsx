"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Filter,
  ChevronDown,
  Star,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import { ShopProductModel, Data, Product } from "@/models/shop_product_model";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const NoResultsFound = ({ onClear, t }: { onClear: () => void; t: any }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-[3rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
      <Search className="w-8 h-8 text-stone-300" />
    </div>
    <h3 className="text-xl font-bold text-stone-900 mb-2">
      {t.no_items.title}
    </h3>
    <p className="text-sm text-stone-400 max-w-xs mb-8">
      {t.no_items.description}
    </p>
    <button
      onClick={onClear}
      className="px-8 py-3 rounded-[1rem] bg-[var(--olive)] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all shadow-lg active:scale-95 cursor-pointer"
    >
      {t.no_items.clear_filters}
    </button>
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col animate-pulse h-full">
    <div className="aspect-[4/3] bg-stone-100" />
    <div className="p-4 space-y-3 flex flex-col flex-1">
      <div className="space-y-1.5">
        <div className="h-4 bg-stone-100 rounded-md w-3/4" />
        <div className="h-3 bg-stone-50 rounded-md w-5/6" />
      </div>
      <div className="h-5 bg-stone-100 rounded-md w-1/3 mt-2" />
      <div className="h-10 bg-stone-50 rounded-xl w-full mt-auto" />
    </div>
  </div>
);

function ShopQueryHandler({
  categories,
  setSelectedCategory,
  setActiveFilters,
}: {
  categories: any[];
  setSelectedCategory: any;
  setActiveFilters: any;
}) {
  const searchParams = useSearchParams();
  const initialCatParam = searchParams.get("category");

  useEffect(() => {
    if (initialCatParam && categories.length > 0) {
      const paramLower = initialCatParam.toLowerCase();
      const matched = categories.find(
        (c) =>
          c.categoryname?.toLowerCase() === paramLower ||
          c.categoryname?.toLowerCase().includes(paramLower) ||
          paramLower.includes(c.categoryname?.toLowerCase()),
      );
      if (matched) {
        setSelectedCategory(matched.categoryname);
        setActiveFilters((prev: any) => ({
          ...prev,
          categoryid: matched.categoryid,
          subcategoryid: 0,
          page: 1,
        }));
      }
    }
  }, [initialCatParam, categories]);

  return null;
}

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
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
    return () =>
      window.removeEventListener("favoritesUpdated", fetchFavourites);
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
  });

  const mapWeightToValue = (w: string): number => {
    if (w === "250g") return 250;
    if (w === "500g") return 500;
    if (w === "1kg") return 1;
    if (w === "2kg") return 2;
    return 0;
  };

  const fetchCategories = async () => {
    try {
      const response = await API.post(API_ROUTES.CATEGORIES);
      if (response.status === 200) {
        setCategories(response.data["data"] || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async ({ categoryid }: { categoryid: number }) => {
    try {
      const response = await API.post(API_ROUTES.SUBCATEGORIES, {
        categoryid,
      });
      if (response.status === 200) {
        setSubcategories(response.data["data"] || []);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

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

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products whenever activeFilters change
  useEffect(() => {
    fetchProducts();
  }, [activeFilters]);

  // Fetch subcategories when activeFilters.categoryid changes
  useEffect(() => {
    if (activeFilters.categoryid > 0) {
      fetchSubcategories({ categoryid: activeFilters.categoryid });
    } else {
      setSubcategories([]);
    }
  }, [activeFilters.categoryid]);

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

  // Mapping dynamic API product models to the local component schema
  const mappedProducts = products.map((p: Product) => {
    const rawPrice = p.price || 0;
    const rawSellingPrice = p.sellingprice || 0;

    let displayPrice = rawPrice;
    let originalPrice: number | null = null;
    let discountPercent: number | null = null;

    if (rawSellingPrice > 0 && rawSellingPrice < rawPrice) {
      displayPrice = rawSellingPrice;
      originalPrice = rawPrice;
      discountPercent = Math.round(
        ((rawPrice - rawSellingPrice) / rawPrice) * 100,
      );
    } else {
      displayPrice = rawSellingPrice > 0 ? rawSellingPrice : rawPrice;
      originalPrice = null;
      discountPercent = null;
    }

    return {
      id: p.productid,
      name: p.productname || "",
      image: p.productimage
        ? p.productimage.startsWith("http")
          ? p.productimage
          : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${p.productimage}`
        : "/placeholder.png",
      price: displayPrice,
      originalPrice,
      discountPercent,
      category: p.categoryname || "",
      subcategory: p.subcategoryname || "",
      isNew: p.isFeatured,
      desc: p.description,
      weight: p.weight,
      unit: p.unit,
      itemtype:
        p.itemtype ||
        ((p.categoryname && p.categoryname.toLowerCase().includes("gift")) ||
          p.categoryid === 4
          ? "gift"
          : "product"),
      bid: p.bid || 1,
      availablestock: p.availablestock || 0,
    };
  });

  const searchedProducts = mappedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedProducts = searchedProducts;

  const FilterContent = () => (
    <div className="divide-y divide-stone-100">
      <div className="px-5 py-5">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">
          {t.shop_filters.categories}
        </h4>
        <div className="space-y-3">
          <button
            onClick={() => {
              setSelectedCategory("All Categories");
              setActiveFilters((prev: any) => ({
                ...prev,
                categoryid: 0,
                subcategoryid: 0,
                page: 1,
              }));
              if (isMobileFilterOpen) setIsMobileFilterOpen(false);
            }}
            className={`block text-[12px] font-bold transition-colors cursor-pointer ${selectedCategory === "All Categories" ? "text-[var(--olive)] font-extrabold" : "text-stone-500 hover:text-stone-900"}`}
          >
            {t.shop_filters.all_collections}
          </button>
          <div className="pl-4 space-y-3">
            {categories.map((cat) => (
              <button
                key={cat.categoryid || cat.categoryname}
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
                className={`block text-[12px] font-bold transition-colors cursor-pointer text-left w-full ${selectedCategory === cat.categoryname ? "text-stone-900 font-extrabold" : "text-stone-500 hover:text-stone-900"}`}
              >
                {selectedCategory === cat.categoryname && (
                  <ChevronRight className="w-3 h-3 inline mr-1 text-stone-400" />
                )}
                {cat.categoryname}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedCategory !== "All Categories" && subcategories.length > 0 && (
        <details className="group" open>
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50/50 transition-colors list-none select-none">
            <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">
              {t.shop_filters.subcategories || "Sub Categories"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 space-y-2.5">
            {subcategories.map((sub) => (
              <label
                key={sub.subcategoryid}
                className="flex items-center gap-3 cursor-pointer group/label"
              >
                <input
                  type="checkbox"
                  checked={activeFilters.subcategoryid === sub.subcategoryid}
                  onChange={() => {
                    setActiveFilters((prev: any) => ({
                      ...prev,
                      subcategoryid:
                        prev.subcategoryid === sub.subcategoryid
                          ? 0
                          : sub.subcategoryid,
                      page: 1,
                    }));
                  }}
                  className="w-3.5 h-3.5 border-stone-300 rounded-sm text-[var(--olive)] focus:ring-0 cursor-pointer"
                />
                <span
                  className={`text-[12px] font-medium transition-colors ${activeFilters.subcategoryid === sub.subcategoryid ? "text-stone-900 font-bold" : "text-stone-600 group-hover/label:text-stone-900"}`}
                >
                  {sub.subcategoryname}
                </span>
              </label>
            ))}
          </div>
        </details>
      )}

      <details className="group" open>
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50/50 transition-colors list-none select-none">
          <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">
            {t.shop_filters.price}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 space-y-2.5">
          {[
            {
              label: t.shop_filters.price_options?.under_500 || "Under 500",
              value: "0-500",
            },
            {
              label: "500-1000",
              value: "500-1000",
            },
            {
              label: "1000-1500",
              value: "1000-1500",
            },
            {
              label: t.shop_filters.price_options?.above_1500 || "Above 1500",
              value: "above-1500",
            },
          ].map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-3 cursor-pointer group/label"
            >
              <input
                type="checkbox"
                checked={activeFilters.pricerange === range.value}
                onChange={() => {
                  setActiveFilters((prev: any) => ({
                    ...prev,
                    pricerange:
                      prev.pricerange === range.value ? "" : range.value,
                    page: 1,
                  }));
                }}
                className="w-3.5 h-3.5 border-stone-300 rounded-sm text-[var(--olive)] focus:ring-0 cursor-pointer"
              />
              <span
                className={`text-[12px] font-medium transition-colors ${activeFilters.pricerange === range.value ? "text-stone-900 font-bold" : "text-stone-600 group-hover/label:text-stone-900"}`}
              >
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </details>

      <details className="group" open>
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50/50 transition-colors list-none select-none">
          <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">
            {t.shop_filters.weight}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 grid grid-cols-2 gap-2 animate-in fade-in duration-300">
          {["250g", "500g", "1kg", "2kg"].map((w) => {
            const numericWeight = mapWeightToValue(w);
            return (
              <button
                key={w}
                onClick={() => {
                  setActiveFilters((prev: any) => ({
                    ...prev,
                    weight: prev.weight === numericWeight ? 0 : numericWeight,
                    page: 1,
                  }));
                }}
                className={`py-2 rounded-sm text-[11px] font-bold border transition-all cursor-pointer ${activeFilters.weight === numericWeight
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 shadow-sm"
                  }`}
              >
                {w}
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fafaf9] pt-16">
      <Suspense fallback={null}>
        <ShopQueryHandler
          categories={categories}
          setSelectedCategory={setSelectedCategory}
          setActiveFilters={setActiveFilters}
        />
      </Suspense>
      {/* PREMIUM HERO SECTION */}
      <div className="relative bg-transparent">
        <div className="max-w-7xl mx-auto px-6 pt-2 pb-1">
          <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500">
            {/* Elegant luxury top gold-to-olive line accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--gold)] via-[var(--olive)] to-[var(--gold)]" />

            {/* Subtle premium textured background */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

            <div className="relative px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                {/* Small luxury category tag */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[9px] font-black tracking-widest text-stone-500 uppercase">
                  <span className="w-1.5 h-1.5 bg-[var(--olive)] rounded-full animate-pulse" />
                  {t.shop || "Shop"}
                </span>

                {/* Heading */}
                <h1 className="text-base md:text-lg font-black text-stone-900 tracking-tight leading-tight">
                  {t.shop_headline}
                </h1>

                {/* Description */}
                <p className="text-[11px] md:text-xs text-stone-500 font-medium leading-relaxed">
                  {t.shop_desc}
                </p>
              </div>

              {/* Subtle luxury decorative badge */}
              <div className="hidden md:flex items-center gap-3 shrink-0 bg-stone-50/80 border border-stone-100 rounded-xl px-4 py-2.5">
                <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />
                <span className="text-[10px] font-bold text-stone-600 tracking-wider uppercase">
                  100% Organic & Pure
                </span>
                <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHOP CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 bg-white border border-stone-200 shadow-sm overflow-hidden rounded-1xl">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-white">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  {t.shop_filters.title}
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setActiveFilters({
                      categoryid: 0,
                      subcategoryid: 0,
                      pricerange: "",
                      weight: 0,
                      sortby: "",
                      page: 1,
                    });
                    setSortBy("");
                  }}
                  className="text-[11px] font-bold text-stone-400 hover:text-[var(--olive)] transition-colors uppercase tracking-tight cursor-pointer"
                >
                  {t.shop_filters.clear_all}
                </button>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile/Tablet Filter Trigger */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 shadow-sm hover:border-[var(--olive)] transition-colors"
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
                    className="flex items-center justify-between w-full bg-white border border-stone-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-4 py-2.5 text-xs font-bold text-stone-700 hover:border-[var(--olive)] hover:shadow-md transition-all duration-300 cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                      {sortBy === "" && "Sort: Default"}
                      {sortBy === "lowToHigh" && "Price: Low to High"}
                      {sortBy === "highToLow" && "Price: High to Low"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180 text-[var(--olive)]" : ""}`}
                    />
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-stone-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left font-bold transition-colors cursor-pointer ${sortBy === ""
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
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left font-bold transition-colors cursor-pointer ${sortBy === "lowToHigh"
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
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left font-bold transition-colors cursor-pointer ${sortBy === "highToLow"
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

              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs flex items-center bg-white border border-stone-200 rounded-xl shadow-sm px-4 py-2.5 transition-all hover:border-[var(--olive)]">
                <Search className="h-4 w-4 text-stone-300 mr-3" />
                <input
                  type="text"
                  placeholder={t.search_placeholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveFilters((prev: any) => ({
                      ...prev,
                      page: 1,
                    }));
                  }}
                  className="bg-transparent text-xs font-bold text-stone-700 outline-none w-full placeholder:text-stone-300"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const cartItem = cartItems.find(
                    (item) =>
                      (item.itemtype === "product" &&
                        item.productid === product.id) ||
                      (item.itemtype === "gift" &&
                        item.giftid === product.id) ||
                      item.productid === product.id ||
                      item.giftid === product.id,
                  );
                  return (
                    <Link
                      href={
                        product.itemtype === "gift"
                          ? `/gift-detail/${product.id}?productid=${product.id}&bid=${product.bid || 1}`
                          : `/product-detail/${product.id}?productid=${product.id}&bid=${product.bid || 1}`
                      }
                      key={product.id}
                      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 justify-center items-center flex">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110 ${product.availablestock <= 0 ? "grayscale opacity-60" : ""}`}
                        />
                        {product.availablestock <= 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                            <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}

                        {/* Floating Labels & Actions */}
                        <div className="absolute top-3 right-3 z-20">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleActionWithLogin(async () => {
                                if (product.id === undefined) return;
                                try {
                                  const response = await API.post(
                                    API_ROUTES.ADDFAVOURITE,
                                    { productid: product.id },
                                  );
                                  if (response.status === 200) {
                                    window.dispatchEvent(
                                      new Event("favoritesUpdated"),
                                    );
                                  }
                                } catch (err) {
                                  console.error(
                                    "Error adding to wishlist:",
                                    err,
                                  );
                                }
                              });
                            }}
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 ${product.id !== undefined && favouriteProductIds.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                            />
                          </button>
                        </div>

                        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                          {product.discountPercent && (
                            <span className="px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
                              {product.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {(product as any).weight && (product as any).unitname && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                {(product as any).weight} {(product as any).unitname}
                              </span>
                            )}
                            <p className="text-[11px] text-gray-400 font-medium line-clamp-1 flex-1">
                              {(product as any).desc ||
                                "Tradizions premium selection for health."}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <div className="pt-2 mt-auto">
                          {cartItem ? (
                            <div className="flex items-center justify-between border border-[var(--olive)] rounded-xl overflow-hidden bg-white h-11">
                              <button
                                disabled={updatingCartId === cartItem.cartid}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setUpdatingCartId(cartItem.cartid);
                                  try {
                                    const newQty = cartItem.quantity - 1;
                                    const response = await API.post(
                                      API_ROUTES.UPDATEQUANTITY,
                                      {
                                        cartid: cartItem.cartid,
                                        quantity: newQty,
                                      },
                                    );
                                    if (response.status === 200) {
                                      window.dispatchEvent(
                                        new Event("cartUpdated"),
                                      );
                                    }
                                  } catch (err) {
                                    console.error(
                                      "Error updating quantity:",
                                      err,
                                    );
                                  } finally {
                                    setUpdatingCartId(null);
                                  }
                                }}
                                className="px-4 py-2 hover:bg-stone-50 font-black text-sm text-[var(--olive)] disabled:opacity-50 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs text-gray-800">
                                {updatingCartId === cartItem.cartid
                                  ? "..."
                                  : cartItem.quantity}
                              </span>
                              <button
                                disabled={updatingCartId === cartItem.cartid}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setUpdatingCartId(cartItem.cartid);
                                  try {
                                    const newQty = cartItem.quantity + 1;
                                    const response = await API.post(
                                      API_ROUTES.UPDATEQUANTITY,
                                      {
                                        cartid: cartItem.cartid,
                                        quantity: newQty,
                                      },
                                    );
                                    if (response.status === 200) {
                                      window.dispatchEvent(
                                        new Event("cartUpdated"),
                                      );
                                    }
                                  } catch (err) {
                                    console.error(
                                      "Error updating quantity:",
                                      err,
                                    );
                                  } finally {
                                    setUpdatingCartId(null);
                                  }
                                }}
                                className="px-4 py-2 hover:bg-stone-50 font-black text-sm text-[var(--olive)] disabled:opacity-50 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={
                                addingToCartId === (product.id || null) ||
                                product.availablestock <= 0
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                if (product.availablestock <= 0) return;
                                handleActionWithLogin(async () => {
                                  setAddingToCartId(product.id || null);
                                  try {
                                    const response = await API.post(
                                      API_ROUTES.ADDTOCART,
                                      {
                                        bid: product.bid || 1,
                                        productid:
                                          product?.itemtype === "product"
                                            ? product.id
                                            : null,
                                        giftid:
                                          product?.itemtype === "gift"
                                            ? product.id
                                            : null,
                                        quantity: 1,
                                        itemtype:
                                          product?.itemtype || "product",
                                      },
                                    );
                                    if (response.status === 200) {
                                      window.dispatchEvent(
                                        new Event("cartUpdated"),
                                      );
                                    } else {
                                      alert(
                                        "Failed to add product to cart. Please try again.",
                                      );
                                    }
                                  } catch (err: any) {
                                    console.error("Error adding to cart:", err);
                                    alert(
                                      err?.response?.data?.message ||
                                      "An error occurred while adding to cart.",
                                    );
                                  } finally {
                                    setAddingToCartId(null);
                                  }
                                });
                              }}
                              className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${product.availablestock <= 0 ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#FCFBF9] border-gray-100 text-gray-900 hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"} disabled:opacity-50`}
                            >
                              <span>
                                {product.availablestock <= 0
                                  ? "OUT OF STOCK"
                                  : addingToCartId === product.id
                                    ? "ADDING..."
                                    : "ADD TO CART"}
                              </span>
                              {addingToCartId === product.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ShoppingCart className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <NoResultsFound
                  onClear={() => {
                    setSelectedCategory("All Categories");
                    setActiveFilters({
                      categoryid: 0,
                      subcategoryid: 0,
                      pricerange: "",
                      weight: 0,
                      sortby: "",
                      page: 1,
                    });
                    setSearchQuery("");
                    setSortBy("");
                  }}
                  t={t}
                />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-16">
                <button
                  disabled={activeFilters.page === 1}
                  onClick={() =>
                    setActiveFilters((prev: any) => ({
                      ...prev,
                      page: prev.page - 1,
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
                        setActiveFilters((prev: any) => ({
                          ...prev,
                          page: i + 1,
                        }))
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
                    setActiveFilters((prev: any) => ({
                      ...prev,
                      page: prev.page + 1,
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

      {/* MOBILE FILTER OVERLAY - NO TRANSITION */}
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
