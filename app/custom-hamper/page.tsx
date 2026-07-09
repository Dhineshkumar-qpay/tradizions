"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Search,
  Package,
  CreditCard,
  ChevronRight,
  Check,
  ArrowRight,
  Sparkles,
  Tag,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";

import { useRouter } from "next/navigation";

const STEP_LABELS = ["Choose Packaging", "Add Products", "Personalize"];

export default function CustomGiftBuilder() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [greetingCard, setGreetingCard] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGiftPacks = async () => {
      try {
        const response = await API.post(API_ROUTES.GETGIFTPACKS);
        if (response.data?.data) {
          const mapped = response.data.data.map((item: any) => ({
            id: item.giftpackid,
            name: item.giftpackname,
            price: item.giftpackprice || 0,
            tag: (item.price || 0) > 300 ? "PREMIUM" : "STANDARD",
            image: item.giftpackimage || "/placeholder.png",
            desc: item.description || "Beautiful gift pack for your beloved.",
            capacity: "Up to 5 items",
          }));
          setPackagingOptions(mapped);
        }
      } catch (error) {
        console.error("Error fetching gift packs:", error);
      }
    };
    fetchGiftPacks();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsSearching(true);
      try {
        const response = await API.post(API_ROUTES.GIFTPRODUCTS, { bid: 1 });
        if (response.data?.data) {
          setAllProducts(response.data.data);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setAllProducts([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = search
    ? allProducts.filter((product) =>
      product.productname?.toLowerCase().includes(search.toLowerCase()),
    )
    : allProducts;

  const handleAddItem = (product: any) => {
    setSelectedItems((prev) => {
      const found = prev.find((i) => i.productid === product.productid);
      if (found)
        return prev.map((i) =>
          i.productid === product.productid ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveItem = (productid: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) =>
          i.productid === productid ? { ...i, qty: Math.max(0, i.qty - 1) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const handleDeleteItem = (productid: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.productid !== productid));
  };

  const productsTotal = selectedItems.reduce(
    (a, i) => a + (i.sellingprice || i.price) * i.qty,
    0,
  );
  const packageTotal = selectedPackage?.price || 0;
  const personalizationTotal = greetingCard ? 50 : 0;
  const grandTotal = productsTotal + packageTotal + personalizationTotal;
  const totalQty = selectedItems.reduce((a, i) => a + i.qty, 0);

  const handleCompleteGift = async () => {
    if (!selectedPackage || selectedItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = selectedItems.map((item) => ({
        giftpackid: selectedPackage.id,
        productid: item.productid,
        productname: item.productname,
        productimage: item.productimage,
        quantity: item.qty,
        sellingprice: item.sellingprice || item.price,
      }));

      const createResponse = await API.post(
        API_ROUTES.CREATECUSTOMGIFT,
        { products: payload },
      );

      if (createResponse.status === 200 || createResponse.status === 201) {
        const addToCartResponse = await API.post(API_ROUTES.ADDCUSTOMGIFTCART, {
          giftpackid: selectedPackage.id,
        });

        if (
          addToCartResponse.status === 200 ||
          addToCartResponse.status === 201
        ) {
          window.dispatchEvent(new Event("cartUpdated"));
          alert("Custom gift added to cart successfully!");
          setSelectedItems([]);
          setSelectedPackage(null);
          router.push("/cart");
        }
      }
    } catch (error) {
      console.error("Error creating custom gift:", error);
      alert("Failed to create custom gift. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--site-bg)] pt-[80px] font-sans text-[var(--dark-grey)] selection:bg-[var(--olive)] selection:text-white">
      {/* CORPORATE HERO */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-12 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Custom Gifting</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Custom Gifting
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600">
            Select from our premium range of boxes and artisanal products to
            build custom hampers for clients, employees, and special occasions.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: THE PROCESS */}
          <div className="lg:col-span-8 space-y-16">
            {/* STEP 1: PACKAGING */}
            <section className="relative">
              <div className="flex items-center gap-6 mb-10 border-b border-gray-200 pb-6">
                <span className="text-5xl font-light text-[var(--olive)]/20 ">
                  01
                </span>
                <div>
                  <h2 className="text-xl font-medium tracking-wide text-[var(--olive-dark)] uppercase">
                    Select the Vessel
                  </h2>
                  <p className="text-xs text-[var(--dark-grey)]/60 uppercase tracking-[0.15em] mt-1">
                    Foundation of your gift
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {packagingOptions.map((pkg) => {
                  const active = selectedPackage?.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`group cursor-pointer bg-white transition-all duration-500 ease-out border ${active
                        ? "border-[var(--olive-dark)] shadow-xl"
                        : "border-gray-200 hover:border-[var(--olive)]/50 hover:shadow-md"
                        }`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 p-6 flex flex-col justify-end border-b border-gray-100">
                        {active && (
                          <div className="absolute top-4 right-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--olive-dark)] text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <img
                          src={
                            pkg.image.includes("http")
                              ? pkg.image
                              : IMAGE_URL + pkg.image
                          }
                          alt={pkg.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                        <div className="relative z-10 text-white">
                          <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
                            {pkg.tag}
                          </span>
                          <h4 className="text-lg font-medium leading-tight">
                            {pkg.name}
                          </h4>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col justify-between">
                        <p className="text-[11px] leading-relaxed text-[var(--dark-grey)]/70 mb-4 h-10">
                          {pkg.desc}
                        </p>
                        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                          <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--dark-grey)]/50">
                            {pkg.capacity}
                          </span>
                          <span className="text-sm font-medium text-[var(--orange)]">
                            +₹{pkg.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: PRODUCTS */}
            <section className="relative">
              <div className="flex items-end justify-between gap-6 mb-10 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-6">
                  <span className="text-5xl font-light text-[var(--olive)]/20 ">
                    02
                  </span>
                  <div>
                    <h2 className="text-xl font-medium tracking-wide text-[var(--olive-dark)] uppercase">
                      Curate Contents
                    </h2>
                    <p className="text-xs text-[var(--dark-grey)]/60 uppercase tracking-[0.15em] mt-1">
                      Select premium additions
                    </p>
                  </div>
                </div>

                <div className="relative w-full max-w-[240px] hidden sm:block">
                  <input
                    type="text"
                    placeholder="SEARCH COLLECTION..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-b border-gray-300 bg-transparent px-0 py-2 pr-8 text-[11px] uppercase tracking-[0.2em] text-[var(--dark-grey)] focus:border-[var(--olive-dark)] focus:outline-none transition-colors placeholder:text-gray-400"
                  />
                  <Search className="absolute right-0 top-2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Mobile Search */}
              <div className="relative w-full sm:hidden mb-8">
                <input
                  type="text"
                  placeholder="SEARCH COLLECTION..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-b border-gray-300 bg-transparent px-0 py-2 pr-8 text-[11px] uppercase tracking-[0.2em] text-[var(--dark-grey)] focus:border-[var(--olive-dark)] focus:outline-none transition-colors placeholder:text-gray-400"
                />
                <Search className="absolute right-0 top-2 h-4 w-4 text-gray-400" />
              </div>

              {selectedItems.length > 0 && (
                <div className="mb-10 bg-white border border-[var(--olive)]/10 p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--olive-dark)] mb-5 flex items-center gap-3">
                    <span className="w-8 h-px bg-[var(--olive)]/30"></span>{" "}
                    Inside the Vessel
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="h-14 w-14 shrink-0 bg-gray-50 border border-gray-100 p-1">
                          <img
                            src={
                              item.productimage?.includes("http")
                                ? item.productimage
                                : IMAGE_URL + item.productimage
                            }
                            alt={item.productname}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium text-[var(--olive-dark)]">
                            {item.productname}
                          </p>
                          <p className="text-[10px] text-[var(--dark-grey)]/60 mt-1 uppercase tracking-wider">
                            {item.qty} × ₹{item.sellingprice || item.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pr-2">
                          <button
                            onClick={() => handleRemoveItem(item.productid)}
                            className="text-[var(--dark-grey)]/40 hover:text-[var(--orange)] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="text-[var(--dark-grey)]/40 hover:text-[var(--olive-dark)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSearching ? (
                <div className="flex justify-center py-20">
                  <div className="h-8 w-8 animate-spin border-[3px] border-gray-200 border-t-[var(--olive)] rounded-full" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product, idx) => {
                    const qty =
                      selectedItems.find(
                        (i) => i.productid === product.productid,
                      )?.qty || 0;
                    return (
                      <div
                        key={idx}
                        className="group flex flex-col bg-white border border-gray-200 p-4 transition-colors hover:border-[var(--olive)]/30 h-full"
                      >
                        <div className="relative aspect-square w-full shrink-0 bg-gray-50 overflow-hidden border border-gray-100 mb-4">
                          <img
                            src={
                              product.productimage?.includes("http")
                                ? product.productimage
                                : product.productimage
                                  ? IMAGE_URL + product.productimage
                                  : "/placeholder.png"
                            }
                            alt={product.productname}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {qty > 0 && (
                            <div className="absolute inset-0 bg-[var(--olive-dark)]/5 transition-opacity" />
                          )}
                        </div>

                        <div className="flex flex-col flex-grow">
                          <h3 className="text-xs font-medium text-[var(--olive-dark)] uppercase tracking-wide leading-snug line-clamp-2">
                            {product.productname}
                          </h3>
                          <p className="text-xs font-bold text-[var(--dark-grey)]/80 mt-1">
                            ₹{product.sellingprice || product.price}
                          </p>
                        </div>

                        <div className="w-full mt-4 shrink-0">
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddItem(product)}
                              className="w-full bg-[var(--olive-dark)] text-white py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--orange)] transition-colors border border-transparent"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="w-full flex items-center justify-between bg-white border border-[var(--olive-dark)] h-9">
                              <button
                                onClick={() =>
                                  handleRemoveItem(product.productid)
                                }
                                className="h-full w-9 flex items-center justify-center hover:bg-gray-100 text-[var(--dark-grey)] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-[var(--olive-dark)]">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAddItem(product)}
                                className="h-full w-9 flex items-center justify-center hover:bg-gray-100 text-[var(--dark-grey)] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY RECIEPT */}
          <div className="lg:col-span-4">
            <div className="sticky top-[100px] bg-white border border-gray-200 p-8 shadow-2xl shadow-[var(--olive)]/5">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--olive-dark)] text-center mb-8 border-b border-gray-200 pb-6">
                Order Summary
              </h3>

              {/* Package */}
              <div className="mb-8">
                <span className="block text-[9px] uppercase tracking-[0.2em] text-[var(--dark-grey)]/50 mb-4">
                  Vessel
                </span>
                {selectedPackage ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 bg-gray-50 border border-gray-100 p-1">
                      <img
                        src={
                          selectedPackage.image.includes("http")
                            ? selectedPackage.image
                            : IMAGE_URL + selectedPackage.image
                        }
                        alt={selectedPackage.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[var(--olive-dark)] uppercase tracking-wide">
                        {selectedPackage.name}
                      </p>
                      <p className="text-[10px] text-[var(--dark-grey)]/50 mt-1">
                        ₹{selectedPackage.price}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs italic text-gray-400 ">
                    None selected
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-[var(--dark-grey)]/50">
                    Contents
                  </span>
                  {totalQty > 0 && (
                    <span className="text-[9px] font-medium text-[var(--olive-dark)]">
                      {totalQty} ITEMS
                    </span>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="text-xs italic text-gray-400  border-t border-gray-100 pt-4">
                    Empty
                  </div>
                ) : (
                  <ul className="space-y-4 border-t border-gray-100 pt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-start group"
                      >
                        <div className="flex gap-3">
                          <span className="text-[10px] text-[var(--dark-grey)]/40 mt-0.5">
                            {item.qty}×
                          </span>
                          <div>
                            <p className="text-xs font-medium text-[var(--olive-dark)] max-w-[180px] leading-snug">
                              {item.productname}
                            </p>
                            <button
                              onClick={() => handleDeleteItem(item.productid)}
                              className="text-[9px] uppercase tracking-wider text-red-400 hover:text-red-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <span className="text-xs text-[var(--dark-grey)]/80 pt-0.5">
                          ₹{(item.sellingprice || item.price) * item.qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Personalization */}
              {greetingCard && (
                <div className="mb-8 border-t border-gray-100 pt-6 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--dark-grey)]/80">
                    Card Addition
                  </span>
                  <span className="text-xs text-[var(--dark-grey)]/80">
                    ₹50
                  </span>
                </div>
              )}

              {/* Totals */}
              <div className="border-t-2 border-black pt-6 mb-8 space-y-3">
                <div className="flex justify-between text-[11px] text-[var(--dark-grey)]/70 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>
                    ₹{productsTotal + packageTotal + personalizationTotal}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[var(--olive-dark)] uppercase tracking-widest pt-2">
                  <span>Total</span>
                  <span className="text-[var(--orange)] font-bold">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCompleteGift}
                disabled={
                  selectedItems.length === 0 || !selectedPackage || isSubmitting
                }
                className="w-full bg-[var(--olive)] text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-[var(--olive-dark)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group cursor-pointer"
              >
                {isSubmitting ? "Processing..." : "Complete Gift"}
                {!isSubmitting && (
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <p className="text-center text-[9px] uppercase tracking-[0.15em] text-[var(--olive-dark)]/40 mt-5">
                Complimentary shipping on orders above ₹999
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--olive); }
      `,
        }}
      />
    </div>
  );
}
