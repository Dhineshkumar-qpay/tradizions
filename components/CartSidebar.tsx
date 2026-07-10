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

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("openCartSidebar", handleOpen);
    window.addEventListener("closeCartSidebar", handleClose);
    return () => {
      window.removeEventListener("openCartSidebar", handleOpen);
      window.removeEventListener("closeCartSidebar", handleClose);
    };
  }, []);
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
          let price = 0;
          if (item.itemtype === "customgift") {
            price = (item.totalprice ?? 0) / (item.quantity || 1);
          } else {
            price =
              (item.sellingprice ?? 0) > 0
                ? (item.sellingprice ?? 0)
                : (item.price ?? 0);
          }
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
      if (newQty <= 0) {
        const itemToRemove = cartItems.find((i) => i.cartid === cartid);
        const giftpackid =
          itemToRemove?.itemtype === "customgift"
            ? itemToRemove.giftpackid || 0
            : 0;
        const response = await API.post(API_ROUTES.REMOVECART, {
          cartid: cartid,
          giftpackid: giftpackid,
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } else {
        const response = await API.post(API_ROUTES.UPDATEQUANTITY, {
          cartid: cartid,
          quantity: newQty,
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
        }
      }
    } catch (err) {
      console.error("Error updating/removing quantity:", err);
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
    <div>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[var(--site-bg)] z-[90] shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-medium tracking-wide text-[var(--olive-dark)] uppercase flex items-center gap-2">
              Your Cart
            </h2>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">
              {cartItems.length} {cartItems.length === 1 ? "ITEM" : "ITEMS"}{" "}
              SELECTED
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:text-[var(--orange)] transition-colors text-[var(--dark-grey)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 w-full">
            {isLoading ? (
              <div className="bg-white border border-gray-200 h-64 flex items-center justify-center shadow-sm">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--olive-dark)] animate-spin" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="w-full bg-white border border-gray-200 shadow-sm py-16 flex flex-col items-center justify-center text-center px-8 relative overflow-hidden mt-6">
                <h3 className="text-xl font-medium tracking-wide text-[var(--olive-dark)] uppercase mb-3">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-8 max-w-xs leading-relaxed">
                  Add some items to your cart to see them here.
                </p>
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-[var(--olive-dark)] hover:bg-[var(--orange)] text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Explore Shop
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6 items-start w-full">
                {/* LEFT: Item List */}
                <div className="flex-1 w-full space-y-4">
                  {cartItems.map((item, index) => {
                    const isCustomGift = item.itemtype === "customgift";
                    let itemImage = "/placeholder.png";
                    let itemName = "";
                    let displayPrice = 0;
                    let originalPrice = 0;
                    let totalPrice = 0;
                    let hasDiscount = false;

                    if (isCustomGift) {
                      itemImage = item.giftpackimage
                        ? item.giftpackimage.startsWith("http")
                          ? item.giftpackimage
                          : `${IMAGE_URL || ""}${item.giftpackimage}`
                        : "/placeholder.png";
                      itemName = item.giftpackname || "Custom Gift Hamper";
                      totalPrice = item.totalprice ?? 0;
                      displayPrice =
                        (item.quantity ?? 0) > 0
                          ? totalPrice / (item.quantity ?? 1)
                          : totalPrice;
                      originalPrice = displayPrice;
                      hasDiscount = false;
                    } else {
                      itemImage = item.productimage
                        ? item.productimage.startsWith("http")
                          ? item.productimage
                          : `${IMAGE_URL || ""}${item.productimage}`
                        : "/placeholder.png";
                      itemName = item.productname || "";
                      displayPrice =
                        (item.sellingprice ?? 0) > 0
                          ? (item.sellingprice ?? 0)
                          : (item.price ?? 0);
                      originalPrice = item.price ?? 0;
                      totalPrice = displayPrice * (item.quantity ?? 0);
                      hasDiscount =
                        (item.sellingprice ?? 0) > 0 &&
                        item.sellingprice !== item.price;
                    }

                    const isUpdating = updatingCartId === item.cartid;
                    const isExpanded = expandedGifts.includes(item.cartid || 0);
                    const originalTotal = originalPrice * (item.quantity ?? 0);

                    return (
                      <div
                        key={`cart-item-${item.cartid || "new"}-${index}`}
                        className="bg-white border border-gray-200 shadow-sm transition-all overflow-hidden"
                      >
                        <div className="p-5 relative">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative w-20 h-20 overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                              <img
                                src={itemImage}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt={itemName}
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
                                  <p className="text-[10px] text-[var(--olive)] font-bold tracking-widest uppercase mb-1">
                                    {item.categoryname || "Tradizions"}
                                  </p>
                                  <h3 className="text-base font-black text-stone-900 leading-tight line-clamp-2">
                                    {itemName}
                                  </h3>
                                  {isCustomGift &&
                                    item.products &&
                                    item.products.length > 0 && (
                                      <div className="mt-3 flex flex-col gap-2 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                        <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                            Included Items:
                                          </p>
                                          <p className="text-[11px] font-semibold text-stone-700">
                                            Gift Pack Price: ₹
                                            {item.giftpackprice || 0}
                                          </p>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-1">
                                          {item.products.map((p, idx) => (
                                            <div
                                              key={`nested-${p.productid}-${idx}`}
                                              className="flex items-center justify-between gap-3"
                                            >
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-white">
                                                  <img
                                                    src={
                                                      p.productimage
                                                        ? p.productimage.startsWith(
                                                            "http",
                                                          )
                                                          ? p.productimage
                                                          : `${IMAGE_URL || ""}${p.productimage}`
                                                        : "/placeholder.png"
                                                    }
                                                    alt={p.productname || ""}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-semibold text-stone-700 truncate">
                                                    {p.productname}
                                                  </p>
                                                  <p className="text-[10px] font-medium text-stone-500">
                                                    Qty: {p.quantity}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="text-right shrink-0">
                                                <p className="text-xs font-semibold text-stone-800">
                                                  ₹
                                                  {(
                                                    p.totalprice ||
                                                    (p.sellingprice ?? 0) *
                                                      (p.quantity ?? 1) ||
                                                    0
                                                  ).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartid || 0,
                                      item.quantity ?? 0,
                                      -(item.quantity ?? 0),
                                    )
                                  }
                                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm text-stone-400 hover:text-stone-900 bg-white border border-stone-200 hover:border-stone-400 transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex flex-row items-end justify-between mt-4 gap-2">
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
                                  <p className="text-lg font-black text-stone-900 tracking-tight">
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
                                <div className="flex items-center bg-white rounded-sm border border-stone-200 overflow-hidden shrink-0">
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
                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 border-r border-gray-200"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <div className="w-10 text-center text-[13px] font-bold text-stone-900">
                                    {isUpdating ? (
                                      <div className="w-3 h-3 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto" />
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
                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 border-l border-gray-200"
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
                                            uploadingGiftForCartId ===
                                            item.cartid
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

                                      {globalGiftCards.map(
                                        (gc: any, gcIdx: number) => (
                                          <label
                                            key={`gc-${gc.giftcardid}-${gcIdx}`}
                                            className="shrink-0 cursor-pointer snap-start"
                                          >
                                            <input
                                              type="radio"
                                              name={`gift-${item.cartid || index}`}
                                              className="peer hidden"
                                              checked={
                                                item.giftcardid ===
                                                gc.giftcardid
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
                                                    (
                                                      gc.cardimage || ""
                                                    ).startsWith("http")
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
                                        ),
                                      )}
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
                <div className="w-full shrink-0">
                  <div className="bg-white border border-gray-200 shadow-sm overflow-hidden relative">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                      <div>
                        <h2 className="text-sm font-bold text-[var(--olive-dark)] uppercase tracking-[0.1em]">
                          Order Summary
                        </h2>
                      </div>
                    </div>

                    {/* Line items */}
                    <div className="px-6 py-5 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--dark-grey)] font-medium uppercase tracking-wider">
                          Subtotal ({cartItems.length} items)
                        </span>
                        <span className="font-bold text-gray-900">
                          ₹{totalAmount.toLocaleString()}
                        </span>
                      </div>
                      {cartItems.filter((i) => i.giftcardid).length > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--dark-grey)] font-medium uppercase tracking-wider">
                            Gift Cards
                          </span>
                          <span className="font-bold text-gray-900">
                            Included
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--dark-grey)] font-medium uppercase tracking-wider">
                          Shipping
                        </span>
                        <span className="font-bold text-gray-900">Free</span>
                      </div>
                    </div>

                    {/* Total panel */}
                    <div className="px-6 py-5 flex justify-between items-center border-t border-gray-100">
                      <div>
                        <p className="text-[12px] font-bold text-[var(--olive-dark)] uppercase tracking-widest mb-0.5">
                          Grand Total
                        </p>
                      </div>
                      <p className="text-xl font-bold text-[var(--olive-dark)] tracking-tight">
                        ₹{grandTotal.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="px-5 pb-5 pt-5 space-y-4">
                      <button
                        disabled={isProceeding}
                        onClick={async () => {
                          if (cartItems.length > 0) {
                            setIsProceeding(true);
                            try {
                              const updatePromises = cartItems
                                .filter(
                                  (item) =>
                                    item.itemtype === "gift" && item.giftcardid,
                                )
                                .map((item) =>
                                  API.post(API_ROUTES.UPDATEGIFTCARD, {
                                    cartid: item.cartid,
                                    giftcardid: item.giftcardid,
                                    giftmessage:
                                      giftMessages[item.cartid || 0]?.message ||
                                      "",
                                    sendername:
                                      giftMessages[item.cartid || 0]?.from ||
                                      "",
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
                              setIsOpen(false);
                            }
                          }
                        }}
                        className="w-full py-4 bg-[var(--olive-dark)] text-white font-bold text-[12px] uppercase tracking-[0.2em] shadow-sm hover:bg-[var(--orange)] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                      >
                        {isProceeding ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "PROCEED TO CHECKOUT"
                        )}
                      </button>

                      {/* Trust badges row */}
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                            Secure
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                            Best Price
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-gray-400">
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
        </div>
      </div>
    </div>
  );
}
