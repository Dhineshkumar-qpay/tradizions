import { Metadata } from "next";
import CorporateOrdersPageClient from "./corporateClinet";

export const metadata: Metadata = {
  title: "Corporate Orders & Premium Gifting",
  description: "Partner with Tradizions for corporate gifting. Discover premium, tradition-backed wellness products and custom gift hampers for your business needs.",
  keywords: [
    "corporate orders",
    "corporate gifting",
    "premium gifts",
    "wellness hampers",
    "bulk orders",
    "tradizions corporate",
  ],
  openGraph: {
    title: "Corporate Orders & Premium Gifting",
    description: "Partner with Tradizions for corporate gifting. Discover premium, tradition-backed wellness products and custom gift hampers.",
    url: "https://tradizions.vercel.app/corporate-orders",
    siteName: "Tradizions",
    type: "website",
  },
  alternates: {
    canonical: "https://tradizions.vercel.app/corporate-orders",
  }
};

export default function CorporateOrdersPage() {
  return <CorporateOrdersPageClient />;
}
