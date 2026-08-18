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
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-gray-50 z-[90] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col border-l border-gray-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white shrink-0 shadow-sm z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase flex items-center gap-2">
              {t.cart_sidebar?.your_cart || "Your Cart"}
            </h2>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">
              {cartItems.length} {cartItems.length === 1 ? (t.cart_sidebar?.item || "ITEM") : (t.cart_sidebar?.items_upper || "ITEMS")}{" "}
              {t.cart_sidebar?.selected || "SELECTED"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="p-5 w-full">
            {isLoading ? (
              <div className="bg-white rounded-[var(--radius-sm)] border border-gray-200 h-64 flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--olive)] rounded-full animate-spin" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="w-full bg-white border border-gray-200 rounded-[var(--radius-sm)] shadow-sm py-20 flex flex-col items-center justify-center text-center px-8 mt-2">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
                  {t.cart_sidebar?.cart_empty || "Your cart is empty"}
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-8 max-w-xs leading-relaxed">
                  {t.cart_sidebar?.cart_empty_desc || "Add some items to your cart to see them here."}
                </p>
                <Link
                  href="/shop"
                  className="btn-standard uppercase w-full max-w-[240px]"
                  onClick={() => setIsOpen(false)}
                >
                  {t.cart_sidebar?.explore_shop || "Explore Shop"}
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
                        className="bg-white border border-gray-200 rounded-[var(--radius-sm)] shadow-sm mb-4 overflow-hidden transition-all group"
                      >
                        <div className="p-4 relative">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative w-20 h-20 overflow-hidden bg-gray-50 rounded-[var(--radius-sm)] shrink-0 border border-gray-100">
                              <img
                                src={itemImage}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={itemName}
                              />
                              {item.itemtype === "gift" && (
                                <div className="absolute top-1 left-1 bg-[var(--olive)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-widest">
                                  {t.cart_sidebar?.gift || "Gift"}
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">
                                    {item.categoryname || "Tradizions"}
                                  </p>
                                  <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                                    {itemName}
                                  </h3>
                                  {isCustomGift &&
                                    item.products &&
                                    item.products.length > 0 && (
                                      <div className="mt-3 flex flex-col gap-2 bg-gray-50 p-3 rounded-[var(--radius-sm)] border border-gray-100">
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            {t.cart_sidebar?.included_items || "Included Items:"}
                                          </p>
                                          <p className="text-[10px] font-bold text-gray-900">
                                            {t.cart_sidebar?.gift_pack_price || "Pack Price:"} ₹
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
                                                <div className="w-8 h-8 rounded overflow-hidden border border-gray-200 shrink-0 bg-white">
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
                                                  <p className="text-[11px] font-bold text-gray-900 truncate">
                                                    {p.productname}
                                                  </p>
                                                  <p className="text-[9px] font-bold text-gray-500">
                                                    {t.cart_sidebar?.qty || "Qty:"} {p.quantity}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="text-right shrink-0">
                                                <p className="text-[11px] font-bold text-gray-900">
                                                  ₹
                                                  {(
                                                    p.totalprice ||
                                                    (p.sellingprice ?? 0) *
                                                      (p.quantity ?? 1) ||
                                                    0
                                                  ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
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
                                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-200"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex flex-row items-end justify-between mt-4 gap-2">
                                <div>
                                  {totalPrice !==
                                    totalPrice / (item.quantity ?? 1) && (
                                    <p className="text-xs font-bold text-[var(--olive)] tracking-tight mb-0.5">
                                      ₹
                                      {(totalPrice / (item.quantity ?? 1)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                    </p>
                                  )}
                                  <p className="text-base font-extrabold text-gray-900 tracking-tight">
                                    ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                  {hasDiscount && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-[10px] text-gray-400 font-bold line-through">
                                        ₹
                                        {originalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </p>
                                      <span className="text-[9px] font-bold text-white bg-[var(--orange)] px-1.5 py-0.5 rounded shadow-sm uppercase tracking-widest">
                                        {t.cart_sidebar?.save || "SAVE"} ₹
                                        {(originalTotal - totalPrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Quantity stepper */}
                                <div className="flex items-center bg-gray-50 rounded-[var(--radius-sm)] border border-gray-200 overflow-hidden shrink-0 h-8">
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
                                    className="w-8 h-full flex items-center justify-center bg-white hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 border-r border-gray-200"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <div className="w-8 text-center text-xs font-bold text-gray-900 bg-gray-50">
                                    {isUpdating ? (
                                      <div className="w-2.5 h-2.5 border-2 border-gray-300 border-t-[var(--olive)] rounded-full animate-spin mx-auto" />
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
                                    className="w-8 h-full flex items-center justify-center bg-white hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 border-l border-gray-200"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Gift Card Accordion */}
                        {item.itemtype === "gift" &&
                          globalGiftCards.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50">
                              <button
                                onClick={() =>
                                  toggleGiftExpansion(item.cartid || 0)
                                }
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors group/gift"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-[var(--olive)] flex items-center justify-center shadow-sm">
                                    <Gift className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-0.5">
                                      {t.cart_sidebar?.personalize_gift || "Personalize Gift"}
                                    </p>
                                    {item.giftcardid && item.giftcardid > 0 ? (
                                      <p className="text-[9px] text-[var(--olive)] font-bold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {globalGiftCards.find(
                                          (gc) =>
                                            gc.giftcardid === item.giftcardid,
                                        )?.cardname || (t.cart_sidebar?.card_selected || "Card Selected")}
                                      </p>
                                    ) : (
                                      <p className="text-[9px] text-gray-500 font-bold uppercase">
                                        {t.cart_sidebar?.add_custom_card || "Add custom card & message"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center transition-all duration-300 ${isExpanded ? "rotate-180 border-[var(--olive)] text-[var(--olive)] shadow-sm" : "text-gray-400 group-hover/gift:border-gray-300"}`}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 space-y-5 relative border-t border-gray-100">
                                  {isUpdating && (
                                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                      <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--olive)] rounded-full animate-spin" />
                                    </div>
                                  )}

                                  {/* Card thumbnails */}
                                  <div>
                                    <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-sm bg-gray-200 text-gray-600 flex items-center justify-center">1</span>
                                      {t.cart_sidebar?.choose_card || "Choose a Card"}
                                    </h4>
                                    <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-3 w-full snap-x scroll-smooth custom-scrollbar">
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
                                        <div className="w-24 h-16 rounded border border-gray-200 bg-white flex flex-col items-center justify-center gap-1 transition-all peer-checked:border-[var(--olive)] peer-checked:bg-[var(--olive)]/5 peer-checked:shadow-sm hover:border-gray-300">
                                          <X className="w-4 h-4 text-gray-400" />
                                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            {t.cart_sidebar?.no_card || "No Card"}
                                          </p>
                                        </div>
                                      </label>

                                      {/* Upload Your Own */}
                                      <label className="shrink-0 cursor-pointer snap-start group/upload relative flex flex-col items-center justify-center gap-1 w-24 h-16 rounded border border-dashed border-gray-300 bg-white hover:border-[var(--orange)] hover:bg-[var(--orange)]/5 transition-all text-center">
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
                                          <div className="w-4 h-4 border-2 border-gray-300 border-t-[var(--orange)] rounded-full animate-spin" />
                                        ) : (
                                          <Upload className="w-4 h-4 text-gray-400 group-hover/upload:text-[var(--orange)] transition-colors" />
                                        )}
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/upload:text-[var(--orange)]">
                                          {t.cart_sidebar?.upload_custom || "Custom"}
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
                                            <div className="w-24 h-16 rounded border border-gray-200 overflow-hidden transition-all peer-checked:border-[var(--olive)] peer-checked:shadow-sm hover:border-gray-300 relative group/card">
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 peer-checked:opacity-0 transition-opacity flex items-center justify-center z-10">
                                                <p className="text-white text-[9px] font-bold uppercase tracking-widest">
                                                  {t.cart_sidebar?.select || "Select"}
                                                </p>
                                              </div>
                                              {item.giftcardid ===
                                                gc.giftcardid && (
                                                <div className="absolute top-1 right-1 z-10 bg-[var(--olive)] rounded-sm p-0.5 shadow-sm">
                                                  <Check className="w-2.5 h-2.5 text-white" />
                                                </div>
                                              )}
                                              <div className="h-[60%] bg-gray-100 w-full relative border-b border-gray-100">
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
                                              <div className="h-[40%] px-1 py-1 bg-white flex items-center justify-center">
                                                <p className="text-[9px] font-bold text-gray-800 truncate w-full text-center">
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
                                    <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-sm bg-gray-200 text-gray-600 flex items-center justify-center">2</span>
                                      {t.cart_sidebar?.add_message || "Add Your Message"}
                                    </h4>
                                    <div className="space-y-3">
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
                                        className="w-full px-3 py-2 rounded bg-white border border-gray-200 text-xs font-medium focus:border-[var(--olive)] outline-none transition-all resize-none h-16 placeholder:text-gray-400"
                                        placeholder={t.cart_sidebar?.message_placeholder || "Write a thoughtful message here..."}
                                      />
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
                                        className="w-full px-3 py-2 rounded bg-white border border-gray-200 text-xs font-medium focus:border-[var(--olive)] outline-none transition-all placeholder:text-gray-400"
                                        placeholder={t.cart_sidebar?.sender_name || "Sender Name (From)"}
                                      />
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
                  <div className="bg-white border border-gray-200 rounded-[var(--radius-sm)] shadow-sm overflow-hidden relative mt-2">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                      <div>
                        <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                          {t.cart_sidebar?.order_summary || "Order Summary"}
                        </h2>
                      </div>
                    </div>

                    {/* Line items */}
                    <div className="px-5 py-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest">
                          {t.cart_sidebar?.subtotal || "Subtotal"} ({cartItems.length} {t.cart_sidebar?.items_lower || "items"})
                        </span>
                        <span className="font-bold text-gray-900">
                          ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {cartItems.filter((i) => i.giftcardid).length > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-bold uppercase tracking-widest">
                            {t.cart_sidebar?.gift_cards || "Gift Cards"}
                          </span>
                          <span className="font-bold text-gray-900">
                            {t.cart_sidebar?.included || "Included"}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest">
                          {t.cart_sidebar?.shipping || "Shipping"}
                        </span>
                        <span className="font-bold text-[var(--olive)] uppercase tracking-widest">{t.cart_sidebar?.free || "Free"}</span>
                      </div>
                    </div>

                    {/* Total panel */}
                    <div className="px-5 py-4 flex justify-between items-center border-t border-gray-100 bg-gray-50">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                          {t.cart_sidebar?.grand_total || "Grand Total"}
                        </p>
                      </div>
                      <p className="text-xl font-extrabold text-gray-900 tracking-tight">
                        ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="p-5">
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
                        className="btn-standard w-full uppercase py-3.5"
                      >
                        {isProceeding ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            {t.cart_sidebar?.proceed_to_checkout || "PROCEED TO CHECKOUT"}
                          </span>
                        )}
                      </button>

                      {/* Trust badges row */}
                      <div className="flex items-center justify-center gap-3 pt-4">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="text-[8px] font-bold uppercase tracking-widest">
                            {t.cart_sidebar?.secure || "Secure"}
                          </span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="text-[8px] font-bold uppercase tracking-widest">
                            {t.cart_sidebar?.best_price || "Best Price"}
                          </span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="text-[8px] font-bold uppercase tracking-widest">
                            {t.cart_sidebar?.quality || "Quality"}
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
