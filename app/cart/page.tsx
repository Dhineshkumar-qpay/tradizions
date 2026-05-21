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

  const [cartItems, setCartItems] = useState<Cart[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingCartId, setUpdatingCartId] = useState<number | null>(null);
  const [isProceeding, setIsProceeding] = useState<boolean>(false);

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
            if (item.giftmessage) {
              initialMessages[item.cartid] = {
                message: item.giftmessage,
                from: "",
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

  const updateQuantity = async (
    cartid: number,
    currentQty: number,
    delta: number,
  ) => {
    setUpdatingCartId(cartid);
    try {
      const newQty = currentQty + delta;
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

  // Dynamic Calculations
  const giftCardCharges = cartItems.reduce((acc, item) => {
    if (item.giftcardid && item.giftcard) {
      const card = item.giftcard.find(
        (gc: any) => gc.giftcardid === item.giftcardid,
      );
      return acc + (card ? Number(card.cardprice) : 0);
    }
    return acc;
  }, 0);

  const totalGiftWrapCharges =
    Object.values(giftWraps).filter(Boolean).length * 50;
  const deliveryCharges = cartItems.length > 0 ? 90 : 0;
  const totalGiftCharges = giftCardCharges + totalGiftWrapCharges;

  const taxableAmount = totalAmount + deliveryCharges;
  const grandTotal = taxableAmount + deliveryCharges;

  return (
    <>
      <main className="min-h-screen bg-[var(--site-bg)] pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-stone-900">{t.cart?.title || "My Cart"}</h1>
              <span className="text-stone-500 font-bold">
                ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Product List */}
            <div className="flex-1 space-y-6">
              {isLoading ? (
                <div className="h-64 bg-white rounded-3xl border border-stone-100 flex flex-col items-center justify-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 border-4 border-[var(--olive)]/20 border-t-[var(--olive)] rounded-full animate-spin" />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 md:p-20 text-center border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
                  {/* Decorative Background Element */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -z-10" />

                  <div className="w-24 h-24 bg-stone-50 rounded-[1.5rem] flex items-center justify-center mb-8 border border-stone-100 shadow-inner relative group cursor-default">
                    <div className="absolute inset-0 bg-[var(--olive)]/10 rounded-[1.5rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
                    <ShoppingCart
                      className="w-10 h-10 text-stone-300 group-hover:text-[var(--olive)] transition-colors duration-500 relative z-10"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="text-2xl font-black text-stone-900 mb-3 tracking-tight">
                    Your cart is empty
                  </h3>
                  <p className="text-stone-400 mb-10 font-bold uppercase tracking-widest text-[11px] max-w-sm mx-auto leading-relaxed">
                    Looks like you haven't added anything to your cart yet.
                    Explore our premium selection!
                  </p>

                  <Link
                    href="/shop"
                    className="group flex items-center gap-3 px-8 py-4 bg-[var(--olive)] hover:bg-[var(--olive)] text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    Explore Shop
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

                  return (
                    <div
                      key={item.cartid || index}
                      className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden relative"
                    >
                      <div className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="w-24 h-24 md:w-24 md:h-24 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-50">
                          <img
                            src={itemImage}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-1">
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1 ${item.itemtype === "gift" ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "bg-[var(--olive)]/10 text-[var(--olive)]"}`}
                              >
                                {item.itemtype === "gift"
                                  ? "Gift Item"
                                  : "Product"}
                              </span>
                              <h3 className="text-md font-black font-semibold text-stone-900 truncate">
                                {item.name || ""}
                              </h3>
                              <p className="text-sm text-stone-400 font-semibold">
                                {item.categoryname || "Tradizions Signature"}
                              </p>
                            </div>
                            <div className="flex items-center border border-stone-100 rounded-lg p-1 bg-stone-50/50">
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
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-400 disabled:opacity-30"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-10 text-center text-sm font-black text-stone-900">
                                {isUpdating ? (
                                  <div className="w-3 h-3 border-2 border-stone-200 border-t-[var(--olive)] rounded-full animate-spin mx-auto" />
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
                                disabled={isUpdating}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-400"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <div className="">
                              {(item.sellingprice ?? 0) > 0 && (
                                <p className="text-md line-through font-normal text-stone-500">
                                  ₹{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}.00
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-stone-900">
                                ₹
                                {(
                                  ((item.sellingprice ?? 0) > 0 ? (item.sellingprice ?? 0) : (item.price ?? 0)) *
                                  (item.quantity ?? 0)
                                ).toLocaleString()}
                                .00
                              </p>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.cartid || 0,
                                    item.quantity ?? 0,
                                    -(item.quantity ?? 0),
                                  )
                                }
                                className="mt-2 flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold text-[11px] uppercase tracking-widest ml-auto cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 " />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {item.itemtype === "gift" && item.giftcard && item.giftcard.length > 0 && (
                        <div className="border-t border-stone-100 bg-stone-50/30">
                          <button
                            onClick={() =>
                              toggleGiftExpansion(item.cartid || 0)
                            }
                            className="w-full p-4 flex items-center justify-between text-[11px] font-black text-stone-900 uppercase tracking-widest hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-[var(--gold)]" />
                              Add Gift Card (Optional)
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="p-4 pt-0 space-y-4 animate-fade-in relative">
                              {isUpdating && (
                                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                  <div className="w-8 h-8 border-4 border-[var(--olive)]/20 border-t-[var(--olive)] rounded-full animate-spin" />
                                </div>
                              )}
                              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                <label className="relative shrink-0 w-36 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`gift-${item.cartid || index}`}
                                    className="peer hidden"
                                    checked={
                                      !item.giftcardid || item.giftcardid === 0
                                    }
                                    onChange={() =>
                                      updateGiftCard(item.cartid || 0, 0)
                                    }
                                  />
                                  <div className="h-full bg-white rounded-xl border-2 border-stone-100 p-4 flex flex-col items-center justify-center gap-3 transition-all peer-checked:border-[var(--olive)] peer-checked:bg-[var(--olive)]/5">
                                    <div className="absolute top-2 left-2 w-4 h-4 border-2 border-stone-200 rounded-full flex items-center justify-center peer-checked:border-[var(--olive)]">
                                      <div className="w-2 h-2 bg-[var(--olive)] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center">
                                      <X className="w-6 h-6 text-stone-300" />
                                    </div>
                                    <p className="text-[10px] font-black text-stone-900 text-center uppercase tracking-widest">
                                      No Gift Card
                                    </p>
                                  </div>
                                </label>
                                {item.giftcard?.map((gc: any) => (
                                  <label
                                    key={gc.giftcardid}
                                    className="relative shrink-0 w-36 cursor-pointer"
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
                                    <div className="bg-white rounded-xl border-2 border-stone-100 p-4 transition-all peer-checked:border-[var(--olive)] peer-checked:bg-[var(--olive)]/5">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-4 h-4 border-2 border-stone-200 rounded-full flex items-center justify-center peer-checked:border-[var(--olive)]">
                                          <div className="w-2 h-2 bg-[var(--olive)] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                                        </div>
                                        <div className="h-20 w-full rounded-lg overflow-hidden border border-stone-100">
                                          <img
                                            src={
                                              (gc.cardimage || "").startsWith(
                                                "http",
                                              )
                                                ? gc.cardimage
                                                : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${gc.cardimage || ""}`
                                            }
                                            className="w-full h-full object-cover"
                                            alt=""
                                          />
                                        </div>
                                      </div>
                                      <p className="text-[10px] font-black text-stone-900 mb-1 truncate">
                                        {gc.cardname || ""}
                                      </p>
                                      <p className="text-xs font-black text-stone-900">
                                        ₹{gc.cardprice || 0}.00
                                      </p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                  Gift Message (Optional)
                                </label>
                                <textarea
                                  value={
                                    giftMessages[item.cartid || 0]?.message ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleMessageChange(
                                      item.cartid || 0,
                                      "message",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-4 rounded-xl bg-white border border-stone-100 text-[12px] font-medium focus:border-[var(--olive)] outline-none transition-all resize-none h-16 placeholder:text-stone-300"
                                  placeholder="Wishing you good health and happiness..."
                                />
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

            {/* Right: Summary & Info */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-96 space-y-6 shrink-0 lg:sticky lg:top-8">
                <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
                  <h2 className="text-xl font-black text-stone-900 mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-600">
                      <span>Subtotal ({cartItems.length} Items)</span>
                      <span className="text-stone-900">
                        ₹{totalAmount.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-stone-600">
                      <span>
                        Gift Cards (
                        {cartItems.filter((i) => i.giftcardid).length})
                      </span>
                      <span className="text-stone-900">
                        ₹{totalGiftCharges.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-stone-600 block">
                          Shipping
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Standard Delivery
                        </span>
                      </div>
                      <span className="text-sm font-black text-stone-900">
                        ₹{deliveryCharges.toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-stone-100 mb-8">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-base font-black text-stone-900 block">
                          Total Amount
                        </span>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                          (Inclusive of all taxes)
                        </span>
                      </div>
                      <span className="text-xl font-black text-[var(--olive-dark)]">
                        ₹{grandTotal.toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button
                      disabled={isProceeding}
                      onClick={async () => {
                        if (cartItems.length > 0) {
                          setIsProceeding(true);
                          try {
                            const updatePromises = cartItems
                              .filter(
                                (item) => item.itemtype === "gift"
                              )
                              .map((item) =>
                                API.post(API_ROUTES.UPDATEGIFTCARD, {
                                  cartid: item.cartid,
                                  giftcardid: item.giftcardid,
                                  giftmessage:
                                    giftMessages[item.cartid || 0]?.message ||
                                    "",
                                }),
                              );

                            if (updatePromises.length > 0) {
                              await Promise.all(updatePromises);
                            }
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
                      className="w-full py-4 bg-[var(--olive)] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isProceeding ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      {isProceeding ? "PROCESSING..." : "Proceed to Checkout"}
                    </button>
                    <Link
                      href="/shop"
                      className="w-full py-4 bg-white text-[var(--olive)] border-2 border-[var(--olive)] rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors hover:bg-[var(--olive)]/10 hover:text-[var(--olive)]"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Continue Shopping
                    </Link>
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
