"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  ChevronRight,
  Check,
  Zap,
  X,
} from "lucide-react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { ProductDetailModel } from "@/models/product_detail_model";
import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "@/utils/price";

type props = {
  params: { slug: string };
};

const translations: Record<string, any> = {
  EN: en,
  TA: ta,
  HI: hi,
};

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const baseUrl = IMAGE_URL + imagePath;
  return baseUrl;
};

const timeAgo = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [productData, setProductData] = useState<ProductDetailModel | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const product = productData?.data?.productdetail;
  const reviews = productData?.data?.reviews || [];
  const relatedProducts = productData?.data?.relatedproducts || [];

  const totalReviews = productData?.data?.totalreviews || reviews.length;

  const [mainImage, setMainImage] = useState("/placeholder.png");
  const [showImage, setShowImage] = useState(false);
  const [favouriteProductIds, setFavouriteProductIds] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  // Review Form States
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch favorite status on load
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") return;
    const fetchFavs = async () => {
      try {
        const res = await API.post(API_ROUTES.GETFAVOURITE);
        if (res.status === 200) {
          const favs = res.data?.data || [];
          setFavouriteProductIds(favs.map((f: any) => f.productid));
          if (product && favs.some((f: any) => f.productid === product.productid)) {
            setIsFavourite(true);
          }
        }
      } catch (err) { }
    };
    fetchFavs();
    window.addEventListener("favoritesUpdated", fetchFavs);
    return () => window.removeEventListener("favoritesUpdated", fetchFavs);
  }, [product]);

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.productname,
      text: "Check out this amazing product from Tradizions!",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleFavourite = () => {
    if (!product) return;
    handleActionWithLogin(async () => {
      try {
        const response = await API.post(API_ROUTES.ADDFAVOURITE, {
          productid: product.productid || Number(id),
        });
        if (response.status === 200) {
          setIsFavourite(true);
          window.dispatchEvent(new Event("favoritesUpdated"));
        }
      } catch (err) {
        console.error("Error adding to favorites:", err);
      }
    });
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    handleActionWithLogin(async () => {
      setIsAddingToCart(true);
      try {
        const response = await API.post(API_ROUTES.ADDTOCART, {
          bid: product.bid || 1,
          productid: product.productid || Number(id),
          giftid: null,
          quantity: quantity,
          itemtype: "product",
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
          alert("Product added to cart!");
        } else {
          alert("Failed to add product to cart.");
        }
      } catch (err: any) {
        console.error("Error adding to cart:", err);
        alert(
          err?.response?.data?.message ||
          "An error occurred while adding to cart.",
        );
      } finally {
        setIsAddingToCart(false);
      }
    });
  };

  const router = useRouter();

  const handleBuyNow = () => {
    if (!product) return;
    handleActionWithLogin(async () => {
      setIsAddingToCart(true);
      try {
        const response = await API.post(API_ROUTES.ADDTOCART, {
          bid: product.bid || 1,
          productid: product.productid || Number(id),
          giftid: null,
          quantity: quantity,
          itemtype: "product",
          isbuynow: true,
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
          router.push("/checkout");
        } else {
          alert("Failed to proceed to checkout.");
        }
      } catch (err: any) {
        console.error("Error adding to cart:", err);
        alert(
          err?.response?.data?.message ||
          "An error occurred while adding to cart.",
        );
      } finally {
        setIsAddingToCart(false);
      }
    });
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }
    if (!reviewName || !reviewEmail || !reviewTitle || !reviewContent) {
      alert("Please fill all fields.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        bid: product?.bid || 1,
        productid: product?.productid || Number(id),
        rating: rating,
        review: reviewContent,
        email: reviewEmail,
        title: reviewTitle,
        name: reviewName,
        productname: product?.productname || "",
      };
      // Note: Assuming ADDPRODUCTRATING is added to API_ROUTES
      const response = await API.post(
        API_ROUTES.ADDPRODUCTRATING || "/review/add-product-rating",
        payload,
      );
      if (response.status === 200) {
        alert("Review submitted successfully!");
        setShowReviewForm(false);
        setRating(0);
        setReviewName("");
        setReviewEmail("");
        setReviewTitle("");
        setReviewContent("");
        // Optionally, refresh product details here to see the new review
      } else {
        alert("Failed to submit review.");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert(
        err?.response?.data?.message ||
        "An error occurred while submitting review.",
      );
    } finally {
      setIsSubmittingReview(false);
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

  useEffect(() => {
    if (!id) return;
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await API.post(API_ROUTES.PRODUCT_DETAIL, {
          productid: Number(id),
        });
        if (response.status === 200 && response.data?.data?.productdetail) {
          setProductData(response.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    if (product && product.productimage) {
      setMainImage(getImageUrl(product.productimage));
    }
  }, [product]);

  const t = translations[selectedLang] || translations["EN"];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-20 flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-7xl px-6">
          <div className="h-4 bg-stone-200 rounded-md w-1/4 mb-4" />
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2 aspect-[4/5] bg-stone-100 rounded-[2rem]" />
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="h-8 bg-stone-200 rounded-md w-3/4" />
              <div className="h-4 bg-stone-200 rounded-md w-5/6" />
              <div className="h-6 bg-stone-200 rounded-md w-1/4" />
              <div className="h-20 bg-stone-100 rounded-2xl w-full" />
              <div className="h-12 bg-stone-200 rounded-xl w-1/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-20 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-md bg-white rounded-[2rem] p-8 shadow-xl border border-stone-100">
          <h2 className="text-2xl font-black text-stone-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            The product details could not be loaded or the product does not
            exist.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 rounded-[1rem] bg-[var(--olive)] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--olive-dark)] transition-all shadow-md"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const productImages = [
    product?.productimage,
    product?.image1,
    product?.image2,
    product?.image3,
    product?.image4,
  ]
    .filter(Boolean)
    .map((img) => getImageUrl(img as string));

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-28 lg:pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-8">
          <Link
            href="/"
            className="hover:text-[var(--olive)] transition-colors"
          >
            {t.home}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/shop"
            className="hover:text-[var(--olive)] transition-colors"
          >
            {t.shop}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--olive)]">{product.productname}</span>
        </nav>

        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto pb-2 sm:pb-0 scrollbar-hide">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${mainImage === img ? "border-[var(--olive)] shadow-md" : "border-transparent hover:border-gray-200"}`}
                >
                  <img src={img} className="object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className="relative flex-1 aspect-[4/5] sm:aspect-auto sm:h-[600px] rounded-[1rem] overflow-hidden bg-[#faf9f6] justify-center items-center flex cursor-zoom-in"
              onClick={() => setShowImage(true)}
            >
              <img
                src={mainImage}
                alt="Product Main"
                className="h-full object-cover transition-transform duration-700 hover:scale-105 cursor-zoom-in"
              />
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[var(--olive)] tracking-[0.2em] shadow-sm uppercase z-10">
                {product.categoryname || ""}
              </div>
            </div>
          </div>

          {showImage && (
            <div
              className="w-full z-50 fixed inset-0 bg-black/85 flex items-center justify-center p-4"
              onClick={() => setShowImage(false)}
            >
              <img
                src={mainImage}
                alt="Product Main"
                className="max-h-[80vh] max-w-[80vw] object-cover"
              />
              <div
                className="absolute top-6 right-6 text-white cursor-pointer bg-[var(--olive)]/90 rounded-full p-2 hover:bg-[var(--olive)] transition-colors"
                onClick={() => setShowImage(false)}
              >
                <X className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-700">4.8</span>
                <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest ml-1">
                  ({t.product.reviews})
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFavourite}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isFavourite ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavourite ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
              {product.productname}
            </h1>
            <p className="text-gray-500 font-medium mb-4">
              {product.description ||
                "Authentic, unpolished, and nutrient-dense grains sourced directly from ethical organic farmers."}
            </p>

            {product.weight && product.unit && (
              <div className="mb-6">
                <span className="inline-block bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full text-xs font-bold border border-stone-200">
                  Weight: {product.weight} {product.unit}
                </span>
              </div>
            )}

            <div className="flex items-end gap-4 mb-8">
              {product.sellingprice ? (
                <>
                  <span className="text-4xl font-extrabold text-[var(--olive)] leading-none">
                    ₹{formatPrice(product.sellingprice)}
                  </span>
                  <span className="text-lg text-gray-400 font-medium line-through mb-1">
                    ₹{formatPrice(product.price || 0)}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-extrabold text-[var(--olive)] leading-none">
                  ₹{formatPrice(product.price || 0)}
                </span>
              )}
            </div>

            <div className="h-px w-full bg-gray-100 mb-8" />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full sm:w-36 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-[var(--olive)] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-[var(--olive)] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  disabled={
                    isAddingToCart || (product?.availablestock ?? 0) <= 0
                  }
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-2xl bg-white border-2 border-[var(--olive)] text-[var(--olive)] font-bold text-[13px] tracking-widest hover:bg-[var(--olive)]/5 transition-all flex items-center justify-center gap-2 group ${(product?.availablestock ?? 0) <= 0 ? "cursor-not-allowed opacity-50 border-stone-200 text-stone-400" : "cursor-pointer"} disabled:opacity-50`}
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {(product?.availablestock ?? 0) <= 0
                    ? "OUT OF STOCK"
                    : isAddingToCart
                      ? "ADDING..."
                      : t.product.add_to_cart || "ADD TO CART"}
                </button>
              </div>
              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart || (product?.availablestock ?? 0) <= 0}
                className={`w-full py-4 rounded-2xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group ${(product?.availablestock ?? 0) <= 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"} disabled:opacity-50`}
              >
                {isAddingToCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {isAddingToCart
                  ? "PROCESSING..."
                  : t.product.buy_now || "BUY NOW"}
              </button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#faf9f6] border border-gray-100">
                <ShieldCheck className="w-6 h-6 text-[var(--olive)]" />
                <span className="text-xs font-bold text-gray-700">
                  {t.product.organic}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#faf9f6] border border-gray-100">
                <Truck className="w-6 h-6 text-[var(--olive)]" />
                <span className="text-xs font-bold text-gray-700">
                  {t.product.free_delivery}
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 py-8 border-t border-b border-gray-100 my-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                  {t.product.origin}
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {product.country || "India"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                  {t.product.shelf_life}
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {product.shelflife || "12 Months from Packaging"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                  {t.product.storage}
                </span>
                <span className="text-sm font-bold text-stone-800 leading-relaxed font-medium">
                  {product.storageinfo ||
                    "Store in a cool, dry place. Once opened, transfer to an airtight container."}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                  {t.product.benefit}
                </span>
                <span className="text-sm font-bold text-stone-800 leading-relaxed font-medium">
                  {product.ingredients ||
                    "High fiber, Gluten-free, Low Glycemic Index, Rich in minerals."}
                </span>
              </div>
              <div className="flex flex-col gap-3 col-span-1 sm:col-span-2 pt-4">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                  {t.product.nutrition}
                </span>
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 grid grid-cols-3 sm:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">
                      Energy
                    </p>
                    <p className="text-xs font-black text-stone-900">
                      {product.calories || "342"} kcal
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">
                      Protein
                    </p>
                    <p className="text-xs font-black text-stone-900">
                      {product.protien || "11.2"} g
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">
                      Carbs
                    </p>
                    <p className="text-xs font-black text-stone-900">
                      {product.carbohydrates || "66"} g
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">
                      Fat
                    </p>
                    <p className="text-xs font-black text-stone-900">
                      {product.fat || "3.9"} g
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">
                      Fiber
                    </p>
                    <p className="text-xs font-black text-stone-900">
                      {product.fibre || "10"} g
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                {t.product.details}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {product.description ||
                  "Premium selection sourced directly from organic farms."}
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <div className="w-4 h-4 rounded-full bg-[var(--olive)]/10 flex items-center justify-center text-[var(--olive)]">
                    <Check className="w-3 h-3" />
                  </div>
                  {product.ingredients ||
                    "100% natural, unpolished and chemical-free."}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <div className="w-4 h-4 rounded-full bg-[var(--olive)]/10 flex items-center justify-center text-[var(--olive)]">
                    <Check className="w-3 h-3" />
                  </div>
                  Ideal choice for active and healthy lifestyle.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-8 lg:mt-12 bg-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t.product.customer_reviews}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
                {totalReviews > 0 ? (
                  <>
                    <span className="text-xl font-extrabold text-gray-900">
                      {productData?.data?.avgrating || "4.7"}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Based on {totalReviews} reviews
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-500">
                    No reviews yet
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                handleActionWithLogin(() => setShowReviewForm(!showReviewForm))
              }
              className="btn-standard rounded-xl font-bold text-[11px] tracking-widest shadow-md shadow-[var(--olive)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all uppercase"
            >
              {showReviewForm
                ? t.product.cancel_review
                : t.product.write_review}
            </button>
          </div>

          {showReviewForm && (
            <div className="mb-10 bg-[#faf9f6] rounded-[2rem] p-6 lg:p-8 border border-gray-100 animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                {t.product.write_review}
              </h3>
              <form className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t.product.rating}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      {t.contact_us.full_name}
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      {t.contact_us.email}
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t.product.review_title}
                  </label>
                  <input
                    type="text"
                    placeholder="Summarize your experience"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t.product.review_content}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What did you like or dislike? What should other shoppers know before buying?"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] outline-none transition-all font-medium text-gray-800 text-sm resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleActionWithLogin(handleSubmitReview)}
                  className="btn-standard rounded-xl font-bold text-[13px] tracking-widest shadow-md shadow-[var(--olive)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview
                    ? "SUBMITTING..."
                    : t.product.submit_review}
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#faf9f6] border border-gray-100 transition-all hover:border-[var(--olive)]/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center font-bold text-sm border border-[var(--olive)]/20 shadow-sm">
                      {review.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {review.name || "Verified Buyer"}
                      </h4>
                      <div className="flex items-center mt-0.5">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star
                            key={j}
                            className="w-3 h-3 text-amber-500 fill-amber-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-gray-900 mb-2">
                  {review.title || "Great Quality and Fast Shipping!"}
                </h5>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {review.review || "This is a great product! I love it."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 border-t border-stone-100 mt-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                {t.related_products || "Related Products"}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((relProduct) => {
                const relId = relProduct.productid;
                const relName = relProduct.productname;
                const relPrice = relProduct.sellingprice || relProduct.price || 0;
                const relOriginalPrice = relProduct.price !== undefined && relProduct.sellingprice !== undefined && relProduct.price > relProduct.sellingprice ? relProduct.price : null;
                const relImage = relProduct.productimage ? getImageUrl(relProduct.productimage) : "/placeholder.png";
                const isRelFav = relId !== undefined && favouriteProductIds.includes(relId);

                return (
                  <Link
                    href={`/product-detail/${relId}?productid=${relId}&bid=${relProduct.bid || 1}`}
                    key={relId}
                    className="group relative bg-white border border-[var(--olive)]/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={relImage}
                        alt={relName}
                        className={`h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110 ${(relProduct.availablestock ?? 0) <= 0 ? "grayscale opacity-60" : ""}`}
                      />
                      {(relProduct.availablestock ?? 0) <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                          <span className="bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-xl">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleActionWithLogin(async () => {
                              if (relId === undefined) return;
                              try {
                                const response = await API.post(API_ROUTES.ADDFAVOURITE, { productid: relId });
                                if (response.status === 200) {
                                  window.dispatchEvent(new Event("favoritesUpdated"));
                                }
                              } catch (err) {
                                console.error("Error adding to wishlist:", err);
                              }
                            });
                          }}
                          className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isRelFav ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                      </div>
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {relOriginalPrice && relOriginalPrice > relPrice && (
                          <span className="px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
                            {Math.round(((relOriginalPrice - relPrice) / relOriginalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                          {relName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {relProduct.weight && (relProduct.unit || (relProduct as any).unitname) && (
                            <span className="inline-block bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-stone-200 shrink-0">
                              {relProduct.weight} {relProduct.unit || (relProduct as any).unitname}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-gray-900">₹{relPrice.toLocaleString()}</span>
                        {relOriginalPrice && relOriginalPrice > relPrice && (
                          <span className="text-xs text-gray-400 line-through font-medium">₹{relOriginalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="pt-2 mt-auto">
                        <button
                          disabled={(relProduct.availablestock ?? 0) <= 0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if ((relProduct.availablestock ?? 0) <= 0) return;
                            handleActionWithLogin(async () => {
                              try {
                                const response = await API.post(API_ROUTES.ADDTOCART, {
                                  bid: relProduct.bid || 1,
                                  productid: relId,
                                  giftid: null,
                                  quantity: 1,
                                  itemtype: "product",
                                });
                                if (response.status === 200) {
                                  window.dispatchEvent(new Event("cartUpdated"));
                                } else {
                                  alert("Failed to add product to cart. Please try again.");
                                }
                              } catch (err: any) {
                                console.error("Error adding to cart:", err);
                                alert(err?.response?.data?.message || "An error occurred while adding to cart.");
                              }
                            });
                          }}
                          className={`w-full border py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between transition-all duration-300 group/btn ${
                            (relProduct.availablestock ?? 0) <= 0
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-[var(--olive)]/10 border-[var(--olive)]/20 text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] cursor-pointer"
                          } disabled:opacity-50`}
                        >
                          <span>{(relProduct.availablestock ?? 0) <= 0 ? "OUT OF STOCK" : "ADD TO CART"}</span>
                          <ShoppingCart className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
