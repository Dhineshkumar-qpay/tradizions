"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Gift,
  Truck,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  ChevronRight,
  Sparkles,
  X,
  Zap,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useEffect, useRef } from "react";
import en from "@/languages/en.json";
import ta from "@/languages/ta.json";
import hi from "@/languages/hi.json";
import { GiftDetailModel, GiftCardsData } from "@/models/product_detail_model";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/service/api_service";
import { API_ROUTES, IMAGE_URL } from "@/routes/api_routes";
import { formatDistanceToNow } from "date-fns";
import { Upload } from "lucide-react";

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

export default function GiftDetailPage() {
  const { id } = useParams();
  const [mainImage, setMainImage] = useState("/placeholder.png");
  const [giftDetail, setGiftDetail] = useState<GiftDetailModel | null>(null);
  const gift = giftDetail?.data?.giftdetail;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  // Fetch favorite status on load
  useEffect(() => {
    if (!gift || localStorage.getItem("isLoggedIn") !== "true") return;
    const fetchFavs = async () => {
      try {
        const res = await API.post(API_ROUTES.GETFAVOURITE);
        if (res.status === 200) {
          const favs = res.data?.data || [];
          if (
            favs.some((f: any) => f.productid === (gift.giftid || Number(id)))
          ) {
            setIsFavourite(true);
          }
        }
      } catch (err) { }
    };
    fetchFavs();
  }, [gift, id]);

  const handleShare = async () => {
    if (!gift) return;
    const shareData = {
      title: gift.giftname,
      text: "Check out this amazing gift from Tradizions!",
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
    if (!gift) return;
    handleActionWithLogin(async () => {
      try {
        const response = await API.post(API_ROUTES.ADDFAVOURITE, {
          productid: gift.giftid || Number(id),
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
    if (!gift) return;
    handleActionWithLogin(async () => {
      setIsAddingToCart(true);
      try {
        const response = await API.post(API_ROUTES.ADDTOCART, {
          bid: gift.bid || 1,
          productid: null,
          giftid: gift.giftid || Number(id),
          quantity: quantity,
          itemtype: "gift",
        });
        if (response.status === 200) {
          window.dispatchEvent(new Event("cartUpdated"));
          alert("Gift added to cart!");
        } else {
          alert("Failed to add gift to cart.");
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

  const handleCheckoutWithGiftCard = async () => {
    if (!gift) return;
    setIsAddingToCart(true);
    try {
      const response = await API.post(API_ROUTES.ADDTOCART, {
        bid: gift.bid || 1,
        productid: null,
        giftid: gift.giftid || Number(id),
        quantity: quantity,
        itemtype: "gift",
        isbuynow: true,
      });
      if (response.status === 200) {
        const cartId = response.data?.data?.cartid;
        if (cartId && selectedGiftCardId) {
          await API.post(API_ROUTES.UPDATEGIFTCARD, {
            cartid: cartId,
            giftcardid: selectedGiftCardId,
            giftmessage: giftMessage,
            sendername: senderName,
          });
        }
        window.dispatchEvent(new Event("cartUpdated"));
        router.push("/checkout");
      } else {
        alert("Failed to proceed to checkout.");
      }
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      alert(
        err?.response?.data?.message ||
        "An error occurred while proceeding to checkout.",
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await API.post(API_ROUTES.GIFT_DETAIL, {
          giftid: Number(id),
        });
        if (response.status === 200 && response.data?.data?.giftdetail) {
          setGiftDetail(response.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching gift detail:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    if (gift && gift.giftimage) {
      setMainImage(getImageUrl(gift.giftimage));
    }
  }, [gift]);

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
        bid: gift?.bid || 1,
        productid: gift?.giftid || Number(id),
        rating: rating,
        review: reviewContent,
        email: reviewEmail,
        title: reviewTitle,
        name: reviewName,
        productname: gift?.giftname || "",
      };

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

  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review Form States
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [selectedWrap, setSelectedWrap] = useState("");
  const [giftCards, setGiftCards] = useState<GiftCardsData[]>([]);
  const [selectedGiftCardId, setSelectedGiftCardId] = useState<number | null>(
    null,
  );
  const [giftMessage, setGiftMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  const [isUploadingGiftCard, setIsUploadingGiftCard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGiftCards = async () => {
    try {
      const response = await API.post(API_ROUTES.GIFT_CARDS);
      if (response.status === 200 && response.data?.data) {
        setGiftCards(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching gift cards:", err);
    }
  };

  useEffect(() => {
    if (gift) {
      fetchGiftCards();
    }
  }, [gift]);

  const handleUploadGiftCard = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingGiftCard(true);
    try {
      const formData = new FormData();
      formData.append("cardimage", file);

      const response = await API.post(API_ROUTES.UPLOADGIFTCARDIMAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 && response.data?.data?.giftcardid) {
        const newCardId = response.data.data.giftcardid;
        const newCardImage = response.data.data.cardimage;

        setGiftCards((prev) => [
          {
            giftcardid: newCardId,
            cardname: "Your Custom Card",
            cardimage: newCardImage,
            status: "active",
          },
          ...prev,
        ]);

        setSelectedGiftCardId(newCardId);
        if (window.innerWidth < 1024) {
          setTimeout(() => {
            document.getElementById("step-2-preview")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else {
        alert("Failed to upload gift card.");
      }
    } catch (err: any) {
      console.error("Error uploading gift card:", err);
      alert(err?.response?.data?.message || "An error occurred during upload.");
    } finally {
      setIsUploadingGiftCard(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  if (error || !gift) {
    return (
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-20 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-md bg-white rounded-[2rem] p-8 shadow-xl border border-stone-100">
          <h2 className="text-2xl font-black text-stone-900 mb-2">
            Gift Not Found
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            The gift details could not be loaded or the gift does not exist.
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

  const giftImages = [
    gift?.giftimage,
    gift?.image1,
    gift?.image2,
    gift?.image3,
    gift?.image4,
  ]
    .filter(Boolean)
    .map((img) => getImageUrl(img as string));

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6">
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
            href="/gifts"
            className="hover:text-[var(--olive)] transition-colors"
          >
            {t.gifting}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--olive)]">Brass Diya Set</span>
        </nav>

        <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col lg:flex-row gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--olive)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse sm:flex-row gap-4 relative z-10">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto pb-2 sm:pb-0 scrollbar-hide">
              {giftImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${mainImage === img ? "border-[var(--olive)] shadow-md" : "border-transparent hover:border-gray-200"}`}
                >
                  <img
                    src={img}
                    className="h-full object-contain"
                    alt="thumbnail"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className="relative flex-1 aspect-[4/5] sm:aspect-auto sm:h-[600px] rounded-[2rem] overflow-hidden bg-[#faf9f6] shadow-inner"
              onClick={() => setShowImage(true)}
            >
              <img
                src={mainImage}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 cursor-zoom-in"
                alt="Gift Main"
              />
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[var(--olive)] tracking-[0.2em] shadow-sm uppercase z-10">
                {gift.categoryname ?? ""}
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
                alt="Gift Main"
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
          <div className="w-full lg:w-1/2 flex flex-col pt-4 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-700">
                  {giftDetail?.data?.reviews?.length}
                </span>
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
              {gift.giftname}
            </h1>
            <p className="text-gray-500 font-medium mb-4">
              {gift.giftdescription || ""}
            </p>

            {gift.weight && gift.unit && (
              <div className="mb-6">
                <span className="inline-block bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full text-xs font-bold border border-stone-200">
                  Weight: {gift.weight} {gift.unit}
                </span>
              </div>
            )}

            <div className="flex items-end gap-4 mb-8">
              {gift.giftsellingprice === 0.00 ||
                gift.giftsellingprice == undefined ? (
                <>
                  <span className="text-4xl font-extrabold text-[var(--olive)] leading-none">
                    ₹{gift.giftprice}
                  </span>
                </>
              ) : (
                <>
                  {" "}
                  <span className="text-4xl font-extrabold text-[var(--olive)] leading-none">
                    ₹{gift.giftsellingprice}
                  </span>
                  <span className="text-lg text-gray-400 font-medium line-through mb-1">
                    ₹{gift.giftprice}
                  </span>
                </>
              )}
              <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded-md mb-1 border border-emerald-100">
                {t.product.save} {gift.discount}%
              </span>
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
                  disabled={isAddingToCart || (gift?.stock ?? 0) <= 0}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-2xl bg-white border-2 border-[var(--olive)] text-[var(--olive)] font-bold text-[13px] tracking-widest hover:bg-[var(--olive)]/5 transition-all flex items-center justify-center gap-2 group ${(gift?.stock ?? 0) <= 0 ? "cursor-not-allowed opacity-50 border-stone-200 text-stone-400" : "cursor-pointer"} disabled:opacity-50`}
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {(gift?.stock ?? 0) <= 0
                    ? "OUT OF STOCK"
                    : isAddingToCart
                      ? "ADDING..."
                      : t.product.add_to_cart || "ADD TO CART"}
                </button>
              </div>
              <button
                onClick={() =>
                  handleActionWithLogin(() => setShowGiftDialog(true))
                }
                className="w-full py-4 rounded-2xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t.product.buy_now || "BUY NOW"}
              </button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#faf9f6] border border-gray-100">
                <Sparkles className="w-6 h-6 text-[var(--olive)]" />
                <span className="text-xs font-bold text-gray-700">
                  {t.gift_detail.perfect_for}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#faf9f6] border border-gray-100">
                <Gift className="w-6 h-6 text-[var(--olive)]" />
                <span className="text-xs font-bold text-gray-700">
                  {t.gift_detail.packaging}
                </span>
              </div>
            </div>

            {/* Description Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                {t.gift_detail.included_products}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-light">
                {gift.productlist?.map((name, index) => (
                  <span
                    key={index}
                    className="capitalize bg-[var(--olive)]/10 px-2 py-1 rounded-md mr-2 mb-2 inline-block px-2 py-1 text-[10px] font-bold text-[var(--foreground)] uppercase tracking-widest"
                  >
                    {name.name}
                    {index !== gift.productlist?.length! - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-12 bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
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
                {giftDetail?.data?.reviews?.length! > 0 ? (
                  <span className="text-sm font-medium text-gray-500">
                    Based on {giftDetail?.data?.totalreviews} reviews
                  </span>
                ) : (
                  <>
                    <span className="text-xl font-extrabold text-gray-900">
                      {giftDetail?.data?.avgrating || "5.0"}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Based on {giftDetail?.data?.reviews?.length} reviews
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                handleActionWithLogin(() => setShowReviewForm(!showReviewForm))
              }
              className="px-6 py-3 rounded-xl bg-[var(--olive)] text-white font-bold text-[11px] tracking-widest shadow-md shadow-[var(--olive)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all uppercase"
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
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)] focus:bg-white transition-all text-sm font-medium resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleActionWithLogin(handleSubmitReview)}
                  className="py-3.5 px-8 rounded-xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-md shadow-[var(--olive)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview
                    ? "SUBMITTING..."
                    : t.product.submit_review}
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftDetail?.data?.reviews?.map((data, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#faf9f6] border border-gray-100 transition-all hover:border-[var(--olive)]/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center font-bold text-sm border border-[var(--olive)]/20 shadow-sm">
                      {data.title?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {data.name ?? ""}
                      </h4>
                      <div className="flex items-center mt-0.5">
                        {[...Array(data.rating)].map((_, j) => (
                          <Star
                            key={j}
                            className="w-3 h-3 text-amber-500 fill-amber-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {formatDistanceToNow(new Date(data.createdAt ?? ""), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-gray-900 mb-2">
                  {data.title ?? ""}
                </h5>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {data.review ?? ""}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Gift Card Dialogue */}
        {showGiftDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-[0_32px_80px_-15px_rgba(0,0,0,0.35)] relative flex flex-col max-h-[92vh] overflow-hidden">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--olive)]/10 flex items-center justify-center border border-[var(--olive)]/20">
                    <Gift className="w-5 h-5 text-[var(--olive)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">Personalise Your Gift</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Choose a card and add your message</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGiftDialog(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden min-h-0">

                {/* ─── Left: Card Picker ─── */}
                <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                      Step 1 — Select a Gift Card
                    </p>
                    {selectedGiftCardId && (
                      <button
                        onClick={() => setSelectedGiftCardId(null)}
                        className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors cursor-pointer"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-3">
                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingGiftCard}
                      className="relative group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[var(--olive)] bg-gray-50 hover:bg-[var(--olive)]/5 transition-all duration-300 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleUploadGiftCard}
                      />
                      <div className="w-full aspect-[4/2] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                        {isUploadingGiftCard ? (
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--olive)] rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-[var(--olive)] transition-colors" />
                        )}
                      </div>
                      <p className="text-[11px] font-bold leading-tight line-clamp-2 w-full text-gray-600 group-hover:text-[var(--olive)] transition-colors">
                        Upload Your Own
                      </p>
                    </button>
                    {giftCards.map((card) => {
                      const isSelected = selectedGiftCardId === card.giftcardid;
                      return (
                        <button
                          key={card.giftcardid}
                          type="button"
                          onClick={() => {
                            setSelectedGiftCardId(card.giftcardid || null);
                            if (window.innerWidth < 1024) {
                              setTimeout(() => {
                                document.getElementById("step-2-preview")?.scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            }
                          }}
                          className={`relative group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center
                            ${isSelected
                              ? "border-[var(--olive)] bg-[var(--olive)]/5 shadow-md"
                              : "border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200"
                            }`}
                        >
                          {/* Selection badge */}
                          <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? "border-[var(--olive)] bg-[var(--olive)]" : "border-gray-300 bg-white"}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>

                          {/* Card Image */}
                          <div className="w-full aspect-[4/2] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            {card.cardimage ? (
                              <img
                                src={getImageUrl(card.cardimage)}
                                alt={card.cardname}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <Gift className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                            )}
                          </div>

                          {/* Card Name */}
                          <p className={`text-[11px] font-bold leading-tight line-clamp-2 w-full ${isSelected ? "text-[var(--olive)]" : "text-gray-600"}`}>
                            {card.cardname}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ─── Right: Preview + Message ─── */}
                <div id="step-2-preview" className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5 sm:gap-6 p-4 sm:p-6 lg:p-8 lg:overflow-y-auto">

                  {/* Step Label */}
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest shrink-0">
                    Step 2 — Preview & Message
                  </p>

                  {/* Live Preview Card */}
                  <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 shadow-md flex items-center justify-center shrink-0">
                    {selectedGiftCardId ? (() => {
                      const sel = giftCards.find(c => c.giftcardid === selectedGiftCardId);
                      return sel?.cardimage ? (
                        <img
                          src={getImageUrl(sel.cardimage)}
                          alt={sel.cardname}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <Gift className="w-14 h-14 text-gray-300" strokeWidth={1} />
                      );
                    })() : (
                      <div className="flex flex-col items-center gap-2 text-gray-300 select-none">
                        <Gift className="w-12 h-12" strokeWidth={1} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No card selected</p>
                      </div>
                    )}

                    {/* Message + Sender overlay – centered on card image */}
                    {selectedGiftCardId && (giftMessage.trim() || senderName.trim()) && (
                      <div className="absolute inset-0 flex items-center justify-center px-5 py-4 pointer-events-none">
                        <div className="bg-black/35 backdrop-blur-[2px] rounded-xl px-4 py-3 w-full flex flex-col items-center gap-1.5 overflow-hidden">
                          {giftMessage.trim() && (
                            <p className="text-white text-center text-[13px] font-semibold leading-snug drop-shadow break-words whitespace-pre-wrap w-full">
                              {giftMessage}
                            </p>
                          )}
                          {senderName.trim() && (
                            <p className="text-white/90 text-center text-[11px] font-bold italic leading-snug drop-shadow break-words w-full">
                              By {senderName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bottom gradient ribbon with name */}
                    {selectedGiftCardId && (() => {
                      const sel = giftCards.find(c => c.giftcardid === selectedGiftCardId);
                      return sel ? (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-8 pb-3 px-4">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{sel.cardname}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Message textarea */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                      Your Message <span className="normal-case font-normal text-gray-300">(optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write something heartfelt…"
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-gray-200 focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300 resize-none transition-all"
                    />
                    <p className="text-[10px] text-gray-300 text-right font-medium">{giftMessage.length}/200</p>
                  </div>

                  {/* Sender Name input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                      Sender Name <span className="normal-case font-normal text-gray-300">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dhinesh"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-gray-200 focus:border-[var(--olive)] focus:ring-4 focus:ring-[var(--olive)]/10 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300 transition-all"
                    />
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleCheckoutWithGiftCard}
                    disabled={isAddingToCart}
                    className="w-full py-4 rounded-2xl bg-[var(--olive)] text-white font-black text-[12px] tracking-[0.15em] uppercase shadow-lg shadow-[var(--olive)]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-auto"
                  >
                    {isAddingToCart ? (
                      <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {isAddingToCart ? "Processing…" : "Continue to Checkout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
