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
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[var(--olive)] selection:text-white pb-24">
      {/* ── Corporate Hero Section ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm mb-12">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-8 h-[2px] bg-[var(--olive)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500">Corporate Gifting</span>
            <span className="w-8 h-[2px] bg-[var(--olive)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900">
            {t.custom_gift?.title || "Custom Hamper Builder"}
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-gray-600 font-medium leading-relaxed">
            {t.custom_gift?.desc || "Design a truly unique gifting experience tailored to your exact specifications. Select premium packaging and curate artisanal products to build the perfect corporate hamper."}
          </p>
        </div>
      </div>

      {/* ── Builder Interface ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: The Process */}
          <div className="lg:col-span-8 space-y-12">

            {/* Step 1: Packaging */}
            <section className="bg-white rounded-[var(--radius-md)] p-8 md:p-10 shadow-sm border border-gray-200 relative overflow-hidden mb-8">
              <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-center w-12 h-12 rounded bg-gray-50 text-[var(--olive)] font-bold text-lg border border-gray-100">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    {t.custom_gift?.step1_title || "Choose Your Packaging"}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {t.custom_gift?.step1_desc || "Select the foundation for your custom gift"}
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
                      className={`group cursor-pointer rounded-[var(--radius-sm)] overflow-hidden transition-all duration-300 border-2 ${active
                        ? "border-[var(--olive)] bg-[var(--olive)]/5 shadow-md scale-[1.02]"
                        : "border-transparent bg-gray-50 hover:bg-white hover:shadow-lg hover:border-gray-200"
                        }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-white border-b border-gray-100">
                        {active && (
                          <div className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--olive)] text-white shadow-sm">
                            <Check className="w-3.5 h-3.5" />
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
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">
                            {pkg.name}
                          </h4>
                          <span className="inline-flex px-2 py-0.5 rounded bg-gray-200 text-[9px] font-bold uppercase tracking-widest text-gray-600">
                            {pkg.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 font-medium">
                          {pkg.desc}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
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
            <section className="bg-white rounded-[var(--radius-md)] p-8 md:p-10 shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-gray-50 text-[var(--orange)] font-bold text-lg border border-gray-100">
                    2
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                      {t.custom_gift?.step2_title || "Curate Contents"}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      {t.custom_gift?.step2_desc || "Select premium items to fill your hamper"}
                    </p>
                  </div>
                </div>

                <div className="relative w-full md:max-w-xs group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[var(--olive)] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.custom_gift?.search || "Search collection..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-[var(--radius-sm)] pl-11 pr-4 py-3 outline-none focus:border-[var(--olive)] focus:ring-1 focus:ring-[var(--olive)] transition-all placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="mb-10 bg-gray-50 rounded-[var(--radius-md)] p-6 border border-gray-200">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-5 flex items-center gap-3">
                    <Package className="w-4 h-4 text-[var(--olive)]" />
                    {t.custom_gift?.inside_vessel || "Inside Your Hamper"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-[var(--radius-sm)] border border-gray-100 shadow-sm">
                        <div className="h-14 w-14 shrink-0 rounded bg-gray-100 overflow-hidden">
                          <img
                            src={item.productimage?.includes("http") ? item.productimage : IMAGE_URL + item.productimage}
                            alt={item.productname}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-bold text-gray-900">
                            {item.productname}
                          </p>
                          <p className="text-[11px] font-bold text-gray-500 mt-1">
                            ₹{item.sellingprice || item.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded p-1 border border-gray-200">
                          <button
                            onClick={() => handleRemoveItem(item.productid)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center text-gray-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all"
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
                  <div className="h-10 w-10 animate-spin border-4 border-gray-200 border-t-[var(--olive)] rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
                  {filteredProducts.map((product, idx) => {
                    const qty = selectedItems.find((i) => i.productid === product.productid)?.qty || 0;
                    return (
                      <div
                        key={idx}
                        className="group flex flex-col bg-white rounded-[var(--radius-sm)] border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[var(--olive)] transition-all duration-300 h-full"
                      >
                        <div className="relative aspect-square w-full shrink-0 bg-gray-50 overflow-hidden border-b border-gray-100">
                          <img
                            src={product.productimage?.includes("http") ? product.productimage : product.productimage ? IMAGE_URL + product.productimage : "/placeholder.png"}
                            alt={product.productname}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {qty > 0 && (
                            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--olive)] text-white shadow-sm">
                              <span className="text-xs font-bold">{qty}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-grow p-4">
                          <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
                            {product.productname}
                          </h3>
                          <p className="text-sm font-black text-gray-900 mt-auto">
                            ₹{product.sellingprice || product.price}
                          </p>
                        </div>

                        <div className="px-4 pb-4 shrink-0">
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddItem(product)}
                              className="w-full bg-white border border-gray-200 text-gray-900 py-2.5 rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              {t.custom_gift?.add || "Add Item"}
                            </button>
                          ) : (
                            <div className="w-full flex items-center justify-between bg-gray-50 rounded-[var(--radius-sm)] border border-gray-200 h-10 px-1">
                              <button
                                onClick={() => handleRemoveItem(product.productid)}
                                className="h-8 w-8 flex items-center justify-center rounded bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold text-gray-900">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAddItem(product)}
                                className="h-8 w-8 flex items-center justify-center rounded bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 transition-all"
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
            <div className="sticky top-32 bg-white border border-gray-200 rounded-[var(--radius-md)] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                  <ShoppingBag className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {t.custom_gift?.order_summary || "Hamper Summary"}
                </h3>
              </div>

              {/* Package Summary */}
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  {t.custom_gift?.vessel || "Selected Packaging"}
                </span>
                {selectedPackage ? (
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-[var(--radius-sm)] border border-gray-200">
                    <div className="h-12 w-12 shrink-0 rounded bg-white border border-gray-100 overflow-hidden">
                      <img
                        src={selectedPackage.image.includes("http") ? selectedPackage.image : IMAGE_URL + selectedPackage.image}
                        alt={selectedPackage.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        {selectedPackage.name}
                      </p>
                      <p className="text-[11px] font-bold text-gray-500 mt-1">
                        ₹{selectedPackage.price}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 border-dashed rounded-[var(--radius-sm)] p-4 text-xs font-medium text-gray-500">
                    <Package className="w-4 h-4" />
                    {t.custom_gift?.none_selected || "No packaging selected"}
                  </div>
                )}
              </div>

              {/* Items Summary */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {t.custom_gift?.contents || "Curated Items"}
                  </span>
                  {totalQty > 0 && (
                    <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600">
                      {totalQty} {t.custom_gift?.items || "ITEMS"}
                    </span>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-[var(--radius-sm)] p-4 text-xs font-medium text-gray-500 text-center">
                    {t.custom_gift?.empty || "Your hamper is empty"}
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-start group bg-white p-3 rounded-[var(--radius-sm)] border border-gray-200 shadow-sm">
                        <div className="flex gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-900 shrink-0">
                            {item.qty}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-gray-900 max-w-[150px] leading-snug">
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
                        <span className="text-xs font-black text-gray-900 pt-1">
                          ₹{(item.sellingprice || item.price) * item.qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Personalization (if any) */}
              {greetingCard && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-sm)] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-900">
                      {t.custom_gift?.card_addition || "Card Addition"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-gray-900">
                    ₹50
                  </span>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 rounded-[var(--radius-sm)] p-5 mb-6 border border-gray-200">
                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  <span>{t.custom_gift?.subtotal || "Subtotal"}</span>
                  <span>₹{productsTotal + packageTotal + personalizationTotal}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 uppercase tracking-wide pt-3 border-t border-gray-200">
                  <span>{t.custom_gift?.total || "Total"}</span>
                  <span className="text-[var(--olive)]">₹{grandTotal}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCompleteGift}
                disabled={selectedItems.length === 0 || !selectedPackage || isSubmitting}
                className="w-full bg-[var(--olive)] text-white py-4 rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-[var(--olive-dark)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

              <p className="text-center text-[10px] font-medium text-gray-500 mt-5">
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
