"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const cleanedBase = IMAGE_URL.endsWith("/") ? IMAGE_URL.slice(0, -1) : IMAGE_URL;
  const cleanedPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;
  return `${cleanedBase}/${cleanedPath}`;
};

export default function ProductCard({
  product,
  isVisible = true,
  delay = 0,
  onClick,
}: {
  product: any;
  isVisible?: boolean;
  delay?: number;
  onClick?: () => void;
}) {
  const id = product.productid !== undefined ? product.productid : product.id;
  const name = product.productname || product.name;
  const price = product.sellingprice || product.price || 0;
  const originalPrice =
    product.price !== undefined &&
      product.sellingprice !== undefined &&
      product.price > product.sellingprice
      ? product.price
      : product.originalPrice || null;
  const image = product.productimage
    ? getImageUrl(product.productimage)
    : product.image
      ? getImageUrl(product.image)
      : "/placeholder.png";

  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchFav = async () => {
      if (localStorage.getItem("isLoggedIn") === "true") {
        try {
          const response = await API.post(API_ROUTES.GETFAVOURITE);
          if (response.status === 200) {
            const list = response.data?.data || [];
            const favIds = list.map((fav: any) => fav.productid);
            setIsFav(favIds.includes(id));
          }
        } catch (err) { }
      }
    };
    fetchFav();
    const handleUpdate = () => fetchFav();
    window.addEventListener("favoritesUpdated", handleUpdate);
    return () => window.removeEventListener("favoritesUpdated", handleUpdate);
  }, [id]);

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

  const isGiftOrPooja =
    product.categoryid === 4 ||
    product.categoryid === 5 ||
    product.itemtype === "gift" ||
    (product.category && product.category.toLowerCase().includes("gift"));
  const detailUrl = isGiftOrPooja
    ? `/gift-detail/${id}?productid=${id}&bid=${product.bid || 1}`
    : `/product-detail/${id}?productid=${id}&bid=${product.bid || 1}`;

  return (
    <Link
      href={detailUrl}
      onClick={onClick}
      className="group relative bg-white border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden flex flex-col transition-all duration-500 hover:shadow-xl h-full animate-fade-in"
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 justify-center items-center flex border-b border-gray-100">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${(product.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
        />

        {/* Subtle Corporate Overlay on Hover */}
        <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {(product.availablestock ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10">
            <span className="bg-gray-900 text-white text-[10px] font-bold px-4 py-2 tracking-widest uppercase rounded shadow-sm">
              Out Of Stock
            </span>
          </div>
        )}

        {/* Top Left Discount Badge */}
        {originalPrice && originalPrice > price && (
          <div className="absolute top-3 left-3 z-20 bg-[var(--orange)] text-white text-[10px] font-bold px-2 py-1 shadow-sm tracking-wider rounded-sm">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Top Right Favourite Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActionWithLogin(async () => {
                if (id === undefined) return;
                try {
                  const response = await API.post(API_ROUTES.ADDFAVOURITE, {
                    productid: id,
                  });
                  if (response.status === 200) {
                    window.dispatchEvent(new Event("favoritesUpdated"));
                  }
                } catch (err) {
                  console.error("Error adding to wishlist:", err);
                }
              });
            }}
            className={`w-8 h-8 bg-white shadow-sm border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer rounded-sm ${isFav
                ? "border-[var(--orange)] text-[var(--orange)]"
                : "border-gray-200 text-gray-400 hover:text-[var(--orange)] hover:border-[var(--orange)]"
              }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${isFav ? "fill-[var(--orange)] text-[var(--orange)]" : ""
                }`}
            />
          </button>
        </div>

        {/* Quick View Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[var(--cream)] backdrop-blur border-t border-gray-100 text-[var(--olive-dark)] text-[10px] font-bold py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 tracking-widest uppercase">
          Quick View
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
        {/* Subcategory & Title */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {product.category || "Organic"}
            </span>
            {product.weight && (product.unit || product.unitname) && (
              <span className="text-gray-500 text-[10px] font-medium">
                {product.weight} {product.unit || product.unitname}
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-bold text-[var(--olive-dark)] group-hover:text-[var(--orange)] transition-colors duration-300 line-clamp-1 leading-tight">
            {name}
          </h3>
        </div>

        {/* Ratings & Stock Status Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="text-[12px] text-gray-500 font-medium line-clamp-2 leading-relaxed flex-1 pr-2">
            {product.desc || product.description || "Tradizions premium selection for health. Discover natural goodness."}
          </p>
        </div>

        {/* Price Details */}
        <div className="flex items-baseline gap-2 mb-5 border-t border-gray-100 pt-4 mt-auto">
          <span className="text-lg font-bold text-gray-900">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && (
            <>
              <span className="text-[13px] text-gray-400 line-through font-medium">
                ₹{originalPrice.toLocaleString()}
              </span>
            </>
          )}
        </div>

        {/* Add to Cart Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quantity Stepper */}
          <div
            className="flex items-center border border-gray-200 rounded bg-white overflow-hidden h-10 shrink-0"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-3 text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-50 h-full flex items-center cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[13px] font-bold text-gray-900 w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-3 text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-50 h-full flex items-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add To Cart CTA */}
          <button
            disabled={isAdding || (product.availablestock ?? 0) <= 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if ((product.availablestock ?? 0) <= 0) return;
              handleActionWithLogin(async () => {
                setIsAdding(true);
                try {
                  const response = await API.post(API_ROUTES.ADDTOCART, {
                    bid: product.bid || 1,
                    productid: product.itemtype === "gift" ? null : id,
                    giftid: product.itemtype === "gift" ? id : null,
                    quantity: quantity,
                    itemtype: product.itemtype || "product",
                  });
                  if (response.status === 200) {
                    window.dispatchEvent(new Event("cartUpdated"));
                  } else {
                    alert("Failed to add product to cart. Please try again.");
                  }
                } catch (err: any) {
                  console.error("Error adding to cart:", err);
                  alert(
                    err?.response?.data?.message ||
                    "An error occurred while adding to cart.",
                  );
                } finally {
                  setIsAdding(false);
                }
              });
            }}
            className={`flex-1 h-10 rounded font-bold text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 ${(product.availablestock ?? 0) <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-[var(--olive)] hover:bg-[var(--orange)] text-white shadow-md hover:shadow-lg cursor-pointer"
              } disabled:opacity-50`}
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>
              {(product.availablestock ?? 0) <= 0
                ? "Sold Out"
                : isAdding
                  ? "Adding..."
                  : "Add to Cart"}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
