"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Download,
  CalendarDays,
  PackageCheck,
  Check,
  Truck,
  ChevronRight,
  Users,
  Flame,
  Scale,
  Sparkles,
} from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import { CalculatorData } from "@/models/calculator_model";

const ORDER_STEPS = [
  { key: "pending",        label: "Pending",          icon: Clock },
  { key: "confirmed",      label: "Confirmed",        icon: ShieldCheck },
  { key: "processing",     label: "Processing",       icon: Package },
  { key: "packed",         label: "Packed",           icon: PackageCheck },
  { key: "shipped",        label: "Shipped",          icon: Truck },
  { key: "outfordelivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered",      label: "Delivered",        icon: CheckCircle2 },
];

function StatusBadge({ status, index }: { status: string; index: number }) {
  const isDelivered = status === "delivered";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
        isDelivered
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
      {ORDER_STEPS[index]?.label || "Pending"}
    </span>
  );
}

function MonthlyOrderDetailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [orderData, setOrderData] = useState<CalculatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    API.post(API_ROUTES.CALCULATORORDERDETAILS, { orderid: Number(orderId) })
      .then((r) => { if (r.status === 200) setOrderData(r.data?.data || null); })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f7f5]">
        <div className="w-12 h-12 border-[3px] border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-sm font-semibold tracking-wide">Loading order details…</p>
      </div>
    );
  }

  if (!orderData || !orderData.order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f7f5] px-4">
        <Package className="w-14 h-14 text-stone-200" strokeWidth={1.5} />
        <p className="text-stone-500 font-bold">Order not found.</p>
        <Link
          href="/my-account"
          className="mt-2 px-6 py-3 bg-[var(--olive)] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-md hover:opacity-90 transition-opacity"
        >
          Return to Account
        </Link>
      </div>
    );
  }

  const { order, items } = orderData;
  const currentStatusRaw = (order.orderstatus || "pending").toLowerCase();
  let currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatusRaw);
  if (currentIndex === -1) currentIndex = 0;
  const progressPct = (currentIndex / (ORDER_STEPS.length - 1)) * 100;

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
              Monthly Subscription Order
            </p>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
              Order #{orderId}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <StatusBadge status={currentStatusRaw} index={currentIndex} />
          </div>
        </div>

        {/* ── Tracker Card ── */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[var(--olive)]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-[var(--olive)]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--olive)]" strokeWidth={2} />
            </div>
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest">Shipment Progress</h2>
            <div className="ml-auto flex items-center gap-2 text-stone-400">
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-semibold">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:block relative px-6 z-10">
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
                      className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight ${
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
              <div className="w-full bg-[var(--olive)] rounded-full transition-all duration-1000" style={{ height: `${progressPct}%` }} />
            </div>
            {ORDER_STEPS.map((step, idx) => {
              const done = idx <= currentIndex;
              const active = idx === currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${done ? "bg-[var(--olive)] text-white" : "bg-stone-100 text-stone-300"}`}>
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${active ? "text-[var(--olive)]" : done ? "text-stone-700" : "text-stone-400"}`}>
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
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Items in this Order</h2>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 text-[10px] font-black">
                {items?.length || 0} item{(items?.length || 0) !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items?.map((item) => {
                const image = item.productimage?.startsWith("http")
                  ? item.productimage
                  : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${item.productimage}`;

                return (
                  <div
                    key={item.orderitemid}
                    className="group bg-white rounded-[1.75rem] border border-stone-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] hover:border-[var(--olive)]/20 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="w-full bg-[#f4f3f1] p-6 flex items-center justify-center relative overflow-hidden h-40 shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--olive)]/5 to-transparent" />
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-white/80 relative z-10 group-hover:scale-105 transition-transform duration-500">
                        <img src={image || "/placeholder.png"} alt={item.productname} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col gap-4">
                      <h3 className="text-base font-black text-stone-900 leading-snug line-clamp-2 group-hover:text-[var(--olive)] transition-colors">
                        {item.productname}
                      </h3>

                      {/* Stat chips */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { icon: Users,  label: "Family", val: `${item.familymembers}` },
                          { icon: Flame,  label: "Daily",  val: `${item.gramsperday}g` },
                          { icon: Scale,  label: "Total",  val: `${item.totalquantitykg} KG` },
                        ].map(({ icon: Icon, label, val }) => (
                          <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f4f3f1] rounded-xl border border-stone-200">
                            <Icon className="w-3 h-3 text-[var(--olive)]" strokeWidth={2.5} />
                            <span className="text-[8px] font-black text-stone-400 uppercase tracking-wider">{label}</span>
                            <span className="text-[10px] font-black text-stone-800">{val}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Total Price</p>
                          <p className="text-xl font-black text-stone-900">₹{item.totalprice?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Supply</p>
                          <span className="text-xs font-black text-stone-700 px-2.5 py-1 bg-stone-100 rounded-lg">
                            {item.dayspermonth} Days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Payment Details</h3>
              </div>

              <div className="space-y-3 text-sm relative z-10 mb-5">
                {[
                  { label: "Subtotal",     val: `₹${order.totalamount?.toLocaleString()}`, colored: false },
                  { label: "Delivery Fee", val: "FREE",                                    colored: true  },
                  { label: "Taxes",        val: "Included",                                colored: false },
                ].map(({ label, val, colored }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{label}</span>
                    <span className={`font-bold ${colored ? "text-emerald-600" : "text-stone-800"}`}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-dashed border-stone-200 relative z-10">
                <div className="flex justify-between items-end mb-5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total Paid</span>
                  <span className="text-2xl font-black text-stone-900">₹{order.totalamount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Payment Status</p>
                    <p className="text-xs font-black text-emerald-700">{order.paymentstatus?.toUpperCase() || "PAID"}</p>
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
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Delivery Info</h3>
              </div>

              <div className="rounded-xl bg-[#f8f7f5] border border-stone-200 p-4 mb-4 relative z-10">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1.5">Shipping Address</p>
                <p className="text-sm text-stone-600 leading-relaxed">{order.address}</p>
              </div>

              <div className="mt-5 pt-5 border-t border-stone-100 relative z-10">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Need Help?</p>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--olive)] hover:underline"
                >
                  Contact Support
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Invoice Button */}
            <button className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[1.25rem] bg-white border border-stone-200 text-stone-700 text-xs font-black uppercase tracking-widest hover:bg-stone-50 hover:border-[var(--olive)]/30 hover:text-[var(--olive)] transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MonthlyOrderDetail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f7f5]">
          <div className="w-12 h-12 border-[3px] border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-semibold tracking-wide">Loading…</p>
        </div>
      }
    >
      <MonthlyOrderDetailContent />
    </Suspense>
  );
}
