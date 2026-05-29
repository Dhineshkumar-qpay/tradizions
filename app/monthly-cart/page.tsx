"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import { AddressData, States, Districts } from "@/models/address_model";
import { MonthlyCartModel, MonthlyCartData } from "@/models/calculator_model";
import locationDataRaw from "../../public/location/india_states_districts.json";
import SearchableDropdown from "@/components/SearchableDropdown";

const locationData: Record<string, string[]> = locationDataRaw as any;

export default function MonthlyCartPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<MonthlyCartData | null>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

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
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      router.push("/");
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

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const body = { addressid: selectedAddressId };
      const response = await API.post(API_ROUTES.PLACECALCULATORORDER, body);
      if (response.status === 200 && response.data?.data) {
        setPlacedOrderId(response.data.data.orderid);
        setOrderPlaced(true);
      } else {
        alert("Failed to place order.");
      }
    } catch (err: any) {
      console.error("Error placing order:", err);
      alert(err?.response?.data?.message || "An error occurred while placing your order.");
    } finally {
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
      <main className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-25 overflow-hidden relative">
        <div className="absolute top-[-80px] left-[-80px] w-[180px] h-[180px] bg-[var(--olive)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[180px] h-[180px] bg-[var(--olive-dark)]/10 rounded-full blur-3xl" />
        <div className="relative w-full max-w-sm">
          <div className="relative bg-white rounded-[28px] border border-stone-200/70 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--olive)] via-[var(--olive)] to-[var(--olive-dark)]" />
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--olive)]/30 animate-ping" />
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--olive)] to-[var(--olive-dark)] flex items-center justify-center shadow-[0_15px_30px_rgba(85,107,47,0.35)]">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-7 h-7 text-[var(--olive)]" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: "draw 0.6s ease forwards" }} />
                    </svg>
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">Order Confirmed</h1>
              <p className="text-stone-500 text-xs leading-relaxed max-w-[240px] mx-auto mb-6">Your monthly order has been placed successfully.</p>
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-bold">Order ID</span>
                  <span className="text-xs font-black text-stone-900">#{placedOrderId}</span>
                </div>
                <div className="border-t border-dashed border-stone-200 my-3"></div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] text-stone-500 font-medium">Total</span>
                  <span className="text-lg font-black text-[var(--olive-dark)]">₹{cartData?.totalamount?.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link href={`/order-detail?id=${placedOrderId}`} className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--olive)] to-[var(--olive-dark)] text-white text-[10px] font-black tracking-[0.18em] uppercase flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(85,107,47,0.25)]">Track Order</Link>
                <Link href="/shop" className="w-full h-12 rounded-xl bg-white border border-stone-200 text-stone-700 text-[10px] font-black tracking-[0.18em] uppercase flex items-center justify-center hover:bg-stone-50 transition-all duration-300">Continue Shopping</Link>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-12 lg:pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-[1rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-sm">1</span>
                  Delivery Address
                </h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-[11px] font-black text-[var(--olive)] tracking-widest hover:underline uppercase transition-colors cursor-pointer">
                  {showAddressForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="border-2 rounded-2xl p-6 cursor-pointer transition-all border-[var(--olive)] bg-[#fcfcfb]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all border-[var(--olive)] bg-[var(--olive)]">
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Select Delivery Address</h3>
                      <p className="text-xs text-stone-500">All items will be delivered to this address</p>
                    </div>
                  </div>
                  <div className="ml-10">
                    <select
                      value={selectedAddressId || ""}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full border border-stone-200 rounded-xl py-3 px-4 bg-white focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-stone-800 text-sm shadow-sm"
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
                <div className="mt-8 border border-stone-100 rounded-[1.5rem] p-6 sm:p-8 bg-stone-50/50 shadow-inner animate-fade-in-up">
                  <h3 className="text-sm font-black text-stone-900 mb-6 uppercase tracking-widest">Enter Details</h3>
                  <form onSubmit={handleSaveAddress} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          Title
                        </label>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full border border-stone-200 rounded-xl py-3.5 px-4 bg-white focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm"
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
                          className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white"
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
                        className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                      <input type="email" required placeholder="Required for order updates" value={addressEmail} onChange={(e) => setAddressEmail(e.target.value)} className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Address Line</label>
                      <textarea rows={2} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all resize-none font-bold text-stone-800 text-sm shadow-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Landmark</label>
                      <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white" />
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
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Pincode</label>
                        <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-black text-[11px] uppercase tracking-widest shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer">
                        SAVE SECURE ADDRESS
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-[1rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 sticky top-24">
              <h2 className="text-xl font-black text-stone-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {cartData?.items?.map((item, idx) => {
                  const itemImage = item.productimage?.startsWith("http")
                    ? item.productimage
                    : `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}${item.productimage}`;
                  return (
                    <div key={item.monthlycartid || idx} className="flex gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50">
                      <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-100">
                        <img src={itemImage || "/placeholder.png"} className="w-full h-full object-cover" alt={item.productname || ""} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <p className="text-xs font-bold text-stone-900 truncate">{item.productname}</p>
                        <p className="text-[9px] text-stone-400 mt-0.5 font-medium leading-relaxed">
                          Family: <span className="text-stone-600 font-bold">{item.familymembers}</span> | 
                          <span className="text-stone-600 font-bold"> {item.gramsperday}g</span>/day | 
                          <span className="text-stone-600 font-bold"> {item.dayspermonth}</span> days
                        </p>
                        <div className="flex items-end justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <p className="text-[10px] text-stone-500 bg-white border border-stone-100 px-1.5 py-0.5 rounded font-bold">Qty: {item.totalquantitykg}kg</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-[var(--olive)]">₹{item.calcultedprice?.toLocaleString()}</p>
                            {item.price && item.price > (item.sellingprice || 0) && (
                              <p className="text-[9px] text-stone-400 line-through">₹{item.price * (item.totalquantitykg || 1)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-stone-100 pt-6 space-y-4 mb-6">
                <div className="flex justify-between items-center text-stone-600">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-sm font-bold text-stone-900">₹{cartData?.totalamount?.toLocaleString() || 0}</span>
                </div>
                <div className="border-t border-dashed border-stone-200 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-stone-900">Total Amount</span>
                  <span className="text-xl font-black text-[var(--olive-dark)]">₹{cartData?.totalamount?.toLocaleString() || 0}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !cartData?.items?.length}
                className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-black text-[12px] uppercase tracking-widest shadow-[0_8px_20px_rgba(85,107,47,0.2)] hover:shadow-[0_12px_25px_rgba(85,107,47,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
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
