"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { AddressData } from "@/models/address_model";
import { MonthlyCartData } from "@/models/calculator_model";
import locationDataRaw from "../../public/location/india_states_districts.json";
import SearchableDropdown from "@/components/SearchableDropdown";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const locationData: Record<string, string[]> = locationDataRaw as any;

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function MonthlyCartPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<MonthlyCartData | null>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState("EN");

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [title, setTitle] = useState("Home");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addressEmail, setAddressEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedStateId, setSelectedStateId] = useState<number>(0);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [selectedStateName, setSelectedStateName] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [statesList, setStatesList] = useState<string[]>(Object.keys(locationData));
  const [districtsList, setDistrictsList] = useState<string[]>([]);

  const fetchAddresses = async () => {
    try {
      const response = await API.post(API_ROUTES.GETALLADDRESS);
      if (response.status === 200) {
        setAddresses(response.data?.data || []);
        if (response.data?.data?.length > 0) {
          setSelectedAddressId(response.data.data[0].addressid);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  // Location logic handled locally now
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobileNumber.trim() || !addressLine.trim() || !city.trim() || !pincode.trim() || !selectedStateName || !selectedDistrictName) {
      alert("Please fill all required address fields.");
      return;
    }
    try {
      const payload = {
        addressid: 0,
        title: title || "Home",
        fullname: name || "Customer",
        mobilenumber: mobileNumber || "9025821501",
        email: addressEmail,
        addressline: addressLine,
        landmark: landmark,
        city: city,
        district: selectedDistrictName,
        districtid: 1,
        state: selectedStateName,
        stateid: 1,
        country: "India",
        pincode: pincode,
        latitude: 11.3667,
        longitude: 77.7867,
      };

      const response = await API.post(API_ROUTES.ADDADDRESS, payload);
      if (response.status === 200) {
        alert("Address added successfully!");
        fetchAddresses();
        setShowAddressForm(false);
        setTitle("Home");
        setName("");
        setMobileNumber("");
        setAddressEmail("");
        setAddressLine("");
        setLandmark("");
        setCity("");
        setPincode("");
        setSelectedStateId(0);
        setSelectedDistrictId(0);
        setSelectedStateName("");
        setSelectedDistrictName("");
      } else {
        alert("Failed to save address.");
      }
    } catch (err: any) {
      console.error("Error saving address:", err);
      alert(err?.response?.data?.message || "An error occurred while saving address.");
    }
  };

  const fetchCart = async () => {
    try {
      const response = await API.post(API_ROUTES.GETCALCULATORCART);
      if (response.status === 200) {
        const data = response.data?.data || null;
        setCartData(data);
        if (!data || !data.items || data.items.length === 0) {
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchAddresses(), fetchCart()]);
      setIsLoading(false);
    };
    init();
  }, []);

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

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsPlacingOrder(false);
        return;
      }

      const grandTotal = cartData?.totalamount || 0;

      const options = {
        key: "rzp_test_TRz4Jt08XnAOja",
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "Tradizions",
        description: "Monthly Order Payment",
        handler: async function (response: any) {
          try {
            const body = {
              addressid: selectedAddressId,
              razorpay_payment_id: response.razorpay_payment_id
            };
            const apiRes = await API.post(API_ROUTES.PLACECALCULATORORDER, body);
            if (apiRes.status === 200 && apiRes.data?.data) {
              setPlacedOrderId(apiRes.data.data.orderid);
              setOrderPlaced(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              alert("Failed to place order.");
            }
          } catch (err: any) {
            console.error("Error placing order:", err);
            alert(err?.response?.data?.message || "An error occurred while placing your order.");
          } finally {
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#556B2F",
        },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response: any) {
        alert(response.error.description);
        setIsPlacingOrder(false);
      });
    } catch (err: any) {
      console.error("Error with payment:", err);
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-gray-200 shadow-sm overflow-hidden animate-receipt rounded-md">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: "draw 0.6s ease 0.2s forwards" }} />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2 animate-stagger-1">
              {t.order_confirmed || "Payment Successful"}
            </h1>
            <p className="text-gray-400 text-sm animate-stagger-1">
              {t.monthly_order_confirmed_desc || "Your monthly order has been processed and is now confirmed."}
            </p>
          </div>

          {/* Details */}
          <div className="px-8 py-8">
            <div className="mb-6 pb-6 border-b border-gray-100 animate-stagger-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Transaction Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Order ID</span>
                  <span className="text-sm font-bold text-gray-900">#{placedOrderId}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Date</span>
                  <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Payment Method</span>
                  <span className="text-sm font-bold text-gray-900 uppercase">Razorpay</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded border border-gray-100 animate-stagger-3">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Total Amount Paid</span>
              <span className="text-xl font-black text-gray-900">
                ₹{cartData?.totalamount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 animate-stagger-4">
              <Link
                href="/shop"
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 text-[11px] font-bold tracking-widest uppercase flex items-center justify-center hover:bg-gray-50 transition-colors rounded"
              >
                {t.continue_shopping || "Continue Shopping"}
              </Link>
              
              <Link
                href={`/order-detail?id=${placedOrderId}`}
                className="w-full py-3.5 bg-gray-900 text-white text-[11px] font-bold tracking-widest uppercase flex items-center justify-center hover:bg-black transition-colors shadow-sm rounded"
              >
                {t.track_order || "Track Order"}
              </Link>
            </div>
          </div>
        </div>
        <style jsx>{`
          .animate-receipt {
            animation: printReceipt 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-stagger-1 { opacity: 0; animation: staggerFade 0.5s ease-out 0.2s forwards; }
          .animate-stagger-2 { opacity: 0; animation: staggerFade 0.5s ease-out 0.4s forwards; }
          .animate-stagger-3 { opacity: 0; animation: staggerFade 0.5s ease-out 0.6s forwards; }
          .animate-stagger-4 { opacity: 0; animation: staggerFade 0.5s ease-out 0.8s forwards; }
          @keyframes printReceipt {
            0% { transform: translateY(-40px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes staggerFade {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes draw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--site-bg)] pt-10 lg:pt-10 pb-20 selection:bg-[var(--olive)] selection:text-white text-[var(--dark-grey)]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-10">
            <div className="bg-white border border-gray-200 p-6 sm:p-10 relative shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-light text-[var(--olive)]/20">01</span>
                  <h2 className="text-xl font-medium tracking-wide text-[var(--olive-dark)] uppercase">
                    Delivery Address
                  </h2>
                </div>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-[11px] font-bold text-[var(--olive-dark)] tracking-[0.2em] hover:text-[var(--orange)] uppercase transition-colors cursor-pointer">
                  {showAddressForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="border border-[var(--olive-dark)] p-6 transition-all bg-gray-50/50 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-6 h-6 flex items-center justify-center transition-all bg-[var(--olive-dark)]">
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--olive-dark)] uppercase tracking-[0.1em]">Select Delivery Address</h3>
                      <p className="text-xs text-gray-500 font-medium">All items will be delivered to this address</p>
                    </div>
                  </div>
                  <div className="ml-10">
                    <select
                      value={selectedAddressId || ""}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full border-b border-gray-300 py-3 px-0 bg-transparent focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none"
                    >
                      <option value="">Select an address</option>
                      {addresses.map((addr) => (
                        <option key={addr.addressid} value={addr.addressid}>
                          {addr.title}, {addr.addressline}, {addr.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {showAddressForm && (
                <div className="mt-8 border border-gray-200 p-6 sm:p-8 bg-white animate-fade-in-up shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--olive-dark)] mb-6 uppercase tracking-[0.15em]">Enter Details</h3>
                  <form onSubmit={handleSaveAddress} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          Title
                        </label>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit Mobile Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                      <input type="email" required placeholder="Required for order updates" value={addressEmail} onChange={(e) => setAddressEmail(e.target.value)} className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Address Line</label>
                      <textarea rows={2} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors resize-none font-medium text-[var(--dark-grey)] text-sm shadow-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Landmark</label>
                      <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">State</label>
                        <SearchableDropdown
                          options={statesList}
                          value={selectedStateName}
                          placeholder="Select State"
                          onChange={(val) => {
                            setSelectedStateName(val);
                            setDistrictsList(locationData[val] || []);
                            setSelectedDistrictName("");
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">District</label>
                        <SearchableDropdown
                          options={districtsList}
                          value={selectedDistrictName}
                          placeholder="Select District"
                          disabled={!selectedStateName}
                          onChange={(val) => {
                            setSelectedDistrictName(val);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">City</label>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Pincode</label>
                        <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full border-b border-gray-300 bg-transparent py-3 px-0 focus:border-[var(--olive-dark)] outline-none transition-colors font-medium text-[var(--dark-grey)] text-sm shadow-none" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full py-4 bg-[var(--olive-dark)] text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-[var(--orange-dark)] transition-colors cursor-pointer">
                        SAVE SECURE ADDRESS
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl font-medium tracking-wide text-[var(--olive-dark)] uppercase mb-8 pb-4 border-b border-gray-100">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {cartData?.items?.map((item, idx) => {
                  const itemImage = item.productimage?.startsWith("http")
                    ? item.productimage
                    : `${IMAGE_URL || ""}${item.productimage}`;
                  return (
                    <div key={item.monthlycartid || idx} className="flex gap-4 p-4 border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="w-16 h-16 bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                        <img src={itemImage || "/placeholder.png"} className="w-full h-full object-cover" alt={item.productname || ""} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{item.productname}</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed uppercase tracking-wider">
                          Family: <span className="text-[var(--olive-dark)] font-bold">{item.familymembers}</span> |
                          <span className="text-[var(--olive-dark)] font-bold"> {item.gramsperday}g</span>/day |
                          <span className="text-[var(--olive-dark)] font-bold"> {item.dayspermonth}</span> days
                        </p>
                        <div className="flex items-end justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <p className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 font-bold uppercase tracking-widest">Qty: {item.totalquantitykg}kg</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[var(--olive-dark)]">₹{item.calcultedprice?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                            {item.price && item.price > (item.sellingprice || 0) && (
                              <p className="text-[10px] text-gray-400 line-through">₹{item.price * (item.totalquantitykg || 1)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4 mb-6">
                <div className="flex justify-between items-center text-[var(--dark-grey)]">
                  <span className="text-sm font-medium uppercase tracking-wider">Subtotal</span>
                  <span className="text-sm font-bold text-gray-900">₹{cartData?.totalamount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}</span>
                </div>
                <div className="border-t border-gray-100 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900 uppercase tracking-wider">Total Amount</span>
                  <span className="text-xl font-black text-[var(--olive-dark)]">₹{cartData?.totalamount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !cartData?.items?.length}
                className="w-full py-4 bg-[var(--olive-dark)] text-white font-bold text-[12px] uppercase tracking-[0.2em] shadow-sm hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
              >
                {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "PLACE ORDER"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
