"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  ChevronRight,
  Clock,
  ShieldCheck,
  Gift,
  Check,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { OrderItemData } from "@/models/order_item_model";

const translations: Record<string, any> = { EN: en, TA: ta, HI: hi };

const ORDER_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: ShieldCheck },
  { key: "processing", label: "Processing", icon: Package },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "outfordelivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "pending";
  const isDelivered = s === "delivered";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
        isDelivered
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
      {status || "Pending"}
    </span>
  );
}

function OrderDetailContent() {
  const [selectedLang, setSelectedLang] = useState("EN");
  useEffect(() => {
    const saved = localStorage.getItem("selectedLang");
    if (saved && translations[saved]) setSelectedLang(saved);
    const handler = () => {
      const l = localStorage.getItem("selectedLang");
      if (l && translations[l]) setSelectedLang(l);
    };
    window.addEventListener("languageChange", handler);
    return () => window.removeEventListener("languageChange", handler);
  }, []);

  const t = translations[selectedLang] || translations["EN"];
  const searchParams = useSearchParams();
  const orderItemId = searchParams.get("id");
  const [orderData, setOrderData] = useState<OrderItemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderItemId) return;
    setIsLoading(true);
    API.post(API_ROUTES.ORDERDETAILS, { orderitemid: Number(orderItemId) })
      .then((r) => { if (r.status === 200 && r.data?.data) setOrderData(r.data.data); })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [orderItemId]);

  const orderInfo = orderData
    ? {
        id: `TRD-${orderData.orderdetails?.orderitemid}`,
        status: orderData.orderdetails?.itemstatus,
        items: [
          {
            id: orderData.product?.productid,
            name: orderData.product?.productname,
            desc: "Premium handcrafted tradition",
            price: orderData.orderdetails?.price ?? 0,
            qty: orderData.orderdetails?.quantity ?? 1,
            image: orderData.product?.productimage?.startsWith("http")
              ? orderData.product.productimage
              : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${orderData.product?.productimage}`,
          },
        ],
        billing: {
          subtotal: (orderData.orderdetails?.price ?? 0) * (orderData.orderdetails?.quantity ?? 1),
          tax: 0,
          total: orderData.orderdetails?.totalprice ?? 0,
        },
        shipping: {
          name: "User",
          address: `${orderData.address?.addressline}, ${orderData.address?.city}, ${orderData.address?.state} - ${orderData.address?.pincode}`,
          method: "Standard Shipping",
        },
        giftcard: orderData.giftcard,
        ordertype: orderData.orderdetails?.ordertype,
        gramsperday: orderData.orderdetails?.gramsperday,
        familymembers: orderData.orderdetails?.familymembers,
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#f8f7f5]">
        <div className="w-12 h-12 border-[3px] border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-sm font-semibold tracking-wide">Loading order details…</p>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#f8f7f5]">
        <Package className="w-12 h-12 text-stone-200" strokeWidth={1.5} />
        <p className="text-stone-500 font-bold">Order not found.</p>
        <Link href="/my-account" className="text-xs uppercase tracking-widest font-black text-[var(--olive)] hover:underline">
          Back to Account
        </Link>
      </div>
    );
  }

  const currentStatus = orderInfo.status?.toLowerCase() || "pending";
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  const progressPct = currentIndex >= 0 ? (currentIndex / (ORDER_STEPS.length - 1)) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#f8f7f5] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Page Header ── */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/my-account"
            className="group w-10 h-10 rounded-full bg-white border border-stone-100 shadow-sm flex items-center justify-center text-stone-500 hover:text-[var(--olive)] hover:border-[var(--olive)]/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mb-0.5">
              {t.order_detail?.title || "Order Detail"}
            </p>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
              #{orderInfo.id.replace("TRD-", "")}
            </h1>
          </div>
          <div className="ml-auto">
            <StatusBadge status={orderInfo.status} />
          </div>
        </div>

        {/* ── Order Tracker Card ── */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-8 md:p-10 mb-8 relative overflow-hidden">
          {/* BG decoration */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[var(--olive)]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-[var(--olive)]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--olive)]" strokeWidth={2} />
            </div>
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest">Shipment Progress</h2>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:block relative px-6 relative z-10">
            <div className="absolute left-10 right-10 top-5 h-[3px] bg-stone-100 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[var(--olive)] to-[var(--olive)]/70 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {ORDER_STEPS.map((step, idx) => {
                const done = idx <= currentIndex;
                const active = idx === currentIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-3 w-20 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-300 ${
                        done ? "bg-[var(--olive)] text-white scale-110" : "bg-stone-100 text-stone-300"
                      } ${active ? "ring-4 ring-[var(--olive)]/20" : ""}`}
                    >
                      {done ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight transition-colors ${
                        active ? "text-[var(--olive)]" : done ? "text-stone-700" : "text-stone-300"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="md:hidden space-y-4 relative z-10">
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-stone-100 rounded-full">
              <div
                className="w-full bg-[var(--olive)] rounded-full transition-all duration-1000"
                style={{ height: `${progressPct}%` }}
              />
            </div>
            {ORDER_STEPS.map((step, idx) => {
              const done = idx <= currentIndex;
              const active = idx === currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-4 relative z-10">
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${
                      done ? "bg-[var(--olive)] text-white" : "bg-stone-100 text-stone-300"
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-black uppercase tracking-widest ${
                      active ? "text-[var(--olive)]" : done ? "text-stone-700" : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left: Items */}
          <div className="flex-1 space-y-4">

            {/* Section label */}
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">
                Items in this Order
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 text-[10px] font-black">
                {orderInfo.items.length} item{orderInfo.items.length > 1 ? "s" : ""}
              </span>
            </div>

            {orderInfo.items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-[1.75rem] border border-stone-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] hover:border-[var(--olive)]/20 transition-all duration-500 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Product image */}
                  <div className="sm:w-52 bg-[#f4f3f1] flex items-center justify-center p-6 shrink-0 border-b sm:border-b-0 sm:border-r border-stone-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--olive)]/5 to-transparent" />
                    <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border border-white/80 relative z-10 group-hover:scale-105 transition-transform duration-500">
                      <img src={item.image} alt={item.name || "Product"} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-stone-900 mb-1 leading-snug group-hover:text-[var(--olive)] transition-colors">
                          {item.name}
                        </h3>
                        {orderInfo.ordertype === "monthly" ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {[
                              { label: "Family", val: `${orderInfo.familymembers} members` },
                              { label: "Daily", val: `${orderInfo.gramsperday}g` },
                            ].map(({ label, val }) => (
                              <div key={label} className="px-3 py-1.5 bg-[#f4f3f1] rounded-xl border border-stone-200 flex items-center gap-2">
                                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</span>
                                <span className="text-xs font-black text-stone-800">{val}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400 font-medium leading-relaxed">{item.desc}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Total</p>
                        <p className="text-2xl font-black text-stone-900">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Qty</span>
                        <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 text-xs font-black flex items-center justify-center">
                          {item.qty}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                        ₹{item.price.toLocaleString()} / unit
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift card row */}
            {orderInfo.giftcard && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[1.75rem] border border-amber-200/60 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-52 bg-amber-100/40 flex items-center justify-center p-6 shrink-0 border-b sm:border-b-0 sm:border-r border-amber-100">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border border-white">
                      <img
                        src={
                          orderInfo.giftcard.giftcardimage?.startsWith("http")
                            ? orderInfo.giftcard.giftcardimage
                            : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${orderInfo.giftcard.giftcardimage}`
                        }
                        alt={orderInfo.giftcard.giftcardname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Gift Card</span>
                    </div>
                    <h3 className="text-lg font-black text-stone-900 mb-1">{orderInfo.giftcard.giftcardname}</h3>
                    {orderInfo.giftcard.giftmessage && (
                      <p className="text-sm italic text-stone-500 bg-white/70 px-3 py-2 rounded-xl border border-amber-100 mt-2">
                        "{orderInfo.giftcard.giftmessage}"
                      </p>
                    )}
                    <p className="text-2xl font-black text-amber-600 mt-3">
                      ₹{orderInfo.giftcard.giftcardprice?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-[340px] shrink-0 space-y-4">

            {/* Payment Card */}
            <div className="bg-white rounded-[1.75rem] border border-stone-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-8 relative overflow-hidden">
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[var(--olive)]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-[var(--olive)]/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[var(--olive)]" />
                </div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                  {t.order_detail?.payment || "Payment"}
                </h3>
              </div>

              <div className="space-y-3 text-sm relative z-10 mb-5">
                {[
                  { label: "Subtotal", val: `₹${orderInfo.billing.subtotal.toLocaleString()}`, colored: false },
                  { label: t.checkout?.tax || "Tax (GST)", val: `₹${orderInfo.billing.tax.toLocaleString()}`, colored: false },
                  { label: t.checkout?.shipping || "Delivery", val: t.checkout?.free || "FREE", colored: true },
                ].map(({ label, val, colored }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{label}</span>
                    <span className={`font-bold ${colored ? "text-emerald-600" : "text-stone-800"}`}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-dashed border-stone-200 relative z-10">
                <div className="flex justify-between items-end mb-5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                    {t.order_detail?.total_amount || "Total Paid"}
                  </span>
                  <span className="text-2xl font-black text-stone-900">
                    ₹{orderInfo.billing.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Payment Status</p>
                    <p className="text-xs font-black text-emerald-700">PAID &amp; CONFIRMED</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Card */}
            <div className="bg-white rounded-[1.75rem] border border-stone-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-8 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-stone-100/60 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[var(--olive)]" />
                </div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                  {t.order_detail?.delivery_details || "Delivery Info"}
                </h3>
              </div>

              <div className="rounded-xl bg-[#f8f7f5] border border-stone-200 p-4 mb-4 relative z-10">
                <p className="text-sm font-bold text-stone-800 mb-1">{orderInfo.shipping.name}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{orderInfo.shipping.address}</p>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 relative z-10">
                <Truck className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                    {t.order_detail?.method || "Method"}
                  </p>
                  <p className="text-xs font-bold text-stone-700">{orderInfo.shipping.method}</p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-stone-100 relative z-10">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
                  {t.order_detail?.need_help || "Need Help?"}
                </p>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--olive)] hover:underline"
                >
                  {t.order_detail?.chat_with_us || "Contact Support"}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Invoice Button */}
            <button className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[1.25rem] bg-white border border-stone-200 text-stone-700 text-xs font-black uppercase tracking-widest hover:bg-stone-50 hover:border-[var(--olive)]/30 hover:text-[var(--olive)] transition-all shadow-sm">
              <Download className="w-4 h-4" />
              {t.order_detail?.invoice || "Download Invoice"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#f8f7f5]">
          <div className="w-12 h-12 border-[3px] border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-semibold tracking-wide">Loading…</p>
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
