"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Search,
  Package,
  CreditCard,
  Check,
  Sparkles,
  Tag,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";

import { useRouter } from "next/navigation";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const STEP_LABELS = ["Choose Packaging", "Add Products", "Personalize"];

export default function CustomGiftBuilder() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [greetingCard, setGreetingCard] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const fetchGiftPacks = async () => {
      try {
        const response = await API.post(API_ROUTES.GETGIFTPACKS);
        if (response.data?.data) {
          const mapped = response.data.data.map((item: any) => ({
            id: item.giftpackid,
            name: item.giftpackname,
            price: item.giftpackprice || 0,
            tag: (item.price || 0) > 300 ? "PREMIUM" : "STANDARD",
            image: item.giftpackimage || "/placeholder.png",
            desc: item.description || "Beautiful gift pack for your beloved.",
            capacity: "Up to 5 items",
          }));
          setPackagingOptions(mapped);
        }
      } catch (error) {
        console.error("Error fetching gift packs:", error);
      }
    };
    fetchGiftPacks();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsSearching(true);
      try {
        const response = await API.post(API_ROUTES.GIFTPRODUCTS, { bid: 1 });
        if (response.data?.data) {
          setAllProducts(response.data.data);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setAllProducts([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = search
    ? allProducts.filter((product) =>
      product.productname?.toLowerCase().includes(search.toLowerCase()),
    )
    : allProducts;

  const handleAddItem = (product: any) => {
    setSelectedItems((prev) => {
      const found = prev.find((i) => i.productid === product.productid);
      if (found)
        return prev.map((i) =>
          i.productid === product.productid ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveItem = (productid: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) =>
          i.productid === productid ? { ...i, qty: Math.max(0, i.qty - 1) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const handleDeleteItem = (productid: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.productid !== productid));
  };

  const productsTotal = selectedItems.reduce(
    (a, i) => a + (i.sellingprice || i.price) * i.qty,
    0,
  );
  const packageTotal = selectedPackage?.price || 0;
  const personalizationTotal = greetingCard ? 50 : 0;
  const grandTotal = productsTotal + packageTotal + personalizationTotal;
  const totalQty = selectedItems.reduce((a, i) => a + i.qty, 0);

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

  const handleCompleteGift = () => {
    if (!selectedPackage || selectedItems.length === 0) return;

    handleActionWithLogin(async () => {
      setIsSubmitting(true);
      try {
        const payload = selectedItems.map((item) => ({
          giftpackid: selectedPackage.id,
          productid: item.productid,
          productname: item.productname,
          productimage: item.productimage,
          quantity: item.qty,
          sellingprice: item.sellingprice || item.price,
        }));

        const createResponse = await API.post(API_ROUTES.CREATECUSTOMGIFT, {
          products: payload,
        });

        if (createResponse.status === 200 || createResponse.status === 201) {
          const addToCartResponse = await API.post(API_ROUTES.ADDCUSTOMGIFTCART, {
            giftpackid: selectedPackage.id,
          });

          if (
            addToCartResponse.status === 200 ||
            addToCartResponse.status === 201
          ) {
            window.dispatchEvent(new Event("cartUpdated"));
            alert("Custom gift added to cart successfully!");
            setSelectedItems([]);
            setSelectedPackage(null);
            window.dispatchEvent(new Event("openCartSidebar"));
          }
        }
      } catch (error) {
        console.error("Error creating custom gift:", error);
        alert("Failed to create custom gift. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-[var(--olive)] selection:text-white pb-24">
      {/* ── Premium Hero Section ── */}
      <div className="bg-gradient-to-br from-[var(--olive)]/35 via-white to-[var(--orange)]/15 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[var(--olive)]/20 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[var(--orange)]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--olive-dark)]">The Artisan Builder</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 text-gray-900">
            {t.custom_gift?.title || "Bespoke Hampers"}
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-gray-600 font-medium">
            {t.custom_gift?.desc || "Design a truly unique gifting experience. Hand-select from our premium vessels and curate with artisanal products to build the perfect custom hamper."}
          </p>
        </div>
      </div>

      {/* ── Builder Interface ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: The Process */}
          <div className="lg:col-span-8 space-y-12">

            {/* Step 1: Packaging */}
            <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-stone-200/40 border border-stone-200/60 relative overflow-hidden">
              <div className="flex items-center gap-5 mb-10 pb-6 border-b border-stone-100">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] font-bold text-xl">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                    {t.custom_gift?.step1_title || "Choose Your Vessel"}
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    {t.custom_gift?.step1_desc || "Select the perfect packaging to present your gifts"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {packagingOptions.map((pkg) => {
                  const active = selectedPackage?.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border-2 ${active
                        ? "border-[var(--olive)] bg-[var(--olive)]/5 shadow-lg shadow-[var(--olive)]/10 scale-[1.02]"
                        : "border-transparent bg-stone-50 hover:bg-stone-100"
                        }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-white">
                        {active && (
                          <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--olive)] text-white shadow-md animate-in zoom-in">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <img
                          src={pkg.image.includes("http") ? pkg.image : IMAGE_URL + pkg.image}
                          alt={pkg.name}
                          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${active ? "scale-105" : "group-hover:scale-105"}`}
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-stone-900 leading-tight">
                            {pkg.name}
                          </h4>
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-stone-200 text-[9px] font-bold uppercase tracking-widest text-stone-600">
                            {pkg.tag}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mb-4 line-clamp-2">
                          {pkg.desc}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-stone-200/50">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                            {pkg.capacity}
                          </span>
                          <span className="text-sm font-black text-[var(--olive)]">
                            +₹{pkg.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Products */}
            <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-stone-200/40 border border-stone-200/60 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                      {t.custom_gift?.step2_title || "Curate Contents"}
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                      {t.custom_gift?.step2_desc || "Hand-pick artisanal items to fill your vessel"}
                    </p>
                  </div>
                </div>

                <div className="relative w-full md:max-w-xs group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-400 group-focus-within:text-[var(--orange)] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.custom_gift?.search || "Search collection..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[var(--orange)] focus:ring-4 focus:ring-[var(--orange)]/10 transition-all placeholder:text-stone-400 font-medium"
                  />
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="mb-10 bg-stone-50 rounded-2xl p-6 border border-stone-200">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 mb-5 flex items-center gap-3">
                    <Package className="w-4 h-4 text-[var(--orange)]" />
                    {t.custom_gift?.inside_vessel || "Inside Your Vessel"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                        <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-stone-100">
                          <img
                            src={item.productimage?.includes("http") ? item.productimage : IMAGE_URL + item.productimage}
                            alt={item.productname}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-bold text-stone-900">
                            {item.productname}
                          </p>
                          <p className="text-[11px] font-medium text-[var(--olive)] mt-0.5">
                            ₹{item.sellingprice || item.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-200">
                          <button
                            onClick={() => handleRemoveItem(item.productid)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500 text-stone-500 hover:text-stone-900 hover:shadow-sm transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-stone-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-stone-500 hover:text-stone-900 hover:shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSearching ? (
                <div className="flex justify-center py-20">
                  <div className="h-10 w-10 animate-spin border-4 border-stone-200 border-t-[var(--orange)] rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
                  {filteredProducts.map((product, idx) => {
                    const qty = selectedItems.find((i) => i.productid === product.productid)?.qty || 0;
                    return (
                      <div
                        key={idx}
                        className="group flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 hover:border-stone-300 transition-all duration-300 h-full"
                      >
                        <div className="relative aspect-square w-full shrink-0 bg-stone-50 overflow-hidden">
                          <img
                            src={product.productimage?.includes("http") ? product.productimage : product.productimage ? IMAGE_URL + product.productimage : "/placeholder.png"}
                            alt={product.productname}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {qty > 0 && (
                            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--orange)] text-white shadow-md animate-in zoom-in">
                              <span className="text-xs font-bold">{qty}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-grow p-4">
                          <h3 className="text-xs font-bold text-stone-900 leading-snug line-clamp-2 mb-1">
                            {product.productname}
                          </h3>
                          <p className="text-sm font-black text-[var(--olive)] mt-auto">
                            ₹{product.sellingprice || product.price}
                          </p>
                        </div>

                        <div className="px-4 pb-4 shrink-0">
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddItem(product)}
                              className="w-full bg-[var(--olive-dark)] text-white py-2.5 rounded-[0px] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--orange-dark)] hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                              {t.custom_gift?.add || "Add Item"}
                            </button>
                          ) : (
                            <div className="w-full flex items-center justify-between bg-stone-50 rounded-xl border border-stone-200 h-10 px-1">
                              <button
                                onClick={() => handleRemoveItem(product.productid)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-stone-600 hover:text-stone-900 transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold text-stone-900">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAddItem(product)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-stone-600 hover:text-stone-900 transition-all"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Floating Summary Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-stone-200/50">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <div className="p-2.5 bg-stone-100 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-stone-900" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {t.custom_gift?.order_summary || "Hamper Summary"}
                </h3>
              </div>

              {/* Package Summary */}
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">
                  {t.custom_gift?.vessel || "Selected Vessel"}
                </span>
                {selectedPackage ? (
                  <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                    <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-white">
                      <img
                        src={selectedPackage.image.includes("http") ? selectedPackage.image : IMAGE_URL + selectedPackage.image}
                        alt={selectedPackage.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-900 leading-tight">
                        {selectedPackage.name}
                      </p>
                      <p className="text-[11px] font-medium text-[var(--olive)] mt-0.5">
                        ₹{selectedPackage.price}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-4 text-xs font-medium text-stone-500">
                    <Package className="w-4 h-4" />
                    {t.custom_gift?.none_selected || "No vessel selected yet"}
                  </div>
                )}
              </div>

              {/* Items Summary */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {t.custom_gift?.contents || "Curated Items"}
                  </span>
                  {totalQty > 0 && (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
                      {totalQty} {t.custom_gift?.items || "ITEMS"}
                    </span>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-4 text-xs font-medium text-stone-500 text-center">
                    {t.custom_gift?.empty || "Your hamper is empty"}
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-start group bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                        <div className="flex gap-3">
                          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-stone-100 text-[10px] font-bold text-stone-600 shrink-0">
                            {item.qty}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-stone-900 max-w-[160px] leading-snug">
                              {item.productname}
                            </p>
                            <button
                              onClick={() => handleDeleteItem(item.productid)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[var(--olive)] pt-0.5">
                          ₹{(item.sellingprice || item.price) * item.qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Personalization (if any) */}
              {greetingCard && (
                <div className="mb-6 p-4 bg-[var(--orange)]/5 border border-[var(--orange)]/20 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[var(--orange)]" />
                    <span className="text-xs font-bold text-stone-900">
                      {t.custom_gift?.card_addition || "Card Addition"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[var(--orange)]">
                    ₹50
                  </span>
                </div>
              )}

              {/* Totals */}
              <div className="bg-stone-50 rounded-2xl p-5 mb-6 border border-stone-200">
                <div className="flex justify-between text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">
                  <span>{t.custom_gift?.subtotal || "Subtotal"}</span>
                  <span>₹{productsTotal + packageTotal + personalizationTotal}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 uppercase tracking-wide pt-3 border-t border-stone-200">
                  <span>{t.custom_gift?.total || "Total"}</span>
                  <span className="text-[var(--olive)]">₹{grandTotal}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCompleteGift}
                disabled={selectedItems.length === 0 || !selectedPackage || isSubmitting}
                className="w-full bg-[var(--olive)] text-white py-4 rounded-[0px] text-xs font-bold uppercase tracking-widest transition-all hover:bg-[var(--olive)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group shadow-xl shadow-[var(--olive)]/20 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.custom_gift?.processing || "Processing..."}
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {t.custom_gift?.complete_gift || "Add to Cart"}
                  </>
                )}
              </button>

              <p className="text-center text-[10px] font-medium text-stone-400 mt-5">
                {t.custom_gift?.shipping_note || "Complimentary shipping on orders above ₹999"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
      `,
        }}
      />
    </div>
  );
}
