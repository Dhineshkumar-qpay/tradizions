"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

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
  const cleanedBase = IMAGE_URL.endsWith("/")
    ? IMAGE_URL.slice(0, -1)
    : IMAGE_URL;
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

function HealthGoalProductsContent() {
  const searchParams = useSearchParams();
  const goalid = searchParams.get("goalid");

  const [products, setProducts] = useState<any[]>([]);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("EN");

  // Filters, Search, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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

  const fetchProducts = async () => {
    if (!goalid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Send goalid to fetch specific products
      const payload: any = { goalid: Number(goalid) };
      const response = await API.post(API_ROUTES.HEALTHGOALPRODUCTS, payload);

      if (response.data && response.data.success) {
        setProducts(response.data.products || response.data.data || []);
      } else if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching health goal products:", err);
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
    fetchProducts();
  }, [goalid]);

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

  const filteredProducts = products.filter((p) => {
    const nameMatch = (p.productname || p.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-[#fafaf9] pt-24 lg:pt-20">
      {/* ──── Health Goals Hero / Header ──── */}
      <section className="relative pt-15 pb-6 px-6 sm:px-12 lg:px-20 overflow-hidden bg-white border-b border-stone-100">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[var(--beige)]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-1 bg-gradient-to-r from-[var(--olive)] via-[var(--orange)] to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[var(--olive)]">Health Goals</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--dark-brown)] leading-tight tracking-tight">
                {t.health_goal_products || "Health Goal Products"}
              </h1>
              <p className="text-sm text-stone-500 max-w-lg font-medium leading-relaxed">
                {t.health_goal_products_desc || "Products targeted for your wellness"}
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
        <div className="space-y-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-2 gap-y-4 md:gap-6 md:gap-y-12">
              {Array.from({ length: 8 }).map((_, idx) => (
                <ProductSkeleton key={idx} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-2 gap-y-4 md:gap-6 md:gap-y-12">
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
                    className="group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--olive)]/60"
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
                                console.error("Error adding to wishlist:", err);
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
                              product.description ||
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
                              : "bg-[var(--olive)]/10 border-[var(--olive)]/20 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
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
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100 text-center px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-stone-300" />
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-2">{t.no_products_found || "No products found"}</h3>
              <p className="text-sm text-stone-500 max-w-sm">{t.no_products_matching || "We couldn't find any products matching your current search criteria. Try using different keywords."}</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-6 px-6 py-3 rounded-xl bg-[var(--olive)]/10 text-[var(--olive)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--olive)] hover:text-white transition-colors"
              >
                {t.clear_search || "Clear Search"}
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {paginatedProducts.length > 0 &&
            filteredProducts.length > ITEMS_PER_PAGE && (
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
                  disabled={
                    startIndex + ITEMS_PER_PAGE >= filteredProducts.length
                  }
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-6 py-3 rounded-full border border-gray-100 bg-white text-[10px] font-bold tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  NEXT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}

export default function HealthGoalProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <HealthGoalProductsContent />
    </Suspense>
  );
}
