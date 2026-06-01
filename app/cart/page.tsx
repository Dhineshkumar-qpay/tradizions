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
import { API_ROUTES } from "@/routes/api_routes";
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
  const [uploadingGiftForCartId, setUploadingGiftForCartId] = useState<number | null>(null);

  const handleUploadGiftCard = async (event: React.ChangeEvent<HTMLInputElement>, cartId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingGiftForCartId(cartId);
    try {
      const formData = new FormData();
      formData.append("cardimage", file);

      const response = await API.post(API_ROUTES.UPLOADGIFTCARDIMAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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

  const fetchCart = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    const handleCartUpdate = () => fetchCart();
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
    setUpdatingCartId(cartid);
    try {
      const newQty = currentQty + delta;
      if (newQty > 10) {
        alert("Maximum quantity allowed per product is 10.");
        return;
      }
      const response = await API.post(API_ROUTES.UPDATEQUANTITY, {
        cartid: cartid,
        quantity: newQty,
      });
      if (response.status === 200) {
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setUpdatingCartId(null);
    }
  };

  const updateGiftCard = async (cartid: number, giftcardid: number) => {
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
      <main className="min-h-screen bg-[#f5f4f0] pt-20 pb-32">
        {/* Sticky page header strip */}
        <div className="bg-white border-b border-stone-100 mb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Shopping Cart</h1>
              <p className="text-xs text-stone-400 font-semibold mt-0.5 uppercase tracking-widest">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-2 text-[11px] font-black text-[var(--olive)] uppercase tracking-widest hover:underline">
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* LEFT: Item List */}
            <div className="flex-1 w-full min-w-0 space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-stone-100 h-64 flex items-center justify-center shadow-sm">
                  <div className="w-10 h-10 border-4 border-stone-100 border-t-[var(--olive)] rounded-full animate-spin" />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-6">
                    <ShoppingCart className="w-9 h-9 text-stone-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-2">Your cart is empty</h3>
                  <p className="text-stone-400 text-sm font-medium mb-8 max-w-xs">Add products to your cart to see them here.</p>
                  <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--olive)] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Explore Shop <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const itemImage = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${item.image}`
                    : "/placeholder.png";
                  const isUpdating = updatingCartId === item.cartid;
                  const isExpanded = expandedGifts.includes(item.cartid || 0);
                  const displayPrice = (item.sellingprice ?? 0) > 0 ? (item.sellingprice ?? 0) : (item.price ?? 0);
                  const totalPrice = displayPrice * (item.quantity ?? 0);
                  const originalTotal = (item.price ?? 0) * (item.quantity ?? 0);
                  const hasDiscount = (item.sellingprice ?? 0) > 0 && item.sellingprice !== item.price;

                  return (
                    <div key={item.cartid || index} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                      <div className="p-4 sm:p-5">
                        <div className="flex gap-3 sm:gap-4">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100">
                            <img src={itemImage} className="w-full h-full object-cover" alt={item.name || ""} />
                            {item.itemtype === "gift" && (
                              <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Gift
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm sm:text-base font-black text-stone-900 leading-snug line-clamp-2 pr-2">{item.name || ""}</h3>
                                <p className="text-[10px] sm:text-[11px] text-stone-400 font-medium mt-0.5">{item.categoryname || "Tradizions"}</p>
                              </div>
                              <button
                                onClick={() => updateQuantity(item.cartid || 0, item.quantity ?? 0, -(item.quantity ?? 0))}
                                className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all -mr-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-end justify-between mt-3 sm:mt-4">
                              <div className="mr-2">
                                <p className="text-base sm:text-lg font-black text-stone-900 leading-none">₹{totalPrice.toLocaleString()}</p>
                                {hasDiscount && (
                                  <p className="text-[10px] sm:text-xs text-stone-400 line-through mt-1">₹{originalTotal.toLocaleString()}</p>
                                )}
                              </div>
                              {/* Quantity stepper */}
                              <div className="flex items-center gap-1 bg-stone-50 rounded-xl border border-stone-100 p-1 shrink-0">
                                <button
                                  onClick={() => updateQuantity(item.cartid || 0, item.quantity || 0, -1)}
                                  disabled={isUpdating || (item.quantity ?? 0) <= 1}
                                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-stone-500 disabled:opacity-30"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div className="w-6 sm:w-8 text-center text-sm font-black text-stone-900">
                                  {isUpdating
                                    ? <div className="w-3 h-3 border-2 border-stone-200 border-t-[var(--olive)] rounded-full animate-spin mx-auto" />
                                    : item.quantity}
                                </div>
                                <button
                                  onClick={() => updateQuantity(item.cartid || 0, item.quantity ?? 0, 1)}
                                  disabled={isUpdating || (item.quantity ?? 0) >= 10}
                                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-stone-500 disabled:opacity-30"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gift Card Accordion */}
                      {item.itemtype === "gift" && globalGiftCards.length > 0 && (
                        <div className="border-t border-stone-100">
                          <button
                            onClick={() => toggleGiftExpansion(item.cartid || 0)}
                            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Gift className="w-3.5 h-3.5 text-amber-500" />
                              </div>
                              <div className="text-left">
                                <p className="text-[11px] font-black text-stone-800 uppercase tracking-widest">Gift Card</p>
                                {item.giftcardid && item.giftcardid > 0 ? (
                                  <p className="text-[10px] text-[var(--olive)] font-semibold">
                                    {globalGiftCards.find((gc) => gc.giftcardid === item.giftcardid)?.cardname || "Selected"}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-stone-400 font-medium">Optional — add a gift card</p>
                                )}
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-5 space-y-4 bg-stone-50/60 relative">
                              {isUpdating && (
                                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                  <div className="w-8 h-8 border-4 border-stone-100 border-t-[var(--olive)] rounded-full animate-spin" />
                                </div>
                              )}

                              {/* Card thumbnails */}
                              <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-4 pt-4 w-full snap-x scroll-smooth no-scrollbar">
                                <label className="shrink-0 cursor-pointer snap-start">
                                  <input
                                    type="radio"
                                    name={`gift-${item.cartid || index}`}
                                    className="peer hidden"
                                    checked={!item.giftcardid || item.giftcardid === 0}
                                    onChange={() => updateGiftCard(item.cartid || 0, 0)}
                                  />
                                  <div className="w-28 min-w-[7rem] h-20 rounded-xl border-2 border-stone-200 bg-white flex flex-col items-center justify-center gap-1.5 transition-all peer-checked:border-[var(--olive)] peer-checked:bg-[var(--olive)]/5 peer-checked:shadow-sm">
                                    <X className="w-5 h-5 text-stone-300" />
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-wider">No Card</p>
                                  </div>
                                </label>

                                {/* Upload Your Own */}
                                <label className="shrink-0 cursor-pointer snap-start group relative flex flex-col items-center justify-center gap-1.5 w-28 min-w-[7rem] h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[var(--olive)] bg-stone-50 hover:bg-[var(--olive)]/5 transition-all text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingGiftForCartId === item.cartid}
                                    onChange={(e) => handleUploadGiftCard(e, item.cartid || 0)}
                                  />
                                  {uploadingGiftForCartId === item.cartid ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--olive)] rounded-full animate-spin" />
                                  ) : (
                                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-[var(--olive)] transition-colors" />
                                  )}
                                  <p className="text-[9px] font-bold text-gray-500 group-hover:text-[var(--olive)] transition-colors w-full px-2">
                                    Upload Custom
                                  </p>
                                </label>

                                {globalGiftCards.map((gc: any) => (
                                  <label key={gc.giftcardid} className="shrink-0 cursor-pointer snap-start">
                                    <input
                                      type="radio"
                                      name={`gift-${item.cartid || index}`}
                                      className="peer hidden"
                                      checked={item.giftcardid === gc.giftcardid}
                                      onChange={() => updateGiftCard(item.cartid || 0, gc.giftcardid || 0)}
                                    />
                                    <div className="w-28 min-w-[7rem] rounded-xl border-2 border-stone-200 overflow-hidden transition-all peer-checked:border-[var(--olive)] peer-checked:shadow-md">
                                      <div className="h-14 bg-stone-100">
                                        <img
                                          src={(gc.cardimage || "").startsWith("http") ? gc.cardimage : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${gc.cardimage || ""}`}
                                          className="w-full h-full object-contain"
                                          alt={gc.cardname || ""}
                                        />
                                      </div>
                                      <div className="px-2 py-1.5 bg-white">
                                        <p className="text-[9px] font-black text-stone-800 truncate">{gc.cardname || ""}</p>
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>

                              {/* Message + Sender fields */}
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">
                                    Gift Message (Optional)
                                  </label>
                                  <textarea
                                    value={giftMessages[item.cartid || 0]?.message || ""}
                                    onChange={(e) => handleMessageChange(item.cartid || 0, "message", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-[12px] font-medium focus:border-[var(--olive)] outline-none transition-all resize-none h-16 placeholder:text-stone-300"
                                    placeholder="Wishing you happiness and good health..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">
                                    Sender Name (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={giftMessages[item.cartid || 0]?.from || ""}
                                    onChange={(e) => handleMessageChange(item.cartid || 0, "from", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-[12px] font-medium focus:border-[var(--olive)] outline-none transition-all placeholder:text-stone-300"
                                    placeholder="Your Name"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT: Order Summary */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--olive)]/10 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-[var(--olive)]" />
                    </div>
                    <h2 className="text-base font-black text-stone-900">Order Summary</h2>
                  </div>

                  {/* Line items */}
                  <div className="px-6 py-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500 font-medium">Subtotal ({cartItems.length} items)</span>
                      <span className="font-bold text-stone-900">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    {cartItems.filter((i) => i.giftcardid).length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500 font-medium flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-500" />
                          Gift Cards ({cartItems.filter((i) => i.giftcardid).length})
                        </span>
                        <span className="font-bold text-stone-900">Included</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500 font-medium flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-500" />
                        Shipping
                      </span>
                      <span className="font-bold text-emerald-600">Free</span>
                    </div>
                  </div>

                  {/* Total panel */}
                  <div className="mx-4 mb-5 rounded-xl bg-[var(--olive)] px-5 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Total Amount</p>
                      <p className="text-white/50 text-[9px] mt-0.5">Incl. all taxes</p>
                    </div>
                    <p className="text-white text-2xl font-black tracking-tight">₹{grandTotal.toLocaleString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 space-y-3">
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
                                  giftmessage: giftMessages[item.cartid || 0]?.message || "",
                                  sendername: giftMessages[item.cartid || 0]?.from || "",
                                }),
                              );
                            if (updatePromises.length > 0) await Promise.all(updatePromises);
                            router.push("/checkout");
                          } catch (err) {
                            console.error("Error updating gift details before checkout:", err);
                            router.push("/checkout");
                          } finally {
                            setIsProceeding(false);
                          }
                        }
                      }}
                      className="w-full py-4 bg-[var(--olive)] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-[var(--olive)]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isProceeding
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Lock className="w-4 h-4" />}
                      {isProceeding ? "Processing..." : "Proceed to Checkout"}
                    </button>
                    <Link
                      href="/shop"
                      className="w-full py-3.5 border-2 border-stone-200 text-stone-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" /> Continue Shopping
                    </Link>
                  </div>

                  {/* Trust badge */}
                  <div className="border-t border-stone-100 px-6 py-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-[10px] text-stone-400 font-semibold">Safe & secure checkout. Your data is protected.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
