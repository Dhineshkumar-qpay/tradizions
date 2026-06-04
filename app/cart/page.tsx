"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  X,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Gift,
  Percent,
  Truck,
  Check,
  Lock,
  ChevronDown,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { Cart } from "@/models/cart_model";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

export default function CartPage() {
  const [selectedLang, setSelectedLang] = useState("EN");
  const t = translations[selectedLang] || translations["EN"];
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState("none");
  const router = useRouter();
  const [expandedGifts, setExpandedGifts] = useState<number[]>([]);

  const toggleGiftExpansion = (cartid: number) => {
    setExpandedGifts((prev) =>
      prev.includes(cartid)
        ? prev.filter((id) => id !== cartid)
        : [...prev, cartid],
    );
  };

  const [globalGiftCards, setGlobalGiftCards] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<Cart[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingCartId, setUpdatingCartId] = useState<number | null>(null);
  const [isProceeding, setIsProceeding] = useState<boolean>(false);
  const [uploadingGiftForCartId, setUploadingGiftForCartId] = useState<
    number | null
  >(null);

  const handleUploadGiftCard = async (
    event: React.ChangeEvent<HTMLInputElement>,
    cartId: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingGiftForCartId(cartId);
    try {
      const formData = new FormData();
      formData.append("cardimage", file);

      const response = await API.post(
        API_ROUTES.UPLOADGIFTCARDIMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200 && response.data?.data?.giftcardid) {
        const newCardId = response.data.data.giftcardid;
        const newCardImage = response.data.data.cardimage;

        setGlobalGiftCards((prev) => [
          {
            giftcardid: newCardId,
            cardname: "Your Custom Card",
            cardimage: newCardImage,
            status: "active",
          },
          ...prev,
        ]);

        updateGiftCard(cartId, newCardId);
      } else {
        alert("Failed to upload gift card.");
      }
    } catch (err: any) {
      console.error("Error uploading gift card:", err);
      alert(err?.response?.data?.message || "An error occurred during upload.");
    } finally {
      setUploadingGiftForCartId(null);
      event.target.value = "";
    }
  };

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

  const fetchCart = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      if (localStorage.getItem("isLoggedIn") === "true") {
        const response = await API.post(API_ROUTES.GETCART);
        if (response.status === 200) {
          const cartData = response.data?.data?.cart || [];
          setCartItems(cartData);
          setTotalAmount(response.data?.data?.totalamount || 0);

          const initialMessages: Record<
            number,
            { message: string; from: string; to: string }
          > = {};
          const initialExpanded: number[] = [];

          cartData.forEach((item: any) => {
            if (item.giftmessage || item.sendername) {
              initialMessages[item.cartid] = {
                message: item.giftmessage || "",
                from: item.sendername || "",
                to: "",
              };
            }
            if (item.giftcardid && item.giftcardid > 0) {
              initialExpanded.push(item.cartid);
            }
          });

          setGiftMessages((prev) => ({ ...prev, ...initialMessages }));
          setExpandedGifts((prev) => {
            const newExpanded = [...prev];
            initialExpanded.forEach((id) => {
              if (!newExpanded.includes(id)) newExpanded.push(id);
            });
            return newExpanded;
          });
        }
      } else {
        setCartItems([]);
        setTotalAmount(0);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    const handleCartUpdate = () => fetchCart(true);
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  useEffect(() => {
    const fetchGlobalGiftCards = async () => {
      try {
        const response = await API.post(API_ROUTES.GIFT_CARDS);
        if (response.status === 200 && response.data?.data) {
          setGlobalGiftCards(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching gift cards:", err);
      }
    };
    fetchGlobalGiftCards();
  }, []);

  const updateQuantity = async (
    cartid: number,
    currentQty: number,
    delta: number,
  ) => {
    const newQty = currentQty + delta;
    if (newQty > 10) {
      alert("Maximum quantity allowed per product is 10.");
      return;
    }

    // Optimistic Update
    setCartItems((prev) => {
      const updated = prev.map((item) => {
        if (item.cartid === cartid) {
          const price =
            (item.sellingprice ?? 0) > 0
              ? (item.sellingprice ?? 0)
              : (item.price ?? 0);
          if (newQty <= 0) {
            setTotalAmount((t) => Math.max(0, t - price * currentQty));
          } else {
            setTotalAmount((t) => Math.max(0, t + price * delta));
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return newQty <= 0 ? updated.filter((i) => i.cartid !== cartid) : updated;
    });

    setUpdatingCartId(cartid);
    try {
      const response = await API.post(API_ROUTES.UPDATEQUANTITY, {
        cartid: cartid,
        quantity: newQty,
      });
      if (response.status === 200) {
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      fetchCart(true); // Revert optimistic update on failure
    } finally {
      setUpdatingCartId(null);
    }
  };

  const updateGiftCard = async (cartid: number, giftcardid: number) => {
    // Optimistic update
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartid === cartid ? { ...item, giftcardid } : item,
      ),
    );

    setUpdatingCartId(cartid);
    try {
      const response = await API.post(API_ROUTES.UPDATEGIFTCARD, {
        cartid: cartid,
        giftcardid: giftcardid,
      });
      if (response.status === 200) {
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.error("Error updating gift card:", err);
      fetchCart(true); // Revert optimistic update on failure
    } finally {
      setUpdatingCartId(null);
    }
  };

  const [giftMessages, setGiftMessages] = useState<
    Record<number, { message: string; from: string; to: string }>
  >({});
  const [giftWraps, setGiftWraps] = useState<Record<number, boolean>>({});
  const [hidePrices, setHidePrices] = useState<Record<number, boolean>>({});

  const handleMessageChange = (
    cartid: number,
    field: string,
    value: string,
  ) => {
    setGiftMessages((prev) => ({
      ...prev,
      [cartid]: {
        ...(prev[cartid] || { message: "", from: "", to: "" }),
        [field]: value,
      },
    }));
  };

  const totalGiftWrapCharges =
    Object.values(giftWraps).filter(Boolean).length * 50;
  const deliveryCharges = 0; // Free Shipping
  const totalGiftCharges = totalGiftWrapCharges;

  const grandTotal = totalAmount;

  return (
    <>
      <main className="min-h-screen bg-[var(--site-bg)] pt-32 pb-32">
        {/* Top Header */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight mb-2">
                Your <span className="gradient-text">Cart</span>
              </h1>
              <p className="text-xs text-stone-500 font-semibold tracking-wide">
                {cartItems.length} {cartItems.length === 1 ? "ITEM" : "ITEMS"}{" "}
                SELECTED
              </p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-[12px] font-bold text-[var(--olive)] uppercase tracking-widest hover:text-[var(--orange)] transition-colors animate-fade-in-left"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--olive)]/10 group-hover:bg-[var(--orange)]/10 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </span>
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="glass rounded-3xl h-64 flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 border-4 border-stone-200 border-t-[var(--olive)] rounded-full animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="max-w-lg mx-auto bg-white/60 backdrop-blur-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] py-16 md:py-20 flex flex-col items-center justify-center text-center px-8 relative overflow-hidden group animate-fade-in-up">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[var(--olive)]/10 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[var(--orange)]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
              </div>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--olive)]/20 to-[var(--orange)]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-stone-50 border border-white shadow-xl flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                  <ShoppingBag className="w-8 h-8 text-stone-300 group-hover:text-[var(--olive)] transition-colors duration-500" strokeWidth={1.5} />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100 animate-bounce">
                    <ShoppingBag className="w-3.5 h-3.5 text-[var(--orange)]" />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-stone-900 mb-3 tracking-tight">
                Your cart is waiting!
              </h3>
              <p className="text-stone-500 text-sm font-medium mb-8 max-w-sm leading-relaxed">
                Discover our handpicked selection of premium wellness products, organic millets, and beautiful gifts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center relative z-10 w-full sm:w-auto">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-6 py-3 bg-[var(--olive)] hover:bg-[var(--olive-dark)] text-white rounded-full font-bold text-[12px] uppercase tracking-widest shadow-[0_8px_20px_rgba(85,107,47,0.25)] hover:shadow-[0_12px_25px_rgba(85,107,47,0.35)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  Explore Shop
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* LEFT: Item List */}
              <div className="flex-1 w-full min-w-0 space-y-6">
                {cartItems.map((item, index) => {
                  const itemImage = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `${IMAGE_URL || ""}${item.image}`
                    : "/placeholder.png";
                  const isUpdating = updatingCartId === item.cartid;
                  const isExpanded = expandedGifts.includes(item.cartid || 0);
                  const displayPrice =
                    (item.sellingprice ?? 0) > 0
                      ? (item.sellingprice ?? 0)
                      : (item.price ?? 0);
                  const totalPrice = displayPrice * (item.quantity ?? 0);
                  const originalTotal =
                    (item.price ?? 0) * (item.quantity ?? 0);
                  const hasDiscount =
                    (item.sellingprice ?? 0) > 0 &&
                    item.sellingprice !== item.price;

                  return (
                    <div
                      key={item.cartid || index}
                      className={`bg-white rounded-3xl border border-stone-100 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up delay-${(index % 5) * 100} group`}
                    >
                      <div className="p-5 md:p-6 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--olive)]/5 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                        <div className="flex gap-4 md:gap-6">
                          {/* Product Image */}
                          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100 shadow-inner group-hover:border-[var(--olive)]/20 transition-colors">
                            <img
                              src={itemImage}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt={item.name || ""}
                            />
                            {item.itemtype === "gift" && (
                              <div className="absolute top-2 left-2 bg-[var(--orange)] text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-md">
                                Gift
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-[11px] text-[var(--olive)] font-bold tracking-widest uppercase mb-1">
                                  {item.categoryname || "Tradizions"}
                                </p>
                                <h3 className="text-base md:text-xl font-black text-stone-900 leading-tight line-clamp-2">
                                  {item.name || ""}
                                </h3>
                              </div>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.cartid || 0,
                                    item.quantity ?? 0,
                                    -(item.quantity ?? 0),
                                  )
                                }
                                className="shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-stone-300 hover:text-white hover:bg-red-500 transition-all shadow-sm hover:shadow-md"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 md:mt-6 gap-4">
                              <div>
                                {totalPrice !==
                                  totalPrice / (item.quantity ?? 1) && (
                                  <p className="text-sm md:text-md font-black font-semibold text-[var(--orange)] tracking-tight my-2">
                                    ₹
                                    {(totalPrice / (item.quantity ?? 1))
                                      .toFixed(2)
                                      .toLocaleString()}{" "}
                                  </p>
                                )}
                                <p className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                                  ₹{totalPrice.toFixed(2).toLocaleString()}
                                </p>
                                {hasDiscount && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-stone-400 line-through">
                                      ₹
                                      {originalTotal
                                        .toFixed(2)
                                        .toLocaleString()}
                                    </p>
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">
                                      SAVE ₹
                                      {(
                                        originalTotal - totalPrice
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Quantity stepper */}
                              <div className="flex items-center gap-2 bg-stone-50 rounded-2xl border border-stone-200 p-1.5 shrink-0 shadow-inner">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartid || 0,
                                      item.quantity || 0,
                                      -1,
                                    )
                                  }
                                  disabled={
                                    isUpdating || (item.quantity ?? 0) <= 1
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white hover:bg-[var(--olive)] hover:text-white transition-all text-stone-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-600 shadow-sm"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <div className="w-10 text-center text-base font-black text-stone-900">
                                  {isUpdating ? (
                                    <div className="w-4 h-4 border-2 border-stone-200 border-t-[var(--olive)] rounded-full animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartid || 0,
                                      item.quantity ?? 0,
                                      1,
                                    )
                                  }
                                  disabled={
                                    isUpdating || (item.quantity ?? 0) >= 10
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white hover:bg-[var(--olive)] hover:text-white transition-all text-stone-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-600 shadow-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gift Card Accordion */}
                      {item.itemtype === "gift" &&
                        globalGiftCards.length > 0 && (
                          <div className="border-t border-stone-100 bg-stone-50/50">
                            <button
                              onClick={() =>
                                toggleGiftExpansion(item.cartid || 0)
                              }
                              className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors group/gift"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--orange)] to-[var(--olive)] flex items-center justify-center shadow-md group-hover/gift:scale-110 transition-transform">
                                  <Gift className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[12px] font-black text-stone-900 uppercase tracking-widest mb-0.5">
                                    Personalize Gift
                                  </p>
                                  {item.giftcardid && item.giftcardid > 0 ? (
                                    <p className="text-[11px] text-[var(--olive)] font-bold flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      {globalGiftCards.find(
                                        (gc) =>
                                          gc.giftcardid === item.giftcardid,
                                      )?.cardname || "Card Selected"}
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-stone-500 font-medium">
                                      Add a custom card & message
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white transition-all duration-300 ${isExpanded ? "rotate-180 border-[var(--olive)] text-[var(--olive)]" : "text-stone-400 group-hover/gift:border-stone-300"}`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-6 pb-6 pt-2 space-y-6 relative border-t border-stone-100/50">
                                {isUpdating && (
                                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-b-3xl">
                                    <div className="w-10 h-10 border-4 border-stone-200 border-t-[var(--olive)] rounded-full animate-spin" />
                                  </div>
                                )}

                                {/* Card thumbnails */}
                                <div>
                                  <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3">
                                    1. Choose a Card
                                  </h4>
                                  <div className="flex flex-row flex-nowrap gap-4 overflow-x-auto pb-4 w-full snap-x scroll-smooth no-scrollbar pt-2 px-1">
                                    <label className="shrink-0 cursor-pointer snap-start">
                                      <input
                                        type="radio"
                                        name={`gift-${item.cartid || index}`}
                                        className="peer hidden"
                                        checked={
                                          !item.giftcardid ||
                                          item.giftcardid === 0
                                        }
                                        onChange={() =>
                                          updateGiftCard(item.cartid || 0, 0)
                                        }
                                      />
                                      <div className="w-32 h-24 rounded-2xl border-2 border-stone-200 bg-white flex flex-col items-center justify-center gap-2 transition-all peer-checked:border-[var(--olive)] peer-checked:bg-[var(--olive)]/5 peer-checked:shadow-md hover:border-stone-300 hover:shadow-sm">
                                        <X className="w-6 h-6 text-stone-400" />
                                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                                          No Card
                                        </p>
                                      </div>
                                    </label>

                                    {/* Upload Your Own */}
                                    <label className="shrink-0 cursor-pointer snap-start group/upload relative flex flex-col items-center justify-center gap-2 w-32 h-24 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[var(--orange)] bg-white hover:bg-[var(--orange)]/5 transition-all text-center">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={
                                          uploadingGiftForCartId === item.cartid
                                        }
                                        onChange={(e) =>
                                          handleUploadGiftCard(
                                            e,
                                            item.cartid || 0,
                                          )
                                        }
                                      />
                                      {uploadingGiftForCartId ===
                                      item.cartid ? (
                                        <div className="w-6 h-6 border-2 border-stone-300 border-t-[var(--orange)] rounded-full animate-spin" />
                                      ) : (
                                        <Upload className="w-6 h-6 text-stone-400 group-hover/upload:text-[var(--orange)] transition-colors" />
                                      )}
                                      <p className="text-[10px] font-black text-stone-500 group-hover/upload:text-[var(--orange)] transition-colors w-full px-2 uppercase tracking-wider">
                                        Upload Custom
                                      </p>
                                    </label>

                                    {globalGiftCards.map((gc: any) => (
                                      <label
                                        key={gc.giftcardid}
                                        className="shrink-0 cursor-pointer snap-start"
                                      >
                                        <input
                                          type="radio"
                                          name={`gift-${item.cartid || index}`}
                                          className="peer hidden"
                                          checked={
                                            item.giftcardid === gc.giftcardid
                                          }
                                          onChange={() =>
                                            updateGiftCard(
                                              item.cartid || 0,
                                              gc.giftcardid || 0,
                                            )
                                          }
                                        />
                                        <div className="w-32 h-24 rounded-2xl border-2 border-stone-200 overflow-hidden transition-all peer-checked:border-[var(--olive)] peer-checked:shadow-lg hover:border-stone-300 hover:shadow-sm relative group/card">
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 peer-checked:opacity-0 transition-opacity flex items-center justify-center z-10">
                                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">
                                              Select
                                            </p>
                                          </div>
                                          {item.giftcardid ===
                                            gc.giftcardid && (
                                            <div className="absolute top-1.5 right-1.5 z-10 bg-[var(--olive)] rounded-full p-0.5 shadow-sm">
                                              <Check className="w-3 h-3 text-white" />
                                            </div>
                                          )}
                                          <div className="h-[60%] bg-stone-100 w-full relative">
                                            <img
                                              src={
                                                (gc.cardimage || "").startsWith(
                                                  "http",
                                                )
                                                  ? gc.cardimage
                                                  : `${IMAGE_URL || ""}${gc.cardimage || ""}`
                                              }
                                              className="w-full h-full object-cover"
                                              alt={gc.cardname || ""}
                                            />
                                          </div>
                                          <div className="h-[40%] px-2 py-1.5 bg-white flex items-center justify-center border-t border-stone-100">
                                            <p className="text-[10px] font-black text-stone-800 truncate w-full text-center">
                                              {gc.cardname || ""}
                                            </p>
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Message + Sender fields */}
                                <div>
                                  <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3">
                                    2. Add Your Message
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                      <textarea
                                        value={
                                          giftMessages[item.cartid || 0]
                                            ?.message || ""
                                        }
                                        onChange={(e) =>
                                          handleMessageChange(
                                            item.cartid || 0,
                                            "message",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-stone-200 text-[13px] font-medium focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none transition-all resize-none h-24 placeholder:text-stone-400 shadow-sm"
                                        placeholder="Write a thoughtful message here..."
                                      />
                                    </div>
                                    <div className="md:col-span-1">
                                      <input
                                        type="text"
                                        value={
                                          giftMessages[item.cartid || 0]
                                            ?.from || ""
                                        }
                                        onChange={(e) =>
                                          handleMessageChange(
                                            item.cartid || 0,
                                            "from",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 text-[13px] font-medium focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none transition-all placeholder:text-stone-400 shadow-sm"
                                        placeholder="Sender Name (From)"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Order Summary */}
              <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-28 animate-fade-in-left delay-200">
                <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden relative premium-card">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--olive)]/5 rounded-bl-full -z-10" />

                  {/* Header */}
                  <div className="px-6 md:px-8 py-6 border-b border-stone-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--olive)] to-[var(--olive-dark)] flex items-center justify-center shadow-lg shadow-[var(--olive)]/20">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-stone-900 tracking-tight">
                        Order Summary
                      </h2>
                      <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">
                        Review your cart
                      </p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="px-6 md:px-8 py-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500 font-bold">
                        Subtotal ({cartItems.length} items)
                      </span>
                      <span className="font-black text-stone-900 text-lg">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                    {cartItems.filter((i) => i.giftcardid).length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500 font-bold flex items-center gap-2">
                          <Gift className="w-4 h-4 text-[var(--orange)]" />
                          Gift Cards (
                          {cartItems.filter((i) => i.giftcardid).length})
                        </span>
                        <span className="font-black text-[var(--olive)]">
                          Included
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500 font-bold flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[var(--olive)]" />
                        Shipping
                      </span>
                      <span className="font-black text-[var(--olive)] uppercase tracking-wider text-xs bg-[var(--olive)]/10 px-2 py-1 rounded-md">
                        Free
                      </span>
                    </div>
                  </div>

                  {/* Total panel */}
                  <div className="mx-6 md:mx-8 mb-6 rounded-2xl bg-gradient-to-r from-[var(--olive-dark)] to-[var(--olive)] px-6 py-5 flex justify-between items-center shadow-lg shadow-[var(--olive)]/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <p className="text-white/80 text-[11px] font-black uppercase tracking-widest mb-1">
                        Grand Total
                      </p>
                      <p className="text-white/60 text-[9px] uppercase tracking-wider font-semibold">
                        Incl. all taxes
                      </p>
                    </div>
                    <p className="text-white text-3xl font-black tracking-tight relative z-10">
                      ₹{grandTotal.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-6 md:px-8 pb-8 space-y-4">
                    <button
                      disabled={isProceeding}
                      onClick={async () => {
                        if (cartItems.length > 0) {
                          setIsProceeding(true);
                          try {
                            const updatePromises = cartItems
                              .filter((item) => item.itemtype === "gift")
                              .map((item) =>
                                API.post(API_ROUTES.UPDATEGIFTCARD, {
                                  cartid: item.cartid,
                                  giftcardid: item.giftcardid,
                                  giftmessage:
                                    giftMessages[item.cartid || 0]?.message ||
                                    "",
                                  sendername:
                                    giftMessages[item.cartid || 0]?.from || "",
                                }),
                              );
                            if (updatePromises.length > 0)
                              await Promise.all(updatePromises);
                            router.push("/checkout");
                          } catch (err) {
                            console.error(
                              "Error updating gift details before checkout:",
                              err,
                            );
                            router.push("/checkout");
                          } finally {
                            setIsProceeding(false);
                          }
                        }
                      }}
                      className="w-full h-[60px] bg-gradient-to-r from-[var(--orange)] to-[var(--orange-dark)] text-white rounded-2xl font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(255,140,0,0.4)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      {isProceeding ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                      {isProceeding
                        ? "Processing Securely..."
                        : "Proceed to Checkout"}
                    </button>

                    {/* Trust badges row */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <ShieldCheck className="w-4 h-4 text-[var(--olive)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          Secure
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-stone-200" />
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Percent className="w-4 h-4 text-[var(--olive)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          Best Price
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-stone-200" />
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Check className="w-4 h-4 text-[var(--olive)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          Quality
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
