"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Heart,
  ShoppingCart,
  LogOut,
  ChevronRight,
  Zap,
  Users,
  Wallet,
  Check,
  Calendar,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { FavouriteProductModel, FavouriteProduct } from "@/models/cart_model";
import { ProfileModel } from "@/models/auth_model";
import { OrdersModel, OrdersData } from "@/models/order_item_model";
import { Datum } from "@/models/calculator_model";
import { AddressModel, AddressData } from "@/models/address_model";
import { ProfileData } from "@/models/auth_model";
import locationDataRaw from "../../public/location/india_states_districts.json";
import SearchableDropdown from "@/components/SearchableDropdown";

const locationData: Record<string, string[]> = locationDataRaw as any;

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const getStatusStyles = (status: string | undefined) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "delivered":
      return "bg-[#D1FAE5] text-[#10B981] border-[#10B981]";
    case "confirmed":
      return "bg-[#DBEAFE] text-[#3B82F6] border-[#3B82F6]";
    case "pending":
      return "bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]";
    case "shipped":
      return "bg-[#EDE9FE] text-[#8B5CF6] border-[#8B5CF6]";
    case "cancelled":
      return "bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]";
    default:
      return "bg-stone-50 text-stone-600 border-stone-100";
  }
};

export default function ProfilePage() {
  const [mobile, setMobile] = useState("");
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("EN");
  const [wishlist, setWishlist] = useState<FavouriteProduct[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  const [orders, setOrders] = useState<OrdersData[]>([]);
  const [monthlyOrders, setMonthlyOrders] = useState<Datum[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [profile, setProfileData] = useState<ProfileData | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchProfile = async () => {
    setIsProfileLoading(true);
    try {
      const response = await API.post(API_ROUTES.GETPROFILE);
      if (response.status === 200) {
        const profileModel: ProfileModel = response.data;
        if (profileModel.data) {
          setProfileData(profileModel.data);
          setUsername(profileModel.data.username || "");
          setEmail(profileModel.data.email || "");
          setMobile(profileModel.data.phone || "");
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await API.post(API_ROUTES.UPDATEPROFILE, {
        username: username,
        email: email,
      });
      if (response.status === 200) {
        alert("Profile updated successfully!");
        fetchProfile();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert(
        err?.response?.data?.message ||
          "An error occurred while updating profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [statesList, setStatesList] = useState<string[]>(
    Object.keys(locationData),
  );
  const [districtsList, setDistrictsList] = useState<string[]>([]);

  // Address Form States
  const [orderHistoryTab, setOrderHistoryTab] = useState<"normal" | "monthly">(
    "normal",
  );
  const [addressId, setAddressId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [fullname, setFullname] = useState("");
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

  const fetchAddresses = async () => {
    setIsAddressesLoading(true);
    try {
      const response = await API.post(API_ROUTES.GETALLADDRESS);
      if (response.status === 200) {
        const addrModel: AddressModel = response.data;
        setAddresses(addrModel.data || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setIsAddressesLoading(false);
    }
  };

  // Location data logic handled locally now
  const handleOpenAddAddress = () => {
    setAddressId(0);
    setTitle("");
    setFullname("");
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
    setDistrictsList([]);
    setAddressView("add");
  };

  const handleOpenEditAddress = (addr: AddressData) => {
    setAddressId(addr.addressid || 0);
    setTitle(addr.title || "");
    setFullname(addr.fullname || "");
    setMobileNumber(addr.mobilenumber || "");
    setAddressEmail(addr.email || "");
    setAddressLine(addr.addressline || "");
    setLandmark(addr.landmark || "");
    setCity(addr.city || "");
    setPincode(addr.pincode || "");
    setSelectedStateId(addr.stateid || 0);
    setSelectedDistrictId(addr.districtid || 0);
    setSelectedStateName(addr.state || "");
    setSelectedDistrictName(addr.district || "");
    if (addr.state) {
      setDistrictsList(locationData[addr.state] || []);
    } else {
      setDistrictsList([]);
    }
    setAddressView("edit");
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim()) {
      alert("Please enter full name.");
      return;
    }
    if (!mobileNumber.trim()) {
      alert("Please enter mobile number.");
      return;
    }
    if (!addressLine.trim()) {
      alert("Please enter address line.");
      return;
    }
    if (!city.trim()) {
      alert("Please enter city.");
      return;
    }
    if (!pincode.trim()) {
      alert("Please enter pincode.");
      return;
    }
    if (!selectedStateName) {
      alert("Please select a state.");
      return;
    }
    if (!selectedDistrictName) {
      alert("Please select a district.");
      return;
    }

    try {
      const payload = {
        addressid: addressId,
        title: title || "Home",
        fullname: fullname || "Customer",
        mobilenumber: mobileNumber,
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
        alert(
          addressId === 0
            ? "Address added successfully!"
            : "Address updated successfully!",
        );
        fetchAddresses();
        setAddressView("list");
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

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }
    try {
      const response = await API.post(API_ROUTES.DELETEADDRESS, {
        addressid: id,
      });
      if (response.status === 200) {
        alert("Address deleted successfully!");
        fetchAddresses();
      } else {
        alert("Failed to delete address.");
      }
    } catch (err: any) {
      console.error("Error deleting address:", err);
      alert(
        err?.response?.data?.message ||
          "An error occurred while deleting address.",
      );
    }
  };

  const fetchWishlist = async () => {
    setIsWishlistLoading(true);
    try {
      const response = await API.post(API_ROUTES.GETFAVOURITE);
      if (response.status === 200) {
        const favModel: FavouriteProductModel = response.data;
        setWishlist(favModel.data || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleActionWithLogin = (action: () => void) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.dispatchEvent(new Event("openLoginSidebar"));
      const handleLoginSuccess = () => {
        action();
        window.removeEventListener("loginSuccess", handleLoginSuccess);
      };
      window.addEventListener("loginSuccess", handleLoginSuccess);
    } else {
      action();
    }
  };

  const handleToggleFavorite = async (productid: number) => {
    handleActionWithLogin(async () => {
      try {
        const response = await API.post(API_ROUTES.ADDFAVOURITE, { productid });
        if (response.status === 200) {
          fetchWishlist();
          window.dispatchEvent(new Event("favoritesUpdated"));
        }
      } catch (err) {
        console.error("Error toggling favorite:", err);
      }
    });
  };

  const handleAddToCart = async (productid: number, itemtype: string) => {
    handleActionWithLogin(async () => {
      setAddingToCartId(productid);
      try {
        const response = await API.post(API_ROUTES.ADDTOCART, {
          bid: 1,
          productid: itemtype == "product" ? productid : null,
          giftid: itemtype == "gift" ? productid : null,
          quantity: 1,
          itemtype: itemtype,
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
          alert("Product added to cart!");
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
      } finally {
        setAddingToCartId(null);
      }
    });
  };

  const fetchOrders = async (ordertype: string = "normal") => {
    setIsOrdersLoading(true);
    try {
      const response = await API.post(API_ROUTES.GETALLORDERS, {
        ordertype: ordertype,
      });
      console.log(response.data);

      if (response.status === 200) {
        const orderModel: OrdersModel = response.data;
        const rawData = Array.isArray(orderModel.data)
          ? orderModel.data
          : (orderModel.data as any)?.orders || [];
        const parsedOrders = rawData.map((order: any) => {
          let parsedItems = order.items;
          if (typeof parsedItems === "string") {
            try {
              parsedItems = JSON.parse(parsedItems);
            } catch (e) {
              parsedItems = [];
            }
          }
          return { ...order, items: parsedItems };
        });
        setOrders(parsedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchMonthlyOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const response = await API.post(API_ROUTES.GETALLORDERS, {
        ordertype: "monthly",
      });
      if (response.status === 200) {
        const orderModel: OrdersModel = response.data;
        const rawData = Array.isArray(orderModel.data)
          ? orderModel.data
          : (orderModel.data as any)?.orders || [];
        const parsedOrders = rawData.map((order: any) => {
          let parsedItems = order.items;
          if (typeof parsedItems === "string") {
            try {
              parsedItems = JSON.parse(parsedItems);
            } catch (e) {
              parsedItems = [];
            }
          }
          return { ...order, items: parsedItems };
        });
        setMonthlyOrders(parsedOrders);
      }
    } catch (err) {
      console.error("Error fetching monthly orders:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Left menu state
  const [activeTab, setActiveTab] = useState("profile"); // profile, addresses, wishlist, orders, gift-orders, monthly-orders, subscriptions, referrals, wallet

  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlist();
    } else if (activeTab === "addresses") {
      fetchAddresses();
    } else if (activeTab === "profile") {
      fetchProfile();
    } else if (activeTab === "orders") {
      if (orderHistoryTab === "monthly") {
        fetchMonthlyOrders();
      } else {
        fetchOrders();
      }
    } else if (activeTab === "monthly-orders") {
      fetchMonthlyOrders();
    }
  }, [activeTab, orderHistoryTab]);

  const [addressView, setAddressView] = useState("list");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn !== "true") {
      window.location.href = "/";
    } else {
      setMobile(localStorage.getItem("userMobile") || "9876543210");
      fetchProfile();
    }

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
  }, [router]);

  const t = translations[selectedLang] || translations["EN"];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userMobile");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const renderProfileForm = () => {
    if (isProfileLoading) {
      return (
        <div className="flex flex-col py-20 items-center justify-center space-y-4 animate-fade-in">
          <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-medium">
            Loading profile...
          </p>
        </div>
      );
    }

    return (
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t.my_account.edit_profile}
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              {t.my_account.full_name || t.contact_us.full_name}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              {t.my_account.email || t.contact_us.email}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              {t.my_account.mobile || t.contact_us.mobile}
            </label>
            <input
              type="text"
              disabled
              value={mobile}
              className="w-full border border-gray-100 bg-gray-50 text-gray-400 rounded-lg py-2.5 px-3 outline-none cursor-not-allowed font-medium text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Mobile number cannot be changed.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSavingProfile}
            className="btn-standard w-full rounded-lg font-bold text-[13px] tracking-widest shadow-md shadow-[var(--olive)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSavingProfile ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {isSavingProfile ? "SAVING..." : t.my_account.save_changes}
          </button>
        </form>
      </div>
    );
  };

  const renderAddresses = () => {
    if (addressView === "add" || addressView === "edit") {
      return (
        <div className="animate-fade-in-right">
          <button
            onClick={() => setAddressView("list")}
            className="text-xs font-bold tracking-widest text-gray-400 hover:text-[var(--olive)] mb-6 flex items-center gap-1 uppercase transition-colors"
          >
            ← {t.my_account.back_to_addr}
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {addressView === "add"
              ? t.my_account.add_new_addr
              : t.my_account.edit_addr}
          </h2>
          <form onSubmit={handleSaveAddress} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Address Title
              </label>
              <input
                type="text"
                placeholder="e.g. Home, Office"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Receiver's Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                placeholder="10-digit Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Required for order updates"
                value={addressEmail}
                onChange={(e) => setAddressEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Address Line
              </label>
              <textarea
                rows={2}
                placeholder="Flat / House No. / Street Name"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all resize-none font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Near Water Tank (Optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Pallipalayam"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                State
              </label>
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
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                District
              </label>
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
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                placeholder="6-digit pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
              />
            </div>
            <button
              type="submit"
              className="btn-standard w-full rounded-lg font-bold text-[13px] tracking-widest shadow-md shadow-[var(--olive)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4"
            >
              {addressView === "add"
                ? t.my_account.save_addr
                : t.my_account.update_addr}
            </button>
          </form>
        </div>
      );
    }

    if (isAddressesLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
          <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-medium">
            Loading addresses...
          </p>
        </div>
      );
    }

    if (addresses.length === 0) {
      return (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {t.my_account.saved_addresses}
            </h2>
            <button
              onClick={handleOpenAddAddress}
              className="px-5 py-2.5 bg-[var(--olive)]/10 text-[var(--olive)] font-bold text-[11px] tracking-widest rounded-xl hover:bg-[var(--olive)] hover:text-white transition-colors shadow-sm"
            >
              + {t.my_account.add_new}
            </button>
          </div>
          <div className="text-center py-16 space-y-4 bg-[#faf9f6] rounded-[2rem] border border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-2xl mx-auto shadow-inner">
              📍
            </div>
            <p className="text-gray-400 text-sm font-medium">
              No saved addresses found.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t.my_account.saved_addresses}
          </h2>
          <button
            onClick={handleOpenAddAddress}
            className="px-5 py-2.5 bg-[var(--olive)]/10 text-[var(--olive)] font-bold text-[11px] tracking-widest rounded-xl hover:bg-[var(--olive)] hover:text-white transition-colors shadow-sm"
          >
            + {t.my_account.add_new}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.addressid}
              className="p-6 rounded-2xl border-2 border-[var(--olive)]/10 bg-[#faf9f6] relative group transition-all hover:shadow-md hover:border-[var(--olive)]/30 cursor-pointer"
            >
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button
                  onClick={() => handleOpenEditAddress(addr)}
                  className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-[var(--olive)] transition-colors"
                >
                  EDIT
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() =>
                    addr.addressid && handleDeleteAddress(addr.addressid)
                  }
                  className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                >
                  DELETE
                </button>
              </div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-white shadow-sm text-[var(--olive)] border border-[var(--olive)]/20 text-[10px] font-black tracking-widest rounded-lg mb-3 uppercase">
                  {addr.title || "Address"}
                </span>
                <h3 className="text-base font-black text-gray-900 leading-tight tracking-tight">
                  {addr.fullname}
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-1">
                  {addr.mobilenumber}
                </p>
                <p className="text-xs font-normal text-gray-400 mt-1">
                  {addr.email}
                </p>
              </div>
              <div className="border-t border-dashed border-gray-200 my-4"></div>
              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                {addr.addressline}
                {addr.landmark && (
                  <>
                    <br />
                    <span className="text-gray-400">
                      Landmark: {addr.landmark}
                    </span>
                  </>
                )}
                <br />
                {addr.city}, {addr.district}
                <br />
                {addr.state} -{" "}
                <span className="font-bold text-gray-900">{addr.pincode}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWishlist = () => (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {t.my_account.wishlist}
      </h2>
      {isWishlistLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-medium">
            Loading wishlist...
          </p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-3xl mx-auto shadow-inner">
            ❤️
          </div>
          <p className="text-stone-400 text-sm font-medium">
            Your wishlist is empty.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[var(--olive)] text-white text-xs font-black tracking-widest uppercase rounded-xl shadow-md"
          >
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const itemImage = item.productimage
              ? item.productimage.startsWith("http")
                ? item.productimage
                : `${IMAGE_URL || ""}${item.productimage}`
              : "/placeholder.png";

            return (
              <div
                key={item.productid}
                className="group relative bg-white rounded-3xl p-4 border border-gray-100 hover:border-[var(--olive)]/30 hover:shadow-[0_20px_40px_rgba(85,107,47,0.08)] transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#faf9f6] mb-4">
                  <img
                    src={itemImage}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.productname || "item"}
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() =>
                        item.productid && handleToggleFavorite(item.productid)
                      }
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-sm cursor-pointer border-0"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1 mb-1">
                    {item.productname}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                    Premium handcrafted tradition
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[var(--olive)]">
                        ₹{item.sellingprice || item.price}
                      </span>
                    </div>
                    <button
                      disabled={addingToCartId === item.productid}
                      onClick={() =>
                        item.productid &&
                        handleAddToCart(item.productid, "product")
                      }
                      className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--olive)] group-hover:bg-[var(--olive)] group-hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderOrders = () => {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t.my_account.order_history}
          </h2>
          <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setOrderHistoryTab("normal")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all ${
                orderHistoryTab === "normal"
                  ? "bg-white text-[var(--olive)] shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Normal Orders
            </button>
            <button
              onClick={() => setOrderHistoryTab("monthly")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all ${
                orderHistoryTab === "monthly"
                  ? "bg-white text-[var(--olive)] shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Monthly Orders
            </button>
          </div>
        </div>

        {orderHistoryTab === "normal" ? (
          isOrdersLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
              <p className="text-stone-400 text-sm font-medium">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#faf9f6] rounded-[2rem] p-12 text-center border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -z-10" />

              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm relative group">
                <div className="absolute inset-0 bg-[var(--olive)]/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500" />
                <Package
                  className="w-8 h-8 text-stone-300 group-hover:text-[var(--olive)] transition-colors duration-500 relative z-10"
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                No orders found
              </h3>
              <p className="text-gray-500 mb-8 font-medium text-sm max-w-xs mx-auto leading-relaxed">
                Looks like you haven't placed any orders yet. Discover our
                premium collection.
              </p>

              <Link
                href="/shop"
                className="group flex items-center gap-2 px-6 py-3 bg-[var(--olive)] hover:bg-[var(--olive)]/90 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Explore Shop
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {orders.map((order, index) => {
                return (
                  <Link
                    key={order.orderid || index}
                    href={`/order-detail?id=${order.orderid}`}
                    className="group flex items-center gap-4 p-4 rounded-[1.5rem] bg-white border-2 border-gray-100 hover:border-[var(--olive)]/30 hover:shadow-md transition-all"
                  >
                    {(() => {
                      const hasItems = order.items && order.items.length > 0;
                      const itemName = hasItems
                        ? order.items![0].productname ||
                          order.items![0].giftpackname
                        : `Order #${order.orderid}`;

                      return (
                        <>
                          <div className="relative flex -space-x-3 w-20 shrink-0">
                            {hasItems ? (
                              order.items?.slice(0, 3).map((item, i) => (
                                <div
                                  key={i}
                                  className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-[#faf9f6] shadow-sm z-10 hover:z-20 transition-all hover:scale-110"
                                >
                                  <img
                                    src={
                                      item.productimage?.startsWith("http")
                                        ? item.productimage
                                        : `${IMAGE_URL || ""}${item.productimage || item.giftpackimage}`
                                    }
                                    alt={
                                      item.productname ||
                                      item.giftpackname ||
                                      "Product"
                                    }
                                    className="w-full h-full object-cover mix-blend-multiply"
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="w-12 h-12 rounded-full border-2 border-white bg-[#faf9f6] flex items-center justify-center shadow-sm">
                                <Package className="w-5 h-5 text-stone-300" />
                              </div>
                            )}
                            {hasItems && order.items!.length > 3 && (
                              <div className="relative w-12 h-12 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center shadow-sm z-0 text-[10px] font-bold text-stone-600">
                                +{order.items!.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                            <div>
                              <div className="flex justify-between items-start gap-3 mb-1">
                                <h4
                                  className="text-[13px] font-bold text-gray-900 truncate group-hover:text-[var(--olive)] transition-colors"
                                  title={itemName}
                                >
                                  {itemName}
                                </h4>
                                <p className="text-[13px] font-black text-[var(--olive)] whitespace-nowrap">
                                  ₹{order.totalamount}
                                </p>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium truncate mb-2.5 capitalize">
                                {order.ordertype || "Normal"} • Order #
                                {order.orderid}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-md border ${getStatusStyles(order.orderstatus)}`}
                              >
                                <span className="text-[9px] font-bold tracking-widest uppercase">
                                  {order.orderstatus}
                                </span>
                              </div>
                              <span className="text-[9px] font-black text-gray-400 group-hover:text-[var(--olive)] transition-colors uppercase tracking-widest flex items-center gap-0.5">
                                Details <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </Link>
                );
              })}
            </div>
          )
        ) : isOrdersLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-400 text-sm font-medium">
              Loading monthly orders...
            </p>
          </div>
        ) : monthlyOrders.length === 0 ? (
          <div className="bg-[#faf9f6] rounded-[2rem] p-12 text-center border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -z-10" />
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm relative group">
              <Package className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No monthly orders found
            </h3>
            <p className="text-gray-500 mb-8 font-medium text-sm max-w-xs mx-auto">
              Looks like you haven't placed any monthly orders yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {monthlyOrders.map((order, index) => {
              return (
                <Link
                  key={order.orderid || index}
                  href={`/order-detail?id=${order.orderid}`}
                  className="group flex items-center gap-4 p-4 rounded-[1.5rem] bg-white border-2 border-gray-100 hover:border-[var(--olive)]/30 hover:shadow-md transition-all"
                >
                  {(() => {
                    const orderAny = order as any;
                    const hasItems =
                      orderAny.items && orderAny.items.length > 0;
                    const itemName = hasItems
                      ? orderAny.items[0].productname
                      : `Monthly Order #${order.orderid}`;

                    return (
                      <>
                        <div className="relative flex -space-x-3 w-20 shrink-0">
                          {hasItems ? (
                            orderAny.items
                              .slice(0, 3)
                              .map((item: any, i: number) => (
                                <div
                                  key={i}
                                  className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-[#faf9f6] shadow-sm z-10 hover:z-20 transition-all hover:scale-110"
                                >
                                  <img
                                    src={
                                      item.productimage?.startsWith("http")
                                        ? item.productimage
                                        : `${IMAGE_URL || ""}${item.productimage}`
                                    }
                                    alt={item.productname || "Product"}
                                    className="w-full h-full object-cover mix-blend-multiply"
                                  />
                                </div>
                              ))
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-[#faf9f6] flex items-center justify-center shadow-sm">
                              <Package className="w-5 h-5 text-stone-300" />
                            </div>
                          )}
                          {hasItems && orderAny.items.length > 3 && (
                            <div className="relative w-12 h-12 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center shadow-sm z-0 text-[10px] font-bold text-stone-600">
                              +{orderAny.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                          <div>
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <h4
                                className="text-[13px] font-bold text-gray-900 truncate group-hover:text-[var(--olive)] transition-colors"
                                title={itemName}
                              >
                                {itemName}
                              </h4>
                              <p className="text-[13px] font-black text-[var(--olive)] whitespace-nowrap">
                                ₹{order.totalamount}
                              </p>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium truncate mb-2.5 capitalize">
                              {order.ordertype || "Monthly"} • Order #
                              {order.orderid}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-md border ${getStatusStyles(order.orderstatus)}`}
                            >
                              <span className="text-[9px] font-bold tracking-widest uppercase">
                                {order.orderstatus}
                              </span>
                            </div>
                            <span className="text-[9px] font-black text-gray-400 group-hover:text-[var(--olive)] transition-colors uppercase tracking-widest flex items-center gap-0.5">
                              Details <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderMonthlyOrders = () => (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
          Monthly Orders
        </h2>
        <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold tracking-widest uppercase">
          {monthlyOrders.length} Orders
        </span>
      </div>

      {isOrdersLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-medium">
            Loading monthly orders...
          </p>
        </div>
      ) : monthlyOrders.length === 0 ? (
        <div className="bg-[#faf9f6] rounded-[2rem] p-12 text-center border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--olive)]/5 rounded-full blur-3xl -z-10" />
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm relative group">
            <Package className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No monthly orders found
          </h3>
          <p className="text-gray-500 mb-8 font-medium text-sm max-w-xs mx-auto">
            Looks like you haven't placed any monthly orders yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyOrders.map((order, index) => {
            const isDelivered =
              order.orderstatus?.toLowerCase() === "delivered";
            return (
              <Link
                key={order.orderid || index}
                href={`/order-detail?id=${order.orderid}`}
                className="group relative bg-white rounded-2xl p-4 border border-stone-200 hover:border-[var(--olive)]/30 hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--olive)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--olive)]/10 transition-colors pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-stone-50 rounded-md border border-stone-100 mb-2">
                        <Calendar className="w-3 h-3 text-[var(--olive)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
                          {order.orderdate}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-stone-900 group-hover:text-[var(--olive)] transition-colors">
                        Order #{order.orderid}
                      </h4>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${isDelivered ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"}`}
                    >
                      {isDelivered ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Order Price & Status */}
                  <div className="mt-auto pt-4 border-t border-dashed border-stone-200">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                          Total Amount
                        </p>
                        <p className="text-xl font-black text-stone-900">
                          ₹{order.totalamount}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-stone-400 group-hover:text-[var(--olive)] transition-colors uppercase tracking-widest">
                            Details
                          </span>
                          <div className="w-5 h-5 rounded-full bg-stone-50 group-hover:bg-[var(--olive)]/10 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-[var(--olive)]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(order.orderstatus)}`}
                      >
                        {order.orderstatus || "Pending"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSubscriptionManagement = () => (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.my_account.subscriptions}
      </h2>
      <div className="p-5 rounded-[1.5rem] bg-white border border-stone-100 shadow-sm relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] text-[8px] font-black uppercase tracking-wider">
              <Zap className="w-2.5 h-2.5 fill-current" /> Active Plan
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Premium Health Plan
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[var(--olive)]">
                ₹4,999
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">
                / mo
              </span>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:px-4 py-2 rounded-xl bg-[var(--olive)] text-white font-bold text-[9px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
              BILLING
            </button>
            <button className="flex-1 sm:px-4 py-2 rounded-xl bg-stone-50 text-gray-400 font-bold text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.my_account.referral_rewards}
      </h2>
      <div className="p-5 rounded-[1.5rem] bg-indigo-50/50 border border-indigo-100 flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
          <Users className="w-8 h-8" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-base font-bold text-gray-900">
            {t.my_account.invite_earn}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-indigo-100 tracking-wider">
              TRAD-REF-2026
            </span>
            <button className="text-[9px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
              Copy Link
            </button>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
            Earned
          </p>
          <p className="text-lg font-black text-indigo-600">₹6,000</p>
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.my_account.wallet_coupons}
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="p-6 rounded-[1rem] bg-[var(--olive)] text-white shadow-lg flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--olive)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-3">
            <p className="text-[8px] font-black tracking-[0.3em] uppercase text-stone-500">
              {t.my_account.wallet_balance}
            </p>
            <h3 className="text-3xl font-black tracking-tight">₹2,500.00</h3>
          </div>
          <button className="relative z-10 px-5 py-2 rounded-xl bg-white text-gray-900 font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-all active:scale-[0.95]">
            {t.my_account.add_funds}
          </button>
        </div>

        <div className="space-y-3">
          {[
            { code: "TRAD-WELCOME", status: "active" },
            { code: "FESTIVE-500", status: "expired" },
          ].map((coupon, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl bg-white border border-stone-100 flex items-center justify-between shadow-sm transition-all ${coupon.status === "active" ? "hover:border-[var(--olive)]/30" : "opacity-40"}`}
            >
              <p className="text-[11px] font-black text-gray-900 tracking-wider">
                {coupon.code}
              </p>
              <button
                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${coupon.status === "active" ? "bg-stone-50 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white" : "bg-gray-50 text-gray-300 cursor-not-allowed"}`}
              >
                {coupon.status === "active" ? "COPY" : "USED"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-36 lg:pt-40 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-72 shrink-0">
          <div className="p-8 bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-gray-100 mb-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--olive)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="w-24 h-24 rounded-full bg-[var(--olive)] text-white flex items-center justify-center shadow-xl mb-4 relative z-10 border-4 border-[var(--olive)]/10">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Tradizions User
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1 tracking-wide">
              +91 {mobile}
            </p>
          </div>

          <nav className="flex flex-col gap-2 bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-gray-100 p-3">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "profile" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" /> {t.my_account.edit_profile}
              </div>
              {activeTab === "profile" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "orders" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" /> {t.my_account.order_history}
              </div>
              {activeTab === "orders" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>

            {/* <button
              onClick={() => setActiveTab("monthly-orders")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "monthly-orders" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" /> Monthly Orders
              </div>
              {activeTab === "monthly-orders" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button> */}
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "subscriptions" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" /> {t.my_account.subscriptions}
              </div>
              {activeTab === "subscriptions" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "wishlist" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5" /> {t.my_account.wishlist}
              </div>
              {activeTab === "wishlist" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("referrals")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "referrals" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" /> {t.my_account.refer_earn}
              </div>
              {activeTab === "referrals" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "wallet" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5" /> {t.my_account.wallet_coupons}
              </div>
              {activeTab === "wallet" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("addresses");
                setAddressView("list");
              }}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide ${activeTab === "addresses" ? "bg-[var(--olive)] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--olive)]"}`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" /> {t.my_account.saved_addresses}
              </div>
              {activeTab === "addresses" && (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            <div className="h-px w-full bg-gray-100 my-2" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-[13px] tracking-wide text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" /> {t.my_account.logout}
            </button>
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white rounded-3xl md:rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-gray-100 p-4 sm:p-8 md:p-12 min-h-[600px]">
          {activeTab === "profile" && renderProfileForm()}
          {activeTab === "addresses" && renderAddresses()}
          {activeTab === "wishlist" && renderWishlist()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "gift-orders" && renderOrders()}

          {activeTab === "monthly-orders" && renderMonthlyOrders()}
          {activeTab === "subscriptions" && renderSubscriptionManagement()}
          {activeTab === "referrals" && renderReferrals()}
          {activeTab === "wallet" && renderWallet()}
        </div>
      </div>
    </main>
  );
}
