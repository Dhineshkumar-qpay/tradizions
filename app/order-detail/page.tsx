"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Download,
  Clock,
  ShieldCheck,
  Gift,
  Check,
  CheckCircle2,
  Users,
  Scale,
  CalendarDays,
  Flame,
  XCircle,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { Data } from "@/models/order_item_model";

const translations: Record<string, any> = { EN: en, TA: ta, HI: hi };

const ORDER_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: ShieldCheck },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
];

function StatusPill({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "pending";
  const isDelivered = s === "delivered";
  const isShipped = s === "shipped";
  const isCancelled = s === "cancelled";
  const color = isCancelled
    ? "bg-red-50 text-red-600 border-red-200"
    : isDelivered
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isShipped
      ? "bg-orange-50 text-[var(--orange)] border-orange-200"
      : "bg-[var(--olive)]/10 text-[var(--olive)] border-[var(--olive)]/25";
  const dot = isCancelled
    ? "bg-red-500"
    : isDelivered
    ? "bg-emerald-500"
    : isShipped
      ? "bg-[var(--orange)] animate-pulse"
      : "bg-[var(--olive)] animate-pulse";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[9px] font-bold uppercase tracking-widest ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-sm ${dot}`} />
      {status || "Pending"}
    </span>
  );
}

function TrackingTimeline({ status }: { status?: string }) {
  const cur = status?.toLowerCase() || "pending";
  const isCancelled = cur === "cancelled";
  
  // If cancelled, show steps up to cancelled instead of delivered
  const stepsToShow = isCancelled
    ? ORDER_STEPS.filter(s => s.key !== "delivered")
    : ORDER_STEPS.filter(s => s.key !== "cancelled");

  const curIdx = stepsToShow.findIndex((s) => s.key === cur);

  return (
    <div className="mt-8 pt-8 border-t border-[var(--cream)]/60">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--olive)]/60 mb-6">
        Order Tracking
      </p>

      {/* Desktop */}
      <div className="hidden sm:block relative">
        <div className="absolute left-[28px] right-[28px] top-[14px] h-[2px] bg-stone-100 z-0">
          <div
            className="h-full transition-all duration-1000"
            style={{
              width:
                curIdx >= 0
                  ? `${(curIdx / (stepsToShow.length - 1)) * 100}%`
                  : "0%",
              background: isCancelled
                ? "linear-gradient(to right, var(--olive), #ef4444)"
                : "linear-gradient(to right, var(--olive), var(--orange))",
            }}
          />
        </div>
        <div className="relative flex justify-between z-10">
          {stepsToShow.map((step, idx) => {
            const done = idx <= curIdx;
            const isCancelStep = step.key === "cancelled";
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="flex flex-col items-center gap-2.5"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done
                      ? isCancelStep
                        ? "border-red-500 bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                        : "border-[var(--olive)] bg-[var(--olive)] shadow-[0_0_0_3px_rgba(85,107,47,0.15)]"
                      : "bg-white border-stone-200"
                  }`}
                >
                  {done ? (
                    isCancelStep ? (
                      <Icon className="w-3 h-3 text-white" />
                    ) : (
                      <Check className="w-3 h-3 text-white" />
                    )
                  ) : (
                    <Icon className="w-3 h-3 text-stone-300" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-semibold text-center leading-tight max-w-[52px] ${
                    done 
                      ? isCancelStep ? "text-red-500" : "text-[var(--olive)]" 
                      : "text-stone-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-0 relative pl-4">
        <div className="absolute left-[22px] top-3 bottom-3 w-[2px] bg-stone-100 z-0">
          <div
            className="w-full transition-all duration-1000"
            style={{
              height:
                curIdx >= 0
                  ? `${(curIdx / (stepsToShow.length - 1)) * 100}%`
                  : "0%",
              background: isCancelled
                ? "linear-gradient(to bottom, var(--olive), #ef4444)"
                : "linear-gradient(to bottom, var(--olive), var(--orange))",
            }}
          />
        </div>
        {stepsToShow.map((step, idx) => {
          const done = idx <= curIdx;
          const isCancelStep = step.key === "cancelled";
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="flex items-center gap-3 relative z-10 py-2.5"
            >
              <div
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${
                  done 
                    ? isCancelStep 
                      ? "bg-red-500 border-red-500" 
                      : "bg-[var(--olive)] border-[var(--olive)]" 
                    : "bg-white border-stone-200"
                }`}
              >
                {done ? (
                  isCancelStep ? (
                    <Icon className="w-3 h-3 text-white" />
                  ) : (
                    <Check className="w-3 h-3 text-white" />
                  )
                ) : (
                  <Icon className="w-3 h-3 text-stone-300" />
                )}
              </div>
              <span
                className={`text-sm font-semibold ${
                  done 
                    ? isCancelStep ? "text-red-500" : "text-[var(--olive)]" 
                    : "text-stone-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
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

  const searchParams = useSearchParams();
  const orderItemId = searchParams.get("id");
  const [orderData, setOrderData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderItemId) return;
    setIsLoading(true);
    API.post(API_ROUTES.ORDERDETAILS, { orderid: Number(orderItemId) })
      .then((r) => {
        if (r.status === 200 && r.data?.data) setOrderData(r.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [orderItemId]);

  const orderInfo =
    orderData?.order && orderData?.items && orderData.items.length > 0
      ? {
          id: `${orderData.order.orderid}`,
          ordertype: orderData.order.ordertype,
          orderstatus: orderData.order.orderstatus,
          address: orderData.order.address,
          items: orderData.items.map((item, idx) => ({
            key: item.orderitemid || idx,
            name: item.product?.productname,
            price: item.price ?? 0,
            totalprice: item.totalprice ?? 0,
            qty: item.quantity ?? 1,
            status: item.itemstatus,
            ordertype: item.ordertype,
            giftpack: item.giftpack,
            giftpackproducts: item.giftpackproducts,
            giftcard: item.giftcard,
            address: item.address,
            gramsperday: item.gramsperday,
            dayspermonth: item.dayspermonth,
            familymembers: item.familymembers,
            totalquantitykg: item.totalquantitykg,
            image: item.product?.productimage?.startsWith("http")
              ? item.product.productimage
              : `${IMAGE_URL || ""}${item.product?.productimage}`,
          })),
          billing: {
            subtotal: orderData.items.reduce(
              (acc, item) => acc + (parseFloat(item.totalprice?.toString() || "0") ?? 0),
              0,
            ),
            total: orderData.items.reduce(
              (acc, item) => acc + (parseFloat(item.totalprice?.toString() || "0") ?? 0),
              0,
            ),
          },
        }
      : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[var(--site-bg)]">
        <div className="w-12 h-12 border-[2.5px] border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-xs font-bold tracking-widest uppercase">
          Loading order…
        </p>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[var(--site-bg)]">
        <Package className="w-14 h-14 text-stone-200" strokeWidth={1} />
        <p className="text-stone-500 font-bold text-sm">Order not found.</p>
        <Link
          href="/my-account"
          className="text-[10px] uppercase tracking-widest font-black text-[var(--olive)] hover:underline"
        >
          ← Back to Account
        </Link>
      </div>
    );
  }

  const isMonthly = orderInfo.ordertype === "monthly";

  return (
    <main className="min-h-screen bg-[var(--site-bg)] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/my-account"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-[var(--olive)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> My Account
          </Link>
          <StatusPill status={orderInfo.orderstatus} />
        </div>

        {/* Hero Banner */}
        <div className="bg-[var(--olive-dark)] p-8 sm:p-10 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-[var(--olive)] shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3 text-[var(--olive)]">
              {isMonthly ? "Monthly Subscription" : "Standard Order"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2">
              ORDER <span className="font-bold">#{orderInfo.id}</span>
            </h1>
            <p className="text-sm text-stone-400">
              {orderInfo.items.length} item{orderInfo.items.length > 1 ? "s" : ""} · ₹{orderInfo.billing.total.toLocaleString()} total
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-[var(--olive-dark)] text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>
            <Link
              href="/contact-us"
              className="flex items-center gap-2 px-6 py-3 border border-[var(--olive)] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--olive)] transition-colors shadow-sm"
            >
              Support
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Items */}
          <div className="flex-1 w-full space-y-5">
            {/* Monthly: global status + address */}
            {isMonthly && (
              <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-stone-900">
                    <Clock className="w-3.5 h-3.5 text-stone-400" /> Subscription Status
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <TrackingTimeline status={orderInfo.orderstatus} />
                </div>
                {orderInfo.address && (
                  <div className="p-6 border-t border-stone-100 bg-stone-50 flex items-start gap-4">
                    <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">
                        Delivery Address
                      </p>
                      <p className="text-sm text-stone-900 font-medium leading-relaxed">
                        {orderInfo.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            {orderInfo.items.map((item, itemIdx) => (
              <div
                key={item.key}
                className="bg-white border border-stone-200 shadow-sm overflow-hidden group hover:border-[var(--olive-dark)] transition-colors duration-300"
              >
                {/* Top label row */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">
                    Item {itemIdx + 1} of {orderInfo.items.length}
                  </span>
                  <StatusPill status={item.status} />
                </div>

                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-52 p-6 flex items-center justify-center shrink-0 bg-stone-50 border-r border-stone-100">
                    {item.giftpack ? (
                      <div className="relative w-36 h-36">
                        <div className="absolute top-0 left-0 w-28 h-28 rounded-sm overflow-hidden bg-white shadow-sm border border-stone-200 z-10">
                          <img
                            src={item.giftpack.giftpackimage?.startsWith('http') ? item.giftpack.giftpackimage : `${IMAGE_URL || ""}${item.giftpack.giftpackimage}`}
                            alt={item.giftpack.giftpackname}
                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        {item.giftpackproducts && item.giftpackproducts.length > 0 && (
                          <div className="absolute bottom-0 right-0 w-20 h-20 rounded-sm overflow-hidden bg-white shadow-md border-2 border-white z-20">
                            <img
                              src={item.giftpackproducts[0].productimage?.startsWith('http') ? item.giftpackproducts[0].productimage : `${IMAGE_URL || ""}${item.giftpackproducts[0].productimage}`}
                              alt={item.giftpackproducts[0].productname || "Product"}
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                            {item.giftpackproducts.length > 1 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold">
                                +{item.giftpackproducts.length - 1}
                              </div>
                            )}
                          </div>
                        )}
                        {(!item.giftpackproducts || item.giftpackproducts.length === 0) && item.image && (
                          <div className="absolute bottom-0 right-0 w-20 h-20 rounded-sm overflow-hidden bg-white shadow-md border-2 border-white z-20">
                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-36 h-36 rounded-sm overflow-hidden bg-white shadow-sm border border-stone-200">
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 sm:pl-2 sm:pr-6 sm:py-6 flex flex-col justify-between">
                    <div>
                      {item.giftpack ? (
                        <>
                          <h3 className="text-xl font-bold text-stone-900 mb-1 transition-colors group-hover:text-[var(--olive)]">
                            {item.giftpack.giftpackname}
                          </h3>
                          <p className="text-xs text-stone-500 mb-4 leading-relaxed line-clamp-2">
                            {item.giftpack.description}
                          </p>
                          <div className="flex items-baseline gap-3 mb-4">
                            <span
                              className="text-2xl font-black"
                              style={{ color: "var(--olive)" }}
                            >
                              ₹{item.totalprice.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-2 py-1 rounded bg-stone-100">
                              Custom Gift Bundle
                            </span>
                          </div>
                          
                          <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-sm mb-4">
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-200 pb-2">
                              Bundle Contents
                            </p>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-[var(--olive)]" /> {item.qty} × Base Box
                              </span>
                              <span className="text-xs font-medium text-stone-500">₹{((item.giftpack.giftpackprice ?? 0) * item.qty).toLocaleString()}</span>
                            </div>
                            {item.giftpackproducts && item.giftpackproducts.length > 0 ? (
                              item.giftpackproducts.map((gp: any, idx: number) => {
                                const gpImg = gp.productimage?.startsWith('http') ? gp.productimage : `${IMAGE_URL || ""}${gp.productimage}`;
                                return (
                                  <div key={idx} className="flex justify-between items-center mt-2.5 pl-2">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-sm bg-white overflow-hidden border border-stone-200 shrink-0 shadow-sm">
                                        <img src={gpImg} alt={gp.productname} className="w-full h-full object-cover mix-blend-multiply" />
                                      </div>
                                      <span className="text-xs font-semibold text-stone-800 truncate pr-4">
                                        {(gp.quantity ?? 1) * item.qty} × {gp.productname}
                                      </span>
                                    </div>
                                    <span className="text-xs font-medium text-stone-500 shrink-0">
                                      ₹{((gp.totalprice || 0) * item.qty).toLocaleString()}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-stone-800 truncate pr-4 pl-5">
                                  {item.qty} × {item.name}
                                </span>
                                <span className="text-xs font-medium text-stone-500 shrink-0">
                                  ₹{(((item.totalprice / item.qty) - (item.giftpack.giftpackprice ?? 0)) * item.qty).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-stone-900 mb-1 transition-colors group-hover:text-[var(--olive)]">
                            {item.name}
                          </h3>
                          <div className="flex items-baseline gap-3 mb-4">
                            <span
                              className="text-2xl font-black"
                              style={{ color: "var(--olive)" }}
                            >
                              ₹{item.totalprice.toLocaleString()}
                            </span>
                            {item.qty > 1 && (
                              <span className="text-xs text-stone-400 font-medium">
                                ₹{item.price} × {item.qty}
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Monthly stats */}
                      {isMonthly ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            {
                              icon: Flame,
                              label: "Daily Usage",
                              value: `${item.gramsperday}g`,
                              accent: false,
                            },
                            {
                              icon: CalendarDays,
                              label: "Days",
                              value: `${item.dayspermonth}`,
                              accent: false,
                            },
                            {
                              icon: Users,
                              label: "Members",
                              value: `${item.familymembers}`,
                              accent: false,
                            },
                            {
                              icon: Scale,
                              label: "Total Qty",
                              value: `${item.totalquantitykg} kg`,
                              accent: true,
                            },
                          ].map(({ icon: Icon, label, value, accent }) => (
                            <div
                              key={label}
                              className="rounded-xl p-3 border"
                              style={
                                accent
                                  ? {
                                      background: "rgba(85,107,47,0.07)",
                                      borderColor: "rgba(85,107,47,0.18)",
                                    }
                                  : {
                                      background: "var(--site-bg)",
                                      borderColor: "#e7e5e4",
                                    }
                              }
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Icon
                                  className="w-3 h-3"
                                  style={{
                                    color: accent
                                      ? "var(--olive)"
                                      : "var(--orange)",
                                  }}
                                />
                                <span
                                  className="text-[9px] font-bold uppercase tracking-widest"
                                  style={{
                                    color: accent ? "var(--olive)" : "#a8a29e",
                                  }}
                                >
                                  {label}
                                </span>
                              </div>
                              <span
                                className="text-sm font-bold"
                                style={{
                                  color: accent ? "var(--olive)" : "#1c1917",
                                }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500 leading-relaxed">
                          Premium quality, handcrafted for your home.
                        </p>
                      )}
                    </div>

                    {/* Normal per-item tracking */}
                    {!isMonthly && (
                      <div>
                        <TrackingTimeline status={item.status} />
                        {item.address && (
                          <div
                            className="mt-5 p-4 rounded-xl flex items-start gap-3"
                            style={{
                              background: "var(--beige)",
                              border: "1px solid rgba(201,168,76,0.2)",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "rgba(85,107,47,0.1)" }}
                            >
                              <MapPin
                                className="w-4 h-4"
                                style={{ color: "var(--olive)" }}
                              />
                            </div>
                            <div>
                              <p
                                className="text-[9px] font-bold uppercase tracking-widest mb-1"
                                style={{ color: "var(--olive)" }}
                              >
                                Delivery Address
                              </p>
                              <p className="text-sm text-stone-700 font-medium leading-relaxed">
                                {item.address.addressline}
                                {item.address.landmark
                                  ? `, ${item.address.landmark}`
                                  : ""}
                                , {item.address.city}, {item.address.state} –{" "}
                                {item.address.pincode}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gift card */}
                {item.giftcard && (
                  <div className="mx-6 mb-6 rounded-sm overflow-hidden border border-stone-200 bg-stone-50">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                      <div className="w-24 h-16 rounded-sm overflow-hidden shrink-0 border border-stone-200 shadow-sm">
                        <img
                          src={
                            item.giftcard.cardimage?.startsWith("http")
                              ? item.giftcard.cardimage
                              : `${IMAGE_URL || ""}${item.giftcard.cardimage}`
                          }
                          alt={item.giftcard.cardname}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">
                            Gift Card Included
                          </span>
                        </div>
                        <p className="text-stone-900 font-bold text-sm uppercase tracking-wider">
                          {item.giftcard.cardname}
                        </p>
                        {item.giftcard.giftmessage && (
                          <p className="text-xs italic mt-1 text-stone-500">
                            "{item.giftcard.giftmessage}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-5 lg:sticky lg:top-24">
            {/* Payment card */}
            <div className="border border-stone-200 shadow-sm bg-white">
              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2 text-stone-900 border-b border-stone-100 pb-4">
                  <CreditCard className="w-3.5 h-3.5 text-stone-400" /> Payment Summary
                </p>
                <div className="space-y-4 mb-5">
                  {[
                    {
                      label: "Subtotal",
                      val: `₹${orderInfo.billing.subtotal.toFixed(2).toLocaleString()}`,
                    },
                    { label: "Delivery", val: "FREE" },
                    { label: "Tax (GST)", val: "₹0" },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center text-xs font-semibold"
                    >
                      <span className="text-stone-500">
                        {label}
                      </span>
                      <span className="text-stone-900">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Total
                  </span>
                  <span className="text-xl font-bold text-stone-900">
                    ₹{orderInfo.billing.total.toFixed(2).toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Paid bar */}
              <div className="px-6 py-3 flex items-center gap-2.5 bg-stone-50 border-t border-stone-100">
                <ShieldCheck className="w-4 h-4 text-[var(--olive)]" />
                <span className="text-stone-900 text-[10px] font-bold uppercase tracking-widest">
                  Payment Confirmed
                </span>
              </div>
            </div>

            {/* Order type */}
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-stone-900 border-b border-stone-100 pb-4">
                Order Info
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-50 border border-stone-200 flex items-center justify-center">
                  {isMonthly ? (
                    <CalendarDays className="w-4 h-4 text-stone-400" />
                  ) : (
                    <Package className="w-4 h-4 text-stone-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {orderInfo.ordertype} Order
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {orderInfo.items.length} product{orderInfo.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--olive-dark)] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download Invoice
              </button>
              <Link
                href="/contact-us"
                className="w-full flex items-center justify-center gap-2 py-3 border border-stone-300 text-stone-900 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors"
              >
                Need Help?
              </Link>
            </div>
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
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[var(--site-bg)]">
          <div className="w-12 h-12 border-[2.5px] border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-xs font-bold tracking-widest uppercase">
            Loading…
          </p>
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
