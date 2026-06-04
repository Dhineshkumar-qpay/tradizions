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
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES ,IMAGE_URL} from "@/routes/api_routes";

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

export default function FeaturedProductsPage() {
  const [selectedLang, setSelectedLang] = useState("EN");
  const [products, setProducts] = useState<any[]>([]);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters, Search, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
    <main className="min-h-screen bg-[#fafaf9] pt-16">
      {/* HEADER */}
      <div className="relative bg-transparent">
        <div className="max-w-7xl mx-auto px-6 pt-2 pb-1">
          <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--gold)] via-[var(--olive)] to-[var(--gold)]" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />
            <div className="relative px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[9px] font-black tracking-widest text-stone-500 uppercase">
                  <span className="w-1.5 h-1.5 bg-[var(--olive)] rounded-full animate-pulse" />
                  {t.featured_products || "Featured Products"}
                </span>
                <h1 className="text-base md:text-lg font-black text-stone-900 tracking-tight leading-tight">
                  {t.featured_desc ||
                    "Explore our top picks carefully selected for you."}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR FILTERS */}
          <aside className="w-full lg:w-56 shrink-0 space-y-6">
            <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                          sortBy === item.id
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                          priceRange === item.id
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
            {/* SEARCH BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="relative w-full sm:max-w-xs flex items-center bg-white border border-stone-200 rounded-xl shadow-sm px-4 py-2.5 transition-all hover:border-[var(--olive)]">
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
            </div>

            {/* PRODUCTS GRID */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 gap-y-12">
                {paginatedProducts.map((product) => {
                  const id =
                    product.productid !== undefined
                      ? product.productid
                      : product.id;
                  const name = product.productname || product.name;
                  const price = product.sellingprice || product.price || 0;
                  const originalPrice =
                    product.price !== undefined &&
                    product.sellingprice !== undefined &&
                    product.price > product.sellingprice
                      ? product.price
                      : null;
                  const image = product.productimage
                    ? getImageUrl(product.productimage)
                    : product.image || "/placeholder.png";
                  const isFav =
                    id !== undefined && favouriteProductIds.includes(id);

                  return (
                    <Link
                      href={`/product-detail/${id}?productid=${id}&bid=${product.bid || 1}`}
                      key={id}
                      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img
                          src={image}
                          alt={name}
                          className={`h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110 ${(product.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
                        />
                        {(product.availablestock ?? 0) <= 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                            <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-20">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleActionWithLogin(async () => {
                                if (id === undefined) return;
                                try {
                                  const response = await API.post(
                                    API_ROUTES.ADDFAVOURITE,
                                    { productid: id },
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
                              className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`}
                            />
                          </button>
                        </div>
                        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                          {originalPrice && originalPrice > price && (
                            <span className="px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
                              {Math.round(
                                ((originalPrice - price) / originalPrice) * 100,
                              )}
                              % OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                            {name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {product.weight &&
                              (product.unit || product.unitname) && (
                                <span className="inline-block bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-stone-200 shrink-0">
                                  {product.weight}{" "}
                                  {product.unit || product.unitname}
                                </span>
                              )}
                            <p className="text-[11px] text-gray-400 font-medium line-clamp-1 flex-1">
                              {product.desc ||
                                "Tradizions premium selection for health."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-gray-900">
                            ₹{price.toLocaleString()}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="pt-2 mt-auto">
                          <button
                            disabled={(product.availablestock ?? 0) <= 0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if ((product.availablestock ?? 0) <= 0) return;
                              handleActionWithLogin(async () => {
                                try {
                                  const response = await API.post(
                                    API_ROUTES.ADDTOCART,
                                    {
                                      bid: product.bid || 1,
                                      productid: id,
                                      giftid: null,
                                      quantity: 1,
                                      itemtype: "product",
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
                                }
                              });
                            }}
                            className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${
                              (product.availablestock ?? 0) <= 0
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-[#FCFBF9] border-gray-100 text-gray-900 hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
                            } disabled:opacity-50`}
                          >
                            <span>
                              {(product.availablestock ?? 0) <= 0
                                ? "OUT OF STOCK"
                                : "ADD TO CART"}
                            </span>
                            <ShoppingCart className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
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
    </main>
  );
}
