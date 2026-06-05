"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, X, Share2, Heart, ArrowUpRight, Leaf, Sparkles, ChevronLeft, Copy, Check } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Nuts, Millets & Spices: A Perfect Blend of Health",
    excerpt: "Discover the goodness of nature with our premium selection of nuts, millets and spices thoughtfully curated for healthy living.",
    content: "Millets have been a staple in Indian diets for thousands of years, revered for their resilience and incredible nutritional profile. When combined with premium nuts like almonds and walnuts, and potent spices like turmeric and cardamom, you create a powerhouse of health.\n\nIn this article, we explore how integrating these three elements into your daily routine can dramatically improve your energy levels, digestion, and overall wellbeing. Our curated gift hampers are designed not just as a present, but as a step towards a healthier lifestyle.\n\n### The Nutritional Synergy\nWhen nuts and millets are consumed together, they provide a complete amino acid profile, ensuring your body gets the building blocks it needs. The healthy fats in nuts also help in the absorption of fat-soluble vitamins found in spices and grains.",
    category: "WELLNESS",
    date: "Oct 12, 2026",
    readTime: "4 min",
    image: "https://images.medicinenet.com/images/article/main_image/what-nuts-are-the-worst-for-allergies.jpg?output-quality=75",
  },
  {
    id: 2,
    title: "Pooja Hampers: Share Blessings & Positivity",
    excerpt: "Beautifully curated pooja hampers with essential items to elevate every ceremony and festival. A thoughtful gift.",
    content: "Festivals and ceremonies are an integral part of our culture, bringing families together in devotion and celebration. To make these moments even more special, we've designed exclusive Pooja Hampers that include everything from premium camphor to divine dhoop sticks and panchamrut ingredients.\n\nGifting a pooja hamper is more than just a tradition; it's a way of sharing blessings, spreading positivity, and ensuring that your loved ones have the purest ingredients for their spiritual practices.\n\n### Why Purity Matters in Rituals\nThe energy of a space is deeply influenced by the items used during prayers. Pure camphor burns without leaving residue, while natural dhoop sticks clear the air of impurities, creating a genuinely uplifting environment.",
    category: "GIFTING",
    date: "Oct 08, 2026",
    readTime: "3 min",
    image: "https://www.thedailynutco.com/cdn/shop/files/IMG_0012_1_530x@2x.jpg?v=1752435807",
  },
  {
    id: 3,
    title: "The Ultimate Guide to Ancient Supergrains",
    excerpt: "Learn why these forgotten supergrains are making a huge comeback and how they can revolutionize your daily diet.",
    content: "For decades, refined grains dominated our plates, leading to a rise in lifestyle diseases. Now, the world is waking up to the magic of ancient supergrains—millets, quinoa, and amaranth.\n\nThese grains are naturally gluten-free, rich in dietary fiber, and packed with essential minerals like iron and magnesium. By replacing just one meal a day with a millet-based dish, you can stabilize blood sugar levels and promote heart health. Join the supergrain revolution today!\n\n### A Sustainable Choice\nMillets are not only good for you, but they are also good for the planet. They require significantly less water to grow compared to rice or wheat and are highly resilient to climate change, making them the food of the future.",
    category: "NUTRITION",
    date: "Oct 01, 2026",
    readTime: "5 min",
    image: "https://experiencelife.lifetime.life/wp-content/uploads/2005/07/great-grains-1557875324.jpg",
  },
  {
    id: 4,
    title: "Dry Fruits: Nature's Little Powerhouses",
    excerpt: "A deep dive into the extraordinary benefits of incorporating premium dry fruits into your everyday snacking habits.",
    content: "Snacking often gets a bad reputation, but it doesn't have to be unhealthy. Dry fruits are nature's candy, packed with essential vitamins, minerals, and healthy fats that your body craves.\n\nAlmonds support brain health, walnuts are incredible for your heart, and raisins provide an instant, natural energy boost. Instead of reaching for processed snacks, keeping a handful of mixed dry fruits at your desk can completely change your energy dynamics throughout the day.\n\n### Proper Portion Control\nWhile dry fruits are incredibly healthy, they are also calorie-dense. A handful (about 30 grams) a day is the optimal amount to reap all the benefits without going overboard on calories.",
    category: "LIFESTYLE",
    date: "Sep 24, 2026",
    readTime: "4 min",
    image: "https://media.istockphoto.com/id/183803376/photo/mixed-nuts-and-dried-fruits.jpg?s=612x612&w=0&k=20&c=C7BlDHRlNQMTCMrAWcCg59PaA18bAuGXVcU0estWhGY=",
  },
  {
    id: 5,
    title: "Corporate Gifting Redefined: The Healthier Choice",
    excerpt: "Move away from traditional sugary corporate gifts. Discover how our wellness hampers are changing the corporate gifting landscape.",
    content: "The corporate gifting landscape is evolving. Gone are the days of sending boxes of sugary sweets that sit in the pantry untouched. Today, companies want to show they genuinely care about their employees' and clients' well-being.\n\nOur wellness hampers, featuring premium nuts, ancient grains, and traditional spices, offer a sophisticated and thoughtful alternative. They communicate a message of health, longevity, and genuine care.\n\n### The Impact of Thoughtful Gifting\nWhen you gift wellness, you aren't just sending a product; you are sending a lifestyle change. Many of our corporate clients report incredible feedback from recipients who appreciated the unique and health-conscious approach.",
    category: "CORPORATE",
    date: "Sep 15, 2026",
    readTime: "3 min",
    image: "https://www.officeoye.com/wp-content/uploads/2023/06/Nuts-Diwali-Corporate-Gift.jpg",
  },
  {
    id: 6,
    title: "Spices for Immunity: Ancient Wisdom Backed by Science",
    excerpt: "Explore the scientific reasons behind why Indian spices have been revered for their immune-boosting properties for millennia.",
    content: "The traditional Indian spice box is actually a medicinal toolkit. Spices like turmeric, black pepper, cinnamon, and cloves contain potent bioactive compounds that have profound effects on human health.\n\nCurcumin in turmeric is a powerful anti-inflammatory, while the piperine in black pepper enhances curcumin's absorption by 2000%. By mindfully adding these spices to our teas, curries, and even warm milk, we can naturally fortify our immune system against seasonal ailments.\n\n### Building Your Spice Toolkit\nStart small by adding a pinch of cinnamon to your morning coffee or brewing a cup of turmeric tea before bed. Small, consistent additions of these spices yield the best long-term results.",
    category: "WELLNESS",
    date: "Sep 02, 2026",
    readTime: "6 min",
    image: "https://spicestationsilverlake.com/wp-content/uploads/2023/12/spices.jpg",
  },
];

const categoryColors: Record<string, string> = {
  WELLNESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  GIFTING: "bg-amber-50 text-amber-700 border-amber-200",
  NUTRITION: "bg-sky-50 text-sky-700 border-sky-200",
  LIFESTYLE: "bg-rose-50 text-rose-700 border-rose-200",
  CORPORATE: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const featuredPost = blogPosts[0];
  const remainingPosts = blogPosts.slice(1);

  // Track scroll progress in sidebar
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el || !selectedPost) return;
    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setReadProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [selectedPost]);

  // Reset progress when sidebar closes
  useEffect(() => {
    if (!selectedPost) setReadProgress(0);
  }, [selectedPost]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--site-bg)] relative overflow-hidden font-[family-name:var(--font-inter)]">

      {/* ──── Hero / Header ──── */}
      <section className="relative pt-28 pb-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Tiny label */}
          <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
            <Leaf className="w-4 h-4 text-[var(--olive)]" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--olive)]">
              Tradizions Journal
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 transition-all duration-1000 delay-200 animate-fade-in-up">
            Wellness, Tradition <br className="gradient-text" />&amp; Thoughtful Living
          </h1>
          <p className="text-[var(--dark-grey)] text-lg max-w-xl leading-relaxed animate-fade-in-up delay-200">
            Stories about ancient nutrition, mindful gifting, and the little rituals that enrich everyday life.
          </p>
        </div>
      </section>

      {/* ──── Featured Post ──── */}
      <section className="px-6 sm:px-12 lg:px-20 mb-20">
        <div
          className="max-w-7xl mx-auto group cursor-pointer animate-fade-in-up delay-300"
          onClick={() => setSelectedPost(featuredPost)}
        >
          <div className="relative rounded-[2rem] overflow-hidden h-[28rem] sm:h-[32rem]">
            <Image
              src={featuredPost.image}
              alt={featuredPost.title}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 w-full p-8 sm:p-14">
              <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border mb-5 ${categoryColors[featuredPost.category] || "bg-white/10 text-white border-white/20"}`}>
                {featuredPost.category}
              </span>
              <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-serif)] text-white leading-tight mb-4 max-w-2xl">
                {featuredPost.title}
              </h2>
              <p className="text-white/70 text-base max-w-lg mb-6 hidden sm:block">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-6">
                <span className="text-white/60 text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> {featuredPost.date}
                </span>
                <span className="text-white/60 text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                </span>
              </div>
            </div>

            {/* Hover arrow */}
            <div className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-45">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── Remaining Posts Grid ──── */}
      <section className="px-6 sm:px-12 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Sparkles className="w-5 h-5 text-[var(--orange)]" />
            <h2 className="text-2xl font-[family-name:var(--font-serif)] text-[var(--dark-brown)]">Latest Articles</h2>
            <div className="flex-1 h-px bg-[var(--olive)]/10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post, i) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`group cursor-pointer animate-fade-in-up delay-${(i % 3 + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] uppercase rounded-md border ${categoryColors[post.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {post.category}
                  </span>
                  <span className="text-[var(--dark-grey)]/60 text-xs flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-[family-name:var(--font-serif)] text-[var(--dark-brown)] leading-snug mb-2 group-hover:text-[var(--olive)] transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[var(--dark-grey)] leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Date */}
                <span className="text-xs text-[var(--dark-grey)]/50 font-medium">{post.date}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Overlay ──── */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-all duration-500 ${selectedPost ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelectedPost(null)}
      />

      {/* ──── Sidebar Reader ──── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[44rem] bg-white z-[100] shadow-[-20px_0_60px_rgba(0,0,0,0.12)] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${selectedPost ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Reading progress bar */}
        <div className="fixed top-0 right-0 w-full max-w-[44rem] h-[3px] z-[110] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-[var(--olive)] to-[var(--orange)] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {selectedPost && (
          <div className="min-h-full font-[family-name:var(--font-inter)]">

            {/* ── Sidebar Hero Image ── */}
            <div className="relative w-full h-[50vh] min-h-[360px]">
              <Image
                src={selectedPost.image}
                alt={selectedPost.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />

              {/* Back button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-[var(--dark-brown)] text-sm font-semibold shadow-lg hover:bg-white transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Category pill on image */}
              <div className="absolute top-6 right-6 z-10">
                <span className={`px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border backdrop-blur-md ${categoryColors[selectedPost.category] || "bg-white/80 text-gray-700 border-white/40"}`}>
                  {selectedPost.category}
                </span>
              </div>
            </div>

            {/* ── Article Content ── */}
            <div className="px-8 sm:px-14 -mt-16 relative z-10">
              {/* Title card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-10 border border-gray-100">
                <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-[family-name:var(--font-serif)] text-[var(--dark-brown)] leading-[1.15] mb-6">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--olive)] to-[var(--orange)] flex items-center justify-center text-white font-[family-name:var(--font-serif)] text-sm shadow-md">
                      T
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--dark-brown)] leading-tight">Tradizions</p>
                      <p className="text-[11px] text-[var(--dark-grey)]">Health &amp; Wellness</p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-gray-200" />

                  <span className="text-xs text-[var(--dark-grey)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--orange)]" /> {selectedPost.date}
                  </span>
                  <span className="text-xs text-[var(--dark-grey)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--orange)]" /> {selectedPost.readTime}
                  </span>
                </div>
              </div>

              {/* Body text */}
              <article className="max-w-none mb-16">
                {/* First paragraph with drop cap */}
                <p className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-8 first-letter:text-6xl first-letter:font-[family-name:var(--font-serif)] first-letter:text-[var(--olive)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]">
                  {selectedPost.content.split("\n\n")[0]}
                </p>

                {/* Remaining paragraphs */}
                {selectedPost.content.split("\n\n").slice(1).map((para, idx) => {
                  if (para.startsWith("###")) {
                    return (
                      <h3
                        key={idx}
                        className="text-2xl font-[family-name:var(--font-serif)] text-[var(--dark-brown)] mt-14 mb-5 flex items-center gap-3"
                      >
                        <span className="w-8 h-[3px] rounded-full bg-gradient-to-r from-[var(--olive)] to-[var(--orange)]" />
                        {para.replace("###", "").trim()}
                      </h3>
                    );
                  }
                  return (
                    <p key={idx} className="text-[var(--dark-grey)] text-[1.125rem] leading-[1.85] mb-7">
                      {para}
                    </p>
                  );
                })}
              </article>

              {/* Action bar */}
              <div className="flex items-center justify-between py-6 border-y border-gray-100 mb-14">
                <div className="flex items-center gap-1">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-[var(--dark-grey)] hover:bg-[var(--site-bg)] transition-colors">
                    <Heart className="w-[18px] h-[18px]" /> Like
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-[var(--dark-grey)] hover:bg-[var(--site-bg)] transition-colors">
                    <Share2 className="w-[18px] h-[18px]" /> Share
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-[var(--dark-grey)] hover:bg-[var(--site-bg)] transition-colors"
                  >
                    {copied ? <Check className="w-[18px] h-[18px] text-emerald-500" /> : <Copy className="w-[18px] h-[18px]" />}
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="mb-20 rounded-2xl overflow-hidden bg-[var(--site-bg)] border border-[var(--olive)]/10">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--olive)] to-[var(--orange)] flex items-center justify-center shrink-0 shadow-lg">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h4 className="text-xl font-[family-name:var(--font-serif)] text-[var(--dark-brown)] mb-2">
                      Explore Our Collections
                    </h4>
                    <p className="text-sm text-[var(--dark-grey)] leading-relaxed">
                      Experience the benefits of traditional wellness with our curated hampers and products.
                    </p>
                  </div>
                  <button className="btn-standard rounded-full whitespace-nowrap shrink-0">
                    Shop Now
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
