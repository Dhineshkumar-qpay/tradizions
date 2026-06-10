import type { Metadata } from "next";
import AboutUsPageClient from "./aboutusClient";

export const metadata: Metadata = {
  title: "About Us - Our Heritage & Mission",
  description: "Learn about Tradizions, our heritage, our organic certifications, and our mission to deliver pure, traditional wellness products, millets, and gifts.",
  keywords: "about tradizions, our heritage, organic certifications, traditional wellness mission, pure millets",
  openGraph: {
    title: "About Us - Our Heritage & Mission",
    description: "Learn about Tradizions, our heritage, our organic certifications, and our mission to deliver pure, traditional wellness products.",
    url: "https://tradizions.vercel.app/about-us",
    siteName: "Tradizions",
    type: "website",
  },
  alternates: {
    canonical: "https://tradizions.vercel.app/about-us",
  },
};

export default function AboutUsPage() {
  return <AboutUsPageClient />;
}
