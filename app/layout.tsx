import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import AuthGate from "@/components/AuthGate";
import CartSidebar from "@/components/CartSidebar";
import { GoogleAnalytics } from '@next/third-parties/google'
import ClickAnimation from "@/components/ClickAnimation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tradizions.vercel.app"),
  title: {
    default: "Millets, Dry Fruits, Gift Hampers",
    template: "%s | Tradizions",
  },
  description:
    "Discover the richness of ancient Indian millets, wholesome malts, premium dry fruits, and artisanal gift hampers. Rooted in tradition, crafted for wellness.",
  twitter: {
    card: "summary_large_image",
    title: "Tradizions - Millets, Dry Fruits, Gift Hampers",
    description:
      "Discover the richness of ancient Indian millets, wholesome malts, premium dry fruits, and artisanal gift hampers. Rooted in tradition, crafted for wellness.",
    images: [
      {
        url: "/images/og-image.jpg",
        alt: "Tradizions - Millets, Dry Fruits, Gift Hampers",
      },
    ],
  },
  openGraph: {
    title: "Tradizions - Millets, Dry Fruits, Gift Hampers",
    description:
      "Discover the richness of ancient Indian millets, wholesome malts, premium dry fruits, and artisanal gift hampers. Rooted in tradition, crafted for wellness.",
    url: "https://tradizions.vercel.app",
    siteName: "Tradizions",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tradizions - Millets, Dry Fruits, Gift Hampers",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  keywords: [
    "Tradizions",
    "Tradizions Millets",
    "Tradizions Nuts",
    "Millets Online",
    "Buy Millets Online",
    "Healthy Foods",
    "Traditional Foods",
    "Organic Millets",
    "Natural Foods",
    "Healthy Snacks",
    "Premium Nuts",
    "Dry Fruits Online",
    "Foxtail Millet",
    "Kodo Millet",
    "Little Millet",
    "Barnyard Millet",
    "Pearl Millet",
    "Finger Millet",
    "Ragi Products",
    "Millet Store",
    "Millet Shopping",
    "Healthy Lifestyle",
    "Nutritious Foods",
    "Whole Grains",
    "Protein Rich Foods",
    "Fiber Rich Foods",
    "Gluten Free Foods",
    "Organic Grocery",
    "Healthy Eating",
    "Traditional Nutrition",
    "Indian Millets",
    "Natural Wellness",
    "Healthy Diet Foods",
    "Millet Based Foods",
    "Best Millet Store",
    "Best Nuts Store",
    "Farm Fresh Products",
    "Sustainable Foods",
    "Healthy Living",
    "Ancient Grains",
    "Nutritional Foods",
    "Online Grocery India",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <AuthGate>
          <CartSidebar />
          <Navbar />
          <main className="flex-1 pt-[160px] md:pt-[165px]">{children}</main>
          <Footer />
          <AIChatbot />
          <ClickAnimation />
        </AuthGate>
      </body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  );
}
