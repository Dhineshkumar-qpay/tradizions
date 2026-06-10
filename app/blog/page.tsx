import { Metadata } from "next";
import BlogPageClient from "./blogClient";

export const metadata: Metadata = {
  title:
    "Tradizions Blog - Insights on Traditional Wellness & Natural Products",

  description:
    "Discover the latest insights, tips, and stories on traditional wellness and natural products. Explore our blog for expert advice, health benefits, and trends in the world of tradition-backed wellness.",

  keywords: [
    "tradizions blog",
    "traditional wellness insights",
    "natural products tips",
    "health benefits",
    "wellness trends",
  ],

  alternates: {
    canonical: "https://tradizions.vercel.app/blog",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
