import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, ShoppingCart } from "lucide-react";

const giftHampers = [
  {
    id: 101,
    name: "Festive Celebration Box",
    price: 2499,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-lo4Psnq5vDI61PzeMWKo2UlIv2_kyPnzBQ&s",
    desc: "A premium collection of organic millets, dry fruits & artisan sweets.",
  },
  {
    id: 102,
    name: "Wellness Nut Selection",
    price: 1899,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk7BJ2N2Wp2yYW6ApncUC_Eo_HNDzAcaKSQQ&s",
    desc: "Hand-picked premium nuts & nutritious millet treats for the health-conscious.",
  },
];

const poojaGifts = [
  {
    id: 201,
    name: "Silver Plated Pooja Thali",
    price: 3499,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPFVWk1vEkuFYgEA8EJ-DpX8ajMJOy7Yuf6w&s",
    tag: "Elegant",
  },
  {
    id: 202,
    name: "Handcrafted Brass Diya Set",
    price: 1299,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5vy3KL_9DSiDnk4MSGeVRHz-G32qmtpWo7A&s",
    tag: "Traditional",
  },
];

function GiftingSection({ t }: { t: any }) {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-20">
          {/* ── Artisanal Gift Hampers ── */}
          <div
            className={`space-y-10 transition-all duration-500 opacity-100 translate-x-0`}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-100 pb-8">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                  {t.gift.split(" ")[0]}{" "}
                  <span className="gradient-text">
                    {t.gift.split(" ").slice(1).join(" ")}
                  </span>
                </h2>
              </div>
              <Link
                href="/gifts"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--olive)] relative"
              >
                <span className="relative">
                  {t.view_all}
                  <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[var(--olive)] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[var(--olive)]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {giftHampers.map((item) => (
                <Link
                  href="/gift-detail"
                  key={item.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95 cursor-pointer">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-2.5 py-1 rounded-full bg-[var(--orange)] text-white text-[9px] font-black tracking-wider shadow-lg">
                        20% OFF
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 line-through font-medium">
                        ₹{(item.price * 1.2).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 mt-auto">
                      <button className="w-full bg-[#FCFBF9] border border-gray-100 text-gray-900 py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-between hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all duration-300 group/btn cursor-pointer">
                        <span>ADD TO CART</span>
                        <ShoppingCart className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Pooja Gift Essentials ── */}
          <div
            className={`space-y-10 transition-all duration-500 delay-300 opacity-100 translate-x-0`}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-100 pb-8">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                  {t.pooja.split(" ").slice(0, 2).join(" ")}{" "}
                  <span className="gradient-text">
                    {t.pooja.split(" ").slice(2).join(" ")}
                  </span>
                </h2>
              </div>
              <Link
                href="/pooja-gifts"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--olive)] relative"
              >
                <span className="relative">
                  {t.view_all}
                  <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[var(--olive)] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[var(--olive)]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {poojaGifts.map((item) => (
                <Link
                  href="/gift-detail"
                  key={item.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95 cursor-pointer">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[7px] font-black text-amber-600 uppercase tracking-widest border border-amber-100/50">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1 space-y-2">
                    <div className="space-y-0.5">
                      <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1 group-hover:text-[var(--olive)] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-medium">Tradizions Sacred Gift</p>
                    </div>
                    <div className="pt-0.5">
                      <p className="text-base font-black text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-1 mt-auto">
                      <button className="w-full bg-[#FCFBF9] border border-gray-100 text-gray-900 py-2.5 px-3 rounded-xl font-bold text-[9px] tracking-widest flex items-center justify-between hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-all duration-300 group/btn cursor-pointer">
                        <span>ADD TO CART</span>
                        <ShoppingCart className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function useInView(): { ref: any; isVisible: any; } {
  throw new Error("Function not implemented.");
}
