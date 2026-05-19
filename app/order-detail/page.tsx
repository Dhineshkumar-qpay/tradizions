"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  MessageCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

export default function OrderDetailPage() {
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
  const searchParams = useSearchParams();
  const orderItemId = searchParams.get("id");
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderItemId) return;
      setIsLoading(true);
      try {
        const response = await API.post(API_ROUTES.ORDERDETAILS, {
          orderitemid: Number(orderItemId),
        });
        if (response.status === 200 && response.data?.data) {
          setOrderData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderItemId]);

  const orderInfo = orderData
    ? {
        id: `TRD-${orderData.orderdetails.orderid}`,
        date: "N/A",
        status: orderData.orderdetails.itemstatus,
        items: [
          {
            id: orderData.product.productid,
            name: orderData.product.productname,
            desc: "Premium handcrafted tradition",
            price: orderData.orderdetails.price,
            qty: orderData.orderdetails.quantity,
            image: orderData.product.productimage?.startsWith("http")
              ? orderData.product.productimage
              : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${orderData.product.productimage}`,
          },
        ],
        billing: {
          subtotal:
            orderData.orderdetails.price * orderData.orderdetails.quantity,
          shipping: 0,
          tax: 0,
          total: orderData.orderdetails.totalprice,
        },
        shipping: {
          name: "User",
          address: `${orderData.address.addressline}, ${orderData.address.city}, ${orderData.address.state} - ${orderData.address.pincode}`,
          method: "Standard Shipping",
        },
        giftcard: orderData.giftcard,
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-sm font-medium">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-stone-400 text-sm font-medium">
          Order details not found.
        </p>
        <Link href="/my-account" className="text-[var(--olive)] font-bold">
          Back to Account
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            {/* <Link href="/my-account" className="inline-flex items-center gap-2 text-[10px] font-black text-[var(--olive)] uppercase tracking-[0.2em] mb-2 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
            </Link> */}
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              {t.order_detail.title}{" "}
              <span className=" text-[var(--olive)]">#{orderInfo.id}</span>
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {t.order_detail.placed_on} {orderInfo.date} •{" "}
              {orderInfo.items.length} {t.order_detail.items_count}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-standard rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all">
              <Download className="w-4 h-4" /> {t.order_detail.invoice}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Professional Progress Section */}
            <div className="bg-white rounded-[1rem] p-5 border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--olive)]" />{" "}
                  {t.order_detail.progress}
                </h3>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  {t.order_detail.status_delivered}
                </span>
              </div>

              <div className="relative flex justify-between">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-50" />
                <div className="absolute top-5 left-0 w-full h-0.5 bg-[var(--olive)] origin-left" />

                {[
                  {
                    label: t.order_detail.step_placed,
                    icon: Calendar,
                    active: true,
                  },
                  {
                    label: t.order_detail.step_shipped,
                    icon: Package,
                    active: true,
                  },
                  {
                    label: t.order_detail.step_transit,
                    icon: Truck,
                    active: true,
                  },
                  {
                    label: t.order_detail.step_delivery,
                    icon: CheckCircle2,
                    active: true,
                  },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-4 relative z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${step.active ? "bg-[var(--olive)] text-white scale-110" : "bg-white text-gray-300 border border-stone-100"}`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${step.active ? "text-gray-900" : "text-gray-300"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Summary - Receipt Style */}
            <div className="bg-white rounded-[1rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
              <div
                className="p-8 border-b border-stone-50"
                style={{ backgroundColor: "rgba(250, 249, 246, 0.5)" }}
              >
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-[var(--olive)]" />{" "}
                  {t.order_detail.summary}
                </h3>
              </div>
              <div className="p-8 space-y-8">
                {orderInfo.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 overflow-hidden relative border border-stone-50">
                      <img
                        src={item.image}
                        className="object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-base font-bold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium ">
                        {item.desc}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-sm font-black text-gray-900 ">
                          ₹{item.price}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Qty: {item.qty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[var(--olive)] ">
                        ₹{item.price * item.qty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-stone-50/50 space-y-4">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-black">
                    ₹{orderInfo.billing.subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>{t.checkout?.tax || "Tax (GST)"}</span>
                  <span className="text-gray-900 font-black">
                    ₹{orderInfo.billing.tax}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  <span>{t.checkout?.shipping || "Shipping"}</span>
                  <span>{t.checkout?.free || "FREE"}</span>
                </div>
                <div className="pt-6 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">
                    {t.order_detail.total_amount}
                  </span>
                  <span className="text-4xl font-black text-[var(--olive)] ">
                    ₹{orderInfo.billing.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Delivery Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[var(--olive)]" />{" "}
                {t.order_detail.delivery_details}
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-100">
                  <p className="text-xs font-black text-gray-900 mb-1">
                    {orderInfo.shipping.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed ">
                    {orderInfo.shipping.address}
                  </p>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white border border-stone-100">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {t.order_detail.method}
                    </p>
                    <p className="text-[11px] font-bold text-gray-700">
                      {orderInfo.shipping.method}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[var(--olive)]" />{" "}
                {t.order_detail.payment}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-stone-100">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    width={24}
                    height={24}
                    alt="paypal"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-900 ">
                    PayPal Express
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                    {t.order_detail.verified}
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-gradient-to-br from-[var(--olive))] to-[var(--olive-dark))] rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold tracking-tight">
                    {t.order_detail.need_help}
                  </h4>
                  <p className="text-[10px] text-white font-medium leading-relaxed">
                    {t.order_detail.support_desc}
                  </p>
                </div>
                <button className="btn-standard w-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-lg">
                  <MessageCircle className="w-4 h-4" />
                  {t.order_detail.chat_with_us}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
