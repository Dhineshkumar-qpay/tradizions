"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Check, ShoppingCart, Gift, Lock } from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { AddressData } from "@/models/address_model";
import { CheckoutProduct } from "@/models/checkout_model";
import { useRouter } from "next/navigation";
import locationDataRaw from "../../public/location/india_states_districts.json";
import SearchableDropdown from "@/components/SearchableDropdown";

const locationData: Record<string, string[]> = locationDataRaw as any;

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [selectedLang, setSelectedLang] = useState("EN");
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [cartItems, setCartItems] = useState<CheckoutProduct[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<"single" | "multi">(
    "single",
  );
  const [multipleAddress, setMultipleAddress] = useState<
    { addressid: number; productid: number; cartid: number }[]
  >([]);

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
  const [statesList, setStatesList] = useState<string[]>(
    Object.keys(locationData),
  );
  const [districtsList, setDistrictsList] = useState<string[]>([]);

  const router = useRouter();

  const fetchAddresses = async () => {
    try {
      const response = await API.post(API_ROUTES.GETALLADDRESS);
      if (response.status === 200) {
        setAddresses(response.data?.data || []);
        // Automatically select the first address if available
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
    if (
      !name.trim() ||
      !mobileNumber.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !pincode.trim() ||
      !selectedStateName ||
      !selectedDistrictName
    ) {
      alert("Please fill all required address fields.");
      return;
    }
    try {
      const payload = {
        addressid: 0,
        title: title || "Home",
        fullname: name ,
        mobilenumber: mobileNumber || "9025821501",
        email: addressEmail,
        addressline: addressLine,
        landmark: landmark,
        city: city,
        district: selectedDistrictName,
        state: selectedStateName,
        country: "India",
        pincode: Number(pincode) || 638008,
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
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Failed to save address.");
      }
    } catch (err: any) {
      console.error("Error saving address:", err);
      alert(
        err?.response?.data?.message ||
          "An error occurred while saving address.",
      );
    }
  };

  const fetchCart = async () => {
    try {
      const response = await API.post(API_ROUTES.CHECKOUTDETAIL);
      if (response.status === 200) {
        setCartItems(response.data?.data?.products || []);
        setTotalAmount(response.data?.data?.totalamount || 0);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
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
    if (
      cartItems.length > 0 &&
      addresses.length > 0 &&
      multipleAddress.length === 0
    ) {
      const initialMultipleAddress = cartItems.map((item) => ({
        addressid: addresses[0].addressid ?? 0,
        productid:
          item.itemtype === "gift" ? (item.giftid ?? 0) : (item.productid ?? 0),
        cartid: item.cartid ?? 0,
      }));
      setMultipleAddress(initialMultipleAddress);
    }
  }, [cartItems, addresses, multipleAddress]);

  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [isLoading, cartItems, router]);

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

  // Total calculations consistent with cart page
  const deliveryCharges = 0; // Free shipping
  const grandTotal = totalAmount; 

  const handlePlaceOrder = async () => {
    if (selectionMode === "single" && !selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    if (selectionMode === "multi") {
      const allSelected = cartItems.every((item) => {
        const entry = multipleAddress.find((e) => e.cartid === item.cartid);
        return entry && entry.addressid !== 0;
      });
      if (!allSelected) {
        alert("Please select an address for all products.");
        return;
      }
    }

    setIsPlacingOrder(true);
    try {
      const body: any = {
        addressid: selectionMode === "single" ? selectedAddressId || 0 : 0,
        issameaddress: selectionMode === "single",
        addressids:
          selectionMode === "multi"
            ? multipleAddress.map(({ addressid, productid }) => ({
                addressid,
                productid,
              }))
            : [],
      };
      const response = await API.post(API_ROUTES.PLACEORDER, body);
      if (response.status === 200 && response.data?.data) {
        setPlacedOrderId(response.data.data.orderid || response.data.orderid);
        setOrderPlaced(true);
        window.dispatchEvent(new Event("cartUpdated"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Failed to place order.");
      }
    } catch (err: any) {
      console.error("Error placing order:", err);
      alert(
        err?.response?.data?.message ||
          "An error occurred while placing your order.",
      );
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
        {/* Background Glow */}
        <div className="absolute top-[-80px] left-[-80px] w-[180px] h-[180px] bg-[var(--olive)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[180px] h-[180px] bg-[var(--olive-dark)]/10 rounded-full blur-3xl" />

        <div className="relative w-full max-w-sm">
          {/* Card */}
          <div className="relative bg-white rounded-[28px] border border-stone-200/70 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* Top Border */}
            <div className="h-1.5 bg-gradient-to-r from-[var(--olive)] via-[var(--olive)] to-[var(--olive-dark)]" />

            <div className="px-6 pt-8 pb-6 text-center">
              {/* Success Icon */}
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                {/* Ring Animation */}
                <div className="absolute inset-0 rounded-full border-2 border-[var(--olive)]/30 animate-ping" />

                {/* Circle */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--olive)] to-[var(--olive-dark)] flex items-center justify-center shadow-[0_15px_30px_rgba(85,107,47,0.35)]">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                    {/* Check */}
                    <svg
                      className="w-7 h-7 text-[var(--olive)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray: 100,
                          strokeDashoffset: 100,
                          animation: "draw 0.6s ease forwards",
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">
                Order Confirmed
              </h1>

              <p className="text-stone-500 text-xs leading-relaxed max-w-[240px] mx-auto mb-6">
                Your payment has been completed successfully.
              </p>

              {/* Order Info */}
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-bold">
                    Order ID
                  </span>

                  <span className="text-xs font-black text-stone-900">
                    #{placedOrderId}
                  </span>
                </div>

                <div className="border-t border-dashed border-stone-200 my-3"></div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Total
                  </span>

                  <span className="text-lg font-black text-[var(--olive-dark)]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Payment
                  </span>

                  <span className="text-[10px] uppercase px-2 py-1 rounded-lg bg-white border border-stone-200 font-bold text-stone-700">
                    {paymentMethod}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  href={`/order-detail?id=${placedOrderId}`}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--olive)] to-[var(--olive-dark)] text-white text-[10px] font-black tracking-[0.18em] uppercase flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(85,107,47,0.25)]"
                >
                  Track Order
                </Link>

                <Link
                  href="/shop"
                  className="w-full h-12 rounded-xl bg-white border border-stone-200 text-stone-700 text-[10px] font-black tracking-[0.18em] uppercase flex items-center justify-center hover:bg-stone-50 transition-all duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-12 lg:pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb lg:mb-2 gap-4">
          <div></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-8">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-[1rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-sm">
                    1
                  </span>
                  {t.checkout.delivery_address}
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-[11px] font-black text-[var(--olive)] tracking-widest hover:underline uppercase transition-colors cursor-pointer"
                >
                  {showAddressForm
                    ? "Cancel"
                    : t.my_account?.add_new || "Add New Address"}
                </button>
              </div>

              <div className="space-y-6">
                {/* Option 1: Single Address */}
                <div
                  className={`border-2 rounded-2xl p-6 transition-all ${
                    cartItems.length > 1 && selectionMode !== "single"
                      ? "border-stone-100 hover:border-stone-200 cursor-pointer"
                      : "border-[var(--olive)] bg-[#fcfcfb]"
                  }`}
                  onClick={() =>
                    cartItems.length > 1 && setSelectionMode("single")
                  }
                >
                  <div className="flex items-center gap-4 mb-4">
                    {cartItems.length > 1 && (
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectionMode === "single"
                            ? "border-[var(--olive)] bg-[var(--olive)]"
                            : "border-stone-300"
                        }`}
                      >
                        {selectionMode === "single" && (
                          <Check
                            className="w-3 h-3 text-white"
                            strokeWidth={4}
                          />
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {cartItems.length > 1
                          ? "Apply one address to all products"
                          : t.checkout?.delivery_address || "Delivery Address"}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {cartItems.length > 1
                          ? "All items will be delivered to the same address"
                          : "Select where you want your item delivered"}
                      </p>
                    </div>
                  </div>

                  {(selectionMode === "single" || cartItems.length <= 1) && (
                    <div className={cartItems.length > 1 ? "ml-10" : ""}>
                      <SearchableDropdown
                        options={addresses.map((addr) => ({
                          label: `${addr.title}, ${addr.addressline}, ${addr.city}`,
                          value: addr.addressid,
                        }))}
                        value={selectedAddressId}
                        placeholder={
                          t.checkout?.select_address || "Select an address"
                        }
                        onChange={(val) => setSelectedAddressId(Number(val))}
                      />
                    </div>
                  )}
                </div>

                {cartItems.length > 1 && (
                  <>
                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-6">
                      <div className="border-t border-stone-200 w-full" />
                      <span className="absolute bg-white px-4 text-stone-400 text-sm font-medium">
                        or
                      </span>
                    </div>

                    {/* Option 2: Multi Address */}
                    <div
                      className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                        selectionMode === "multi"
                          ? "border-[var(--olive)] bg-[#fcfcfb]"
                          : "border-stone-100 hover:border-stone-200"
                      }`}
                      onClick={() => setSelectionMode("multi")}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectionMode === "multi"
                              ? "border-[var(--olive)] bg-[var(--olive)]"
                              : "border-stone-300"
                          }`}
                        >
                          {selectionMode === "multi" && (
                            <Check
                              className="w-3 h-3 text-white"
                              strokeWidth={4}
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-stone-900">
                            Choose address for each product
                          </h3>
                          <p className="text-xs text-stone-500">
                            Select different addresses for different products
                          </p>
                        </div>
                      </div>

                      {selectionMode === "multi" && (
                        <div className="ml-10 space-y-4">
                          {cartItems.map((item, idx) => {
                            const itemImage = item.image?.startsWith("http")
                              ? item.image
                              : `${IMAGE_URL || ""}${item.image}`;
                            return (
                              <div
                                key={item.cartid || idx}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-stone-100 rounded-xl bg-white"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="relative w-12 h-12 rounded-lg bg-stone-50 overflow-hidden shrink-0 border border-stone-100">
                                    <img
                                      src={itemImage || "/placeholder.png"}
                                      className="w-full h-full object-cover"
                                      alt={item.name || ""}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-900 truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                      ₹
                                      {((item.sellingprice ?? 0) > 0
                                        ? item.sellingprice
                                        : item.price
                                      )?.toLocaleString()}{" "}
                                      × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="w-full sm:w-48">
                                  <SearchableDropdown
                                    options={addresses.map((addr) => ({
                                      label: `${addr.title}, ${addr.addressline}, ${addr.city}`,
                                      value: addr.addressid,
                                    }))}
                                    value={
                                      multipleAddress.find(
                                        (entry) => entry.cartid === item.cartid,
                                      )?.addressid || ""
                                    }
                                    placeholder={
                                      t.checkout?.select_address ||
                                      "Select Address"
                                    }
                                    onChange={(val) => {
                                      const addrId = Number(val);
                                      const productid =
                                        item.itemtype === "gift"
                                          ? item.giftid
                                          : item.productid;
                                      const cartId = item.cartid || 0;
                                      setMultipleAddress((prev) => {
                                        const index = prev.findIndex(
                                          (entry) => entry.cartid === cartId,
                                        );
                                        if (index !== -1) {
                                          const updated = [...prev];
                                          updated[index] = {
                                            ...updated[index],
                                            addressid: addrId,
                                          };
                                          return updated;
                                        } else {
                                          return [
                                            ...prev,
                                            {
                                              addressid: addrId,
                                              productid: productid ?? 0,
                                              cartid: cartId,
                                            },
                                          ];
                                        }
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {showAddressForm && (
                <div className="mt-8 border border-stone-100 rounded-[1.5rem] p-6 sm:p-8 bg-stone-50/50 shadow-inner animate-fade-in-up">
                  <h3 className="text-sm font-black text-stone-900 mb-6 uppercase tracking-widest">
                    Enter Details
                  </h3>
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
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Required for order updates"
                        value={addressEmail}
                        onChange={(e) => setAddressEmail(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                        Address Line
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Flat / House No. / Street Name"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all resize-none font-bold text-stone-800 text-sm shadow-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Water Tank (Optional)"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          State
                        </label>
                        <SearchableDropdown
                          options={statesList}
                          value={selectedStateName}
                          placeholder={
                            t.checkout?.select_state || "Select State"
                          }
                          onChange={(val) => {
                            setSelectedStateName(val);
                            setDistrictsList(locationData[val] || []);
                            setSelectedDistrictName("");
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          District
                        </label>
                        <SearchableDropdown
                          options={districtsList}
                          value={selectedDistrictName}
                          placeholder={
                            t.checkout?.select_district || "Select District"
                          }
                          disabled={!selectedStateName}
                          onChange={(val) => {
                            setSelectedDistrictName(val);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Pallipalayam"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                          Pincode
                        </label>
                        <input
                          type="text"
                          placeholder="6-digit pincode"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full border border-stone-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-bold text-stone-800 text-sm shadow-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-black text-[11px] uppercase tracking-widest shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        SAVE SECURE ADDRESS
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Saved Addresses Section */}
            <div className="bg-white rounded-[1rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-stone-900">
                  Saved Addresses
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-[11px] font-black text-[var(--olive)] tracking-widest hover:underline uppercase transition-colors cursor-pointer"
                >
                  {showAddressForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.addressid}
                    className="p-5 rounded-2xl border-2 border-stone-100 bg-white hover:border-[var(--olive)]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 text-[10px] font-black tracking-widest rounded-md uppercase">
                        {addr.city || "ADDRESS"}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-stone-600 leading-relaxed">
                      {addr.addressline},{" "}
                      {addr.landmark && `${addr.landmark}, `}
                      <br />
                      {addr.city}, {addr.state} -{" "}
                      <span className="font-bold text-stone-800">
                        {addr.pincode}
                      </span>
                    </p>
                  </div>
                ))}

                {/* Add New Address Card */}
                <div
                  className="p-5 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--olive)]/50 transition-all min-h-[120px]"
                  onClick={() => setShowAddressForm(true)}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center mb-2 font-bold">
                    +
                  </div>
                  <p className="text-xs font-bold text-stone-600">
                    Add New Address
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-white rounded-[1rem] p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-stone-100 lg:sticky lg:top-24">
              <h2 className="text-xl font-black text-stone-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--olive)]" />
                Order Summary
              </h2>

              {/* Mini Item List */}
              <div className="max-h-[350px] overflow-y-auto space-y-5 mb-6 pr-3 custom-scrollbar">
                {cartItems.map((item, idx) => {
                  const itemImage = item.image?.startsWith("http")
                    ? item.image
                    : `${IMAGE_URL || ""}${item.image}`;

                  return (
                    <div
                      key={item.cartid || idx}
                      className="flex gap-4 group items-center"
                    >
                      <div className="relative w-16 h-16 rounded-xl bg-stone-50 overflow-hidden shrink-0 border border-stone-100">
                        <img
                          src={itemImage || "/placeholder.png"}
                          className="w-full h-full object-cover"
                          alt={item.name || ""}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <p className="text-[13px] font-bold text-stone-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[13px] font-bold text-stone-900 whitespace-nowrap">
                            ₹
                            {item.sellingprice === 0 ||
                            item.sellingprice === undefined
                              ? item.price?.toLocaleString()
                              : item.sellingprice?.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-stone-500">
                          Qty: {item.quantity}
                        </p>
                        {/* Gift Card Addon Detail */}
                        {item.giftcard && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--olive)]/10 border border-[var(--olive)]/20 mt-1">
                            <Gift className="w-3 h-3 text-[var(--olive)]" />
                            <span className="text-[9px] font-black text-[var(--olive)] uppercase tracking-widest">
                              {item.giftcard.cardname}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-stone-100 mb-6 w-full" />

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500 font-medium">
                    Subtotal (
                    {cartItems.reduce(
                      (acc, item) => acc + (item.quantity || 0),
                      0,
                    )}{" "}
                    items)
                  </span>
                  <span className="font-bold text-stone-900">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500 font-medium">
                    {t.checkout?.shipping || "Shipping"}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {t.checkout?.free || "FREE"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-stone-100 mb-6 w-full" />

              <div className="flex justify-between items-end mb-6">
                <span className="text-base font-bold text-stone-900">
                  Total Amount
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-stone-900 block leading-none tracking-tight">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Safe and Secure Payments */}
              <div className="flex items-center gap-2 mb-6 text-emerald-600 border-t border-b border-stone-100 py-4">
                <ShieldCheck className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold">
                    {t.cart?.secure_payment || "Safe and Secure Payments"}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    100% Secure. Your data is safe with us.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full py-3.5 rounded-xl bg-[var(--olive)] text-white font-bold text-sm shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {isPlacingOrder ? "PROCESSING..." : "Place Order"}
              </button>

              <p className="text-[10px] text-center text-stone-400 mt-6 font-medium leading-relaxed">
                <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5" /> By
                placing the order, you agree to our
                <br />
                <Link
                  href="/policies/terms-and-conditions"
                  className="underline hover:text-[var(--olive)] transition-colors"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/policies/privacy-policy"
                  className="underline hover:text-[var(--olive)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
