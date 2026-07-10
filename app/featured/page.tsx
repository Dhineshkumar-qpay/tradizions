"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Minus,
  Star,
  X,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
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



export default function FeaturedProductsPage() {
  const [selectedLang, setSelectedLang] = useState("EN");
  const [products, setProducts] = useState<any[]>([]);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters, Search, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const ITEMS_PER_PAGE = 20;

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

  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    try {
      const payload: any = { page, limit: ITEMS_PER_PAGE };
      if (sortBy) payload.sortBy = sortBy;
      if (priceRange) payload.priceRange = priceRange;

      const response = await API.post(API_ROUTES.FEATURED, payload);
      if (response.data && response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching featured products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
    window.addEventListener("favoritesUpdated", fetchFavourites);
    window.addEventListener("loginSuccess", fetchFavourites);
    return () => {
      window.removeEventListener("favoritesUpdated", fetchFavourites);
      window.removeEventListener("loginSuccess", fetchFavourites);
    };
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, sortBy, priceRange]);

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

  // Client-side filtering and searching (since API only handles pagination)
  const filteredProducts = products.filter((p) => {
    const nameMatch = (p.productname || p.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const paginatedProducts = filteredProducts;

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* ──── Featured Hero / Header ──── */}
      <section className="relative pt-15 pb-6 px-6 sm:px-12 lg:px-20 overflow-hidden bg-white border-b border-stone-100">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[var(--beige)]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-1 bg-gradient-to-r from-[var(--olive)] via-[var(--orange)] to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[var(--olive)]">{t.featured_products || "Featured Products"}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--dark-brown)] leading-tight tracking-tight">
                {t.featured_products || "Featured Products"}
              </h1>
              <p className="text-sm text-stone-500 max-w-lg font-medium leading-relaxed">
                {t.featured_desc || "Explore our top picks carefully selected for you."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end shrink-0">
              {[
                { icon: "🌿", label: "100% Natural" },
                { icon: "📦", label: "Fast Delivery" },
                { icon: "⭐", label: "Premium Grade" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-bold text-stone-600 tracking-wide"
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 md:py-10 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR FILTERS (Desktop) */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-6">
            <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden sticky top-32">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-white">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setSortBy("");
                    setPriceRange("");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="text-[11px] font-bold text-stone-400 hover:text-[var(--olive)] transition-colors uppercase tracking-tight cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Sort By
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "", label: "Default" },
                      { id: "lowToHigh", label: "Price: Low to High" },
                      { id: "highToLow", label: "Price: High to Low" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSortBy(item.id);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${sortBy === item.id
                            ? "bg-[var(--olive)]/5 border-[var(--olive)] text-[var(--olive)] shadow-sm scale-[1.02]"
                            : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                          }`}
                      >
                        <span className="text-[11px] font-bold">
                          {item.label}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${sortBy === item.id ? "border-[var(--olive)]" : "border-stone-200"}`}
                        >
                          {sortBy === item.id && (
                            <div className="w-1.5 h-1.5 bg-[var(--olive)] rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Price Range
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "", label: "All Prices" },
                      { id: "under500", label: "Under ₹500" },
                      { id: "500to1000", label: "₹500 to ₹1000" },
                      { id: "1000to1500", label: "₹1000 to ₹1500" },
                      { id: "above1500", label: "Above ₹1500" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setPriceRange(item.id);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${priceRange === item.id
                            ? "bg-[var(--olive)]/5 border-[var(--olive)] text-[var(--olive)] shadow-sm scale-[1.02]"
                            : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                          }`}
                      >
                        <span className="text-[11px] font-bold">
                          {item.label}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${priceRange === item.id ? "border-[var(--olive)]" : "border-stone-200"}`}
                        >
                          {priceRange === item.id && (
                            <div className="w-1.5 h-1.5 bg-[var(--olive)] rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-8">
            {/* SEARCH BAR & MOBILE FILTER */}
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="relative flex-1 sm:max-w-xs flex items-center bg-white border border-stone-200 rounded-xl shadow-sm px-4 py-2.5 transition-all hover:border-[var(--olive)]">
                <Search className="h-4 w-4 text-stone-300 mr-3" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-stone-700 outline-none w-full placeholder:text-stone-300"
                />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-700 font-bold text-[11px] shadow-sm hover:border-[var(--olive)] transition-colors"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>

            {/* PRODUCTS GRID */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-2 gap-y-4 md:gap-6 md:gap-y-12">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.productid !== undefined ? product.productid : product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                No products found matching your criteria.
              </div>
            )}

            {/* PAGINATION */}
            {paginatedProducts.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-16">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-6 py-3 rounded-full border border-gray-100 bg-white text-[10px] font-bold tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> PREVIOUS
                </button>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full font-bold text-[10px] transition-all border bg-[var(--olive)] text-white border-[var(--olive)] shadow-lg shadow-emerald-900/10">
                    {currentPage}
                  </button>
                </div>
                <button
                  disabled={products.length < ITEMS_PER_PAGE}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-6 py-3 rounded-full border border-gray-100 bg-white text-[10px] font-bold tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
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

            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Sort By
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { id: "", label: "Default" },
                    { id: "lowToHigh", label: "Price: Low to High" },
                    { id: "highToLow", label: "Price: High to Low" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSortBy(item.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${sortBy === item.id
                          ? "bg-[var(--olive)]/5 border-[var(--olive)] text-[var(--olive)] shadow-sm scale-[1.02]"
                          : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                        }`}
                    >
                      <span className="text-[11px] font-bold">
                        {item.label}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${sortBy === item.id ? "border-[var(--olive)]" : "border-stone-200"}`}
                      >
                        {sortBy === item.id && (
                          <div className="w-1.5 h-1.5 bg-[var(--olive)] rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Price Range
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { id: "", label: "All Prices" },
                    { id: "under500", label: "Under ₹500" },
                    { id: "500to1000", label: "₹500 to ₹1000" },
                    { id: "1000to1500", label: "₹1000 to ₹1500" },
                    { id: "above1500", label: "Above ₹1500" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPriceRange(item.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${priceRange === item.id
                          ? "bg-[var(--olive)]/5 border-[var(--olive)] text-[var(--olive)] shadow-sm scale-[1.02]"
                          : "bg-white border-stone-100 text-stone-600 hover:border-stone-200 hover:bg-stone-50/50 hover:shadow-sm"
                        }`}
                    >
                      <span className="text-[11px] font-bold">
                        {item.label}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${priceRange === item.id ? "border-[var(--olive)]" : "border-stone-200"}`}
                      >
                        {priceRange === item.id && (
                          <div className="w-1.5 h-1.5 bg-[var(--olive)] rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
