import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Gift Hampers & Corporate Gifting",
  description:
    "Explore our curated selection of premium gift hampers. Thoughtfully crafted with millets, dry fruits, and traditional wellness products for every occasion.",
  keywords: [
    "gift hampers",
    "premium gifting",
    "corporate gifts",
    "healthy gifts",
    "traditional gifts",
    "millets hampers",
    "dry fruits hampers",
    "tradizions gifts",
  ],
  openGraph: {
    title: "Premium Gift Hampers & Corporate Gifting | Tradizions",
    description:
      "Explore our curated selection of premium gift hampers. Thoughtfully crafted with millets, dry fruits, and traditional wellness products for every occasion.",
    url: "https://tradizions.vercel.app/gifts",
    siteName: "Tradizions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Gift Hampers & Corporate Gifting | Tradizions",
    description:
      "Explore our curated selection of premium gift hampers. Thoughtfully crafted with millets, dry fruits, and traditional wellness products for every occasion.",
  },
  alternates: {
    canonical: "https://tradizions.vercel.app/gifts",
  },
};

export default function GiftsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
