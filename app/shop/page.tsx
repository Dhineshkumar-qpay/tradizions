import type { Metadata } from "next";
import ShopClient from "./shopClient";

export const metadata: Metadata = {
  title: "Shop Traditional Wellness & Natural Products",
  description: "Explore our curated selection of tradition-backed products. From ancient grains, millets, and health goal products to natural wellness essentials and premium gifts.",
  keywords: [
    "tradizions",
    "shop organic",
    "traditional wellness",
    "millets",
    "natural products",
    "ancient grains",
    "premium gifts",
  ],
  openGraph: {
    title: "Shop Traditional Wellness & Natural Products",
    description: "Explore our curated selection of tradition-backed products. From ancient grains, millets, and health goal products to natural wellness essentials and premium gifts.",
    url: "https://tradizions.vercel.app/shop",
    siteName: "Tradizions",
    type: "website",
  },
  alternates: {
    canonical: "https://tradizions.vercel.app/shop",
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
